#!/usr/bin/env node
/**
 * Builds report.html - a self-contained overview of every case in the lab.
 *
 *   node tools/build-report.js
 *
 * run.js calls this after a sweep and after --rederive, so the page never goes
 * stale against results.md.
 *
 * Sources, in order of authority:
 *   results.md    the verdicts and ratios (the committed record)
 *   case.json     what each case tests, and why, one per case directory
 *   runs/         absolute per-phase milliseconds, when they are on disk
 *
 * runs/ is gitignored, so a fresh clone has no absolute timings. That is a
 * degrade, not a failure: the page still builds and simply omits the ms view.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { median, PHASE_COLUMNS, phaseMedian } from "../parse.js";

const LAB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CASES_DIR = join(LAB_ROOT, "cases");
const RUNS_DIR = join(LAB_ROOT, "runs");
const RESULTS_MD = join(LAB_ROOT, "results.md");
const REPORT_HTML = join(LAB_ROOT, "report.html");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ------------------------------------------------------------------- sources

/** Parses the markdown table into row objects, last row per (case, count) winning. */
function readResults() {
  if (!existsSync(RESULTS_MD)) return { rows: [], supersededCount: 0 };

  const rows = [];
  for (const line of readFileSync(RESULTS_MD, "utf8").split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    // case, count, variable, <one per phase>, other, verdict, engine, date
    if (cells.length !== PHASE_COLUMNS.length + 9) continue;
    if (cells[0] === "case" || cells[0].startsWith("---")) continue;

    const [caseId, count, variable] = cells;
    const ratios = {};
    PHASE_COLUMNS.forEach(({ column }, i) => {
      ratios[column] = cells[3 + i];
    });
    const [other, spike, verdict, engine, fps, date] = cells.slice(3 + PHASE_COLUMNS.length);
    rows.push({ caseId, count, variable, ratios, other, spike, verdict, engine, fps, date });
  }

  // Re-running a case appends rather than replacing, so the table is history.
  // The overview shows the current reading and counts what it superseded.
  const latest = new Map();
  let supersededCount = 0;
  for (const row of rows) {
    const key = `${row.caseId}::${row.count}`;
    if (latest.has(key)) supersededCount++;
    latest.set(key, row);
  }

  return { rows: [...latest.values()], supersededCount };
}

function readCases() {
  if (!existsSync(CASES_DIR)) return new Map();
  const cases = new Map();
  for (const entry of readdirSync(CASES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = join(CASES_DIR, entry.name, "case.json");
    if (!existsSync(manifest)) continue;
    try {
      cases.set(entry.name, JSON.parse(readFileSync(manifest, "utf8")));
    } catch (error) {
      console.warn(`  skipping cases/${entry.name}: ${error.message}`);
    }
  }
  return cases;
}

/**
 * Absolute per-phase medians for one (case, count), computed the same way
 * run.js computes them: the median across repeats of each repeat's own median.
 * Returns null when the traces are not on disk.
 */
function readAbsolutes(caseId, count) {
  const dir = join(RUNS_DIR, caseId + (count === "-" ? "" : `-${count}`));
  if (!existsSync(dir)) return null;

  const perVariant = { A: {}, B: {} };
  for (const variant of ["A", "B"]) {
    const runs = [];
    for (let i = 1; ; i++) {
      const file = join(dir, `${variant}${i}.phases.json`);
      if (!existsSync(file)) break;
      runs.push(JSON.parse(readFileSync(file, "utf8")));
    }
    if (runs.length === 0) return null;

    for (const { column, event } of PHASE_COLUMNS) {
      const values = runs.map((run) => phaseMedian(run, event)).filter((v) => v !== null);
      perVariant[variant][column] = values.length ? median(values) : null;
    }
  }
  return perVariant;
}

// ------------------------------------------------------------------ rendering

/** Classifies a ratio cell so the page can style it without re-deriving anything. */
function classifyRatio(text) {
  if (!text || text === "--") return { kind: "absent", label: "—" };
  if (text === "B-only" || text === "A-only") return { kind: "oneSided", label: text };

  const weak = text.startsWith("(");
  const value = parseFloat(text.replace(/[()x]/g, ""));
  if (Number.isNaN(value)) return { kind: "absent", label: escapeHtml(text) };

  if (weak) return { kind: "weak", label: escapeHtml(text), value };
  return { kind: value >= 1 ? "worse" : "better", label: escapeHtml(text), value };
}

const formatMs = (value) => (value === null || value === undefined ? "—" : `${value.toFixed(2)}`);

function renderCountRow(row, absolutes) {
  const cells = PHASE_COLUMNS.map(({ column }) => {
    const { kind, label } = classifyRatio(row.ratios[column]);
    const a = absolutes?.A?.[column];
    const b = absolutes?.B?.[column];
    const ms = absolutes ? `${formatMs(a)} → ${formatMs(b)}` : "—";
    return `<td class="cell ${kind}"><span class="asRatio">${label}</span><span class="asMs">${ms}</span></td>`;
  }).join("");

  const isNull = /NO RELIABLE DIFFERENCE/i.test(row.verdict);
  // A phase outside the printed columns that moved. Shown inline because a case
  // can be dominated by one while every printed column stays flat.
  const other =
    row.other && row.other !== "--"
      ? `<div class="other">also moved: <b>${escapeHtml(row.other)}</b></div>`
      : "";
  return `
        <tr>
          <th scope="row">${escapeHtml(row.count)}</th>
          ${cells}
          <td class="verdict ${isNull ? "null" : "finding"}">${escapeHtml(row.verdict)}${other}</td>
        </tr>`;
}

function renderCard(caseId, manifest, rows) {
  const labels = { a: "A", b: "B", ...(manifest?.labels ?? {}) };
  const status = manifest?.status ?? "?";
  const hypothesis = manifest?.hypothesis ?? "?";

  // Did the case land on the axis it predicted? Only meaningful once at least
  // one count produced a finding.
  const findingVerdicts = rows.map((r) => r.verdict).filter((v) => !/NO RELIABLE DIFFERENCE/i.test(v));
  const hitAxis = findingVerdicts.some((v) => v.includes(hypothesis));
  const axisNote = findingVerdicts.length === 0 ? "none" : hitAxis ? "hit" : "missed";

  const countRows = rows
    .sort((x, y) => Number(x.count) - Number(y.count))
    .map((row) => renderCountRow(row, readAbsolutes(caseId, row.count)))
    .join("");

  // An authored-but-unrun case is information, so say so rather than showing
  // an empty table that reads like a rendering fault.
  const body =
    rows.length > 0
      ? `<table>
          <thead>
            <tr><th scope="col">n</th>${PHASE_COLUMNS.map(({ column }) => `<th scope="col">${column}</th>`).join("")}<th scope="col">verdict</th></tr>
          </thead>
          <tbody>${countRows}
          </tbody>
        </table>`
      : `<p class="unmeasured">Authored, not yet measured — no rows in <code>results.md</code>.</p>`;

  const detail = [
    manifest?.claim ? `<p class="detailBlock"><b>Claim under test.</b> ${escapeHtml(manifest.claim)}</p>` : "",
    manifest?.result ? `<p class="detailBlock"><b>Result.</b> ${escapeHtml(manifest.result)}</p>` : "",
    manifest?.notes ? `<p class="detailBlock"><b>Rules &amp; gate.</b> ${escapeHtml(manifest.notes)}</p>` : "",
  ].join("");

  return `
      <article class="card">
        <header>
          <h2>${escapeHtml(caseId)}</h2>
          <div class="badges">
            <span class="badge status-${escapeHtml(status)}">${escapeHtml(status)}</span>
            <span class="badge axis axis-${axisNote}" title="Hypothesised axis: ${escapeHtml(hypothesis)}">${escapeHtml(hypothesis)}${axisNote === "missed" ? " ↯" : ""}</span>
          </div>
        </header>
        <p class="title">${escapeHtml(manifest?.title ?? "")}</p>
        <p class="variable"><span class="side">A</span> ${escapeHtml(labels.a)} <span class="vs">vs</span> <span class="side">B</span> ${escapeHtml(labels.b)}</p>
        ${body}
        ${detail ? `<details><summary>Claim, result and rule notes</summary>${detail}</details>` : ""}
      </article>`;
}

// ----------------------------------------------------------------------- page

function buildPage() {
  const { rows, supersededCount } = readResults();
  const cases = readCases();

  const byCase = new Map();
  for (const row of rows) {
    if (!byCase.has(row.caseId)) byCase.set(row.caseId, []);
    byCase.get(row.caseId).push(row);
  }

  // Cases with no rows yet still deserve a card - "authored, not yet run" is
  // information, and hiding them would quietly misrepresent the lab's coverage.
  for (const caseId of cases.keys()) if (!byCase.has(caseId)) byCase.set(caseId, []);

  const caseIds = [...byCase.keys()].sort();
  const cards = caseIds.map((id) => renderCard(id, cases.get(id), byCase.get(id))).join("");

  const engines = [...new Set(rows.map((r) => r.engine).filter((e) => e && e !== "-"))];
  const dates = [...new Set(rows.map((r) => r.date))].sort();
  const findings = rows.filter((r) => !/NO RELIABLE DIFFERENCE/i.test(r.verdict)).length;
  const hasAbsolutes = rows.some((r) => readAbsolutes(r.caseId, r.count));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gameface Perf Lab — results</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f6f7f9;
    --panel: #ffffff;
    --ink: #16181d;
    --muted: #6a7180;
    --line: #dfe3ea;
    --worse: #b4342a;
    --worse-bg: #fdecea;
    --better: #1d7a4d;
    --better-bg: #e8f6ee;
    --onesided: #7a4ab0;
    --onesided-bg: #f1eaf9;
    --accent: #2a5db0;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #101014;
      --panel: #17181d;
      --ink: #e8e8f0;
      --muted: #8d94a3;
      --line: #262832;
      --worse: #ff8a7a;
      --worse-bg: #2c1a18;
      --better: #6edba0;
      --better-bg: #14261d;
      --onesided: #c3a0ee;
      --onesided-bg: #221a2e;
      --accent: #7fa8ec;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 24px 64px;
    background: var(--bg); color: var(--ink);
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .wrap { max-width: 1500px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: var(--muted); margin: 0 0 20px; font-size: 13.5px; }
  .sub b { color: var(--ink); font-weight: 600; }

  .toolbar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center;
             padding: 12px 14px; margin-bottom: 22px; background: var(--panel);
             border: 1px solid var(--line); border-radius: 10px; }
  .toolbar label { display: inline-flex; gap: 7px; align-items: center; font-size: 13px; cursor: pointer; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--muted); }
  .legend span { white-space: nowrap; }
  .swatch { display: inline-block; width: 9px; height: 9px; border-radius: 2px; vertical-align: baseline; }

  .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(460px, 1fr)); align-items: start; }
  .unmeasured { padding: 10px 6px; font-size: 12px; color: var(--muted); }

  .card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 16px 16px 12px; }
  .card header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .card h2 { font-size: 14.5px; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: -0.01em; }
  .badges { display: flex; gap: 6px; flex-shrink: 0; }
  .badge { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
           padding: 2px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); }
  /* status-DIRECT and axis-none deliberately have no rule: the neutral base
     .badge is the right look for "nothing unusual" and "no finding to compare
     the hypothesis against". Only the notable states get colour. */
  .status-ADAPTED { color: var(--onesided); background: var(--onesided-bg); border-color: transparent; }
  .axis-hit { color: var(--better); background: var(--better-bg); border-color: transparent; }
  .axis-missed { color: var(--worse); background: var(--worse-bg); border-color: transparent; }
  .title { margin: 8px 0 2px; font-size: 13.5px; }
  .variable { margin: 0 0 12px; font-size: 12.5px; color: var(--muted); }
  .side { display: inline-block; min-width: 13px; font-weight: 700; color: var(--ink); font-size: 11px; }
  .vs { opacity: 0.6; margin: 0 3px; }

  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);
             font-weight: 600; text-align: right; padding: 0 6px 5px; border-bottom: 1px solid var(--line); }
  thead th:first-child, tbody th { text-align: left; }
  thead th:last-child { text-align: left; }
  tbody th { font-size: 12px; font-weight: 600; color: var(--muted); padding: 5px 6px; }
  .cell { text-align: right; padding: 5px 6px; font-size: 12.5px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .cell.worse { color: var(--worse); font-weight: 600; }
  .cell.better { color: var(--better); font-weight: 600; }
  .cell.weak { color: var(--muted); }
  .cell.absent { color: var(--muted); opacity: 0.5; }
  .cell.oneSided { color: var(--onesided); font-weight: 600; font-size: 11.5px; }
  .verdict { padding: 5px 6px; font-size: 11.5px; line-height: 1.35; }
  .other { margin-top: 2px; font-size: 11px; color: var(--onesided); }
  .other b { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 600; }
  .verdict.null { color: var(--muted); }
  .verdict.finding { color: var(--ink); }
  tbody tr + tr th, tbody tr + tr td { border-top: 1px solid var(--line); }

  /* Absolute-ms view. Both readings are rendered; the toggle picks one. */
  .asMs { display: none; }
  body.showMs .asRatio { display: none; }
  body.showMs .asMs { display: inline; }

  details { margin-top: 10px; border-top: 1px solid var(--line); padding-top: 8px; }
  summary { cursor: pointer; font-size: 12px; color: var(--accent); }
  .detailBlock { font-size: 12px; color: var(--muted); line-height: 1.55; margin: 8px 0 0; }
  .detailBlock b { color: var(--ink); }

  footer { margin-top: 28px; font-size: 12px; color: var(--muted); }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.94em; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Gameface Perf Lab</h1>
  <p class="sub">
    <b>${caseIds.length}</b> cases · <b>${rows.length}</b> measured (case, count) pairs ·
    <b>${findings}</b> findings, <b>${rows.length - findings}</b> no reliable difference ·
    cohtml ${escapeHtml(engines.join(", ") || "—")} ·
    1920×1080, vsync on ·
    ${escapeHtml(dates[0] ?? "")}${dates.length > 1 ? "–" + escapeHtml(dates[dates.length - 1]) : ""}
    ${supersededCount > 0 ? `· ${supersededCount} superseded row(s) hidden` : ""}
  </p>

  <div class="toolbar">
    ${hasAbsolutes ? `<label><input type="checkbox" id="msToggle"> Show absolute ms (A → B)</label>` : `<span class="legend"><span>absolute ms unavailable — <code>runs/</code> is gitignored</span></span>`}
    <div class="legend">
      <span><span class="swatch" style="background:var(--worse)"></span> B costs more</span>
      <span><span class="swatch" style="background:var(--better)"></span> B costs less</span>
      <span><span class="swatch" style="background:var(--onesided)"></span> phase runs in one variant only</span>
      <span>(parenthesised) = inside the guardrail, not a finding</span>
      <span>— = neither variant did this work</span>
    </div>
  </div>

  <div class="grid">${cards}
  </div>

  <footer>
    Generated by <code>tools/build-report.js</code> from <code>results.md</code> and each
    <code>cases/&lt;id&gt;/case.json</code>. Ratios are B/A of the steady-state median.
    A finding must clear both halves of the guardrail: signal &gt; run-to-run noise, and an
    effect outside 1.10×. Negative results mean “no measurable difference <em>on this machine</em>”.
    Do not edit this file — re-run <code>node tools/build-report.js</code>.
  </footer>
</div>
<script>
  var toggle = document.getElementById('msToggle');
  if (toggle) {
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('showMs', toggle.checked);
    });
  }
</script>
</body>
</html>
`;
}

/** Writes report.html and returns its path. Safe to call from run.js. */
export function buildReport({ quiet = false } = {}) {
  const page = buildPage();
  writeFileSync(REPORT_HTML, page);
  if (!quiet) console.log(`wrote report.html (${(page.length / 1024).toFixed(0)} KB)`);
  return REPORT_HTML;
}

// Only build on import when this file is the thing being run.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  buildReport();
}
