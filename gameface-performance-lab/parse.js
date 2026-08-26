/**
 * Turns a raw Gameface CDP trace into per-frame phase durations.
 *
 * What the trace actually looks like (Cohtml 3.2.0.2, verified):
 *
 *   - Every phase is a `Coherent_*` begin/end pair (ph "B" / ph "E"). There
 *     are no "X" complete events, so durations must be paired by hand.
 *   - Work is spread over five threads and two processes: Main Thread, a
 *     styling worker pool whose tid *changes between frames*, a Layout
 *     thread, a Rendering thread, and a GPU thread in a separate process.
 *     Pairing is therefore keyed on (pid, tid, name), never name alone.
 *   - Most "E" events carry `args.frameId`, which is what lets a phase be
 *     attributed to a frame rather than to a point in time. That matters
 *     because the pipeline is deep: frame N's Paint runs well after frame N's
 *     Advance has finished, so bucketing by timestamp would mis-assign it.
 *   - A phase that has nothing to do emits no events at all. A page that
 *     never dirties layout produces zero `Coherent_Layout` events, not
 *     zero-duration ones. Absent is therefore reported as absent, not as 0.
 */

/**
 * The phases printed in the per-case table and in results.md.
 *
 * Script is the JS-thread cost: Gameface runs rAF callbacks, timers and event
 * handlers inside Coherent_ExecuteTimers, on the main thread. Without it the
 * whole class of "the script is the problem" patterns - long tasks, per-frame
 * allocation, unthrottled handlers, cssText rewrites - would measure as no
 * difference on every rendering phase and be reported as harmless.
 */
export const PHASE_COLUMNS = [
  { column: "GPU", event: "Coherent_GPU" },
  { column: "Paint", event: "Coherent_Paint" },
  { column: "Layout", event: "Coherent_Layout" },
  { column: "Styles", event: "Coherent_Styling" },
  { column: "Script", event: "Coherent_ExecuteTimers" },
];

/** The main-thread frame envelope, recorded for sanity checks but not printed. */
export const FRAME_EVENT = "Coherent_Advance";

export function median(values) {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Pairs begin/end events into durations in milliseconds.
 * Unmatched events - a phase already open when tracing started, or still open
 * when it stopped - are dropped rather than guessed at.
 */
function pairDurations(events) {
  const open = new Map();
  const pairs = [];

  for (const event of events) {
    if (event.ph !== "B" && event.ph !== "E") continue;
    if (!event.name.startsWith("Coherent_")) continue;

    const key = `${event.pid}:${event.tid}:${event.name}`;

    if (event.ph === "B") {
      if (!open.has(key)) open.set(key, []);
      open.get(key).push(event.ts);
      continue;
    }

    const start = open.get(key)?.pop();
    if (start === undefined) continue;

    pairs.push({
      name: event.name,
      // Trace timestamps are microseconds.
      durationMs: (event.ts - start) / 1000,
      frameId: event.args?.frameId,
    });
  }

  return pairs;
}

/**
 * Collapses one phase's pairs into per-frame samples.
 *
 * When the phase reports a frameId, occurrences sharing a frame are summed, so
 * a phase that runs twice in one frame is charged its full per-frame cost.
 * When it doesn't (Coherent_Layout is the notable one), each occurrence is its
 * own sample and `perFrame` exposes whether that assumption held.
 */
function summarisePhase(pairs, frameCount) {
  const withFrameId = pairs.filter((p) => p.frameId !== undefined);
  const keyedByFrame = withFrameId.length >= pairs.length * 0.9;

  let samples;
  if (keyedByFrame) {
    const perFrame = new Map();
    for (const pair of withFrameId) {
      perFrame.set(pair.frameId, (perFrame.get(pair.frameId) ?? 0) + pair.durationMs);
    }
    samples = [...perFrame.values()];
  } else {
    samples = pairs.map((p) => p.durationMs);
  }

  return {
    median: median(samples),
    min: Math.min(...samples),
    max: Math.max(...samples),
    occurrences: pairs.length,
    samples: samples.length,
    perFrame: frameCount > 0 ? pairs.length / frameCount : NaN,
    keyedByFrame,
  };
}

/**
 * @param {object[]} events raw trace events from Tracing.dataCollected
 * @returns per-phase medians for every Coherent_* phase present in the trace
 */
export function parseTrace(events) {
  const pairs = pairDurations(events);

  const byName = new Map();
  for (const pair of pairs) {
    if (!byName.has(pair.name)) byName.set(pair.name, []);
    byName.get(pair.name).push(pair);
  }

  const framePairs = byName.get(FRAME_EVENT) ?? [];
  const frameIds = new Set(framePairs.map((p) => p.frameId).filter((id) => id !== undefined));
  const frameCount = frameIds.size || framePairs.length;

  // Observed frame interval, from the main-thread frame envelope. This is what
  // the Player's cap actually produced, recorded so a row can be read back
  // knowing the conditions it was measured under.
  const frameStarts = events
    .filter((e) => e.name === FRAME_EVENT && e.ph === "B")
    .map((e) => e.ts)
    .sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < frameStarts.length; i++) intervals.push((frameStarts[i] - frameStarts[i - 1]) / 1000);

  const phases = {};
  for (const [name, namePairs] of byName) {
    phases[name] = summarisePhase(namePairs, frameCount);
  }

  return {
    frameCount,
    frameIntervalMs: median(intervals),
    eventCount: events.length,
    phases,
  };
}

/**
 * The median of a phase across a trace, or null when the phase never ran.
 * Null and zero mean different things here and must not be conflated: null is
 * "the engine did no work of this kind", zero would be "it did, immeasurably
 * fast".
 */
export function phaseMedian(parsed, eventName) {
  const phase = parsed.phases[eventName];
  return phase ? phase.median : null;
}
