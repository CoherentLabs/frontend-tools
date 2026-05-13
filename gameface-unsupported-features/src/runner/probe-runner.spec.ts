/**
 * Gameface Feature Inventory — probe orchestrator.
 *
 * This Mocha spec is executed by the gameface-e2e CLI, which handles:
 *   - Spawning the Player executable
 *   - Connecting to the CDP WebSocket
 *   - Providing the global `gf` object with executeScript / navigate
 *
 * Candidate sources (merged at runtime):
 *   CSS properties  – BCD standard set  ∪  DTS CSSStyleDeclaration props  ∪  coh-* custom props
 *   CSS selectors   – BCD selectors  ∪  at-rules + complex variants (selector-list.ts)
 *   HTML tags       – BCD elements  ∪  custom/non-standard tags (html-tags.ts)
 *   JS interfaces   – DTS interfaces  (with instance-factory fallback for non-window globals)
 *
 * Execution order:
 *   before()  – static analysis (no Player needed) + navigate to probe page
 *   it()      – one probe per surface; results stored in module-level vars
 *   after()   – parse CohtmlApplication.log → reconcile → write JSON files
 *
 * To run:
 *   npm run probe
 * (which does: tsc && gameface-e2e)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { parseDts } from '../static/dts-parser';
import { SHORTHAND_MAP } from '../static/shorthand-map';
import { CUSTOM_HTML_TAGS } from '../static/html-tags';
import { INPUT_TYPES } from '../static/input-types';
import { SELECTOR_LIST } from '../static/selector-list';
import type { SelectorEntry } from '../static/selector-list';
import {
    getBcdHtmlTags,
    getBcdCssProperties,
    getBcdCssSelectors,
    getBcdCssPropertyValues,
    getBcdJsInterfaces,
} from '../static/bcd-source';
import { CSS_KEYWORD_VALUES } from '../static/css-keyword-values';
import { CSS_FUNCTIONS } from '../static/css-functions';

import { jsProbe } from '../probes/js-probe';
import {
    htmlConstructorProbe,
    htmlFingerprintProbe,
    inputTypeProbe,
} from '../probes/html-probe';

import { parseLogSync, parseLogFromOffset, getLogByteOffset } from '../log/log-parser';
import type { LogParseResults } from '../log/log-parser';
import { reconcile, partitionBySurface } from '../merge/reconciler';

import type { JsProbeResults } from '../probes/js-probe';
import { probeValueReadback } from '../probes/css-probe';
import type { CssPropertyResults, CssSelectorResults } from '../probes/css-probe';
import type {
    HtmlConstructorResults,
    HtmlFingerprintResults,
    InputTypeResults,
} from '../probes/html-probe';
import type { DtsParsed } from '../static/dts-parser';

// ── Configuration ─────────────────────────────────────────────────────────────

const CONFIG_PATH = path.resolve(__dirname, '../../gameface-e2e-config.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: {
    gamefacePath?: string;
    dtsPath?: string;
    logPath?: string;
    outputDir?: string;
} = fs.existsSync(CONFIG_PATH) ? require(CONFIG_PATH) : {};

const PROBE_PAGE = path.resolve(__dirname, '../../probe-page/index.html')
    .replace(/\\/g, '/');

const OUTPUT_DIR = config.outputDir
    ? path.resolve(config.outputDir)
    : path.resolve(__dirname, '../../results');

// Custom Gameface properties JSON (user-editable at package root).
const CUSTOM_PROPS_PATH = path.resolve(__dirname, '../../gameface-custom-properties.json');
const customPropsJson: Record<string, { testValue: string; description?: string }> =
    fs.existsSync(CUSTOM_PROPS_PATH)
        ? JSON.parse(fs.readFileSync(CUSTOM_PROPS_PATH, 'utf-8'))
        : {};

function resolveLogPath(): string {
    if (config.logPath) return config.logPath;
    if (config.gamefacePath) {
        return path.resolve(path.dirname(config.gamefacePath), 'CohtmlApplication.log');
    }
    return '';
}

// ── Accumulated results ───────────────────────────────────────────────────────

let dtsParsed: DtsParsed = {
    interfaces: {},
    globals: [],
    cssStyleDeclarationProps: [],
    cohProperties: [],
};
let jsResults: JsProbeResults = {};
let cssPropertyResults: CssPropertyResults = {};
let cssSelectorResults: CssSelectorResults = {};
let htmlConstructorResults: HtmlConstructorResults = {};
let htmlFingerprintResults: HtmlFingerprintResults = {};
let inputTypeResults: InputTypeResults = {};
/** Log results from the dedicated stylesheet-based CSS probe page. */
let cssSheetLogResults: LogParseResults | undefined;
/**
 * Byte offset into CohtmlApplication.log captured BEFORE navigating to the
 * CSS sheet probe page.  Used in `after()` to isolate sheet-probe warnings
 * from any earlier log content.  Log parsing is deferred until after() so
 * Gameface has fully flushed its asynchronous log writes.
 */
let cssSheetLogOffset = 0;
/**
 * Lower-cased property names recognised by Gameface's style object.
 * Pre-computed at page-load time by the css-sheet-probe page's inline
 * <script> (which enumerates `document.documentElement.style` and stashes
 * the result on `window.__cssStyleKeys`); read in before() via a tiny
 * `runProbe(readCssStyleKeys)` call.  Used in after() to build
 * cssPropertyResults.
 */
let cssStyleObjectKeys: Set<string> = new Set();
/**
 * The keyword values tested per property on the CSS sheet probe page.
 * Keys are lower-case property names. Passed to reconcile() so the reconciler
 * can report which specific values are supported vs unsupported per property.
 */
let cssTestedValues: Record<string, string[]> = {};
/**
 * For each property that has more than one tested keyword value, the values
 * that were confirmed accepted by `probeValueReadback` (set + read-back in JS).
 * Keys are lower-case property names.
 */
let cssValueReadbackResults: Record<string, string[]> = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function runProbe<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return (global as any).gf.executeScript(fn, ...args);
}

/**
 * Returns the merged set of all CSS property candidates for a given dts parse.
 * Extracted here so both the stylesheet probe page and the JS probe use the same list.
 */
function buildCssCandidates(parsed: DtsParsed): string[] {
    const customPropNames = Object.keys(customPropsJson).filter((k) => !k.startsWith('_'));
    return [
        ...new Set([
            ...getBcdCssProperties(),
            ...parsed.cssStyleDeclarationProps,
            ...parsed.cohProperties,
            ...customPropNames,
            ...Object.keys(SHORTHAND_MAP),
        ]),
    ];
}

/**
 * Returns a map of property → array of values to test on the CSS sheet probe page.
 *
 * For keyword-bearing properties (most longhand properties), each known keyword
 * is tested as a separate CSS rule so the log reveals exactly which values
 * Gameface accepts.  The result feeds both generateCssSheetProbePage() (which
 * writes one rule per value) and reconcile() (which uses it for per-value
 * evidence in the output JSON).
 *
 * Priority order per property:
 *   1. Shorthands (SHORTHAND_MAP) → single canonical test value; shorthand
 *      testing is about longhand propagation, not keyword enumeration.
 *   2. Custom coh-* / user-configured props (customPropsJson) → configured
 *      testValue only.
 *   3. All other properties → union of BCD keyword sub-entries +
 *      CSS_KEYWORD_VALUES curated supplement, de-duplicated.
 *      Falls back to `['initial']` when no keyword values are known.
 *
 * Keys in the returned map are lower-case property names.
 */
function buildCssValueVariants(candidates: string[]): Record<string, string[]> {
    const bcdValues = getBcdCssPropertyValues();
    const result: Record<string, string[]> = {};

    for (const prop of candidates) {
        const propLower = prop.toLowerCase();

        // Shorthands: single representative value for longhand-propagation test.
        if (SHORTHAND_MAP[prop]) {
            result[propLower] = [SHORTHAND_MAP[prop].testValue];
            continue;
        }

        // User-configured custom properties: use the provided test value.
        if (customPropsJson[prop]?.testValue) {
            result[propLower] = [customPropsJson[prop].testValue];
            continue;
        }

        // Merge BCD keyword sub-entries with the curated supplement.
        const values = new Set<string>([
            ...(bcdValues[propLower] ?? []),
            ...(CSS_KEYWORD_VALUES[propLower] ?? []),
        ]);

        result[propLower] = values.size > 0 ? [...values] : ['initial'];
    }

    return result;
}

/**
 * Generates a temporary HTML file whose `<style>` block contains one CSS rule
 * per (property, value) pair from `valueVariants`.
 *
 * Each rule uses a sequential class selector (`.gf-p-N`) purely for isolation —
 * the Gameface log identifies failing pairs by property+value name, not by
 * class index, so the index has no semantic meaning.
 *
 * Writes to probe-page/css-sheet-probe.html and returns the path in
 * forward-slash format (no file:// prefix) for gf.navigate().
 */
function generateCssSheetProbePage(valueVariants: Record<string, string[]>): string {
    const rules: string[] = [];
    let idx = 0;
    for (const [prop, values] of Object.entries(valueVariants)) {
        for (const value of values) {
            rules.push(`  .gf-p-${idx++} { ${prop}: ${value}; }`);
        }
    }

    // Style-object enumeration runs at page-load time, off the CDP JS thread.
    // Result is stashed on window.__cssStyleKeys so a tiny follow-up
    // executeScript can read it without re-running the slow `for...in` loop
    // (which on Gameface takes ~40 ms per property and routinely exceeds the
    // ~10 s Runtime.evaluate timeout when called via runProbe).
    //
    // CSS function probing intentionally lives in its OWN page navigated
    // LAST (see the css-function-probe it() block) — earlier attempts to
    // fold the function rules into this page caused the immediately-
    // following Runtime.evaluate (the css-value readback) to time out,
    // because Gameface's image pipeline started chasing the URL-bearing
    // function values (url(…), image-set(…), cross-fade(…)) and tied up
    // the renderer thread.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gameface CSS Property Sheet Probe</title>
  <style>
${rules.join('\n')}
  </style>
  <script>
(function () {
  var set = {};
  var style = document.documentElement.style;
  for (var i = 0; i < style.length; i++) set[style[i]] = true;
  for (var k in style) {
    if (typeof style[k] !== 'function') {
      var kebab = k.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
      set[kebab] = true;
    }
  }
  window.__cssStyleKeys = Object.keys(set);
})();
  </script>
</head>
<body></body>
</html>
`;

    const outDir = path.resolve(__dirname, '../../probe-page');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'css-sheet-probe.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    return outPath.replace(/\\/g, '/');
}

/**
 * Standalone CSS-function probe page.
 *
 * One rule per (function, variant) pair in CSS_FUNCTIONS, skipping any
 * entry marked `skipProbe` (URL/image-fetching functions — see
 * css-functions.ts for the rationale).  No `<script>`, no apply-elements:
 * Gameface emits parse-time "Unable to parse declaration" warnings for
 * unsupported function values regardless of whether anything applies the
 * rule (matches the user-reported `font-size: clamp(100px, 20vw, 200px)`
 * observation), so we keep the page minimal to limit any chance of the
 * renderer stalling on speculative resource resolution.
 *
 * This page is navigated to LAST — see the matching it() block at the end
 * of the spec — so that if Gameface still happens to hang on some function
 * value we haven't blacklisted yet, every other surface is already
 * captured.
 *
 * Writes to probe-page/css-function-probe.html and returns the path in
 * forward-slash form for gf.navigate().
 */
function generateCssFunctionProbePage(): string {
    const rules: string[] = [];
    CSS_FUNCTIONS.forEach((entry, i) => {
        if (entry.skipProbe) return;
        rules.push(
            `  .gf-fn-${i}-canonical { ${entry.testProperty}: ${entry.canonicalValue}; }`,
        );
        if (entry.mixedUnitsValue !== undefined) {
            rules.push(
                `  .gf-fn-${i}-mixed { ${entry.testProperty}: ${entry.mixedUnitsValue}; }`,
            );
        }
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gameface CSS Function Probe Page</title>
  <!--
    Mixed-units negative tests are INTENTIONAL: Gameface's documented
    limitation is "no mixing units inside math/sizing functions", and the
    reconciler relies on those rules failing to mark a function as
    'partial'.  Do not consolidate them away.

    Resource-fetching functions (url, image-set, cross-fade) are
    deliberately skipped — see CssFunctionEntry.skipProbe.
  -->
  <style>
${rules.join('\n')}
  </style>
</head>
<body></body>
</html>
`;

    const outDir = path.resolve(__dirname, '../../probe-page');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'css-function-probe.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    return outPath.replace(/\\/g, '/');
}

/**
 * Generates a static HTML file with one `<style>` block per selector entry.
 *
 * Each block is isolated so a bad rule in one sheet does not prevent the
 * parser from processing the remaining sheets. CSS parsing happens at page-
 * load time — entirely outside the JS thread — so a slow or unsupported
 * selector silently fails without blocking CDP or crashing the Player.
 *
 * Rule construction per entry type:
 *   pseudo-element (::X)  → `p::X { color: rgb(1,2,3); content: ''; }`
 *   at-rule (@X …)        → `@X … { * { color: rgb(1,2,3); } }`
 *   everything else       → `selector { color: rgb(1,2,3); }`
 *
 * Each style element is given an id `gf-sel-{i}` so a single follow-up
 * executeScript can read sheet.cssRules.length for every entry.
 */
function generateSelectorProbePage(entries: SelectorEntry[]): string {
    const blocks = entries.map(({ selector }, i) => {
        const isAtRule = selector.trimStart().startsWith('@');
        const isPseudoElement = !isAtRule && selector.trimStart().startsWith('::');

        let ruleText: string;
        if (isAtRule) {
            ruleText = `${selector} { * { color: rgb(1, 2, 3); } }`;
        } else if (isPseudoElement) {
            ruleText = `p${selector} { color: rgb(1, 2, 3); content: ''; }`;
        } else {
            ruleText = `${selector} { color: rgb(1, 2, 3); }`;
        }

        return `  <style id="gf-sel-${i}">${ruleText}</style>`;
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gameface CSS Selector Probe Page</title>
${blocks.join('\n')}
</head>
<body><p id="__gf_sel_target__">probe</p></body>
</html>
`;

    const outDir = path.resolve(__dirname, '../../probe-page');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'css-selector-probe.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    return outPath.replace(/\\/g, '/');
}

/**
 * Generates a static HTML file whose inline <script> runs
 * `document.createElement` for every tag during page load — entirely outside
 * a CDP Runtime.evaluate call.
 *
 * The script stores results in `window.__htmlConstructorResults` so a single
 * tiny follow-up executeScript can read the pre-computed map.  Any tag that
 * causes a native crash is caught by the try/catch; the navigation timeout
 * (30 s) is the only global backstop.
 *
 * Writes to probe-page/html-constructor-probe.html and returns the path.
 */
function generateHtmlConstructorProbePage(tags: string[]): string {
    const tagsJson = JSON.stringify(tags);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gameface HTML Constructor Probe</title>
  <script>
(function () {
  var tags = ${tagsJson};
  var results = {};
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    try {
      var el = document.createElement(tag);
      var ctorName = (el.constructor && el.constructor.name) || 'unknown';
      var tier = ctorName === 'HTMLUnknownElement' ? 'unknown'
               : ctorName === 'HTMLElement'        ? 'parsed-no-impl'
               :                                     'implemented';
      results[tag] = { tier: tier, constructorName: ctorName };
    } catch (e) {
      results[tag] = { tier: 'unknown', constructorName: 'error:' + String(e) };
    }
  }
  window.__htmlConstructorResults = results;
})();
  </script>
</head>
<body></body>
</html>
`;
    const outDir = path.resolve(__dirname, '../../probe-page');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'html-constructor-probe.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    return outPath.replace(/\\/g, '/');
}

/**
 * Tiny browser-side function executed after navigating to the HTML constructor
 * probe page.  All createElement calls already ran at page-load time; this
 * just reads the pre-computed global.
 */
function readHtmlConstructorResults(): HtmlConstructorResults {
    return (window as any).__htmlConstructorResults || {};
}

// HTML fingerprint static-page approach was attempted and abandoned:
// Gameface's HTML/JS parser hangs when an inline <script> contains the
// ~14KB serialised `htmlFingerprintProbe.toString()` source with modern
// ES2020+ syntax (`?.`, `??`, arrow functions, destructuring).
// `Page.loadEventFired` never fires for that page, even though every other
// static probe page loads in 70-94 ms.
//
// Replaced by a per-tag runProbe loop in the it() block — each call runs
// one tag's fingerprint via Runtime.evaluate, well under the ~10 s CDP
// budget.  Slow tags (canvas, details, dialog) are bounded by per-tag
// withTimeout, so a single hung fingerprint cannot stall the suite.

/**
 * Tiny browser-side reader for the style-object key set computed at page-load
 * time by the css-sheet-probe page's inline <script>.  Gameface's
 * `for...in` over CSSStyleDeclaration takes ~40 ms per property and would
 * exceed the ~10 s Runtime.evaluate timeout if called via executeScript.
 */
function readCssStyleKeys(): string[] {
    return (window as any).__cssStyleKeys || [];
}

/**
 * Tiny browser-side function executed after navigating to the selector probe
 * page.  All CSS parsing has already happened during page load; this function
 * only reads the pre-computed cssRules.length for each <style> block.
 *
 * Returns an array of rule counts, one per entry, in the same order as the
 * entries passed to generateSelectorProbePage.  -1 means the element was not
 * found; 0 means the rule was discarded; ≥1 means accepted.
 */
function readSelectorRuleCounts(count: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
        try {
            const el = document.getElementById('gf-sel-' + i) as any;
            if (!el || !el.sheet) { out.push(-1); continue; }
            out.push((el.sheet.cssRules || []).length);
        } catch (_) {
            out.push(0);
        }
    }
    return out;
}

/**
 * Builds `cssPropertyResults` from the recognition set + sheet log warnings,
 * without running the iterative runtime probe.
 *
 * The reconciler treats `cssSheetLogResults.unsupportedProperties` as the
 * highest-priority signal (overrides anything we put here).  This function
 * just needs to emit one entry per candidate so the reconciler's loop visits
 * every property:
 *
 *   - `unrecognized`   : property name not in style object → 'missing'
 *   - `recognized`     : in style object, no log warning → reconciler treats
 *                        as 'partial' (name-recognized-but-value-not-accepted)
 *   - `value-accepted` : in style object AND no rejected-value warnings →
 *                        reconciler upgrades to 'supported' when sheet log
 *                        also shows no warnings, else downgrades.
 *
 * Shorthand-propagation testing is intentionally dropped — Gameface's
 * stylesheet parser warns "The X shorthand doesn't support: …" in the log,
 * which the reconciler consumes via `shorthandsWithLimitations`.
 */
function buildCssPropertyResultsFromStatic(
    candidates: string[],
    styleObjectKeys: Set<string>,
    sheetLog: LogParseResults | undefined,
): CssPropertyResults {
    const results: CssPropertyResults = {};

    for (const prop of candidates) {
        const propLower = prop.toLowerCase();
        const isInStyleObject = styleObjectKeys.has(propLower);
        const sheetUnsupported = sheetLog?.unsupportedProperties.has(propLower) ?? false;
        const sheetHasInvalidValues = sheetLog?.propertiesWithInvalidValues.has(propLower) ?? false;

        if (sheetUnsupported || !isInStyleObject) {
            results[prop] = { status: 'unrecognized' };
        } else if (sheetHasInvalidValues) {
            results[prop] = { status: 'recognized' };
        } else {
            results[prop] = { status: 'value-accepted' };
        }
    }

    return results;
}

/** Promise that rejects after `ms` milliseconds with a clear timeout message. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(
                () => reject(new Error(`[${label}] Timed out after ${ms}ms`)),
                ms,
            ),
        ),
    ]);
}

// ── Spec ──────────────────────────────────────────────────────────────────────

describe('Gameface Feature Inventory', function () {
    this.timeout(120_000);

    // ── Setup ────────────────────────────────────────────────────────────────

    before(async function () {
        const gf = (global as any).gf;
        if (!gf) throw new Error('[before] gf global is not available — gameface-e2e setup may have failed.');

        // ── Static pass: parse Gameface .d.ts ────────────────────────────────
        if (config.dtsPath) {
            try {
                dtsParsed = parseDts(config.dtsPath);
                console.log(
                    `[dts-parser] Found ${Object.keys(dtsParsed.interfaces).length} interfaces, ` +
                    `${dtsParsed.globals.length} globals, ` +
                    `${dtsParsed.cssStyleDeclarationProps.length} declared CSS props, ` +
                    `${dtsParsed.cohProperties.length} coh-* props.`,
                );
            } catch (e) {
                console.warn(`[dts-parser] Failed to parse ${config.dtsPath}: ${e}`);
                // Non-fatal: JS probe will fall back to runtime window inspection.
            }
        } else {
            console.warn('[dts-parser] No dtsPath configured — JS surface will only use runtime probes.');
        }

        // ── Merge TypeScript lib.dom.d.ts ─────────────────────────────────────
        // lib.dom.d.ts provides detailed member lists for all standard Web APIs.
        // We merge it into dtsParsed so the JS probe covers the full DOM surface,
        // not just what Gameface's own .d.ts declares.
        const tsDomPath = path.resolve(__dirname, '../../node_modules/typescript/lib/lib.dom.d.ts');
        if (fs.existsSync(tsDomPath)) {
            try {
                const libDomParsed = parseDts(tsDomPath);
                let added = 0;
                let augmented = 0;
                for (const [name, info] of Object.entries(libDomParsed.interfaces)) {
                    if (!dtsParsed.interfaces[name]) {
                        dtsParsed.interfaces[name] = { members: [...info.members], extends: [...info.extends] };
                        added++;
                    } else {
                        const existing = dtsParsed.interfaces[name];
                        for (const m of info.members) {
                            if (!existing.members.includes(m)) existing.members.push(m);
                        }
                        augmented++;
                    }
                }
                for (const g of libDomParsed.globals) {
                    if (!dtsParsed.globals.includes(g)) dtsParsed.globals.push(g);
                }
                console.log(
                    `[lib.dom.d.ts] Merged — ${added} new interfaces, ${augmented} augmented. ` +
                    `Total: ${Object.keys(dtsParsed.interfaces).length} interfaces.`,
                );
            } catch (e) {
                console.warn(`[lib.dom.d.ts] Failed to merge (non-fatal): ${e}`);
            }
        } else {
            console.warn(`[lib.dom.d.ts] Not found at ${tsDomPath} — skipping standard DOM merge.`);
        }

        // ── Merge BCD Web API interfaces ──────────────────────────────────────
        // BCD's api.* catalogue is the authoritative list of browser-documented
        // Web APIs.  Each interface entry includes its member names.  We use it
        // as a supplement: BCD is the authority on which interfaces exist; the
        // d.ts files above provide detailed member lists.
        try {
            const bcdInterfaces = getBcdJsInterfaces();
            let added = 0;
            let augmented = 0;
            for (const [name, members] of Object.entries(bcdInterfaces)) {
                if (!dtsParsed.interfaces[name]) {
                    dtsParsed.interfaces[name] = { members: [...members], extends: [] };
                    added++;
                } else {
                    const existing = dtsParsed.interfaces[name];
                    for (const m of members) {
                        if (!existing.members.includes(m)) existing.members.push(m);
                    }
                    augmented++;
                }
            }
            console.log(
                `[bcd-api] Merged — ${added} new interfaces, ${augmented} augmented. ` +
                `Total: ${Object.keys(dtsParsed.interfaces).length} interfaces.`,
            );
        } catch (e) {
            console.warn(`[bcd-api] Failed to merge JS interfaces (non-fatal): ${e}`);
        }

        // ── CSS stylesheet probe ──────────────────────────────────────────────
        // Navigate to a generated page whose <style> block covers every candidate
        // property × value pair.  Gameface's stylesheet parser emits warnings:
        //   "Unsupported CSS property detected: X"
        //   "Trying to set X property to invalid value: Y"
        // for unknown properties and rejected values respectively.
        //
        // Parsing happens at page-load time, OFF the JS thread — a slow or
        // unsupported property silently fails without blocking CDP or crashing
        // the Player.
        //
        // Log parsing is intentionally deferred to `after()` so all warnings
        // (which Gameface buffers asynchronously) are captured.  The baseline
        // offset is still recorded here so the reconciler can isolate the
        // sheet probe's warnings from any earlier log content.
        const logPath = resolveLogPath();

        try {
            cssSheetLogOffset = getLogByteOffset(logPath);
            console.log(`[css-sheet-probe] Log baseline offset: ${cssSheetLogOffset} bytes (path: ${logPath || 'not configured'})`);

            const cssCandidates = buildCssCandidates(dtsParsed);
            cssTestedValues = buildCssValueVariants(cssCandidates);
            const totalRules = Object.values(cssTestedValues).reduce((s, vs) => s + vs.length, 0);

            const cssSheetPage = generateCssSheetProbePage(cssTestedValues);
            console.log(
                `[css-sheet-probe] Generated probe page — ` +
                `${cssCandidates.length} properties, ${totalRules} rules: ${cssSheetPage}`,
            );

            console.log('[css-sheet-probe] Navigating to stylesheet probe page…');
            await withTimeout(
                gf.navigate(cssSheetPage),
                30_000,
                'css-sheet-probe navigate',
            );
            console.log('[css-sheet-probe] Navigation complete (log warnings collected later).');

            // ── Style-object key read (pre-computed at page load) ─────────────
            // The css-sheet-probe page's inline <script> already enumerated
            // CSSStyleDeclaration during page-load and stored the key list on
            // window.__cssStyleKeys.  This runProbe call is a single property
            // read — milliseconds, not the ~10 s the live `for...in` enumeration
            // takes when called via Runtime.evaluate.
            try {
                const keys: string[] = await withTimeout(
                    runProbe(readCssStyleKeys),
                    5_000,
                    'css-style-keys read',
                );
                cssStyleObjectKeys = new Set(keys.map((k) => k.toLowerCase()));
                console.log(`[css-property-probe] Read ${cssStyleObjectKeys.size} style-object property names (pre-computed).`);
            } catch (e) {
                console.warn(`[css-property-probe] Style key read failed (continuing with empty set): ${e}`);
            }

            // ── Value readback (focused property list) ────────────────────────
            // Run immediately after page load while the JS thread is freshly
            // idle.  We restrict to ~20 high-impact properties so the total
            // mutation count stays ≤ ~100 (≈ 1.5 s at Gameface's ~16 ms/mut).
            // If we used all of CSS_KEYWORD_VALUES (~90 props × 7 vals = 630
            // mutations) the JS thread would still be running when the next
            // gf.navigate() fires, causing a DOM.documentUpdated timeout.
            // Values are taken directly from cssTestedValues (not sliced) so
            // the reconciler gets accurate supportedValues / unsupportedValues.
            const READBACK_FOCUS = new Set([
                // Layout — most game-UI-critical
                'display', 'position', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
                // Flexbox & alignment
                'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
                // Typography
                'font-style', 'font-weight', 'white-space', 'text-align', 'text-overflow',
                // Box model
                'box-sizing', 'object-fit',
                // Animation
                'animation-direction', 'animation-fill-mode', 'animation-play-state',
                // Rendering
                'backface-visibility', 'transform-style',
            ]);
            const readbackInput = Object.fromEntries(
                Object.entries(cssTestedValues).filter(
                    ([prop, vals]) => vals.length > 1 && READBACK_FOCUS.has(prop),
                ),
            );
            const readbackEntries = Object.entries(readbackInput);
            if (readbackEntries.length > 0) {
                const READBACK_BATCH = 20;
                let batchesDone = 0;
                for (let i = 0; i < readbackEntries.length; i += READBACK_BATCH) {
                    const batch = Object.fromEntries(readbackEntries.slice(i, i + READBACK_BATCH));
                    const batchLabel =
                        `css-value-readback batch ${Math.floor(i / READBACK_BATCH) + 1}` +
                        `/${Math.ceil(readbackEntries.length / READBACK_BATCH)}`;
                    try {
                        const batchResult = await withTimeout(
                            runProbe(probeValueReadback, batch),
                            10_000,
                            batchLabel,
                        );
                        Object.assign(cssValueReadbackResults, batchResult);
                        batchesDone++;
                    } catch (e) {
                        console.warn(`[css-value-readback-probe] ${batchLabel} failed — skipping remaining: ${e}`);
                        break;
                    }
                }
                if (batchesDone > 0) {
                    console.log(
                        `[css-value-readback-probe] ${batchesDone} batch(es) done, ` +
                        `${Object.keys(cssValueReadbackResults).length} properties with readback data.`,
                    );
                }
            }
        } catch (e) {
            console.error(`[css-sheet-probe] FAILED (results will be incomplete): ${e}`);
            // cssSheetLogResults stays undefined; reconciler treats it as "no override".
        }


        // ── CSS selector probe page ───────────────────────────────────────────
        // Build a static HTML page with one <style> block per selector and
        // navigate to it.  The CSS parser runs at page-load time (off the JS
        // thread), so a bad selector silently fails instead of blocking CDP.
        // After settling, a single tiny executeScript reads the pre-computed
        // cssRules.length for every sheet — no parsing happens in that call.
        try {
            const selectorEntries: SelectorEntry[] = [
                ...getBcdCssSelectors(),
                ...SELECTOR_LIST,
            ];
            const selectorProbePage = generateSelectorProbePage(selectorEntries);
            console.log(
                `[css-selector-probe] Generated static page for ${selectorEntries.length} selectors: ${selectorProbePage}`,
            );

            console.log('[css-selector-probe] Navigating to selector probe page…');
            await withTimeout(
                gf.navigate(selectorProbePage),
                30_000,
                'css-selector-probe navigate',
            );
            console.log('[css-selector-probe] Navigation complete. Reading cssRules counts…');

            // Short settle so the engine finishes any async stylesheet work.
            await new Promise<void>((resolve) => setTimeout(resolve, 500));

            // Single tiny call — just reads lengths, no CSS work done here.
            const ruleCounts: number[] = await withTimeout(
                runProbe(readSelectorRuleCounts, selectorEntries.length),
                15_000,
                'css-selector-probe read-results',
            );

            for (let i = 0; i < selectorEntries.length; i++) {
                const { selector, group } = selectorEntries[i];
                const count = ruleCounts[i] ?? -1;
                cssSelectorResults[selector] = {
                    status: count > 0 ? 'supported' : 'probe-b-failed',
                    group,
                    probeA: false,
                    probeB: count > 0,
                };
            }

            const supported = Object.values(cssSelectorResults).filter((r) => r.status === 'supported').length;
            const notApplied = Object.values(cssSelectorResults).filter((r) => r.status === 'probe-b-failed').length;
            console.log(
                `[css-selector-probe] Complete — ${supported} supported, ${notApplied} not-applied.`,
            );
        } catch (e) {
            console.error(`[css-selector-probe] FAILED (results will be incomplete): ${e}`);
        }

        // ── HTML constructor probe page ───────────────────────────────────────
        // Follows the same pattern as the CSS selector probe: generate a static
        // page whose inline <script> runs all document.createElement calls
        // during page load (off the CDP JS thread).  A problematic tag (e.g.
        // audio, canvas) that would hang a Runtime.evaluate call can only block
        // the page-load timeout (30 s), not subsequent CDP calls.
        try {
            const allTags = [...new Set([...getBcdHtmlTags(), ...CUSTOM_HTML_TAGS])];
            const htmlProbePage = generateHtmlConstructorProbePage(allTags);
            console.log(
                `[html-constructor-probe] Generated static page for ${allTags.length} tags: ${htmlProbePage}`,
            );

            console.log('[html-constructor-probe] Navigating to constructor probe page…');
            await withTimeout(
                gf.navigate(htmlProbePage),
                30_000,
                'html-constructor-probe navigate',
            );
            console.log('[html-constructor-probe] Navigation complete. Reading results…');

            // Brief settle so the engine finishes any async init triggered by
            // the created elements (e.g. audio, canvas subsystem startup).
            await new Promise<void>((resolve) => setTimeout(resolve, 500));

            htmlConstructorResults = await withTimeout(
                runProbe(readHtmlConstructorResults),
                10_000,
                'html-constructor-probe read',
            );

            const tiers = Object.values(htmlConstructorResults).reduce(
                (acc, r) => { acc[r.tier] = (acc[r.tier] ?? 0) + 1; return acc; },
                {} as Record<string, number>,
            );
            console.log(
                `[html-constructor-probe] ${Object.keys(htmlConstructorResults).length}/${allTags.length} tags classified: ${JSON.stringify(tiers)}`,
            );
        } catch (e) {
            console.error(`[html-constructor-probe] FAILED (results will be incomplete): ${e}`);
        }

        // ── Navigate to the main probe page ───────────────────────────────────
        // (Fingerprint probing now runs as an it() block via per-tag runProbe
        // calls — see the static-page rationale comment near the removed
        // generateHtmlFingerprintProbePage function.)
        console.log(`[before] Navigating to main probe page: ${PROBE_PAGE}`);
        await withTimeout(
            gf.navigate(PROBE_PAGE),
            30_000,
            'main probe page navigate',
        );
        console.log('[before] Main probe page ready.');
    });

    // ── JS surface ───────────────────────────────────────────────────────────

    it('JS surface: interface presence and stub detection', async function () {
        jsResults = await runProbe(jsProbe, dtsParsed.interfaces, dtsParsed.globals);
        const summary = summariseJs(jsResults);
        console.log(
            `[js-probe] ${summary.supported} supported, ` +
            `${summary.stubs} with stubs, ${summary.missing} missing.`,
        );
    });

    // ── CSS properties ───────────────────────────────────────────────────────

    it('CSS surface: property recognition (single style-object read)', function () {
        // Style-object key set was pre-computed by the css-sheet-probe page's
        // inline <script> at page-load time and read in before().  This test
        // is a pure logger so the Mocha report still shows progress per
        // surface.  Final classification (cssPropertyResults) is built in
        // after() once the sheet log has been parsed.
        console.log(
            `[css-property-probe] ${cssStyleObjectKeys.size} style-object property names available.`,
        );
    });

    // ── CSS selectors ────────────────────────────────────────────────────────
    // Results are pre-computed in before() via the static selector probe page.
    // Selector parsing happens at page-load time (off the JS thread), so bad
    // selectors silently fail without blocking CDP or crashing the Player.

    // it('CSS surface: selector support (static page probe)', function () {
    //     const counts = Object.values(cssSelectorResults).reduce(
    //         (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    //         {} as Record<string, number>,
    //     );
    //     console.log(
    //         `[css-selector-probe] ${Object.keys(cssSelectorResults).length} selectors:`,
    //         JSON.stringify(counts),
    //     );
    // });

    // ── HTML constructor identity ────────────────────────────────────────────

    it('HTML surface: constructor identity (three-tier classification)', function () {
        // Results are pre-computed in before() via the static HTML constructor
        // probe page.  All document.createElement calls happen at page-load
        // time (off the CDP JS thread) so problematic tags (audio, canvas, …)
        // cannot block or crash subsequent Runtime.evaluate calls.
        const tiers = Object.values(htmlConstructorResults).reduce(
            (acc, r) => { acc[r.tier] = (acc[r.tier] ?? 0) + 1; return acc; },
            {} as Record<string, number>,
        );
        console.log(
            `[html-constructor-probe] ${Object.keys(htmlConstructorResults).length} tags classified: ${JSON.stringify(tiers)}`,
        );
    });

    // ── HTML behavioral fingerprints ─────────────────────────────────────────

    it('HTML surface: behavioral fingerprints for implemented tags', async function () {
        // Per-tag runProbe loop — one Runtime.evaluate call per implemented
        // tag, each well under the ~10 s CDP budget.  Slow fingerprints
        // (canvas.getContext, dialog.show(), details + offsetHeight) are
        // bounded by per-tag withTimeout, so a single hung tag is recorded
        // as a stub and the remaining tags still execute.
        //
        // Skip root-document tags: post-load `document.createElement('html')`
        // hangs Gameface's JS thread.  The constructor probe already captured
        // their tier/constructor name, so we lose nothing by skipping here.
        const FINGERPRINT_SKIP = new Set(['html', 'head', 'body']);
        const implementedTags = Object.entries(htmlConstructorResults)
            .filter(([, r]) => r.tier === 'implemented')
            .map(([tag]) => tag)
            .filter((tag) => !FINGERPRINT_SKIP.has(tag));

        console.log(`[html-fingerprint-probe] Running per-tag probes for ${implementedTags.length} tags…`);

        const PER_TAG_TIMEOUT_MS = 5_000;
        for (const tag of implementedTags) {
            const startMs = Date.now();
            try {
                const partial = await withTimeout(
                    runProbe(htmlFingerprintProbe, [tag]),
                    PER_TAG_TIMEOUT_MS,
                    `html-fingerprint-probe(${tag})`,
                );
                Object.assign(htmlFingerprintResults, partial);
            } catch (e) {
                htmlFingerprintResults[tag] = {
                    status: 'stub',
                    checks: {},
                    notes: `runProbe failed: ${String(e)}`,
                };
                console.warn(`[html-fingerprint-probe] ${tag} FAILED after ${Date.now() - startMs}ms: ${e}`);
            }
        }

        const counts = Object.values(htmlFingerprintResults).reduce(
            (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
            {} as Record<string, number>,
        );
        console.log(
            `[html-fingerprint-probe] ${Object.keys(htmlFingerprintResults).length}/${implementedTags.length} fingerprints captured: ${JSON.stringify(counts)}`,
        );
    });

    // ── Input type matrix ────────────────────────────────────────────────────

    it('HTML surface: <input> type matrix', async function () {
        // Per-type runProbe with bounded timeouts, mirroring the fingerprint
        // pattern.  A single-shot `runProbe(inputTypeProbe, INPUT_TYPES)` is
        // vulnerable to Gameface's CDP `Runtime.evaluate` timeout if any one
        // type triggers heavy initialisation; per-type isolation guarantees
        // a slow type can't stall the whole matrix.
        const PER_TYPE_TIMEOUT_MS = 5_000;
        for (const type of INPUT_TYPES) {
            const startMs = Date.now();
            try {
                const partial = await withTimeout(
                    runProbe(inputTypeProbe, [type]),
                    PER_TYPE_TIMEOUT_MS,
                    `input-type-probe(${type})`,
                );
                Object.assign(inputTypeResults, partial);
            } catch (e) {
                inputTypeResults[type] = {
                    status: 'silently-coerced',
                    roundTripType: '',
                    apiChecks: {},
                };
                console.warn(`[input-type-probe] ${type} FAILED after ${Date.now() - startMs}ms: ${e}`);
            }
        }

        const counts = Object.values(inputTypeResults).reduce(
            (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
            {} as Record<string, number>,
        );
        console.log('[input-type-probe]', JSON.stringify(counts));
    });

    // ── CSS functions (deliberately last) ────────────────────────────────────
    // Navigated AFTER all other probes so that if Gameface stalls on any
    // function value we haven't blacklisted via skipProbe yet, every other
    // surface has already been collected.  No browser-side read is needed:
    // the log captures parse-time "Unable to parse declaration" warnings
    // and the after() hook turns them into per-function status entries
    // through reconcileCssFunctions().
    it('CSS surface: function probe page (parse-time log capture)', async function () {
        const gf = (global as any).gf;
        if (!gf) {
            console.warn('[css-function-probe] gf global not available — skipping.');
            return;
        }
        try {
            const probedCount = CSS_FUNCTIONS.filter((e) => !e.skipProbe).length;
            const skippedCount = CSS_FUNCTIONS.length - probedCount;
            const cssFunctionPage = generateCssFunctionProbePage();
            console.log(
                `[css-function-probe] Generated probe page — ` +
                `${probedCount} functions probed, ${skippedCount} skipped (resource-fetching): ` +
                cssFunctionPage,
            );

            console.log('[css-function-probe] Navigating to function probe page…');
            await withTimeout(
                gf.navigate(cssFunctionPage),
                30_000,
                'css-function-probe navigate',
            );
            console.log('[css-function-probe] Navigation complete (log warnings collected in after()).');
        } catch (e) {
            // Soft-fail: skipped entries will still get their `unknown` bucket
            // and probed entries that didn't get a chance to parse will land
            // in the `supported` bucket by default (no log evidence).  Both
            // are honest outcomes — the alternative is making every later
            // run fail just because the function probe hit a new Gameface
            // pathology.
            console.error(`[css-function-probe] FAILED (function results may be incomplete): ${e}`);
        }
    });

    // ── Teardown: merge + write ──────────────────────────────────────────────

    after(async function () {
        const logPath = resolveLogPath();

        // Parse the CSS sheet probe's warnings now (deferred from before() to
        // give Gameface time to flush its async log writes).  Anything between
        // the recorded baseline and the current file end is the sheet-probe
        // window plus any warnings emitted by subsequent test pages — but only
        // the property-related warnings matter for cssSheetLogResults.
        try {
            cssSheetLogResults = parseLogFromOffset(logPath, cssSheetLogOffset);
            console.log(
                `[css-sheet-probe] Deferred parse — ` +
                `${cssSheetLogResults.unsupportedProperties.size} unsupported, ` +
                `${cssSheetLogResults.propertiesWithInvalidValues.size} with rejected values.`,
            );
        } catch (e) {
            console.warn(`[css-sheet-probe] Deferred parse failed: ${e}`);
        }

        // Build cssPropertyResults from the recognition set + sheet log.
        const allCandidates = buildCssCandidates(dtsParsed);
        cssPropertyResults = buildCssPropertyResultsFromStatic(
            allCandidates,
            cssStyleObjectKeys,
            cssSheetLogResults,
        );
        const propCounts = Object.values(cssPropertyResults).reduce(
            (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
            {} as Record<string, number>,
        );
        console.log(
            `[css-property-probe] ${allCandidates.length} candidates classified:`,
            JSON.stringify(propCounts),
        );

        let logResults;
        try {
            logResults = parseLogSync(logPath);
        } catch (e) {
            throw new Error(`[after] parseLogSync failed for path "${logPath}": ${e}`);
        }

        if (logResults.logFound) {
            console.log(
                `[log-parser] Found ${logResults.propertiesWithInvalidValues.size} properties with invalid values, ` +
                `${logResults.unsupportedPseudoClasses.size} unsupported pseudo-classes, ` +
                `${logResults.unsupportedPseudoElements.size} unsupported pseudo-elements.`,
            );
        } else {
            console.warn(`[log-parser] CohtmlApplication.log not found at ${logPath || '(no path configured)'}.`);
        }

        const { supported, partial, unsupported, summary } = reconcile({
            dtsParsed,
            jsResults,
            cssPropertyResults,
            cssSelectorResults,
            htmlConstructorResults,
            htmlFingerprintResults,
            inputTypeResults,
            logResults,
            cssSheetLogResults,
            cssTestedValues,
            cssValueReadbackResults,
        });

        console.log(
            `[reconciler] ${summary.supported} supported, ` +
            `${summary.partial} partial, ${summary.unsupported} unsupported.`,
        );

        const partitioned = partitionBySurface({ supported, partial, unsupported, summary });

        const write = (filePath: string, data: unknown): void => {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[writer] Wrote ${filePath}`);
        };

        for (const folder of ['js', 'css', 'selectors', 'functions', 'html'] as const) {
            const dir = path.join(OUTPUT_DIR, folder);
            fs.mkdirSync(dir, { recursive: true });
            const { supported: s, partial: p, unsupported: u, summary: sum } = partitioned[folder];
            write(path.join(dir, 'supported.json'), s);
            write(path.join(dir, 'partial.json'), p);
            write(path.join(dir, 'unsupported.json'), u);
            write(path.join(dir, 'summary.json'), sum);
        }
    });
});

// ── Internal helpers ──────────────────────────────────────────────────────────

function summariseJs(results: JsProbeResults): {
    supported: number;
    stubs: number;
    missing: number;
} {
    let supported = 0;
    let stubs = 0;
    let missing = 0;
    for (const r of Object.values(results)) {
        if (r.status === 'supported') supported++;
        else if (r.status === 'stub-heavy' || (r.status === 'partial' && r.stubs.length > 0)) stubs++;
        else missing++;
    }
    return { supported, stubs, missing };
}
