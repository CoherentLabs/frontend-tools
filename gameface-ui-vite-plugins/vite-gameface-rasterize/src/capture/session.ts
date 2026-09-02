import CDP from 'chrome-remote-interface';
import { sleep } from './player.js';

export interface Clip {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * A thin CDP session against the Gameface Player.
 *
 * Two Player-specific facts are baked in here:
 *  - `/json/list` echoes the request path into `webSocketDebuggerUrl`, so the target is
 *    resolved by hand and handed to chrome-remote-interface as a relative path.
 *  - `clip.scale` on `Page.captureScreenshot` is accepted and ignored, so supersampling
 *    is done by transforming the page, never by asking the capture to scale.
 */
export class PlayerSession {
    private constructor(private readonly client: any) {}

    static async connect(port: number, host = 'localhost'): Promise<PlayerSession> {
        // /json/version answers before the page target exists, so the target list is polled.
        let page: any;
        for (let attempt = 0; attempt < 40 && !page; attempt++) {
            const targets = await fetch(`http://${host}:${port}/json/list`)
                .then((r) => r.json())
                .catch(() => null);

            if (Array.isArray(targets) && targets.length) {
                page = targets.find((t: any) => t.type === 'page') ?? targets[0];
            }

            if (!page) await sleep(150);
        }

        if (!page) throw new Error(`the Player on port ${port} never exposed a page target`);

        const client = await (CDP as any)({ host, port, local: true, target: `/devtools/page/${page.id}` });

        await client.Page.enable();
        await client.Runtime.enable();
        await client.DOM.enable();
        await client.CSS.enable();

        return new PlayerSession(client);
    }

    async close(): Promise<void> {
        try {
            await this.client.close();
        } catch {
            // the Player may already be gone; nothing useful to do about it
        }
    }

    /** Navigates and waits for the page to be renderable. */
    async goto(url: string, settleMs = 250): Promise<void> {
        const loaded = new Promise<void>((resolve) => {
            const done = () => resolve();
            this.client.Page.loadEventFired(done);
            setTimeout(done, 15000);
        });
        await this.client.Page.navigate({ url });
        await loaded;
        await this.settle(settleMs);
    }

    /** Waits for fonts and two presented frames - the point past which pixels are stable. */
    async settle(extraMs = 0): Promise<void> {
        await this.evaluateRaw(`
            (async () => {
                if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            })()
        `);
        if (extraMs > 0) await sleep(extraMs);
    }

    /** Evaluates a source string in the page and returns its value. */
    async evaluateRaw<T = unknown>(expression: string): Promise<T> {
        const { result, exceptionDetails } = await this.client.Runtime.evaluate({
            expression,
            returnByValue: true,
            awaitPromise: true,
        });
        if (exceptionDetails) {
            const description = exceptionDetails.exception?.description || exceptionDetails.text;
            throw new Error(`page evaluation failed: ${description}`);
        }
        return result.value as T;
    }

    /**
     * Calls a self-contained function in the page with a JSON-serialisable argument.
     * The function is stringified, so it must not close over anything from Node - which is
     * exactly why the browser-side code lives in its own directory with no imports.
     */
    async call<A, R>(fn: (arg: A) => R, arg?: A): Promise<Awaited<R>> {
        const argument = arg === undefined ? '' : JSON.stringify(arg);
        return this.evaluateRaw<Awaited<R>>(`(${fn.toString()})(${argument})`);
    }

    async screenshot(clip: Clip): Promise<Buffer> {
        // The clip must intersect the viewport; the Player rejects anything entirely outside it.
        const { data } = await this.client.Page.captureScreenshot({
            format: 'png',
            clip: { ...clip, scale: 1 },
        });
        return Buffer.from(data, 'base64');
    }

    async viewport(): Promise<{ width: number; height: number }> {
        return this.evaluateRaw(`({ width: window.innerWidth, height: window.innerHeight })`);
    }

    /**
     * Moves the mouse. This is how :hover is baked - CSS.forcePseudoState is accepted by
     * the Player and then does nothing at all, so real input is the only honest route.
     */
    async mouseMove(x: number, y: number): Promise<void> {
        await this.client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 });
    }

    async mouseDown(x: number, y: number): Promise<void> {
        await this.client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    }

    async mouseUp(x: number, y: number): Promise<void> {
        await this.client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    }

    /** Starts a trace. The engine's own phase timings are the only load signal this Player gives. */
    async startTracing(categories = 'disabled-by-default-devtools.timeline'): Promise<void> {
        await this.client.send('Tracing.start', { categories, transferMode: 'ReportEvents' });
    }

    /**
     * Ends a trace and collects it, giving up after `timeoutMs` with whatever arrived.
     *
     * The Player ships an entire trace as one message at `Tracing.end`. Past a few seconds of a
     * heavy scene that message never arrives and `tracingComplete` never fires, so waiting on it
     * unconditionally hangs with no error and leaves a multi-gigabyte Player behind.
     */
    async stopTracing(timeoutMs = 20000): Promise<{ events: any[]; complete: boolean }> {
        const events: any[] = [];
        this.client.Tracing.dataCollected(({ value }: { value: any[] }) => events.push(...value));

        const complete = new Promise<boolean>((resolve) => {
            this.client.Tracing.tracingComplete(() => resolve(true));
        });

        await this.client.send('Tracing.end');

        const finished = await Promise.race([
            complete,
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
        ]);

        return { events, complete: finished };
    }

    /**
     * Rules matching an element, including its pseudo-class rules and the media queries
     * they sit in. The page itself cannot tell us this: cohtml's CSSOM exposes neither
     * iterable cssRules nor matchMedia.
     */
    async matchedRules(selector: string): Promise<MatchedRule[]> {
        const { root } = await this.client.DOM.getDocument({ depth: 1 });
        const { nodeId } = await this.client.DOM.querySelector({ nodeId: root.nodeId, selector });
        if (!nodeId) return [];

        const matched = await this.client.CSS.getMatchedStylesForNode({ nodeId });
        const rules: MatchedRule[] = [];

        for (const entry of matched.matchedCSSRules ?? []) {
            const rule = entry.rule;
            if (!rule) continue;
            rules.push({
                selector: rule.selectorList?.text ?? '',
                media: (rule.media ?? []).map((m: any) => m.text).filter(Boolean),
                declarations: Object.fromEntries(
                    (rule.style?.cssProperties ?? [])
                        .filter((p: any) => p.name && p.value !== undefined)
                        .map((p: any) => [p.name, p.value])
                ),
            });
        }

        return rules;
    }
}

export interface MatchedRule {
    selector: string;
    media: string[];
    declarations: Record<string, string>;
}
