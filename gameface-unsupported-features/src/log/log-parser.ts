import * as fs from 'node:fs';
import * as readline from 'node:readline';

/**
 * Warning categories extracted from CohtmlApplication.log (the Gameface Player log).
 *
 * Real log examples observed:
 *   Warning: Trying to set "filter" property to invalid value: initial
 *   Warning: Trying to set "overflow" property to invalid value: hidden scroll
 *   Warning: Trying to set "alignItems" property to invalid value: anchor-center
 *   Warning: Unable to parse declaration: align-content - baseline
 *   Warning: dashed is not supported for border-style
 *   Warning: mask-mode Luminance currently not supported falling back to alpha
 *   Warning: Space repeat type is not supported falling back to round
 *   Warning: Unable to evaluate calc() expression: calc(sign(-1)*-100px)
 *   Warning: Unsupported CSS pseudo class selector encountered: focus-within
 *   Warning: Unsupported CSS pseudo element encountered: first-line
 *   Warning: CSS parsing error "syntax error" near text: |
 *   Warning: The all shorthand doesn't support: ...
 *   Warning: not(
 *   Warning: Unsupported CSS pseudo class selector encountered: not
 */
export interface LogParseResults {
    /**
     * Properties for which the engine issued "Trying to set X property to invalid value: Y".
     * Key = lowercase property name. Value = set of rejected values.
     * These properties ARE recognised by the engine but the tested value was rejected.
     */
    propertiesWithInvalidValues: Map<string, Set<string>>;

    /**
     * Properties for which the engine issued "Unsupported CSS property detected: X".
     * These properties are completely unrecognised by the Gameface CSS parser.
     * Populated only when CSS is parsed from a stylesheet (not from JS style object).
     * Key = lowercase property name.
     */
    unsupportedProperties: Set<string>;

    /**
     * Pseudo-class names the engine warned about as unsupported.
     * Stored WITHOUT the leading colon: "focus-within", "not", "has", …
     * Use `':' + name` to match against selector strings.
     */
    unsupportedPseudoClasses: Set<string>;

    /**
     * Pseudo-element names the engine warned about as unsupported.
     * Stored WITHOUT the leading `::`: "first-line", "placeholder", …
     * Use `'::' + name` to match against selector strings.
     */
    unsupportedPseudoElements: Set<string>;

    /**
     * Properties with the special multi-line "shorthand doesn't support" warning.
     * Currently only "all" is known to produce this.
     */
    shorthandsWithLimitations: Set<string>;

    /**
     * Property-agnostic `calc()` rejections.  Gameface emits these when an
     * expression PARSES successfully but contains a math sub-function the
     * engine cannot evaluate (`sign`, `pow`, `sqrt`, …):
     *
     *   Warning: Unable to evaluate calc() expression: calc(sign(-1)*-100px)
     *
     * The warning does not name the property that triggered it, so this
     * channel stores the bare calc-expression string.  The reconciler
     * canonicalises whitespace before comparing against catalogue values.
     */
    unsupportedCalcExpressions: Set<string>;

    /** Raw matching warning lines (for debugging / evidence in output). */
    rawWarnings: string[];

    /** True if the log file was found and successfully opened. */
    logFound: boolean;
}

// ── Pattern table ─────────────────────────────────────────────────────────────

/**
 * Normalise a CSS property name as it might appear in a Gameface warning to
 * the canonical kebab-case form used by the reconciler.
 *
 * Gameface emits warnings using whatever casing the JS code provided, so an
 * `el.style.alignItems = 'foo'` produces a camelCase warning while a stylesheet
 * `align-items: foo` produces a kebab-case one.  We always store kebab.
 *
 * Examples:
 *   alignItems    → align-items
 *   borderStyle   → border-style
 *   border-style  → border-style   (idempotent)
 *   MaskMode      → mask-mode
 */
function normalizePropName(name: string): string {
    return name
        .trim()
        // Insert a dash between any lower→Upper boundary.
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // Insert a dash between consecutive uppercase letters followed by a
        // lowercase one (ABCdef → A-B-Cdef → ab-cdef).
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .replace(/^-/, '')
        .toLowerCase();
}

/**
 * Properties affected by the engine's generic "X repeat type is not supported"
 * warning, which doesn't name the concrete property.  These all accept the
 * `space | round | repeat | no-repeat | stretch` keyword family.
 */
const REPEAT_FAMILY_PROPERTIES = [
    'background-repeat',
    'mask-repeat',
    'border-image-repeat',
    'mask-border-repeat',
];

function recordInvalidValue(
    results: LogParseResults,
    prop: string,
    value: string,
): void {
    const cleanProp = normalizePropName(prop);
    const cleanValue = value.trim().toLowerCase();
    if (!cleanProp || !cleanValue) return;
    if (!results.propertiesWithInvalidValues.has(cleanProp)) {
        results.propertiesWithInvalidValues.set(cleanProp, new Set());
    }
    results.propertiesWithInvalidValues.get(cleanProp)!.add(cleanValue);
}

/**
 * Actual Gameface log patterns derived from CohtmlApplication.log.
 * Order matters: more specific patterns first.
 */
const LOG_PATTERNS: Array<{
    re: RegExp;
    handler: (match: RegExpMatchArray, line: string, results: LogParseResults) => void;
}> = [
    // "Warning: Unsupported CSS property detected: float"
    // Only emitted when CSS is parsed from a stylesheet, NOT from JS el.style writes.
    {
        re: /Unsupported CSS property detected:\s*(?<prop>[\w-]+)/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            if (prop) r.unsupportedProperties.add(normalizePropName(prop));
        },
    },

    // "Warning: Trying to set "filter" property to invalid value: initial"
    // "Warning: Trying to set "alignItems" property to invalid value: anchor-center"
    // The property name may be either kebab-case (stylesheet origin) or
    // camelCase (JS el.style.<name> origin) — normalise to kebab.
    {
        re: /Trying to set "(?<prop>[^"]+)" property to invalid value:\s*(?<value>.+)/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            const value = m.groups?.value ?? '';
            if (prop) recordInvalidValue(r, prop, value);
        },
    },

    // "Warning: Unable to parse declaration: align-content - baseline"
    // Emitted by the stylesheet parser when a property recognises the name but
    // not the supplied value.  The property is always kebab-case here.
    //
    // The separator MUST be whitespace + dash + whitespace.  Greedy/lazy
    // backtracking would otherwise match the `<prop>: <value>` form below
    // by consuming part of a hyphenated property name as a separator (e.g.
    // `font-size: clamp(…)` → prop=`font`, sep=`-`, value=`size: clamp(…)`).
    {
        re: /Unable to parse declaration:\s*(?<prop>[\w-]+?)\s+-\s+(?<value>.+)/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            const value = m.groups?.value ?? '';
            if (prop) recordInvalidValue(r, prop, value);
        },
    },

    // "Warning: Unable to parse declaration: font-size: clamp(100px, 20vw, 200px);"
    // Same warning class as above, but Gameface uses the canonical
    // `<prop>: <value>;` form when the value is structurally complex
    // (function calls, multi-token shorthands, …) instead of the bare
    // `<prop> - <value>` form used for keyword rejections.
    // The semicolon is optional in the recorded value so the function probe
    // can compare against the unterminated form it generated.
    {
        re: /Unable to parse declaration:\s*(?<prop>[\w-]+)\s*:\s*(?<value>.+?)\s*;?\s*$/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            const value = m.groups?.value ?? '';
            if (prop) recordInvalidValue(r, prop, value);
        },
    },

    // "Warning: Unable to evaluate calc() expression: calc(sign(-1)*-100px)"
    // Emitted when calc() itself parses but contains an inner math
    // function Gameface cannot evaluate (sign, pow, sqrt, …).  No
    // property name is included, so we stash the bare expression and let
    // the reconciler match by canonicalised value against the function
    // catalogue (see reconcileCssFunctions).
    {
        re: /^Warning:\s*Unable to evaluate calc\(\) expression:\s*(?<expr>.+?)\s*;?\s*$/i,
        handler: (m, _line, r) => {
            const expr = m.groups?.expr?.trim();
            if (expr) r.unsupportedCalcExpressions.add(expr.toLowerCase());
        },
    },

    // "Warning: Space repeat type is not supported falling back to round"
    // The engine doesn't name the concrete property — fan out to every
    // repeat-family property so whichever one the reconciler is testing
    // against will pick the value up.
    // Anchored to the start of the warning body to avoid sub-string matches
    // inside longer messages; must be checked BEFORE the generic
    // "is not supported for" pattern below.
    {
        re: /^Warning:\s*(?<value>\S+)\s+repeat type is not supported falling back to\b/i,
        handler: (m, _line, r) => {
            const value = m.groups?.value ?? '';
            if (!value) return;
            for (const prop of REPEAT_FAMILY_PROPERTIES) {
                recordInvalidValue(r, prop, value);
            }
        },
    },

    // "Warning: dashed is not supported for border-style"
    // Engine-level rejection where the value is named first, then the property.
    // Anchored to the start of the warning body so multi-clause messages
    // ("X failed because Y is not supported for Z") don't false-positive.
    {
        re: /^Warning:\s*(?<value>\S+)\s+is not supported for\s+(?<prop>[\w-]+)\b/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            const value = m.groups?.value ?? '';
            if (prop) recordInvalidValue(r, prop, value);
        },
    },

    // "Warning: mask-mode Luminance currently not supported falling back to alpha"
    // Property-then-value form with an explicit fallback value.
    {
        re: /^Warning:\s*(?<prop>[\w-]+)\s+(?<value>\S+)\s+currently not supported falling back to\b/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop;
            const value = m.groups?.value ?? '';
            if (prop) recordInvalidValue(r, prop, value);
        },
    },

    // "Warning: Unsupported CSS pseudo class selector encountered: focus-within"
    // Also covers functional pseudo-classes: "Unsupported CSS pseudo class selector encountered: not"
    {
        re: /Unsupported CSS pseudo class selector encountered:\s*(?<name>[\w-]+)/i,
        handler: (m, _line, r) => {
            const name = m.groups?.name?.trim();
            if (name) r.unsupportedPseudoClasses.add(name);
        },
    },

    // "Warning: Unsupported CSS pseudo element encountered: first-line"
    {
        re: /Unsupported CSS pseudo element encountered:\s*(?<name>[\w-]+)/i,
        handler: (m, _line, r) => {
            const name = m.groups?.name?.trim();
            if (name) r.unsupportedPseudoElements.add(name);
        },
    },

    // "Warning: The all shorthand doesn't support:"
    {
        re: /The (?<prop>[\w-]+) shorthand doesn'?t support/i,
        handler: (m, _line, r) => {
            const prop = m.groups?.prop?.toLowerCase().trim();
            if (prop) r.shorthandsWithLimitations.add(prop);
        },
    },

    // "Warning: CSS parsing error "syntax error" near text: TOKEN"
    // Too granular for individual feature mapping, but record the line as evidence.
    {
        re: /CSS parsing error "syntax error" near text:/i,
        handler: (_m, _line, _r) => {
            // Intentionally not mapped — these are sub-token errors from cascaded
            // parse failures. The enclosing selector/property is captured by the
            // pseudo-class / pseudo-element patterns above.
        },
    },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Asynchronously parse the Gameface CohtmlApplication.log.
 * Reads line-by-line to avoid loading large logs into memory.
 */
export async function parseLog(logPath: string): Promise<LogParseResults> {
    const results = emptyResults();
    if (!logPath) return results;

    try {
        await fs.promises.access(logPath, fs.constants.R_OK);
    } catch {
        return results;
    }

    results.logFound = true;

    const rl = readline.createInterface({
        input: fs.createReadStream(logPath, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        processLine(line, results);
    }

    return results;
}

/**
 * Synchronous variant — reads the entire file at once.
 * Suitable for reasonably-sized logs (~few MB).
 */
export function parseLogSync(logPath: string): LogParseResults {
    const results = emptyResults();
    if (!logPath) return results;

    let content: string;
    try {
        content = fs.readFileSync(logPath, 'utf-8');
    } catch {
        return results;
    }

    results.logFound = true;

    for (const line of content.split(/\r?\n/)) {
        processLine(line, results);
    }

    return results;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function emptyResults(): LogParseResults {
    return {
        propertiesWithInvalidValues: new Map(),
        unsupportedProperties: new Set(),
        unsupportedPseudoClasses: new Set(),
        unsupportedPseudoElements: new Set(),
        shorthandsWithLimitations: new Set(),
        unsupportedCalcExpressions: new Set(),
        rawWarnings: [],
        logFound: false,
    };
}

function processLine(line: string, results: LogParseResults): void {
    // Only process Warning: lines to reduce noise.
    if (!line.startsWith('Warning:')) return;

    let matched = false;
    for (const { re, handler } of LOG_PATTERNS) {
        const m = line.match(re);
        if (m) {
            handler(m, line, results);
            matched = true;
        }
    }
    if (matched) results.rawWarnings.push(line.trim());
}

// ── Byte-offset helpers for incremental log reading ───────────────────────────

/**
 * Returns the current size of the log file in bytes.
 * Call this BEFORE navigating to a probe page to record a baseline offset.
 * Returns 0 if the file does not exist yet.
 */
export function getLogByteOffset(logPath: string): number {
    if (!logPath) return 0;
    try {
        return fs.statSync(logPath).size;
    } catch {
        return 0;
    }
}

/**
 * Parse only the log lines appended AFTER a previously recorded byte offset.
 *
 * Use this after navigating to a probe page:
 *   1. Call getLogByteOffset() before navigation to capture the baseline.
 *   2. Navigate + settle.
 *   3. Call parseLogFromOffset() to get only the new warnings.
 *
 * This avoids conflating warnings from different probe pages or prior sessions.
 */
export function parseLogFromOffset(logPath: string, byteOffset: number): LogParseResults {
    const results = emptyResults();
    if (!logPath) return results;

    let fileSize: number;
    try {
        fileSize = fs.statSync(logPath).size;
    } catch {
        return results;
    }

    if (fileSize <= byteOffset) return results;

    let content: string;
    try {
        const fd = fs.openSync(logPath, 'r');
        const buf = Buffer.alloc(fileSize - byteOffset);
        fs.readSync(fd, buf, 0, buf.length, byteOffset);
        fs.closeSync(fd);
        content = buf.toString('utf-8');
    } catch {
        return results;
    }

    results.logFound = true;
    for (const line of content.split(/\r?\n/)) {
        processLine(line, results);
    }
    return results;
}

// ── Convenience: build a flat selector-name lookup from log results ────────────

/**
 * Returns a Set of full selector strings that the log identified as unsupported.
 *
 * Reconstructs `:pseudo-class` and `::pseudo-element` from the log-extracted names
 * so the reconciler can directly compare against its probe results.
 */
export function buildUnsupportedSelectorSet(results: LogParseResults): Set<string> {
    const unsupported = new Set<string>();
    for (const name of results.unsupportedPseudoClasses) {
        unsupported.add(':' + name);
    }
    for (const name of results.unsupportedPseudoElements) {
        unsupported.add('::' + name);
    }
    return unsupported;
}
