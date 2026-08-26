/**
 * Launching the Gameface Player and talking CDP to it.
 *
 * Two Gameface-specific quirks are handled here, both found the hard way:
 *
 *   1. The Player's CDP HTTP endpoint echoes the request path back into
 *      `webSocketDebuggerUrl`, so /json/list reports
 *      "ws://host:port/json/list/devtools/page/0" instead of
 *      ".../devtools/page/0". chrome-remote-interface trusts that field
 *      verbatim, so we resolve the target ourselves and hand it a relative
 *      path instead.
 *
 *   2. The Player serves no /json/protocol. chrome-remote-interface fetches
 *      that on connect unless `local: true` is passed, so without it every
 *      connection fails with "Unexpected end of JSON input".
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import CDP from "chrome-remote-interface";

// Every case is measured at this resolution, and it is recorded alongside the
// results. Phase durations depend on how many pixels there are to fill, so a
// row measured at another size is not comparable to these.
export const VIEWPORT = { width: 1920, height: 1080 };

// Left on. Config.toml warns that disabling vsync lets the Player run at
// thousands of fps, and the lab does not need it: a cap changes how often
// frames run, not how long the work inside one takes.
export const VSYNC = true;

const DEBUG_PORT = 9477;
const GAMEFACE_MCP_CONFIG = join(homedir(), ".gameface-mcp", "config.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Resolves the Player executable: an explicit --player wins, otherwise we
 * borrow the path from the machine-local gameface-mcp config, which is where
 * this path already lives on a Gameface developer's machine.
 */
export function resolvePlayerPath(explicit) {
  if (explicit) {
    if (!existsSync(explicit)) throw new Error(`No Player executable at ${explicit}`);
    return explicit;
  }

  if (existsSync(GAMEFACE_MCP_CONFIG)) {
    try {
      const { browserExecutable } = JSON.parse(readFileSync(GAMEFACE_MCP_CONFIG, "utf8"));
      if (browserExecutable && existsSync(browserExecutable)) return browserExecutable;
    } catch {
      // Malformed config is not fatal - fall through to the error below,
      // which tells the user exactly what to do about it.
    }
  }

  throw new Error(
    `Could not find the Gameface Player.\n` +
      `Pass --player <path-to-Player.exe>, or set "browserExecutable" in ${GAMEFACE_MCP_CONFIG}.`
  );
}

async function waitForDebugPort(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      // Expected while the Player is still starting.
    }
    await sleep(150);
  }
  throw new Error(`Player debug port ${port} never became ready`);
}

/**
 * Boots a Player on `pageUrl` and returns a connected CDP client plus the
 * environment we actually got (as opposed to the one we asked for).
 */
export async function launchPlayer(playerPath, pageUrl, { port = DEBUG_PORT } = {}) {
  const args = [
    `--remote-debugging-port=${port}`,
    "--no-console",
    // Without this the Player wraps the page in its ImGui shell, which eats
    // the window: a 1920x1080 window yields a 1474x622 page surface. With it,
    // the page gets the whole window and the pinned viewport is honoured.
    "--enable-gui=false",
    `--width=${VIEWPORT.width}`,
    `--height=${VIEWPORT.height}`,
    `--vsync=${VSYNC}`,
    `--url=${pageUrl}`,
  ];

  const proc = spawn(playerPath, args, { stdio: ["ignore", "ignore", "ignore"] });
  const spawnFailure = new Promise((_, reject) => {
    proc.once("error", (err) => reject(new Error(`Failed to spawn the Player: ${err.message}`)));
  });

  let client;
  try {
    const version = await Promise.race([waitForDebugPort(port), spawnFailure]);

    const targets = await (await fetch(`http://localhost:${port}/json/list`)).json();
    const target = targets.find((t) => t.type === "page") ?? targets[0];
    if (!target) throw new Error("The Player exposed no CDP target");

    client = await CDP({ host: "localhost", port, target: `/devtools/page/${target.id}`, local: true });

    const cohtmlVersion = /cohtml\/([\d.]+)/i.exec(version["User-Agent"] ?? "")?.[1] ?? "unknown";

    return {
      client,
      cohtmlVersion,
      async viewport() {
        const res = await client.send("Runtime.evaluate", {
          expression: "({ width: window.innerWidth, height: window.innerHeight })",
          returnByValue: true,
        });
        return res.result?.value ?? { width: 0, height: 0 };
      },
      async close() {
        try {
          await client.close();
        } catch {
          // The socket dies with the process; nothing useful to do here.
        }
        proc.kill();
        // The debug port stays bound for a moment after the process dies, and
        // the runner immediately launches the next variant on the same port.
        await sleep(1200);
      },
    };
  } catch (err) {
    try {
      await client?.close();
    } catch {
      // ignore
    }
    proc.kill();
    await sleep(500);
    throw err;
  }
}

/**
 * Drives the mouse along a fixed path so cases about pointer-driven work
 * (:hover rules, move handlers) have something to react to.
 *
 * The Input domain is not listed by Schema.getDomains, but it works - verified
 * by dispatching a move and watching a :hover rule take effect and a mouseover
 * handler fire. Same situation as Tracing, which is also unlisted and works.
 *
 * The path is a fixed sequence with no randomness and no wall-clock input, so
 * both variants of a case receive exactly the same pointer motion.
 */
function startPointerSweep(client, viewport) {
  let step = 0;
  const timer = setInterval(() => {
    step++;
    // Coprime strides walk the pointer over the whole grid without repeating a
    // short cycle, and stay deterministic across runs.
    const x = 16 + ((step * 137) % Math.max(1, viewport.width - 32));
    const y = 16 + ((step * 89) % Math.max(1, viewport.height - 32));
    client
      .send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", clickCount: 0 })
      .catch(() => {
        // A dropped move is not worth failing a run over; the sweep is a
        // stimulus, not the measurement.
      });
  }, 16);

  return () => clearInterval(timer);
}

/**
 * Discards `warmupMs` of startup, then records `traceMs` of the Coherent_*
 * phase events and returns them as raw trace events.
 *
 * `pointerSweep` starts the mouse moving before the warmup, so hover state has
 * settled into its steady rhythm by the time the trace window opens.
 */
export async function traceFrames(client, { warmupMs, traceMs, pointerSweep = false, viewport = VIEWPORT }) {
  const stopSweep = pointerSweep ? startPointerSweep(client, viewport) : null;
  try {
    return await traceWindow(client, { warmupMs, traceMs });
  } finally {
    stopSweep?.();
  }
}

async function traceWindow(client, { warmupMs, traceMs }) {
  await sleep(warmupMs);

  const events = [];
  // Appended one at a time rather than with push(...batch): spreading passes
  // every element as a function argument, and a heavy case (rebuilding 300
  // nodes per frame) sends batches big enough to blow the call stack.
  const onData = (payload) => {
    const batch = payload.value;
    if (!batch) return;
    for (let i = 0; i < batch.length; i++) events.push(batch[i]);
  };
  client.on("Tracing.dataCollected", onData);

  let complete = false;
  const onComplete = () => {
    complete = true;
  };
  client.on("Tracing.tracingComplete", onComplete);

  await client.send("Tracing.start", { transferMode: "ReportEvents" });
  await sleep(traceMs);
  await client.send("Tracing.end");

  // Events arrive in batches after Tracing.end; wait for the terminator rather
  // than guessing how long the flush takes.
  const deadline = Date.now() + 10000;
  while (!complete && Date.now() < deadline) await sleep(100);
  if (!complete) throw new Error("The Player never reported tracingComplete");

  return events;
}

export { pathToFileURL };
