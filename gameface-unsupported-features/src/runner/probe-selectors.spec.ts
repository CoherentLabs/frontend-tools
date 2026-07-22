/**
 * Gameface Selector Probe — standalone spec.
 *
 * Run FIRST (before probe-runner.spec.js) so the selector probe gets a fresh
 * Gameface session.  Each Player launch overwrites CohtmlApplication.log, so
 * this session's log contains ONLY selector-probe warnings.
 *
 * This spec:
 *   1. Generates css-selector-probe.html
 *   2. Navigates the Player to it (the CSS parser emits warnings at page-load time)
 *   3. Reads cssRules.length for each selector style block (probe B)
 *   4. Sleeps to let Gameface flush its async log, then after() parses and writes:
 *      - results/intermediate/selector-data.json  (raw data for probe-runner)
 *      - results/selectors/*.json                 (browsable output right away)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { SELECTOR_LIST } from '../static/selector-list';
import type { SelectorEntry } from '../static/selector-list';
import { getBcdCssSelectors } from '../static/bcd-source';

import { parseLogSync } from '../log/log-parser';
import { reconcile, partitionBySurface } from '../merge/reconciler';

import type { CssSelectorResults } from '../probes/css-probe';

// ── Configuration ─────────────────────────────────────────────────────────────

const CONFIG_PATH = path.resolve(__dirname, '../../gameface-e2e-config.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: {
    gamefacePath?: string;
    logPath?: string;
    outputDir?: string;
    dtsPath?: string;
} = fs.existsSync(CONFIG_PATH) ? require(CONFIG_PATH) : {};

const OUTPUT_DIR = config.outputDir
    ? path.resolve(config.outputDir)
    : path.resolve(__dirname, '../../results');

const INTERMEDIATE_DIR = path.resolve(OUTPUT_DIR, 'intermediate');
/** Path to the JSON written by this spec and read by probe-runner.spec.js. */
export const SELECTOR_INTERMEDIATE_PATH = path.resolve(INTERMEDIATE_DIR, 'selector-data.json');

function resolveLogPath(): string {
    if (config.logPath) return config.logPath;
    if (config.gamefacePath) {
        return path.resolve(path.dirname(config.gamefacePath), 'CohtmlApplication.log');
    }
    return '';
}

// ── Accumulated results ───────────────────────────────────────────────────────

let cssSelectorResults: CssSelectorResults = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function runProbe<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return (global as any).gf.executeScript(fn, ...args);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`[${label}] Timed out after ${ms}ms`)), ms),
        ),
    ]);
}

/**
 * Extract the at-rule name from a selector string like "@container (min-width: 300px)".
 * Returns e.g. "container", "media", "layer", "scope", "supports", "starting-style".
 */
function extractAtRuleName(selector: string): string {
    // Remove the leading "@" then take the first word/token before any space or "(".
    return selector.trimStart().slice(1).split(/[\s(]/)[0].toLowerCase();
}

function generateSelectorProbePage(entries: SelectorEntry[]): string {
    const blocks = entries.map(({ selector }, i) => {
        const isAtRule = selector.trimStart().startsWith('@');
        const isPseudoElement = !isAtRule && selector.trimStart().startsWith('::');

        let ruleText: string;
        if (isAtRule) {
            // Embed a sentinel fake property `at-{name}: ''` inside the at-rule body.
            // When the at-rule is NOT supported, Gameface's error-recovery parser still
            // processes the body and emits "Unsupported CSS property detected: at-{name}".
            // Crucially, this emission is preceded by "CSS parsing error near text: @" in
            // the log, which the log-parser uses as the signal for a rejected at-rule.
            // When the at-rule IS supported, only the sentinel unsupported-property line
            // appears (no preceding @-error), so the log-parser knows it is accepted.
            const atName = extractAtRuleName(selector);
            const sentinel = `at-${atName}`;
            ruleText = `${selector} { * { color: rgb(1, 2, 3); ${sentinel}: ''; } }`;
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

// ── Spec ──────────────────────────────────────────────────────────────────────

describe('Gameface Selector Probe', function () {
    this.timeout(120_000);

    before(async function () {
        const gf = (global as any).gf;
        if (!gf) throw new Error('[before] gf global not available.');

        try {
            const selectorEntries: SelectorEntry[] = [
                ...getBcdCssSelectors(),
                ...SELECTOR_LIST,
            ];
            const selectorProbePage = generateSelectorProbePage(selectorEntries);
            console.log(
                `[css-selector-probe] Generated static page for ${selectorEntries.length} selectors: ${selectorProbePage}`,
            );

            console.log('[css-selector-probe] Navigating…');
            await withTimeout(gf.navigate(selectorProbePage), 30_000, 'css-selector-probe navigate');
            console.log('[css-selector-probe] Navigation complete. Reading cssRules counts…');

            await new Promise<void>((resolve) => setTimeout(resolve, 500));

            const ruleCounts: number[] = await withTimeout(
                runProbe(readSelectorRuleCounts, selectorEntries.length),
                15_000,
                'css-selector-probe read-results',
            );

            for (let i = 0; i < selectorEntries.length; i++) {
                const { selector, group } = selectorEntries[i];
                const count = ruleCounts[i] ?? -1;
                // For pseudo-classes/elements, count > 0 means Gameface reflected
                // the rule in cssRules (accepted).
                // For at-rules, cssRules is unreliable (Gameface's CSSOM doesn't
                // consistently reflect at-rules).  The actual at-rule support
                // determination is deferred to the reconciler, which uses the
                // sentinel-property log signal from the log-parser.
                const accepted = count > 0;
                cssSelectorResults[selector] = {
                    status: accepted ? 'supported' : 'probe-b-failed',
                    group,
                    probeA: false,
                    probeB: accepted,
                };
            }

            const supported = Object.values(cssSelectorResults).filter((r) => r.status === 'supported').length;
            const notApplied = Object.values(cssSelectorResults).filter((r) => r.status === 'probe-b-failed').length;
            console.log(`[css-selector-probe] Complete — ${supported} supported, ${notApplied} not-applied.`);
        } catch (e) {
            console.error(`[css-selector-probe] FAILED: ${e}`);
        }
    });

    it('CSS selectors: selector probe (static page + log capture)', async function () {
        const counts = Object.values(cssSelectorResults).reduce(
            (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
            {} as Record<string, number>,
        );
        console.log(
            `[css-selector-probe] ${Object.keys(cssSelectorResults).length} selectors:`,
            JSON.stringify(counts),
        );

        // Give Gameface time to flush its async log writes before after() parses the log.
        const gf = (global as any).gf;
        await gf.sleep(3000);
    });

    after(async function () {
        const logPath = resolveLogPath();

        // Player overwrites the log on each launch, so this log contains ONLY
        // selector-probe warnings — no competition from other probes.
        const logResults = parseLogSync(logPath);

        if (logResults.logFound) {
            console.log(
                `[css-selector-probe] Log parsed — ` +
                    `${logResults.unsupportedPseudoClasses.size} unsupported pseudo-classes, ` +
                    `${logResults.unsupportedPseudoElements.size} unsupported pseudo-elements, ` +
                    `${logResults.unsupportedAtRules.size} unsupported at-rules ` +
                    `(${[...logResults.unsupportedAtRules].map((n) => '@' + n).join(', ') || 'none'}).`,
            );
        } else {
            console.warn(`[css-selector-probe] Log not found at "${logPath}".`);
        }

        // Reconcile selectors in isolation (no other surfaces needed).
        const emptyDtsParsed = { interfaces: {}, globals: [], cssStyleDeclarationProps: [], cohProperties: [] };
        const { supported, partial, unsupported, summary } = reconcile({
            dtsParsed: emptyDtsParsed,
            jsResults: {},
            cssPropertyResults: {},
            cssSelectorResults,
            htmlConstructorResults: {},
            htmlFingerprintResults: {},
            inputTypeResults: {},
            logResults,
            cssSelectorLogResults: logResults,
            cssTestedValues: {},
            cssValueReadbackResults: {},
        });

        const partitioned = partitionBySurface({ supported, partial, unsupported, summary });

        const write = (filePath: string, data: unknown): void => {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[writer] Wrote ${filePath}`);
        };

        const selDir = path.join(OUTPUT_DIR, 'selectors');
        fs.mkdirSync(selDir, { recursive: true });
        const sel = partitioned.selectors;
        write(path.join(selDir, 'supported.json'), sel.supported);
        write(path.join(selDir, 'partial.json'), sel.partial);
        write(path.join(selDir, 'unsupported.json'), sel.unsupported);
        write(path.join(selDir, 'summary.json'), sel.summary);

        // Write intermediate data for probe-runner.spec.js to consume.
        fs.mkdirSync(INTERMEDIATE_DIR, { recursive: true });
        const intermediate = {
            cssSelectorResults,
            unsupportedPseudoClasses: [...logResults.unsupportedPseudoClasses],
            unsupportedPseudoElements: [...logResults.unsupportedPseudoElements],
            unsupportedAtRules: [...logResults.unsupportedAtRules],
        };
        write(SELECTOR_INTERMEDIATE_PATH, intermediate);
    });
});
