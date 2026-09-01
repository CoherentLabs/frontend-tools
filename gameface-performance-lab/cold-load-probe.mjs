/**
 * Throwaway probe: what does a COLD document load cost?
 *
 * Two questions, neither of which run.js can answer: PNG vs SVG, and one atlas
 * vs 16 separate files. It discards 2s of warmup before tracing, so the
 * one-off build is long gone by the time the window opens. Here the Player is
 * launched on a blank page, tracing is started, and only THEN does it navigate
 * to the case page - so the whole first load lands inside the trace. Each
 * variant gets a fresh Player process, so nothing is warm from a previous
 * document.
 *
 *   node cold-load-probe.mjs --player <path-to-Player.exe>
 *
 * A cold load is a one-off cost, so the PEAK frame is the measurement, not the
 * median that results.md reports. That is why this lives here and not in
 * results.md: the two numbers are not the same statistic and must not sit in
 * one table.
 *
 * MEASURED, 2026-09-01, cohtml 3.1.2.1, 1920x1080, 300 tiles, peak frame in ms:
 *
 *                      PNG        SVG
 *   complex  Paint     1.12     977.09      (893 / 937 / 977 over three runs)
 *            Record    0.81     891.71
 *            GPU       1.87     185.66
 *            Styles    4.33      12.89
 *   simple   Paint     2.02      92.04      (90 / 92 / 89 over three clean runs)
 *            Record    0.96       7.98
 *            GPU       0.36       7.66
 *            Styles    4.58       4.40
 *
 *                    ATLAS   16 FILES
 *   atlas    Paint    1.28       4.24      (3.58 -> 4.45 on a second run)
 *            Record   0.84       0.99
 *            GPU      0.56       0.62
 *            Styles   4.52       5.41
 *
 * So yes, SVGs are heavier at load, and by the same mechanism the churn cases
 * found: 300 complex SVG tiles cost a single frozen frame of ~0.95s against
 * ~1ms for the PNGs rasterised from them, and even the 4-shape sprite costs
 * ~90ms. Note the phase: at cold load the cost lands in Paint and
 * RecordRendering with Styles roughly flat, whereas under churn Styles
 * dominates. The rasterisation is the same work billed to a different phase
 * depending on whether elements are built in one batch before first paint or
 * re-resolved every frame; that reading is inference from where the time lands,
 * not something verified inside the engine.
 *
 * The atlas question answers differently: 16 texture uploads against 1 cost a
 * peak frame of ~4.2ms against ~1-3.6ms, and BOTH variants hold 194 frames with
 * neither hitching. One to three milliseconds, paid once. Set against the 977ms
 * frozen frame the complex SVG costs on the same 300 tiles, atlasing buys
 * nothing at load. See cases/spritesheet-vs-files-churn/case.json.
 *
 * LIMITS: 300 tiles only - the count curve was not measured. For the SVG pair,
 * one shared sprite URL, the most cache-friendly configuration. cohtml 3.1.2.1,
 * while results.md is otherwise 3.2.0.2.
 */

import { writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchPlayer, resolvePlayerPath, pathToFileURL } from "./player.js";
import { parseTrace, PHASE_COLUMNS } from "./parse.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TRACE_MS = 6000;

const playerFlag = process.argv.indexOf("--player");
const playerPath = resolvePlayerPath(playerFlag === -1 ? undefined : process.argv[playerFlag + 1]);

// A blank page to hold the Player still while tracing starts.
const scratch = mkdtempSync(join(tmpdir(), "coldload-"));
const blank = join(scratch, "blank.html");
writeFileSync(
  blank,
  `<!DOCTYPE html><html><head><style>html,body{margin:0;width:100%;height:100%;background:#101014}</style></head><body><div id="root"></div></body></html>`
);
const blankUrl = pathToFileURL(blank).href;

async function coldLoad(caseId, variant, count) {
  const pageUrl = pathToFileURL(join(process.cwd(), "cases", caseId, variant)).href + `?count=${count}`;
  const player = await launchPlayer(playerPath, blankUrl);

  try {
    const events = [];
    let complete = false;
    player.client.on("Tracing.dataCollected", (payload) => {
      const batch = payload.value;
      if (!batch) return;
      for (let i = 0; i < batch.length; i++) events.push(batch[i]);
    });
    player.client.on("Tracing.tracingComplete", () => {
      complete = true;
    });

    await player.client.send("Page.enable");
    await player.client.send("Tracing.start", { transferMode: "ReportEvents" });
    // Tracing is live BEFORE the document exists - this is the whole point.
    await player.client.send("Page.navigate", { url: pageUrl });
    await sleep(TRACE_MS);
    await player.client.send("Tracing.end");

    const deadline = Date.now() + 10000;
    while (!complete && Date.now() < deadline) await sleep(100);

    return parseTrace(events);
  } finally {
    await player.close();
  }
}

const COUNT = 300;
// Both entries must use STATIC pages: on a churning page the peak frame is a
// churn frame rather than the load, and the measurement means nothing. The
// simple sprite has no static case of its own, so the probe writes one next to
// that sprite (assets resolve relative to the page) and removes it afterwards.
const STATIC_A = join(process.cwd(), "cases", "png-vs-svg-static-complex", "A.html");
const temporaries = [];

function staticPagesFor(caseId) {
  const dir = join(process.cwd(), "cases", caseId);
  const a = join(dir, "cold-load-probe-A.html");
  const b = join(dir, "cold-load-probe-B.html");
  const source = readFileSync(STATIC_A, "utf8");
  writeFileSync(a, source);
  writeFileSync(b, source.replace("url('sprite.png')", "url('sprite.svg')"));
  temporaries.push(a, b);
  return ["cold-load-probe-A.html", "cold-load-probe-B.html"];
}

const targets = [
  ["png-vs-svg-static-complex", "svg complex", "A.html", "B.html", "png", "svg"],
  ["png-vs-svg-churn-simple", "svg simple", ...staticPagesFor("png-vs-svg-churn-simple"), "png", "svg"],
  // many-images-vs-spritesheet's own pages are already static, so the atlas-vs-
  // loose-files pair needs no generated stand-in. A here is the atlas, B is 16
  // separate files: 1 texture upload against 16 on a cold document.
  ["many-images-vs-spritesheet", "atlas vs 16 files", "A.html", "B.html", "atlas", "16 files"],
];

for (const [caseId, label, aFile, bFile, aLabel, bLabel] of targets) {
  const a = await coldLoad(caseId, aFile, COUNT);
  const b = await coldLoad(caseId, bFile, COUNT);

  console.log(`\n${label}, ${COUNT} tiles, cold load (peak frame in ms)`);
  console.log(`         ${`A (${aLabel})`.padStart(10)} ${`B (${bLabel})`.padStart(10)}    ratio`);
  for (const { column, event } of PHASE_COLUMNS) {
    const pa = a.phases[event];
    const pb = b.phases[event];
    if (!pa && !pb) continue;
    const ma = pa ? pa.max : 0;
    const mb = pb ? pb.max : 0;
    const ratio = ma > 0 ? (mb / ma).toFixed(2) + "x" : "--";
    console.log(`  ${column.padEnd(8)} ${ma.toFixed(2).padStart(8)}   ${mb.toFixed(2).padStart(8)}   ${ratio.padStart(8)}`);
  }
  const ra = a.phases["Coherent_RecordRendering"];
  const rb = b.phases["Coherent_RecordRendering"];
  if (ra || rb) {
    const ma = ra ? ra.max : 0;
    const mb = rb ? rb.max : 0;
    console.log(`  ${"Record".padEnd(8)} ${ma.toFixed(2).padStart(8)}   ${mb.toFixed(2).padStart(8)}   ${(ma > 0 ? (mb / ma).toFixed(2) + "x" : "--").padStart(8)}`);
  }
  console.log(`  frames: A ${a.frameCount}, B ${b.frameCount}`);
}

for (const file of temporaries) rmSync(file, { force: true });
