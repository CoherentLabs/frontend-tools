#!/usr/bin/env node
/**
 * node run.js <case-id> [options]
 *
 *   --all             run every case in cases/
 *   --count <n>       run only this count (default: every count in case.json)
 *   --repeats <n>     A/B pairs per count (default 3)
 *   --player <path>   Player.exe to measure in (default: the one in
 *                     ~/.gameface-mcp/config.json)
 *   --self-test       measure A against itself; must report
 *                     NO RELIABLE DIFFERENCE or the lab is fooling itself
 *   --dry-run         print what would be measured, launch nothing
 *   --rederive        rebuild every results.md row from the traces already in
 *                     runs/, without launching the Player - for when the
 *                     verdict rule changes but the measurements have not
 *
 * The protocol, per (case, count):
 *   launch Player on A -> discard 2s warmup -> trace 5s -> kill Player
 *   same for B, and repeat the pair 3 times interleaved (A B A B A B) so that
 *   any drift over the session lands on both variants equally.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchPlayer, resolvePlayerPath, traceFrames, VIEWPORT, VSYNC } from "./player.js";
import { parseTrace, phaseMedian, median, PHASE_COLUMNS, FRAME_EVENT } from "./parse.js";
import { buildReport } from "./tools/build-report.js";

const LAB_ROOT = dirname(fileURLToPath(import.meta.url));
const CASES_DIR = join(LAB_ROOT, "cases");
const RUNS_DIR = join(LAB_ROOT, "runs");
const RESULTS_MD = join(LAB_ROOT, "results.md");

const WARMUP_MS = 2000;
const TRACE_MS = 5000;
const DEFAULT_REPEATS = 3;

// The second half of the guardrail. Clearing run-to-run noise is necessary but
// not sufficient: on a quiet machine the spread can collapse far enough that a
// 2-3% difference passes, and such findings contradicted themselves across
// counts of the same case (class-string-vs-classlist read 1.03x at 100 and no
// difference at both 30 and 300). An effect must also be big enough to matter.
const MIN_RATIO = 1.1;

const RESULTS_HEADER = `# Results

One row per completed (case, count), appended by \`run.js\`. Never edit by hand -
re-running a case appends a new row and the old ones stay, because they are the
history and a free engine-version comparison later.

Ratios are B/A of the steady-state median for that phase. A ratio in
(parentheses) did not clear the noise guardrail and is not a finding. A dash
means the engine did no work in that phase in either variant.

The "other" column names any phase outside the printed set that moved - the
per-frame scene-graph walk lives there, and a case can be dominated by it while
every printed column stays flat.

The "fps" column is the frame rate the row was measured at. It is load-bearing:
the Player alternates between full and half vsync, and Coherent_GPU is NOT
emitted at all in the fast mode - so a row measured at 64 shows no GPU phase and
cannot be compared against one measured at 32.

The "spike" column is A->B frame jitter, as max/median of the main-thread frame.
1.0 means every frame cost the same; a large number means the work arrives in
bursts. Medians cannot see a hitch, so this is the column that can.

| case | count | variable | ${PHASE_COLUMNS.map((p) => p.column).join(" | ")} | other | spike | verdict | engine | fps | date |
|${"---|".repeat(PHASE_COLUMNS.length + 9)}
`;

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const options = { caseIds: [], all: false, repeats: DEFAULT_REPEATS, selfTest: false, dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--all":
        options.all = true;
        break;
      case "--self-test":
        options.selfTest = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--rederive":
        options.rederive = true;
        break;
      case "--count":
        options.count = Number(argv[++i]);
        break;
      case "--repeats":
        options.repeats = Number(argv[++i]);
        break;
      case "--player":
        options.player = argv[++i];
        break;
      default:
        if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}`);
        options.caseIds.push(arg);
    }
  }

  return options;
}

// -------------------------------------------------------------------- cases

function loadCase(caseId) {
  const dir = join(CASES_DIR, caseId);
  const manifestPath = join(dir, "case.json");
  if (!existsSync(manifestPath)) throw new Error(`No case.json in ${dir}`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const field of ["title", "variable", "hypothesis", "status", "notes"]) {
    if (!manifest[field]) throw new Error(`cases/${caseId}/case.json is missing "${field}"`);
  }

  return {
    id: caseId,
    dir,
    counts: manifest.counts ?? [null],
    labels: { a: "A", b: "B", ...(manifest.labels ?? {}) },
    ...manifest,
  };
}

function allCaseIds() {
  return readdirSync(CASES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(CASES_DIR, entry.name, "case.json")))
    .map((entry) => entry.name)
    .sort();
}

function pageUrl(caseDir, file, count) {
  const url = pathToFileURL(join(caseDir, file));
  if (count !== null) url.searchParams.set("count", String(count));
  return url.href;
}

// ------------------------------------------------------------- measurement

async function measure(playerPath, url, label, pointerSweep = false) {
  const player = await launchPlayer(playerPath, url);
  try {
    const viewport = await player.viewport();
    if (viewport.width !== VIEWPORT.width || viewport.height !== VIEWPORT.height) {
      console.warn(
        `  ! ${label}: viewport is ${viewport.width}x${viewport.height}, expected ${VIEWPORT.width}x${VIEWPORT.height}. ` +
          `Durations scale with pixel count, so this row is not comparable to rows measured at the pinned size.`
      );
    }

    const events = await traceFrames(player.client, {
      warmupMs: WARMUP_MS,
      traceMs: TRACE_MS,
      pointerSweep,
      viewport,
    });
    const parsed = parseTrace(events);
    if (parsed.frameCount === 0) {
      throw new Error(`${label} produced no frames - the page may have failed to load`);
    }

    return { parsed, events, cohtmlVersion: player.cohtmlVersion, viewport };
  } finally {
    await player.close();
  }
}

// ------------------------------------------------------------------ verdict

/**
 * The entire statistics, per the spec: signal is the gap between the two
 * variants' medians; noise is the worse of the two variants' own run-to-run
 * spreads. If the gap does not clear the noise, there is no finding.
 */
function comparePhase(aRuns, bRuns) {
  const aPresent = aRuns.filter((v) => v !== null);
  const bPresent = bRuns.filter((v) => v !== null);

  if (aPresent.length === 0 && bPresent.length === 0) {
    return { status: "absent" };
  }

  const medians = (runs) => runs.map((r) => r.median);
  const a = aPresent.length ? median(medians(aPresent)) : 0;
  const b = bPresent.length ? median(medians(bPresent)) : 0;

  const spread = (values) => (values.length > 1 ? Math.max(...values) - Math.min(...values) : 0);
  const noise = Math.max(spread(medians(aPresent)), spread(medians(bPresent)));
  const signal = Math.abs(a - b);
  const ratio = a > 0 ? b / a : Infinity;

  // How much of an average frame this phase actually accounts for. A phase that
  // runs once per frame has perFrame 1; Coherent_JSEvent fires about five times
  // in a 5s trace, so its per-frame share is ~0.03 even when each occurrence is
  // expensive. Ranking on the raw median let that outrank a phase costing real
  // time on every single frame.
  const perFrame = (runs) => (runs.length ? median(runs.map((r) => r.perFrame ?? 1)) : 0);
  const weight = Math.abs(b * perFrame(bPresent) - a * perFrame(aPresent));

  // A phase that runs in one variant and not the other is a qualitative
  // result, not a ratio - "B introduces layout work" says more than a number.
  let status = "ratio";
  if (aPresent.length === 0) status = "b-only";
  else if (bPresent.length === 0) status = "a-only";

  // Both halves of the guardrail: the gap must clear the noise, and the effect
  // must be large enough to be worth acting on. A one-sided phase is exempt
  // from the size test - "runs at all vs does not run" has no meaningful ratio.
  const bigEnough = status !== "ratio" || ratio > MIN_RATIO || ratio < 1 / MIN_RATIO;
  const meaningful = signal > noise && bigEnough;

  return { status, a, b, noise, signal, meaningful, ratio, weight };
}

const PRINTED_EVENTS = new Set(PHASE_COLUMNS.map((p) => p.event));

/**
 * Phases excluded from the "other" column because reporting them would be
 * double-counting, not discovery.
 *
 * The first group nests inside Coherent_Paint, the second inside
 * Coherent_Styling - a case that moves Paint moves all of Paint's children too,
 * and surfacing them adds noise without adding information. The Wait* phases
 * are blocking time on the styling thread rather than work, so they echo
 * whatever the worker threads are doing.
 *
 * Deliberately NOT excluded: Coherent_UpdateNodeTransforms,
 * Coherent_RecalcVisualStyle and Coherent_RecordRendering. That trio is the
 * per-frame scene-graph walk on the Layout thread, and no printed column
 * contains it - which is exactly how dom-depth-shallow-vs-deep hid a 7.5x
 * regression behind five flat columns.
 */
const CONTAINED_IN_PRINTED = new Set([
  "Coherent_ExecuteProcess",
  "Coherent_Frontend",
  "Coherent_ProcessFrontendCommandsOnly",
  "Coherent_BeginFrame",
  "Coherent_ProcessFrontendCommands",
  "Coherent_ExecutePaint",
  "Coherent_Backend",
  "Coherent_ExecuteBackendBuffers",
  "Coherent_BackendExecute",
  "Coherent_TickAnimations",
  "Coherent_RecalculateStyles",
  "Coherent_WaitPendingLayout",
  "Coherent_WaitPendingStyle",
  "Coherent_StylingFinalizer",
  // The main-thread frame roll-up. It contains Script and waits on the worker
  // threads, so its delta is always at least Script's and it wins every ranking
  // while saying less: "B costs more (Advance)" where the honest answer is
  // "B costs more (Script)". The Layout-thread trio above provides the coverage
  // this was otherwise giving.
  "Coherent_Advance",
]);

/**
 * Accumulates one run's per-phase medians into a { event: [perRun...] } map,
 * keeping every array the same length. A phase the engine skipped in this run
 * records null rather than 0, and a phase seen for the first time is back-filled
 * with nulls so it still lines up with the runs that preceded it.
 */
function recordRun(sink, parsed, runsSoFar) {
  for (const event of new Set([...Object.keys(sink), ...Object.keys(parsed.phases)])) {
    if (!sink[event]) sink[event] = new Array(runsSoFar).fill(null);
    // The whole phase summary, not just the median: perFrame is what separates
    // a phase that runs every frame from one that fires a handful of times per
    // trace, and the two must not be ranked as if they cost the same.
    sink[event].push(parsed.phases[event] ?? null);
  }
}

/**
 * Compares every phase in the trace, not only the printed columns.
 *
 * The printed five are the phases that usually carry the story, but they are
 * not all the work the engine does. dom-depth-shallow-vs-deep proved it: at
 * depth 20 the cost landed almost entirely in Coherent_UpdateNodeTransforms
 * (7.5x) and Coherent_RecordRendering (6.6x) - the per-frame scene-graph walk -
 * while all five printed phases stayed inside the guardrail. The lab called it
 * NO RELIABLE DIFFERENCE, which was simply wrong.
 *
 * So the verdict is decided over every recorded phase. Anything meaningful that
 * is not one of the printed columns is surfaced in the "other" field rather
 * than being silently dropped.
 */
/**
 * How spiky the main-thread frame was, as max/median of Coherent_Advance
 * within a run: 1.0 means every frame cost the same, 10 means one frame cost
 * ten times the typical one.
 *
 * This exists because the lab's medians are blind to the thing a "long task" IS.
 * Chunked work costs a little every frame; a burst costs nothing on nine frames
 * and a lot on the tenth. By median the correctly-chunked version looks worse,
 * which is exactly backwards. The spike figure sees what the median cannot.
 *
 * It never touches the median guardrail. Every row gets it as a diagnostic; only
 * a case declaring "metric": "frame-spike" lets it decide the verdict.
 */
function frameSpike(runs) {
  const values = (runs ?? [])
    .filter((r) => r !== null && r.median > 0)
    .map((r) => r.max / r.median);
  return values.length ? median(values) : null;
}

function compareSpike(aRunsByPhase, bRunsByPhase) {
  const a = frameSpike(aRunsByPhase[FRAME_EVENT]);
  const b = frameSpike(bRunsByPhase[FRAME_EVENT]);
  if (a === null || b === null) return { available: false };

  const spread = (runs) => {
    const v = (runs ?? []).filter((r) => r !== null && r.median > 0).map((r) => r.max / r.median);
    return v.length > 1 ? Math.max(...v) - Math.min(...v) : 0;
  };
  const noise = Math.max(spread(aRunsByPhase[FRAME_EVENT]), spread(bRunsByPhase[FRAME_EVENT]));
  const ratio = b / a;
  const meaningful = Math.abs(a - b) > noise && (ratio > MIN_RATIO || ratio < 1 / MIN_RATIO);

  return { available: true, a, b, ratio, meaningful };
}

function compare(aRunsByPhase, bRunsByPhase, { useSpike = false } = {}) {
  const phases = {};
  for (const { column, event } of PHASE_COLUMNS) {
    phases[column] = comparePhase(aRunsByPhase[event] ?? [], bRunsByPhase[event] ?? []);
  }

  const spike = compareSpike(aRunsByPhase, bRunsByPhase);

  const candidates = [];
  for (const [column, result] of Object.entries(phases)) {
    candidates.push({ label: column, result, printed: true });
  }

  const otherEvents = new Set([...Object.keys(aRunsByPhase), ...Object.keys(bRunsByPhase)]);
  for (const event of otherEvents) {
    if (PRINTED_EVENTS.has(event) || CONTAINED_IN_PRINTED.has(event)) continue;
    const result = comparePhase(aRunsByPhase[event] ?? [], bRunsByPhase[event] ?? []);
    candidates.push({ label: event.replace(/^Coherent_/, ""), result, printed: false });
  }

  // Ranked by per-frame time moved, not by ratio: it keeps the headline on the
  // phase that actually costs milliseconds every frame, and naturally prefers a
  // specific phase over the roll-up (Coherent_Advance) that contains it.
  const meaningful = candidates.filter((c) => c.result.meaningful && c.result.status !== "absent");
  meaningful.sort((x, y) => y.result.weight - x.result.weight);

  const dominant = meaningful[0] ?? null;
  const topUnprinted = meaningful.find((c) => !c.printed) ?? null;
  const other = topUnprinted ? `${topUnprinted.label} ${formatRatio(topUnprinted.result)}` : "--";

  // A case that declares frame-spike is declaring that jitter, not median cost,
  // is the thing it measures - so the spike decides its verdict outright rather
  // than only breaking a tie.
  //
  // This has to come BEFORE the median verdict, and the first version of it did
  // not. long-task-chunked-vs-burst caught the mistake: the burst variant is
  // genuinely cheaper on nine frames in ten, so Script read 0.20x and the lab
  // announced "B costs less" while the spike column beside it read 30.7x. The
  // table was recommending the antipattern in its own words.
  if (useSpike && spike.available && spike.meaningful) {
    const worse = spike.b > spike.a;
    return {
      phases,
      other,
      spike,
      verdict: worse ? `B hitches (frame spike ${spike.b.toFixed(1)}x)` : `A hitches (frame spike ${spike.a.toFixed(1)}x)`,
      headline: `MEANINGFUL - ${worse ? "B" : "A"} spikes the frame (${spike.a.toFixed(1)}x vs ${spike.b.toFixed(1)}x max/median)`,
    };
  }

  if (!dominant) {
    return { phases, other, spike, verdict: "NO RELIABLE DIFFERENCE", headline: "no measurable difference on this machine" };
  }

  const { label, result } = dominant;
  if (result.status === "b-only") {
    return { phases, other, spike, verdict: `B introduces ${label} work`, headline: `B does ${label} work that A does not` };
  }
  if (result.status === "a-only") {
    return { phases, other, spike, verdict: `A introduces ${label} work`, headline: `A does ${label} work that B does not` };
  }

  const direction = result.b > result.a ? "B costs more" : "B costs less";
  return { phases, other, spike, verdict: `${direction} (${label})`, headline: `MEANINGFUL - ${direction} (${label}-bound)` };
}

// ----------------------------------------------------------------- printing

const ms = (value) => (value === null || Number.isNaN(value) ? "  --   " : `${value.toFixed(2)} ms`);

function formatRatio(result) {
  if (result.status === "absent") return "--";
  if (result.status === "b-only") return "B-only";
  if (result.status === "a-only") return "A-only";
  // A ran the phase but too fast for the trace timer to resolve, so its median
  // is a true 0 and the ratio is a division by zero. "A~0" says what happened;
  // printing "Infinityx" implied a measurement that was never made.
  const text = Number.isFinite(result.ratio) ? `${result.ratio.toFixed(2)}x` : "A~0";
  return result.meaningful ? text : `(${text})`;
}

function formatSpike(spike) {
  if (!spike || !spike.available) return "--";
  const text = `${spike.a.toFixed(1)}->${spike.b.toFixed(1)}`;
  return spike.meaningful ? text : `(${text})`;
}

function printCaseTable(testCase, count, comparison, meta) {
  const heading = count === null ? testCase.id : `${testCase.id} (${count} elements)`;
  console.log(`\n${heading}`);
  const width = Math.max(14, testCase.labels.a.length + 5, testCase.labels.b.length + 5);
  console.log(
    `  ${"".padEnd(9)}${`A (${testCase.labels.a})`.padEnd(width)}${`B (${testCase.labels.b})`.padEnd(width)}ratio`
  );

  for (const { column } of PHASE_COLUMNS) {
    const result = comparison.phases[column];
    // A phase the engine never ran prints as absent, not as 0.00 ms - the
    // distinction is the whole point of a B-only result.
    const a = result.status === "absent" || result.status === "b-only" ? null : result.a;
    const b = result.status === "absent" || result.status === "a-only" ? null : result.b;
    console.log(`  ${column.padEnd(9)}${ms(a).padEnd(width)}${ms(b).padEnd(width)}${formatRatio(result)}`);
  }

  if (comparison.other !== "--") {
    console.log(`  ${"other".padEnd(9)}${comparison.other}`);
  }
  if (comparison.spike?.available) {
    console.log(`  ${"spike".padEnd(9)}${formatSpike(comparison.spike)}  (frame max/median)`);
  }
  console.log(`  verdict: ${comparison.headline}`);
  if (meta.frameRateMixed) {
    console.log(
      `  ! the six runs did not all hold the same frame rate (${meta.frameRateModes}). ` +
        `GPU durations track the frame rate, so treat a GPU-only finding here with suspicion.`
    );
  }
  const conditions = Number.isNaN(meta.frameIntervalMs)
    ? `${meta.repeats} A/B pairs, re-derived from stored traces`
    : `${meta.repeats} A/B pairs, ${meta.frames} frames/trace, ${meta.frameIntervalMs.toFixed(1)}ms frame interval`;
  console.log(`  (${conditions}, cohtml ${meta.cohtmlVersion}, ${VIEWPORT.width}x${VIEWPORT.height}, vsync ${VSYNC})`);
}

// ------------------------------------------------------------------ results

function appendResultRow(fields) {
  if (!existsSync(RESULTS_MD)) writeFileSync(RESULTS_MD, RESULTS_HEADER);
  appendFileSync(RESULTS_MD, `| ${fields.join(" | ")} |\n`);
}

const today = () => new Date().toISOString().slice(0, 10);

// --------------------------------------------------------------------- main

async function runCaseCount(testCase, count, options, playerPath) {
  const bFile = options.selfTest ? "A.html" : "B.html";
  const aUrl = pageUrl(testCase.dir, "A.html", count);
  const bUrl = pageUrl(testCase.dir, bFile, count);

  if (options.dryRun) {
    console.log(`\n${testCase.id}${count === null ? "" : ` (${count})`}`);
    console.log(`  A: ${aUrl}`);
    console.log(`  B: ${bUrl}`);
    return;
  }

  const aRunsByPhase = {};
  const bRunsByPhase = {};

  // A self-test measures A against itself, so its traces must never land in
  // the directory holding the case's real A/B data - doing so silently
  // replaced a 5.49x finding with the self-test's own null result, which only
  // surfaced when --rederive rebuilt the table from disk.
  const traceDir = join(
    RUNS_DIR,
    testCase.id + (count === null ? "" : `-${count}`) + (options.selfTest ? "-selftest" : "")
  );
  mkdirSync(traceDir, { recursive: true });
  // Recorded so --rederive can rebuild the row later without having to guess
  // the case id back out of a directory name that contains hyphens itself.
  writeFileSync(join(traceDir, "meta.json"), JSON.stringify({ caseId: testCase.id, count, selfTest: !!options.selfTest }));

  let cohtmlVersion = "unknown";
  let frames = 0;
  const frameIntervals = [];

  for (let repeat = 1; repeat <= options.repeats; repeat++) {
    for (const [variant, url, sink] of [
      ["A", aUrl, aRunsByPhase],
      ["B", bUrl, bRunsByPhase],
    ]) {
      process.stdout.write(`  measuring ${testCase.id}${count === null ? "" : `/${count}`} ${variant} ${repeat}/${options.repeats}... `);
      const { parsed, events, cohtmlVersion: version } = await measure(playerPath, url, `${variant}${repeat}`, testCase.input === "pointer-sweep");
      cohtmlVersion = version;
      frames = parsed.frameCount;
      frameIntervals.push(parsed.frameIntervalMs);

      recordRun(sink, parsed, repeat - 1);

      writeFileSync(join(traceDir, `${variant}${repeat}.json`), JSON.stringify(events));
      writeFileSync(join(traceDir, `${variant}${repeat}.phases.json`), JSON.stringify(parsed, null, 2));
      console.log(`${parsed.frameCount} frames`);
    }
  }

  const comparison = compare(aRunsByPhase, bRunsByPhase, { useSpike: testCase.metric === "frame-spike" });
  // The Player alternates between full and half vsync rate depending on load,
  // and GPU phase durations track that rate. If the six runs did not all sit in
  // the same mode, say so rather than letting it pass as a clean comparison.
  const rateModes = [...new Set(frameIntervals.map((ms) => Math.round(1000 / ms)))].sort((x, y) => x - y);
  printCaseTable(testCase, count, comparison, {
    repeats: options.repeats,
    frames,
    frameIntervalMs: median(frameIntervals),
    cohtmlVersion,
    frameRateMixed: rateModes.length > 1,
    frameRateModes: rateModes.map((r) => r + "fps").join(" and "),
  });

  if (options.selfTest) {
    const passed = comparison.verdict === "NO RELIABLE DIFFERENCE";
    console.log(`  self-test: ${passed ? "PASS" : "FAIL"} - A measured against itself must find no difference`);
    if (!passed) process.exitCode = 1;
    return;
  }

  appendResultRow([
    testCase.id,
    count === null ? "-" : String(count),
    testCase.variable,
    ...PHASE_COLUMNS.map(({ column }) => formatRatio(comparison.phases[column])),
    comparison.other,
    formatSpike(comparison.spike),
    comparison.verdict,
    cohtmlVersion,
    String(Math.round(1000 / median(frameIntervals))),
    today(),
  ]);
}

/**
 * Rebuilds every row in results.md from the per-repeat phase data already on
 * disk in runs/, without launching the Player.
 *
 * This exists because the verdict rule can change after the fact - the size
 * gate was added once the first full sweep showed sub-1.05x findings
 * contradicting themselves across counts. The measurements were fine; only the
 * rule for reading them moved. Re-deriving keeps every row in the table under
 * one consistent rule instead of leaving a mix of old and new verdicts.
 */
function rederive() {
  if (!existsSync(RUNS_DIR)) throw new Error("No runs/ directory to re-derive from");

  const knownCases = allCaseIds();
  const entries = [];

  for (const dir of readdirSync(RUNS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const dirPath = join(RUNS_DIR, dir.name);

    // Self-test traces are A measured against itself. They are diagnostics,
    // never table rows.
    if (dir.name.endsWith("-selftest")) continue;

    let caseId;
    let count;
    const metaPath = join(dirPath, "meta.json");
    if (existsSync(metaPath)) {
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      if (meta.selfTest) continue;
      ({ caseId, count } = meta);
    } else {
      // Older run directories predate meta.json. Case ids contain hyphens, so
      // resolve by longest matching known id rather than by splitting.
      caseId = knownCases.filter((id) => dir.name === id || dir.name.startsWith(id + "-")).sort((a, b) => b.length - a.length)[0];
      if (!caseId) {
        console.warn(`  skipping ${dir.name} - no case matches it`);
        continue;
      }
      const suffix = dir.name.slice(caseId.length + 1);
      count = suffix === "" ? null : Number(suffix);
    }

    const aRunsByPhase = {};
    const bRunsByPhase = {};

    let repeats = 0;
    let cohtmlVersion = "3.2.0.2";
    // A re-derived row must keep the date it was MEASURED, not the date the
    // verdict rule was re-applied - otherwise re-deriving silently rewrites
    // the history the table exists to preserve.
    let measuredAt = null;
    const frameIntervals = [];
    for (let i = 1; ; i++) {
      const aPath = join(dirPath, `A${i}.phases.json`);
      const bPath = join(dirPath, `B${i}.phases.json`);
      if (!existsSync(aPath) || !existsSync(bPath)) break;
      if (measuredAt === null) measuredAt = statSync(aPath).mtime.toISOString().slice(0, 10);
      const a = JSON.parse(readFileSync(aPath, "utf8"));
      const b = JSON.parse(readFileSync(bPath, "utf8"));
      recordRun(aRunsByPhase, a, repeats);
      recordRun(bRunsByPhase, b, repeats);
      frameIntervals.push(a.frameIntervalMs, b.frameIntervalMs);
      repeats++;
    }

    if (repeats === 0) {
      console.warn(`  skipping ${dir.name} - no phase data`);
      continue;
    }

    const testCase = loadCase(caseId);
    entries.push({ caseId, count, testCase, comparison: compare(aRunsByPhase, bRunsByPhase, { useSpike: testCase.metric === "frame-spike" }), cohtmlVersion, repeats, measuredAt, frameIntervalMs: median(frameIntervals) });
  }

  entries.sort((x, y) => x.caseId.localeCompare(y.caseId) || (x.count ?? 0) - (y.count ?? 0));

  writeFileSync(RESULTS_MD, RESULTS_HEADER);
  for (const entry of entries) {
    printCaseTable(entry.testCase, entry.count, entry.comparison, {
      repeats: entry.repeats,
      frames: 0,
      frameIntervalMs: NaN,
      cohtmlVersion: entry.cohtmlVersion,
    });
    appendResultRow([
      entry.caseId,
      entry.count === null ? "-" : String(entry.count),
      entry.testCase.variable,
      ...PHASE_COLUMNS.map(({ column }) => formatRatio(entry.comparison.phases[column])),
      entry.comparison.other,
      formatSpike(entry.comparison.spike),
      entry.comparison.verdict,
      entry.cohtmlVersion,
      String(Math.round(1000 / entry.frameIntervalMs)),
      entry.measuredAt ?? today(),
    ]);
  }

  buildReport();
  console.log(`\nre-derived ${entries.length} row(s) into results.md`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.rederive) {
    rederive();
    return;
  }

  const caseIds = options.all ? allCaseIds() : options.caseIds;
  if (caseIds.length === 0) {
    console.error("Usage: node run.js <case-id> [--all] [--count n] [--repeats n] [--player path] [--self-test]");
    process.exitCode = 1;
    return;
  }

  const playerPath = options.dryRun ? null : resolvePlayerPath(options.player);
  if (playerPath) console.log(`Player: ${playerPath}`);

  for (const caseId of caseIds) {
    const testCase = loadCase(caseId);

    // A documented N/A is a result: it tells users which web advice to ignore
    // in Gameface. It gets a row without anything being measured.
    if (testCase.status === "N/A") {
      console.log(`\n${testCase.id}: N/A - ${testCase.notes}`);
      if (!options.dryRun && !options.selfTest) {
        appendResultRow([testCase.id, "-", testCase.variable, "--", "--", "--", "--", `N/A - ${testCase.notes}`, "-", today()]);
      }
      continue;
    }

    const counts = options.count !== undefined ? [options.count] : testCase.counts;
    for (const count of counts) {
      await runCaseCount(testCase, count, options, playerPath);
    }
  }

  // Keep the overview in step with the table it is built from. A self-test
  // writes no rows, and a dry run writes nothing at all.
  if (!options.dryRun && !options.selfTest) buildReport();
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
});
