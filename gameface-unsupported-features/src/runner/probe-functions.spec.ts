/**
 * Gameface CSS Function Probe — standalone spec.
 *
 * Run LAST (after probe-runner.spec.js) so that if Gameface stalls on any
 * function value, the property / JS / HTML surfaces are already captured.
 *
 * This spec:
 *   1. Generates css-function-probe.html
 *   2. Navigates the Player to it — Gameface emits parse-time warnings for
 *      unsupported values
 *   3. Sleeps to let Gameface flush its async log, then after() parses and writes:
 *      - results/intermediate/function-data.json  (raw data for probe-runner)
 *      - results/functions/*.json                 (browsable output right away)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { CSS_FUNCTIONS } from '../static/css-functions';
import type { CssFunctionEntry } from '../static/css-functions';

import { parseLogSync } from '../log/log-parser';
import { reconcile, partitionBySurface } from '../merge/reconciler';

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
export const FUNCTION_INTERMEDIATE_PATH = path.resolve(INTERMEDIATE_DIR, 'function-data.json');

function resolveLogPath(): string {
    if (config.logPath) return config.logPath;
    if (config.gamefacePath) {
        return path.resolve(path.dirname(config.gamefacePath), 'CohtmlApplication.log');
    }
    return '';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`[${label}] Timed out after ${ms}ms`)), ms),
        ),
    ]);
}

function generateCssFunctionProbePage(): string {
    const rules: string[] = [];
    CSS_FUNCTIONS.forEach((entry: CssFunctionEntry, i: number) => {
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

// ── Spec ──────────────────────────────────────────────────────────────────────

describe('Gameface CSS Function Probe', function () {
    this.timeout(120_000);

    it('CSS functions: function probe page (parse-time log capture)', async function () {
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
            await withTimeout(gf.navigate(cssFunctionPage), 30_000, 'css-function-probe navigate');
            console.log('[css-function-probe] Navigation complete (log warnings collected in after()).');
        } catch (e) {
            console.error(`[css-function-probe] FAILED (function results may be incomplete): ${e}`);
        }

        // Give Gameface time to flush its async log writes before after() parses the log.
        await gf.sleep(3000);
    });

    after(async function () {
        const logPath = resolveLogPath();

        // Player overwrites the log on each launch, so this log contains ONLY
        // function-probe warnings.
        const logResults = parseLogSync(logPath);
        if (logResults.logFound) {
            console.log(
                `[css-function-probe] Log parsed — ` +
                `${logResults.propertiesWithInvalidValues.size} properties with rejected values, ` +
                `${logResults.unsupportedCalcExpressions.size} unsupported calc expressions.`,
            );
        } else {
            console.warn(`[css-function-probe] Log not found at "${logPath}".`);
        }

        // Reconcile functions in isolation.
        const emptyDtsParsed = { interfaces: {}, globals: [], cssStyleDeclarationProps: [], cohProperties: [] };
        const { supported, partial, unsupported, summary } = reconcile({
            dtsParsed: emptyDtsParsed,
            jsResults: {},
            cssPropertyResults: {},
            cssSelectorResults: {},
            htmlConstructorResults: {},
            htmlFingerprintResults: {},
            inputTypeResults: {},
            logResults,
            cssTestedValues: {},
            cssValueReadbackResults: {},
        });

        const partitioned = partitionBySurface({ supported, partial, unsupported, summary });

        const write = (filePath: string, data: unknown): void => {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[writer] Wrote ${filePath}`);
        };

        const fnDir = path.join(OUTPUT_DIR, 'functions');
        fs.mkdirSync(fnDir, { recursive: true });
        const fn = partitioned.functions;
        write(path.join(fnDir, 'supported.json'), fn.supported);
        write(path.join(fnDir, 'partial.json'), fn.partial);
        write(path.join(fnDir, 'unsupported.json'), fn.unsupported);
        write(path.join(fnDir, 'summary.json'), fn.summary);

        // Write intermediate data for probe-runner.spec.js.
        fs.mkdirSync(INTERMEDIATE_DIR, { recursive: true });
        const intermediate = {
            propertiesWithInvalidValues: Object.fromEntries(
                [...logResults.propertiesWithInvalidValues.entries()].map(([k, v]) => [k, [...v]]),
            ),
            unsupportedCalcExpressions: [...logResults.unsupportedCalcExpressions],
        };
        write(FUNCTION_INTERMEDIATE_PATH, intermediate);
    });
});
