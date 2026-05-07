/**
 * JS surface probe — runs entirely inside the Gameface browser context.
 *
 * This module exports one function, `jsProbe`, which is serialized by the
 * orchestrator and executed via gf.executeScript().  It must therefore be
 * completely self-contained: no imports, no closures over external variables.
 *
 * The function receives the interface map produced by dts-parser.ts and
 * returns a plain-JSON result object.
 */

export interface InterfaceProbeInput {
    members: string[];
    extends: string[];
}

export interface MemberProbeResult {
    status: 'present' | 'missing' | 'likely-stub';
    evidence?: string;
}

export interface InterfaceProbeResult {
    /** Overall classification for the interface as a whole. */
    status: 'supported' | 'partial' | 'stub-heavy' | 'missing-from-window';
    present: string[];
    missing: string[];
    stubs: string[];
}

export type JsProbeResults = Record<string, InterfaceProbeResult>;

/**
 * Browser-side probe function.
 *
 * Accepts the interface map from dts-parser and the list of globals that
 * should be directly on window.
 *
 * For interfaces that have no `declare var` (not accessible as window.Name),
 * an instance factory is used to obtain a live object and probe its prototype.
 *
 * Stub-detection heuristics (any one positive → flagged as stub):
 *   1. Function body is completely empty: /^\s*function[^{]*\{\s*\}/.
 *   2. Body is under 80 characters (after stripping whitespace) — typically
 *      `function(){return undefined}` or similar no-op.
 *   3. Body contains only a `return` with no meaningful expression.
 *
 * NOTE: This function is serialized as a string and executed in the browser.
 * Keep it free of TypeScript-only syntax that won't survive toString().
 * The type annotations above are for the Node.js side only.
 */
export function jsProbe(
    interfaceMap: Record<string, InterfaceProbeInput>,
    globalNames: string[],
): JsProbeResults {
    const results: JsProbeResults = {};
    const w = window as any;

    // ── Instance factories for interfaces without `declare var` ───────────────
    // These are called when window[name] is absent, to get a live instance
    // whose prototype can still be probed.
    // Each factory must be self-contained and safe to call with no side-effects.
    const INSTANCE_FACTORIES: Record<string, () => any> = {
        CSSStyleDeclaration: function() {
            return document.documentElement.style;
        },
        CSSStyleSheet: function() {
            var s = document.createElement('style') as any;
            document.head.appendChild(s);
            var sheet = s.sheet;
            document.head.removeChild(s);
            return sheet;
        },
        CSSRuleList: function() {
            var s = document.createElement('style') as any;
            s.textContent = 'body{}';
            document.head.appendChild(s);
            var rules = s.sheet ? s.sheet.cssRules : null;
            document.head.removeChild(s);
            return rules;
        },
        CanvasRenderingContext2D: function() {
            var c = document.createElement('canvas') as HTMLCanvasElement;
            return c.getContext('2d');
        },
        CanvasGradient: function() {
            var c = document.createElement('canvas') as HTMLCanvasElement;
            var ctx = c.getContext('2d');
            return ctx ? ctx.createLinearGradient(0, 0, 1, 1) : null;
        },
        CanvasPattern: function() {
            var c = document.createElement('canvas') as HTMLCanvasElement;
            var ctx = c.getContext('2d');
            return ctx ? ctx.createPattern(c, 'repeat') : null;
        },
        HTMLDocument: function() { return document; },
        Attr: function() { return document.createAttribute('data-probe'); },
        Animation: function() {
            var el = document.createElement('div') as HTMLDivElement;
            return el.animate([], { duration: 0 });
        },
        CSSAnimation: function() {
            var el = document.createElement('div') as HTMLDivElement;
            return el.animate([], { duration: 0 });
        },
        StyleSheet: function() {
            var s = document.createElement('style') as any;
            document.head.appendChild(s);
            var sheet = s.sheet;
            document.head.removeChild(s);
            return sheet;
        },
    };

    // Build a set of declared globals for quick lookup.
    const declaredGlobals = new Set(globalNames);

    for (const [name, info] of Object.entries(interfaceMap)) {
        // Check window first (covers all `declare var` globals + anything
        // Gameface implicitly exposes).
        const isGlobal = declaredGlobals.has(name) || name in w;

        if (!isGlobal) {
            // Try to obtain a live instance via a factory.
            const factory = (INSTANCE_FACTORIES as any)[name];
            if (factory) {
                let instance: any;
                try { instance = factory(); } catch (_) { instance = null; }

                if (instance != null) {
                    // Probe the instance's prototype chain.
                    const proto = Object.getPrototypeOf(instance) ?? instance;
                    const present: string[] = [];
                    const missing: string[] = [];
                    const stubs: string[] = [];

                    for (const member of info.members) {
                        let found = false;
                        let obj: any = proto;
                        while (obj != null) {
                            if (Object.prototype.hasOwnProperty.call(obj, member)) {
                                found = true;
                                const descriptor = Object.getOwnPropertyDescriptor(obj, member);
                                const value = descriptor?.value;
                                if (typeof value === 'function') {
                                    if (isLikelyStub(value)) stubs.push(member);
                                    else present.push(member);
                                } else {
                                    present.push(member);
                                }
                                break;
                            }
                            obj = Object.getPrototypeOf(obj);
                        }
                        if (!found) missing.push(member);
                    }

                    const total = present.length + missing.length + stubs.length;
                    let status: InterfaceProbeResult['status'];
                    if (missing.length === 0 && stubs.length === 0) status = 'supported';
                    else if (stubs.length > 0 && stubs.length >= total / 2) status = 'stub-heavy';
                    else if (missing.length > 0 || stubs.length > 0) status = 'partial';
                    else status = 'supported';

                    results[name] = { status, present, missing, stubs };
                    continue;
                }
            }

            // No factory or factory returned null — record as missing.
            results[name] = {
                status: 'missing-from-window',
                present: [],
                missing: [],
                stubs: [],
            };
            continue;
        }

        const ctor = w[name];
        if (!ctor) {
            results[name] = {
                status: 'missing-from-window',
                present: [],
                missing: info.members.slice(),
                stubs: [],
            };
            continue;
        }

        const proto = ctor.prototype ?? ctor;
        const present: string[] = [];
        const missing: string[] = [];
        const stubs: string[] = [];

        for (const member of info.members) {
            // Walk the prototype chain to find the member.
            let found = false;
            let obj: any = proto;
            while (obj != null) {
                if (Object.prototype.hasOwnProperty.call(obj, member)) {
                    found = true;
                    const descriptor = Object.getOwnPropertyDescriptor(obj, member);
                    const value = descriptor?.value;

                    if (typeof value === 'function') {
                        if (isLikelyStub(value)) {
                            stubs.push(member);
                        } else {
                            present.push(member);
                        }
                    } else {
                        // Accessor or data property — presence is enough.
                        present.push(member);
                    }
                    break;
                }
                obj = Object.getPrototypeOf(obj);
            }
            if (!found) missing.push(member);
        }

        const total = present.length + missing.length + stubs.length;
        let status: InterfaceProbeResult['status'];
        if (missing.length === 0 && stubs.length === 0) {
            status = 'supported';
        } else if (stubs.length > 0 && stubs.length >= total / 2) {
            status = 'stub-heavy';
        } else if (missing.length > 0 || stubs.length > 0) {
            status = 'partial';
        } else {
            status = 'supported';
        }

        results[name] = { status, present, missing, stubs };
    }

    return results;

    // ── helpers ────────────────────────────────────────────────────────────────

    function isLikelyStub(fn: Function): boolean {
        const src = fn.toString();
        // Remove comments and normalise whitespace to reduce noise.
        const stripped = src
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/[^\n]*/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Empty body: function () {}  or  () => {}
        if (/^(function\s*\w*\s*\([^)]*\)|[^=]*=>)\s*\{\s*\}$/.test(stripped)) {
            return true;
        }
        // Body consisting only of a plain `return;` or `return undefined;`
        if (/\{\s*return(\s+undefined)?\s*;?\s*\}$/.test(stripped)) {
            return true;
        }
        // Body is suspiciously short (under 80 chars after stripping)
        const bodyMatch = stripped.match(/\{([\s\S]*)\}$/);
        if (bodyMatch && bodyMatch[1].trim().length < 30) {
            return true;
        }
        // Native function — these are real implementations
        if (/\[native code\]/.test(stripped)) {
            return false;
        }
        return false;
    }
}
