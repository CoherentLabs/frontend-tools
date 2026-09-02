import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ATTR } from './contract.js';
import type { ResolvedOptions } from './config.js';
import { DiagnosticBag } from './diagnostics.js';
import { closePlayer, findFreePort, launchPlayer, type PlayerHandle } from './capture/player.js';
import { PlayerSession } from './capture/session.js';
import { headInjector, serveDirectory, type StaticServer } from './capture/server.js';
import { PROBE_SNIPPET } from './browser/probe.js';
import { rzIntrospect } from './browser/introspect.js';
import { rzCleanup } from './browser/isolate.js';
import type { AdvisorHit, IntrospectResult, RawMark } from './browser/types.js';
import { planMark, type BakePlan } from './plan.js';
import { bake, type BakeResult } from './bake.js';
import { BakeCache } from './cache.js';
import { writeDiagnostics, writeOutput } from './emit/write.js';
import { formatReport, groupAdvisor } from './emit/report.js';
import { auditBuild, stripGeneratedTags, type RouteAudit } from './audit.js';

/** Tags that receive input by their nature and therefore can never be baked away. */
const INTERACTIVE_TAGS = ['button', 'input', 'select', 'textarea', 'a', 'video', 'canvas', 'iframe', 'label', 'option'];

export interface PipelineInput {
    /** Build output directory: served to the Player, then written back into. */
    outDir: string;
    options: ResolvedOptions;
    /** Serve nothing and introspect this URL instead - used by `rasterize check`. */
    externalUrl?: string;
    /** Plan and report only: no captures, no files written. */
    dryRun?: boolean;
    log?: (message: string) => void;
}

export interface PipelineOutcome {
    bag: DiagnosticBag;
    report: string;
    assetCount: number;
    hadErrors: boolean;
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutcome> {
    const { options, outDir } = input;
    const log = input.log ?? (() => {});
    const bag = new DiagnosticBag(options.strictTransitions);
    const started = Date.now();

    const jsWrittenVariables = input.externalUrl ? new Set<string>() : await scanForVariableWrites(outDir);

    let server: StaticServer | undefined;
    let player: PlayerHandle | undefined;
    let session: PlayerSession | undefined;

    const baseUrl = async () => {
        if (input.externalUrl) return input.externalUrl;
        if (!server) {
            server = await serveDirectory(outDir, {
                injectHead: headInjector(options.routes, PROBE_SNIPPET),
                // Baking a directory that has already been baked must measure the original
                // CSS, not the previous run's underlays, so a prior run's tags are stripped.
                transformHtml: stripGeneratedTags,
            });
        }
        return server.origin;
    };

    const origin = await baseUrl();
    const routeUrl = (route: string) => (route.startsWith('http') ? route : `${origin}/${route.replace(/^\//, '')}`);

    let viewport = { ...options.viewport };
    let engineVersion = 'unknown';

    const start = async () => {
        // A Player that comes up without a page target is not usable and not worth diagnosing;
        // it is cheaper to throw that one away and launch another.
        for (let attempt = 1; ; attempt++) {
            const port = await findFreePort(options.port);

            try {
                player = await launchPlayer({
                    executablePath: options.playerPath,
                    port,
                    url: routeUrl(options.routes[0].path),
                    width: viewport.width,
                    height: viewport.height,
                    headed: options.headed,
                    cwd: path.resolve(options.cacheDir, 'player'),
                });
                session = await PlayerSession.connect(port);
                engineVersion = player.engineVersion;
                return;
            } catch (error) {
                if (player) await closePlayer(player);
                player = undefined;
                if (attempt >= 3) throw error;
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    };

    const stop = async () => {
        if (session) await session.close();
        if (player) await closePlayer(player);
        session = undefined;
        player = undefined;
    };

    /**
     * The Player occasionally drops the debugger connection mid-run, and a fresh one can come up
     * without a page target if the previous process is still going away. Losing a whole build to
     * that is worse than paying for a restart, so each unit of work gets a few attempts against a
     * fresh Player - work is scoped per route precisely so a retry can redo it from scratch.
     */
    const isTransient = (message: string) =>
        /websocket|connection closed|econnreset|socket hang up|never exposed a page target|never responded/i.test(message);

    const retryOnDisconnect = async <T>(label: string, work: () => Promise<T>): Promise<T> => {
        const attempts = 3;

        for (let attempt = 1; ; attempt++) {
            try {
                return await work();
            } catch (error: any) {
                const message = String(error?.message ?? error);
                if (attempt >= attempts || !isTransient(message)) throw error;

                const tail = player?.stderrTail() ?? '';
                log(
                    `the Player dropped out during ${label} (attempt ${attempt}/${attempts}); restarting it` +
                        `${tail ? `\n    ${tail}` : ''}`
                );

                await stop();
                // Give the old process time to release its port and window before the next one.
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                await start();
            }
        }
    };

    try {
        await start();
        log(`launched the Player (cohtml ${engineVersion}) at ${viewport.width}x${viewport.height}`);

        const advisorHits: AdvisorHit[] = [];

        /** Visits every route and plans what it finds. Repeatable: nothing is captured here. */
        const survey = async (): Promise<Map<string, BakePlan>> => {
            const plans = new Map<string, BakePlan>();

            for (const route of options.routes) {
                await retryOnDisconnect(`survey of ${route.path}`, async () => {
                    const marks = await visitRoute(session!, routeUrl(route.path), route.setup, route.settleMs, options, bag, route.path);
                    if (!marks) return;

                    if (options.advisor) advisorHits.push(...marks.advisor);

                    for (const mark of marks.marks) {
                        const rules = await session!.matchedRules(`[data-rz-uid="${mark.uid}"]`);
                        const plan = planMark(mark, rules, {
                            options,
                            bag,
                            engineVersion,
                            route: route.path,
                            jsWrittenVariables,
                        });

                        // The same decoration on several routes is one texture, planned once.
                        if (plan && !plans.has(plan.hash)) plans.set(plan.hash, plan);
                    }
                });
            }

            return plans;
        };

        let plans = await survey();

        // The capture clip has to intersect the viewport - this Player has no
        // captureBeyondViewport and no Emulation domain - so the window is grown to fit the
        // largest planned bake before anything is captured.
        const needed = requiredViewport([...plans.values()]);
        if (needed.width > viewport.width || needed.height > viewport.height) {
            const grown = {
                width: Math.min(options.maxViewport.width, Math.max(viewport.width, needed.width)),
                height: Math.min(options.maxViewport.height, Math.max(viewport.height, needed.height)),
            };

            if (grown.width < needed.width || grown.height < needed.height) {
                bag.add(
                    'RZ006',
                    'build',
                    `a bake needs a ${needed.width}x${needed.height} viewport but maxViewport is ` +
                        `${options.maxViewport.width}x${options.maxViewport.height}; lower bakeScale or raise maxViewport`
                );
            }

            log(`growing the bake viewport to ${grown.width}x${grown.height} to fit the largest asset`);
            viewport = grown;
            await stop();
            await start();

            const before = totalPlannedArea([...plans.values()]);
            plans = await survey();
            const after = totalPlannedArea([...plans.values()]);

            // A layout sized in vh - or in rem derived from vh, which is what the Gameface
            // scaling guidance recommends - grows when the window does, which makes the next
            // asset bigger, which grows the window again. It converges, at a size nobody chose,
            // and the only symptom is a larger number in the VRAM column.
            if (after > before * 1.05) {
                bag.add(
                    'RZ006',
                    'build',
                    `growing the bake viewport made every planned asset ${(after / before).toFixed(2)}x larger, so this ` +
                        'layout is sized relative to the viewport. The textures being baked are bigger than the ones ' +
                        "the game will show. Pin the scale in the route's setup hook, e.g. " +
                        `setup: "document.documentElement.style.setProperty('font-size', '10px')"`
                );
            }
        }

        if (input.dryRun) {
            const report = dryRunReport([...plans.values()], bag, advisorHits, Date.now() - started);
            return { bag, report, assetCount: plans.size, hadErrors: bag.errors.length > 0 };
        }

        // ---- capture ----
        const cache = new BakeCache(path.resolve(options.cacheDir));
        const results: BakeResult[] = [];
        const baked = new Set<string>();
        let cacheHits = 0;

        for (const route of options.routes) {
            if (![...plans.values()].some((p) => p.route === route.path && !baked.has(p.hash))) continue;

            await retryOnDisconnect(`bake of ${route.path}`, () => bakeRoute(route.path));
        }

        async function bakeRoute(routePath: string): Promise<void> {
            const route = options.routes.find((r) => r.path === routePath)!;

            // Recomputed per attempt so a restart only redoes what has not been baked yet.
            const routePlans = [...plans.values()].filter((p) => p.route === routePath && !baked.has(p.hash));
            if (!routePlans.length) return;

            const marks = await visitRoute(session!, routeUrl(route.path), route.setup, route.settleMs, options, bag, route.path);
            if (!marks) return;

            // uids are handed out per visit, so they are re-bound to this visit's document.
            const byHash = new Map(marks.marks.map((m) => [m.uid, m] as const));

            for (const plan of routePlans) {
                const fresh = byHash.get(plan.uid);
                if (fresh) plan.mark = { ...fresh, liveParts: fresh.liveParts, layoutDynamic: fresh.layoutDynamic };

                const cached = await cache.read(plan);
                if (cached) {
                    results.push(cached);
                    baked.add(plan.hash);
                    cacheHits++;
                    continue;
                }

                log(`baking ${plan.assetId} (${plan.mode}, ${plan.states.length} state${plan.states.length === 1 ? '' : 's'})`);

                try {
                    const result = await bake(
                        session!,
                        plan,
                        bag,
                        options.debug ? { dir: path.resolve(options.cacheDir, 'debug') } : undefined
                    );
                    if (result) {
                        await cache.write(result);
                        results.push(result);
                    }
                } catch (error: any) {
                    const message = String(error?.message ?? error);

                    // A lost connection is the caller's problem to retry; anything else is this
                    // one element's problem, and must not take the whole build down with it.
                    if (/websocket|connection closed|econnreset|socket hang up/i.test(message)) throw error;

                    bag.add('RZ017', plan.assetId, `capture failed: ${message}`, route.path);
                }

                baked.add(plan.hash);
            }

            await session!.call(rzCleanup);
        }

        const written = await writeOutput(
            results,
            options,
            engineVersion,
            bag,
            outDir,
            options.routes.map((r) => r.path)
        );

        // Empty captures on a page that is still moving are timing-dependent, so the set of
        // elements that fail is not stable between runs. Saying so once is the difference between
        // "five elements were refused" and "this build is not reproducible".
        const refused = bag.items.filter((d) => d.code === 'RZ019').reduce((sum, d) => sum + d.count, 0);
        if (refused) {
            bag.add(
                'RZ019',
                'build',
                `${refused} element${refused === 1 ? ' was' : 's were'} refused for empty or clipped captures. ` +
                    'A rerun may bake a different set - this is timing-dependent on a page that is still moving. ' +
                    'Freeze the page in the route setup hook to make builds reproducible'
            );
        }

        // The finished build is rendered against itself-without-the-bake while the Player is
        // still up. Two page loads per route, and it is the only check that sees the page whole.
        let audits: RouteAudit[] = [];
        if (options.audit && results.length) {
            audits = await retryOnDisconnect('the visual audit', () =>
                auditBuild({ session: session!, options, outDir, routes: options.routes, manifest: written.manifest, bag, log })
            );
        }

        await stop();

        const diagnosticsPath = await writeDiagnostics(
            outDir,
            options.outDir,
            engineVersion,
            bag,
            groupAdvisor(advisorHits),
            audits.map((a) => ({ route: a.route, marked: a.marked, resolved: a.resolved, unresolved: a.unresolved }))
        );

        const report = formatReport({
            manifest: written.manifest,
            bag,
            advisor: advisorHits,
            cacheHits,
            durationMs: Date.now() - started,
            patchedHtml: written.patchedHtml,
            audits,
            planned: plans.size,
            diagnosticsPath,
        });

        return { bag, report, assetCount: results.length, hadErrors: bag.errors.length > 0 };
    } finally {
        await stop();
        if (server) await server.close();
    }
}

async function visitRoute(
    session: PlayerSession,
    url: string,
    setup: string | undefined,
    settleMs: number | undefined,
    options: ResolvedOptions,
    bag: DiagnosticBag,
    routeName: string
): Promise<IntrospectResult | null> {
    try {
        await session.goto(url, settleMs ?? 250);

        if (setup) {
            await session.evaluateRaw(`(async () => { ${setup} })()`);
            await session.settle(settleMs ?? 250);
        }

        return await session.call(rzIntrospect, {
            attrs: {
                mark: ATTR.mark,
                mode: ATTR.mode,
                states: ATTR.states,
                id: ATTR.id,
                scale: ATTR.scale,
                live: ATTR.live,
            },
            interactiveTags: INTERACTIVE_TAGS,
            advisor: options.advisor,
            advisorLimit: 5000,
        });
    } catch (error: any) {
        bag.add('RZ017', routeName, `route could not be introspected: ${error?.message ?? error}`, routeName);
        return null;
    }
}

/** Total texture area the current plan would produce, used to spot viewport-relative layouts. */
function totalPlannedArea(plans: BakePlan[]): number {
    return plans.reduce((sum, plan) => sum + plan.captureSize.w * plan.captureSize.h * plan.scale * plan.scale, 0) || 1;
}

/** The window each bake needs: its widest capture, plus the padding that keeps ink on screen. */
function requiredViewport(plans: BakePlan[]): { width: number; height: number } {
    let width = 0;
    let height = 0;

    for (const plan of plans) {
        const ink = plan.inkOverflow;
        const pad = Math.ceil(Math.max(ink.left, ink.top) * plan.scale) + 24;
        const size = plan.captureSize;

        width = Math.max(width, Math.ceil((size.w + ink.left + ink.right) * plan.scale) + pad * 2);
        height = Math.max(height, Math.ceil((size.h + ink.top + ink.bottom) * plan.scale) + pad * 2);
    }

    return { width, height };
}

/**
 * Best-effort scan for custom properties the bundle writes at runtime. A value frozen out of
 * one of those is a value that will be wrong the moment the game changes it (RZ003).
 */
async function scanForVariableWrites(outDir: string): Promise<Set<string>> {
    const names = new Set<string>();

    const walk = async (dir: string): Promise<void> => {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(full);
            } else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
                const source = await fs.readFile(full, 'utf8');
                for (const match of source.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) names.add(match[1]);
            }
        }
    };

    await walk(outDir);
    return names;
}

function dryRunReport(plans: BakePlan[], bag: DiagnosticBag, advisor: AdvisorHit[], durationMs: number): string {
    const lines = ['', `rasterize dry run - ${plans.length} element${plans.length === 1 ? '' : 's'} would be baked`, ''];

    for (const plan of plans) {
        const size = plan.captureSize;
        lines.push(
            `  ${plan.assetId}  ${plan.mode}  ${Math.round(size.w)}x${Math.round(size.h)} @${plan.scale}x  ` +
                `states: ${plan.states.join(', ')}  strips: ${plan.strippedProperties.join(', ') || 'nothing'}`
        );
    }

    if (bag.items.length) lines.push('');
    for (const diagnostic of bag.items) lines.push(`  ${diagnostic.level.padEnd(5)} ${bag.format(diagnostic)}`);

    // Same grouping and no truncation as the build summary: this is the command people are meant
    // to reach for first, so it is the last place that should be quietly hiding a list.
    const grouped = groupAdvisor(advisor);

    if (grouped.length) {
        lines.push('', `  ${advisor.length} unmarked element${advisor.length === 1 ? '' : 's'} using expensive properties`);
        for (const group of grouped) {
            const selector = `${group.tag}${group.classes.map((c) => `.${c}`).join('')}`;
            lines.push(`  info  ${selector}${group.count > 1 ? ` x${group.count}` : ''} - ${group.properties.join(', ')}`);
        }
    }

    lines.push('', `  ${(durationMs / 1000).toFixed(1)}s`, '');
    return lines.join('\n');
}

export type { RawMark };
