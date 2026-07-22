/**
 * CSS surface probe — runs entirely inside the Gameface browser context.
 *
 * Exported functions are serialized by the orchestrator and executed via
 * gf.executeScript().  They must be self-contained.
 *
 * Three probe functions are exported:
 *   cssPropertyProbe   – property recognition + shorthand propagation
 *   cssSelectorProbe   – selector support (parse + apply)
 */

// ── Shared types (used on both Node.js and browser sides) ────────────────────

export type CssPropertyStatus =
    | 'recognized'          // name appears in style object but we couldn't set a value
    | 'value-accepted'      // value accepted by parser (el.style reads back non-empty)
    | 'computed'            // value shows up in getComputedStyle
    | 'partial-shorthand'   // shorthand parses but not all longhands propagate
    | 'unrecognized';       // property name not in style object at all

export interface CssPropertyResult {
    status: CssPropertyStatus;
    /** For shorthands: which longhands failed to populate. */
    missingLonghands?: string[];
    /** For shorthands: computed values of each longhand after setting shorthand. */
    longhandValues?: Record<string, string>;
}

export type CssPropertyResults = Record<string, CssPropertyResult>;

export type CssSelectorStatus =
    | 'supported'       // passes both probe A and probe B
    | 'probe-b-failed'  // probe A ok, but cssRules.length == 0 (accepted, not applied)
    | 'syntax-error'    // probe A threw SyntaxError (parser-level rejection)
    | 'error';          // unexpected error during probing

export interface CssSelectorResult {
    status: CssSelectorStatus;
    group: string;
    probeA: boolean;
    probeB: boolean;
}

export type CssSelectorResults = Record<string, CssSelectorResult>;

// ── Shorthand input type (mirrors shorthand-map.ts, but plain JSON) ──────────

export interface ShorthandEntry {
    longhands: string[];
    testValue: string;
}

// ── Property probe ────────────────────────────────────────────────────────────

/**
 * Browser-side: probe every CSS property for recognition, value acceptance,
 * computed style application, and shorthand→longhand propagation.
 *
 * @param extraCandidates   Additional property names to test beyond those
 *                          already present on document.documentElement.style.
 *                          (Node side passes the keys of shorthand-map + BCD gap list.)
 * @param shorthandMap      Plain-JSON shorthand→longhands map from shorthand-map.ts.
 */
export function cssPropertyProbe(
    extraCandidates: string[],
    shorthandMap: Record<string, ShorthandEntry>,
): CssPropertyResults {
    const results: CssPropertyResults = {};

    // Build the union candidate set: everything the engine names + everything
    // we know about from static data.
    const engineProperties = new Set<string>();
    const sampleStyle = document.documentElement.style;
    for (let i = 0; i < sampleStyle.length; i++) {
        engineProperties.add(sampleStyle[i]);
    }
    // Also walk the style object as keys (covers camelCase in some engines).
    for (const key in sampleStyle) {
        if (typeof (sampleStyle as any)[key] !== 'function') {
            // Convert camelCase to kebab-case
            const kebab = key.replace(/([A-Z])/g, (m) => '-' + m.toLowerCase());
            engineProperties.add(kebab);
        }
    }

    const candidates = new Set([...engineProperties, ...extraCandidates]);

    // Detached element for set/read-back tests.
    const probe = document.createElement('div') as HTMLDivElement;
    document.body!.appendChild(probe);

    for (const prop of candidates) {
        results[prop] = probeProperty(prop, probe, shorthandMap);
    }

    document.body!.removeChild(probe);
    return results;

    // ── helpers ────────────────────────────────────────────────────────────────

    function probeProperty(
        prop: string,
        el: HTMLElement,
        shMap: Record<string, ShorthandEntry>,
    ): CssPropertyResult {
        // Reset element styles before each test.
        el.removeAttribute('style');

        // Step 1 – is the property name recognised at all?
        const camel = kebabToCamel(prop);
        const styleObj = el.style as any;

        // A property is recognised if its name (or camelCase equivalent) is a
        // key in the style object, OR if it appears in the indexed list.
        const isRecognized =
            prop in styleObj ||
            camel in styleObj ||
            (() => {
                styleObj[prop] = 'initial';
                const recognised = styleObj[prop] !== undefined;
                styleObj[prop] = '';
                return recognised;
            })();

        if (!isRecognized) {
            return { status: 'unrecognized' };
        }

        // Step 2 – determine a canonical test value.
        // Prefer the shorthand map's testValue; fall back to a generic safe value.
        const shorthandEntry = shMap[prop];
        const testValue = shorthandEntry?.testValue ?? getTestValue(prop);

        // Set the value.
        styleObj[prop] = testValue;
        const readBack = styleObj[prop];

        if (!readBack) {
            // Name recognised but value not accepted.
            return { status: 'recognized' };
        }

        // Step 3 – does it appear in getComputedStyle?
        const computed = getComputedStyle(el);
        const computedValue = (computed as any)[prop] ?? (computed as any)[camel] ?? '';

        if (!shorthandEntry) {
            // Not a shorthand — just report computed presence.
            return {
                status: computedValue ? 'computed' : 'value-accepted',
            };
        }

        // Step 4 – shorthand propagation test.
        const missingLonghands: string[] = [];
        const longhandValues: Record<string, string> = {};

        for (const lh of shorthandEntry.longhands) {
            const lhCamel = kebabToCamel(lh);
            const lhValue =
                (computed as any)[lh] ??
                (computed as any)[lhCamel] ??
                '';
            longhandValues[lh] = lhValue;
            if (!lhValue) missingLonghands.push(lh);
        }

        if (missingLonghands.length > 0) {
            return {
                status: 'partial-shorthand',
                missingLonghands,
                longhandValues,
            };
        }

        return { status: 'computed', longhandValues };
    }

    function kebabToCamel(prop: string): string {
        return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }

    function getTestValue(prop: string): string {
        // Minimal safe values for common property families.
        if (prop.includes('color')) return 'red';
        if (prop.includes('width') || prop.includes('height') || prop === 'top' ||
            prop === 'bottom' || prop === 'left' || prop === 'right') return '10px';
        if (prop.includes('opacity')) return '0.5';
        if (prop.includes('display')) return 'block';
        if (prop.includes('position')) return 'relative';
        if (prop.includes('font-size')) return '16px';
        if (prop.includes('font-weight')) return 'bold';
        if (prop.includes('z-index')) return '1';
        if (prop.includes('flex')) return '1';
        if (prop.includes('transform')) return 'translateX(0)';
        if (prop.includes('transition')) return 'none';
        if (prop.includes('animation')) return 'none';
        if (prop.includes('overflow')) return 'hidden';
        if (prop.includes('cursor')) return 'pointer';
        if (prop.includes('visibility')) return 'visible';
        if (prop.includes('pointer-events')) return 'none';
        if (prop.includes('border')) return '1px solid black';
        if (prop.includes('background')) return 'red';
        return 'initial';
    }
}

// ── Value readback probe ──────────────────────────────────────────────────────

/**
 * Browser-side: for each property in `variants`, test every listed value via
 * `el.style[prop] = value` + immediate read-back.  Returns a map of
 * `{ propName: [acceptedValue, …] }` — only values that produce a non-empty
 * read-back string are included.
 *
 * Intentionally scoped to the multi-value subset (~30–50 properties × ~15
 * values = ~500 operations) so it completes well within the CDP timeout.
 */
export function probeValueReadback(
    variants: Record<string, string[]>,
): Record<string, string[]> {
    // Intentionally NOT appended to the document.  Inline-style set+readback
    // works on detached elements and avoids triggering layout recalculations
    // for every property mutation (which would cause CDP timeouts in Gameface).
    const probe = document.createElement('div') as HTMLDivElement;
    const results: Record<string, string[]> = {};

    for (const prop of Object.keys(variants)) {
        const values = variants[prop];
        const accepted: string[] = [];
        const camel = prop.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
        const styleObj = probe.style as any;

        for (const val of values) {
            try {
                styleObj[camel] = '';   // reset
                styleObj[camel] = val; // set
                const readback = styleObj[camel];
                if (readback && readback !== '') accepted.push(val);
            } catch (_) { /* skip bad value */ }
        }
        results[prop] = accepted;
    }

    return results;
}

// ── Selector probe ─────────────────────────────────────────────────────────

export interface SelectorProbeInput {
    selector: string;
    group: string;
}

/**
 * Browser-side: probe a list of CSS selectors using two complementary methods.
 *
 * Probe A: Try to use the selector in document.querySelector().
 *   - SyntaxError → syntax-error (parser rejects it completely)
 *   - No error    → probeA = true (parser accepts it)
 *
 * Probe B: Inject `<style>selector{color:rgb(1,2,3)}</style>` and check
 *   sheet.cssRules.length.
 *   - length 0    → probe-b-failed (parser silently discards the rule)
 *   - length >= 1 → probeB = true
 *
 * At-rules are only tested via probe B (they can't be used in querySelector).
 */
export function cssSelectorProbe(entries: SelectorProbeInput[]): CssSelectorResults {
    const results: CssSelectorResults = {};
    // Sentinel element that will never match real content.
    const sentinelId = '__gf_probe_nope__';
    const sentinel = document.createElement('div') as HTMLDivElement;
    sentinel.id = sentinelId;
    document.body!.appendChild(sentinel);

    for (const { selector, group } of entries) {
        try {
            results[selector] = probeSelector(selector, group, sentinelId);
        } catch (_e) {
            // Unexpected non-SyntaxError (e.g. Gameface internal exception on
            // exotic at-rules or pseudo-selectors). Record as 'error' so the
            // one bad selector doesn't abort the whole batch.
            results[selector] = { status: 'error', group, probeA: false, probeB: false };
        }
    }

    document.body!.removeChild(sentinel);
    return results;

    // ── helpers ────────────────────────────────────────────────────────────────

    function probeSelector(
        selector: string,
        group: string,
        sentinelId: string,
    ): CssSelectorResult {
        const isAtRule = selector.trimStart().startsWith('@');
        // Pseudo-elements (::before, ::after, …) are never valid subjects of
        // querySelector — attempting it can hang some engines rather than
        // throwing SyntaxError. Skip probe A for them entirely.
        const isPseudoElement = !isAtRule && selector.trimStart().startsWith('::');

        let probeA = false;
        let probeB = false;

        // Probe A — querySelector (skip for at-rules and pseudo-elements)
        if (!isAtRule && !isPseudoElement) {
            try {
                // Append a sentinel that will never match so the query always runs.
                document.querySelector(`${selector}, #${sentinelId}`);
                probeA = true;
            } catch (e) {
                if (e instanceof SyntaxError || (e as any)?.name === 'SyntaxError') {
                    return {
                        status: 'syntax-error',
                        group,
                        probeA: false,
                        probeB: false,
                    };
                }
                return { status: 'error', group, probeA: false, probeB: false };
            }
        }

        // Probe B — style injection
        const styleEl = document.createElement('style') as HTMLStyleElement;
        let ruleText: string;
        if (isAtRule) {
            // Wrap the at-rule with a simple rule inside to make it detectable.
            ruleText = `${selector} { * { color: rgb(1, 2, 3); } }`;
        } else if (isPseudoElement) {
            // Bare pseudo-element selectors (e.g. `::before { … }`) can stall
            // some CSS parsers. Anchoring to a generic element type makes the
            // rule syntactically unambiguous: `p::before { … }`.
            ruleText = `p${selector} { color: rgb(1, 2, 3); content: ''; }`;
        } else {
            ruleText = `${selector} { color: rgb(1, 2, 3); }`;
        }
        styleEl.textContent = ruleText;

        document.head.appendChild(styleEl);
        try {
            const sheet = styleEl.sheet;
            probeB = (sheet?.cssRules?.length ?? 0) > 0;
        } finally {
            document.head.removeChild(styleEl);
        }

        if (!probeB) {
            return { status: 'probe-b-failed', group, probeA, probeB };
        }

        // For at-rules and pseudo-elements, probe A is intentionally skipped;
        // report probeA as true so callers know the absence isn't a failure.
        const reportProbeA = (isAtRule || isPseudoElement) ? true : probeA;
        return { status: 'supported', group, probeA: reportProbeA, probeB };
    }
}
