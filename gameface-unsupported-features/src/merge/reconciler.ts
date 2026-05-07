import type { DtsParsed } from '../static/dts-parser';
import type { JsProbeResults } from '../probes/js-probe';
import type {
    CssPropertyResults,
    CssSelectorResults,
    CssSelectorResult,
} from '../probes/css-probe';
import type {
    HtmlConstructorResults,
    HtmlFingerprintResults,
    InputTypeResults,
} from '../probes/html-probe';
import type { LogParseResults } from '../log/log-parser';
import { buildUnsupportedSelectorSet } from '../log/log-parser';
import {
    getGamefaceSupportedUnits,
    getSupportedUnitsForProperty,
} from '../static/css-unit-support';

// ── Output types ──────────────────────────────────────────────────────────────

/**
 * All possible status labels across all surfaces.
 * Using a union keeps the reconciler output strongly typed.
 */
export type FeatureStatus =
    // Positive
    | 'supported'
    // Partial / dangerous
    | 'partial-shorthand'
    | 'stub'
    | 'stub-heavy'
    | 'parser-only'
    | 'parsed-no-impl'
    | 'silently-coerced'
    | 'type-preserved-but-inert'
    | 'partial'
    // Negative
    | 'missing'
    | 'missing-from-window'
    | 'unknown'
    | 'syntax-error';

export interface FeatureEntry {
    status: FeatureStatus;
    surface: 'css-property' | 'css-selector' | 'js' | 'html' | 'input-type';
    /** Human-readable name of the feature (property, tag, interface name, etc.) */
    name: string;
    evidence?: Record<string, unknown>;
}

export interface ReconcileOutput {
    /** Features that work as spec describes — no known gaps. */
    supported: FeatureEntry[];
    /**
     * The high-value partial output:
     * partial-shorthand, stub, silently-coerced,
     * type-preserved-but-inert, partial, stub-heavy.
     */
    partial: FeatureEntry[];
    /** Features that fail all probes or are entirely absent. */
    unsupported: FeatureEntry[];
    /** Summary counts for quick inspection. */
    summary: {
        supported: number;
        partial: number;
        unsupported: number;
        byStatus: Record<string, number>;
    };
}

export interface ReconcileInput {
    dtsParsed: DtsParsed;
    jsResults: JsProbeResults;
    cssPropertyResults: CssPropertyResults;
    cssSelectorResults: CssSelectorResults;
    htmlConstructorResults: HtmlConstructorResults;
    htmlFingerprintResults: HtmlFingerprintResults;
    inputTypeResults: InputTypeResults;
    logResults: LogParseResults;
    /**
     * Log results parsed from the stylesheet-based CSS probe page.
     * Contains `unsupportedProperties` populated by the Gameface stylesheet
     * parser (which emits "Unsupported CSS property detected" warnings).
     * This is the most reliable signal for completely unsupported properties.
     */
    cssSheetLogResults?: LogParseResults;
    /**
     * The keyword values that were individually tested per property on the
     * CSS sheet probe page.  Keys are lower-case property names.  Values are
     * the tested value strings exactly as written in the generated CSS rules.
     */
    cssTestedValues?: Record<string, string[]>;
    /**
     * For every property in `cssTestedValues` that has more than one keyword
     * value, the subset of those values that were confirmed accepted by the
     * JS set+read-back probe (`probeValueReadback`).
     *
     * When present this is the primary source for `supportedValues` /
     * `unsupportedValues` evidence because it is more accurate than log
     * parsing (which Gameface may omit for silently-ignored values).
     *
     * Keys are lower-case property names.
     */
    cssValueReadbackResults?: Record<string, string[]>;
}

// ── Bucket helpers ────────────────────────────────────────────────────────────

const PARTIAL_STATUSES: Set<FeatureStatus> = new Set([
    'partial-shorthand',
    'stub',
    'stub-heavy',
    'silently-coerced',
    'type-preserved-but-inert',
    'partial',
]);

const UNSUPPORTED_STATUSES: Set<FeatureStatus> = new Set([
    'missing',
    'missing-from-window',
    'unknown',
    'syntax-error',
    // Selectors that the engine accepts at the parser level but never
    // applies — `cssRules.length` stays zero or the engine emits an
    // "Unsupported CSS pseudo …" warning.  At this layer that's
    // indistinguishable from "completely unsupported", so we route to
    // the unsupported bucket instead of the partial one.
    'parser-only',
    // Tags whose constructor is the generic HTMLElement: Gameface ships a
    // framework-compat shim (every unsupported tag still satisfies
    // `el instanceof HTMLElement`), so we cannot tell at this layer whether
    // the tag is genuinely implemented or just permissively parsed.  Per
    // policy, these are reported as unsupported — the substitution is to
    // use <div>/<span> with appropriate styling.
    'parsed-no-impl',
]);

function bucket(entry: FeatureEntry, output: ReconcileOutput): void {
    if (entry.status === 'supported') {
        output.supported.push(entry);
    } else if (PARTIAL_STATUSES.has(entry.status)) {
        output.partial.push(entry);
    } else if (UNSUPPORTED_STATUSES.has(entry.status)) {
        output.unsupported.push(entry);
    } else {
        // Fallback: treat unrecognized statuses as partial.
        output.partial.push(entry);
    }
}

// ── Main reconcile function ───────────────────────────────────────────────────

export function reconcile(input: ReconcileInput): ReconcileOutput {
    const output: ReconcileOutput = {
        supported: [],
        partial: [],
        unsupported: [],
        summary: { supported: 0, partial: 0, unsupported: 0, byStatus: {} },
    };

    reconcileCssProperties(input, output);
    reconcileCssSelectors(input, output);
    reconcileJs(input, output);
    reconcileHtml(input, output);
    reconcileInputTypes(input, output);

    // Build summary.
    output.summary.supported = output.supported.length;
    output.summary.partial = output.partial.length;
    output.summary.unsupported = output.unsupported.length;

    const allEntries = [...output.supported, ...output.partial, ...output.unsupported];
    for (const entry of allEntries) {
        output.summary.byStatus[entry.status] =
            (output.summary.byStatus[entry.status] ?? 0) + 1;
    }

    return output;
}

// ── Surface partition ─────────────────────────────────────────────────────────

/** The four top-level output folders. */
export type SurfaceFolder = 'js' | 'css' | 'selectors' | 'html';

/**
 * Maps each FeatureEntry surface to the output folder it belongs to.
 * `css-property`  → css        (property support + value-level evidence)
 * `css-selector`  → selectors  (pseudo-classes, pseudo-elements, combinators)
 * `html`          → html
 * `input-type`    → html
 * `js`            → js
 */
const SURFACE_FOLDER: Record<FeatureEntry['surface'], SurfaceFolder> = {
    'js': 'js',
    'css-property': 'css',
    'css-selector': 'selectors',
    'html': 'html',
    'input-type': 'html',
};

function buildSummary(entries: FeatureEntry[]): ReconcileOutput['summary'] {
    const byStatus: Record<string, number> = {};
    let supported = 0;
    let partial = 0;
    let unsupported = 0;
    for (const e of entries) {
        byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
        if (e.status === 'supported') supported++;
        else if (PARTIAL_STATUSES.has(e.status)) partial++;
        else unsupported++;
    }
    return { supported, partial, unsupported, byStatus };
}

/**
 * Splits a merged `ReconcileOutput` into four per-surface `ReconcileOutput`
 * objects keyed by folder name (`js`, `css`, `selectors`, `html`).
 * Each sub-output has its own summary recomputed from its entries.
 */
export function partitionBySurface(
    output: ReconcileOutput,
): Record<SurfaceFolder, ReconcileOutput> {
    const buckets: Record<SurfaceFolder, { supported: FeatureEntry[]; partial: FeatureEntry[]; unsupported: FeatureEntry[] }> = {
        js:        { supported: [], partial: [], unsupported: [] },
        css:       { supported: [], partial: [], unsupported: [] },
        selectors: { supported: [], partial: [], unsupported: [] },
        html:      { supported: [], partial: [], unsupported: [] },
    };

    for (const entry of output.supported) {
        buckets[SURFACE_FOLDER[entry.surface]].supported.push(entry);
    }
    for (const entry of output.partial) {
        buckets[SURFACE_FOLDER[entry.surface]].partial.push(entry);
    }
    for (const entry of output.unsupported) {
        buckets[SURFACE_FOLDER[entry.surface]].unsupported.push(entry);
    }

    const result = {} as Record<SurfaceFolder, ReconcileOutput>;
    for (const folder of ['js', 'css', 'selectors', 'html'] as SurfaceFolder[]) {
        const { supported, partial, unsupported } = buckets[folder];
        const all = [...supported, ...partial, ...unsupported];
        result[folder] = { supported, partial, unsupported, summary: buildSummary(all) };
    }
    return result;
}

// ── CSS property reconciliation ───────────────────────────────────────────────

function reconcileCssProperties(input: ReconcileInput, output: ReconcileOutput): void {
    const { cssPropertyResults, logResults, cssSheetLogResults,
            cssTestedValues, cssValueReadbackResults, dtsParsed } = input;
    if (!cssPropertyResults) return;

    // Supported-units lookup is built once per reconcile() — it depends only
    // on the DTS, not on any per-property probe data.  When the CSS interface
    // is missing from the DTS (e.g. tests pass an empty fixture) every
    // category resolves to an empty list, so getSupportedUnitsForProperty
    // still returns a sensible value.
    const supportedUnitsByType = getGamefaceSupportedUnits(
        dtsParsed?.interfaces?.['CSS']?.members,
    );

    for (const [prop, result] of Object.entries(cssPropertyResults)) {
        let status: FeatureStatus;
        const evidence: Record<string, unknown> = {};

        const propLower = prop.toLowerCase();
        const invalidValues = logResults.propertiesWithInvalidValues.get(propLower);
        const hasShorthandLimitation = logResults.shorthandsWithLimitations.has(propLower);

        // ── Highest-priority signal: stylesheet parser log ────────────────────
        const isParserUnsupported = cssSheetLogResults?.unsupportedProperties.has(propLower) ?? false;
        if (isParserUnsupported) {
            status = 'missing';
            evidence['logWarning'] = 'Unsupported CSS property detected (stylesheet parser)';
            bucket({ status, surface: 'css-property', name: prop, evidence }, output);
            continue;
        }

        // ── Merge invalid-value log entries from both sources ─────────────────
        const sheetInvalidValues = cssSheetLogResults?.propertiesWithInvalidValues.get(propLower);
        const allInvalidValues = new Set([
            ...(invalidValues ?? []),
            ...(sheetInvalidValues ?? []),
        ]);

        // ── Per-value evidence ────────────────────────────────────────────────
        // Prefer the JS readback results (set+readback is more accurate than
        // log parsing, since Gameface may silently ignore unsupported values
        // without emitting a warning).  Fall back to log-based evidence.
        const testedVals = cssTestedValues?.[propLower];
        const readbackAccepted = cssValueReadbackResults?.[propLower]; // undefined = not tested

        if (testedVals && testedVals.length > 1) {
            if (readbackAccepted !== undefined) {
                // Readback data available — use it as the authoritative source.
                const acceptedSet = new Set(readbackAccepted);
                const unsupportedVals = testedVals.filter((v) => !acceptedSet.has(v));
                if (readbackAccepted.length > 0 && unsupportedVals.length > 0) {
                    evidence['supportedValues'] = readbackAccepted;
                    evidence['unsupportedValues'] = unsupportedVals;
                }
            } else if (allInvalidValues.size > 0) {
                // No readback — fall back to log-based evidence.
                const supportedVals = testedVals.filter((v) => !allInvalidValues.has(v));
                const unsupportedVals = testedVals.filter((v) => allInvalidValues.has(v));
                evidence['supportedValues'] = supportedVals;
                evidence['unsupportedValues'] = unsupportedVals;
            }
        }

        if (allInvalidValues.size > 0) {
            if (result.status === 'partial-shorthand') {
                status = 'partial-shorthand';
                evidence['missingLonghands'] = result.missingLonghands;
                evidence['longhandValues'] = result.longhandValues;
                evidence['logRejectedValues'] = [...allInvalidValues];
            } else {
                status = 'partial';
                evidence['logRejectedValues'] = [...allInvalidValues];
            }
        } else if (hasShorthandLimitation) {
            status = 'partial';
            evidence['logWarning'] = 'shorthand has known limitations';
        } else {
            switch (result.status) {
                case 'computed':
                    status = 'supported';
                    break;
                case 'partial-shorthand':
                    status = 'partial-shorthand';
                    evidence['missingLonghands'] = result.missingLonghands;
                    evidence['longhandValues'] = result.longhandValues;
                    break;
                case 'value-accepted': {
                    // Use readback to give a definitive verdict if available.
                    if (readbackAccepted !== undefined && testedVals) {
                        if (readbackAccepted.length === testedVals.length) {
                            // Every tested value accepted → fully supported.
                            status = 'supported';
                        } else if (readbackAccepted.length > 0) {
                            // Some values work, some don't → partial.
                            // evidence['supportedValues'] / ['unsupportedValues']
                            // already set in the per-value block above.
                            status = 'partial';
                        } else {
                            // Recognised by name but no value accepted at all.
                            status = 'partial';
                            evidence['probe'] = 'recognized-no-value-accepted';
                        }
                    } else {
                        // No readback and no log warning — property is in the
                        // style object but we couldn't verify value acceptance.
                        status = 'partial';
                        evidence['probe'] = 'value-accepted-but-not-computed';
                    }
                    break;
                }
                case 'recognized':
                    status = 'partial';
                    evidence['probe'] = 'name-recognized-but-value-not-accepted';
                    break;
                case 'unrecognized':
                    status = 'missing';
                    break;
                default:
                    status = 'missing';
            }
        }

        // Attach unit-support evidence for any unit-bearing property whose
        // bucket is going to be supported or partial.  Skipped for the
        // unsupported bucket (the property doesn't work, so listing the
        // units it WOULD accept would be misleading) and for keyword-only
        // properties (getSupportedUnitsForProperty returns null).
        if (status !== 'missing') {
            const units = getSupportedUnitsForProperty(propLower, supportedUnitsByType);
            if (units && units.length > 0) {
                evidence['supportedUnits'] = units;
            }
        }

        bucket(
            { status, surface: 'css-property', name: prop, evidence },
            output,
        );
    }
}

// ── CSS selector reconciliation ───────────────────────────────────────────────

/**
 * Selectors that Gameface ships with documented limitations rather than
 * full or zero support.  Drives a manual override into the `partial` bucket
 * because the runtime probe (querySelector + cssRules.length) cannot
 * distinguish "applies but with caveats" from "applies fully".
 *
 * Source: Gameface CSS support tables (selectors section).
 */
const KNOWN_PARTIAL_SELECTORS: Array<{
    match: (selector: string) => boolean;
    canonicalName: string;
    note: string;
}> = [
    {
        // ::selection accepts the rule but only honours `color` and
        // `background-color` declarations inside it.
        match: (s) => s === '::selection',
        canonicalName: '::selection',
        note: 'only the `color` and `background-color` properties are honoured; other declarations are ignored.',
    },
    {
        // :nth-child(<an+b>) and the related :nth-* pseudo-classes work, but
        // the CSS Selectors-4 `:nth-child(<an+b> of <complex-selector-list>)`
        // form is not supported.
        match: (s) => /^:nth-(?:child|last-child|of-type|last-of-type)\b/i.test(s),
        canonicalName: ':nth-child(an+b)',
        note: 'no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).',
    },
];

function findKnownPartialSelector(
    selector: string,
): (typeof KNOWN_PARTIAL_SELECTORS)[number] | null {
    return KNOWN_PARTIAL_SELECTORS.find((entry) => entry.match(selector)) ?? null;
}

function reconcileCssSelectors(input: ReconcileInput, output: ReconcileOutput): void {
    const { cssSelectorResults, logResults } = input;
    if (!cssSelectorResults) return;

    // Build a flat set of ":pseudo-class" and "::pseudo-element" strings from log.
    const logUnsupportedSelectors = buildUnsupportedSelectorSet(logResults);

    for (const [selector, result] of Object.entries(cssSelectorResults)) {
        let status: FeatureStatus;
        const evidence: Record<string, unknown> = {
            group: (result as CssSelectorResult).group,
            probeA: (result as CssSelectorResult).probeA,
            probeB: (result as CssSelectorResult).probeB,
        };

        // ── Manual override: documented partial-support selectors ──────────
        // Always take precedence over runtime probe + log signals because
        // the limitation is qualitative (which declarations apply) and
        // can't be detected by the boolean probes.
        const knownPartial = findKnownPartialSelector(selector);
        if (knownPartial) {
            evidence['partialSpec'] = knownPartial.canonicalName;
            evidence['note'] = knownPartial.note;
            bucket(
                { status: 'partial', surface: 'css-selector', name: selector, evidence },
                output,
            );
            continue;
        }

        // Check log: does the selector contain a pseudo-class or pseudo-element
        // that the log identified as unsupported?
        // e.g. selector ":focus-within" matches log entry "focus-within".
        // For functional pseudo-classes like ":not(.foo)", extract "not" and check.
        const logMatch = findLogSelectorMatch(selector, logUnsupportedSelectors);
        if (logMatch) {
            // Log confirmed unsupported.  Gameface logs a warning rather than
            // throwing on bad selectors, so this is the most reliable signal
            // we have that the parser saw the selector and refused to apply
            // it — exactly what `parser-only` is supposed to mean.
            status = 'parser-only';
            evidence['logWarning'] = `unsupported pseudo: ${logMatch}`;
        } else {
            switch (result.status) {
                case 'supported':
                    status = 'supported';
                    break;
                case 'probe-b-failed':
                    // Gameface's CSSOM does not reliably expose `cssRules`
                    // for parsed `<style>` blocks at probe time, so a zero
                    // rule count is NOT evidence of non-support.  The
                    // authoritative negative signal is the engine's own
                    // log, which we already checked above; if it was
                    // silent for this selector the parser accepted it and
                    // we treat that as supported (mirrors the
                    // "log silence as acceptance" rule used for CSS
                    // properties).
                    status = 'supported';
                    evidence['probe'] = 'log-silent-no-rules-observed';
                    break;
                case 'syntax-error':
                    status = 'syntax-error';
                    break;
                case 'error':
                    status = 'missing';
                    evidence['error'] = 'unexpected probe error';
                    break;
                default:
                    status = 'missing';
            }
        }

        bucket(
            { status, surface: 'css-selector', name: selector, evidence },
            output,
        );
    }
}

/**
 * Check whether a selector string contains a pseudo-class or pseudo-element
 * that the log identified as unsupported.
 *
 * Handles both:
 *   ":focus-within"      → checks log set for ":focus-within"
 *   ":not(.foo)"         → extracts "not", checks log set for ":not"
 *   "::first-line"       → checks log set for "::first-line"
 *
 * Returns the matching log entry string, or null if no match.
 */
function findLogSelectorMatch(
    selector: string,
    logUnsupportedSelectors: Set<string>,
): string | null {
    // Direct match (e.g. selector IS ":focus-within" or "::first-line").
    if (logUnsupportedSelectors.has(selector)) return selector;

    // Extract all :pseudo and ::pseudo tokens from the selector.
    // Regex matches ::name or :name (including functional ones like :not(
    const pseudoRe = /::([\w-]+)|:([\w-]+)/g;
    let m: RegExpExecArray | null;
    while ((m = pseudoRe.exec(selector)) !== null) {
        const elementName = m[1]; // ::element
        const className = m[2];   // :class

        if (elementName) {
            const key = '::' + elementName;
            if (logUnsupportedSelectors.has(key)) return key;
        }
        if (className) {
            const key = ':' + className;
            if (logUnsupportedSelectors.has(key)) return key;
        }
    }
    return null;
}

// ── JS surface reconciliation ─────────────────────────────────────────────────

function reconcileJs(input: ReconcileInput, output: ReconcileOutput): void {
    const { jsResults } = input;
    if (!jsResults) return;

    for (const [name, result] of Object.entries(jsResults)) {
        const evidence: Record<string, unknown> = {};
        let status: FeatureStatus;

        switch (result.status) {
            case 'supported':
                status = 'supported';
                break;
            case 'stub-heavy':
                status = 'stub-heavy';
                evidence['stubs'] = result.stubs;
                evidence['present'] = result.present;
                break;
            case 'partial':
                // Has both stub and missing members — classify by dominant issue.
                if (result.stubs.length > 0) {
                    status = 'stub';
                    evidence['stubs'] = result.stubs;
                    evidence['missing'] = result.missing;
                } else {
                    status = 'partial';
                    evidence['missing'] = result.missing;
                }
                break;
            case 'missing-from-window':
                status = 'missing-from-window';
                if (result.missing.length > 0) evidence['missing'] = result.missing;
                break;
            default:
                status = 'missing-from-window';
        }

        bucket(
            { status, surface: 'js', name, evidence },
            output,
        );
    }
}

// ── HTML surface reconciliation ───────────────────────────────────────────────

function reconcileHtml(input: ReconcileInput, output: ReconcileOutput): void {
    const { htmlConstructorResults, htmlFingerprintResults } = input;
    if (!htmlConstructorResults) return;

    for (const [tag, ctorResult] of Object.entries(htmlConstructorResults)) {
        const evidence: Record<string, unknown> = {
            constructorName: ctorResult.constructorName,
        };
        let status: FeatureStatus;

        switch (ctorResult.tier) {
            case 'unknown':
                status = 'unknown';
                break;
            case 'parsed-no-impl':
                // Constructor is generic HTMLElement — that's Gameface's
                // framework-compat shim used for *every* unsupported tag, so
                // we cannot prove the tag is actually implemented.  Per
                // policy: reported as unsupported.  Recommended substitution
                // is <div>/<span> with appropriate styling.
                status = 'parsed-no-impl';
                evidence['note'] =
                    'no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead';
                break;
            case 'implemented': {
                // Refine with fingerprint data if available.
                const fp = htmlFingerprintResults?.[tag];
                if (!fp) {
                    status = 'supported';
                } else {
                    evidence['checks'] = fp.checks;
                    if (fp.notes) evidence['notes'] = fp.notes;
                    switch (fp.status) {
                        case 'supported':
                            status = 'supported';
                            break;
                        case 'partial':
                            status = 'partial';
                            break;
                        case 'stub':
                            status = 'stub';
                            break;
                    }
                }
                break;
            }
        }

        bucket(
            { status: status!, surface: 'html', name: tag, evidence },
            output,
        );
    }
}

// ── Input type reconciliation ─────────────────────────────────────────────────

function reconcileInputTypes(input: ReconcileInput, output: ReconcileOutput): void {
    const { inputTypeResults } = input;
    if (!inputTypeResults) return;

    for (const [type, result] of Object.entries(inputTypeResults)) {
        const evidence: Record<string, unknown> = {
            roundTripType: result.roundTripType,
            apiChecks: result.apiChecks,
        };
        let status: FeatureStatus;

        switch (result.status) {
            case 'supported':
                status = 'supported';
                break;
            case 'type-preserved-but-inert':
                status = 'type-preserved-but-inert';
                break;
            case 'silently-coerced':
                status = 'silently-coerced';
                break;
            default:
                status = 'missing';
        }

        bucket(
            { status, surface: 'input-type', name: `input[type="${type}"]`, evidence },
            output,
        );
    }
}
