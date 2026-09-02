import path from 'node:path';
import type { ResolvedOptions, RasterizeRoute } from './config.js';
import { closePlayer, findFreePort, launchPlayer } from './capture/player.js';
import { PlayerSession } from './capture/session.js';
import { headInjector, serveDirectory, type StaticServer } from './capture/server.js';
import { stripGeneratedTags } from './audit.js';

export interface MeasureOptions {
    outDir: string;
    options: ResolvedOptions;
    /** Live/baked pairs to run. Each pair runs both variants, in alternating order. */
    repetitions?: number;
    /** Seconds of tracing per run. */
    traceSeconds?: number;
    log?: (message: string) => void;
}

export interface VariantResult {
    variant: 'live CSS' | 'baked';
    /** Median GPU time per frame across runs, in milliseconds. */
    gpuP50: number;
    /** Half the spread across runs, as +/-. */
    spread: number;
    paintP50: number;
    runs: number[];
    partial: number;
}

export interface MeasureOutcome {
    variants: VariantResult[];
    change: number | null;
    report: string;
}

/**
 * Measures what the bake actually costs the GPU, live against baked, in the Player.
 *
 * This exists because the obvious measurement returns nothing. The Player paces frames at a fixed
 * cap, so wall-clock frame time reads the same whether the page is a full HUD or empty, and anyone
 * who measures this plugin the natural way concludes it does nothing. The engine's own trace
 * events do reflect the work; `Coherent_GPU` is the per-frame GPU time, which is what a shadow
 * costs and a textured quad does not.
 *
 * Runs alternate which variant goes first, because a second-position advantage cannot otherwise be
 * excluded, and repeat, because absolute levels drift between runs while the gap holds.
 */
export async function measure(input: MeasureOptions): Promise<MeasureOutcome> {
    const { options, outDir } = input;
    const log = input.log ?? (() => {});
    const repetitions = input.repetitions ?? 3;
    const traceSeconds = input.traceSeconds ?? 4;

    const injectHead = headInjector(options.routes);
    let bakedServer: StaticServer | undefined;
    let liveServer: StaticServer | undefined;

    const samples: Record<string, { gpu: number[]; paint: number[]; partial: number }> = {
        'live CSS': { gpu: [], paint: [], partial: 0 },
        baked: { gpu: [], paint: [], partial: 0 },
    };

    try {
        bakedServer = await serveDirectory(outDir, { injectHead });
        liveServer = await serveDirectory(outDir, { injectHead, transformHtml: stripGeneratedTags });

        const route = options.routes[0];

        for (let round = 0; round < repetitions; round++) {
            // Alternate, so neither variant always benefits from whatever the first run warms up.
            const order: ('live CSS' | 'baked')[] = round % 2 === 0 ? ['live CSS', 'baked'] : ['baked', 'live CSS'];

            for (const variant of order) {
                const origin = variant === 'baked' ? bakedServer.origin : liveServer.origin;
                const run = await measureOnce(options, `${origin}/${route.path}`, route, traceSeconds);

                if (run) {
                    samples[variant].gpu.push(run.gpu);
                    samples[variant].paint.push(run.paint);
                    if (run.partial) samples[variant].partial++;
                    log(`${variant} run ${round + 1}: GPU p50 ${run.gpu.toFixed(3)} ms${run.partial ? ' (partial trace)' : ''}`);
                } else {
                    log(`${variant} run ${round + 1}: no trace data`);
                }
            }
        }
    } finally {
        if (bakedServer) await bakedServer.close();
        if (liveServer) await liveServer.close();
    }

    const variants: VariantResult[] = (['live CSS', 'baked'] as const).map((variant) => {
        const gpu = samples[variant].gpu;
        const paint = samples[variant].paint;
        return {
            variant,
            gpuP50: median(gpu),
            spread: gpu.length > 1 ? (Math.max(...gpu) - Math.min(...gpu)) / 2 : 0,
            paintP50: median(paint),
            runs: gpu,
            partial: samples[variant].partial,
        };
    });

    const [live, baked] = variants;
    const change = live.gpuP50 > 0 && baked.runs.length && live.runs.length ? (baked.gpuP50 - live.gpuP50) / live.gpuP50 : null;

    return { variants, change, report: format(variants, change, repetitions) };
}

interface Run {
    gpu: number;
    paint: number;
    partial: boolean;
}

async function measureOnce(
    options: ResolvedOptions,
    url: string,
    route: RasterizeRoute,
    traceSeconds: number
): Promise<Run | null> {
    const port = await findFreePort(options.port + 30);
    const player = await launchPlayer({
        executablePath: options.playerPath,
        port,
        url,
        width: options.viewport.width,
        height: options.viewport.height,
        headed: options.headed,
        cwd: path.resolve(options.cacheDir, 'player-measure'),
    });

    const session = await PlayerSession.connect(port);

    try {
        await session.goto(url, route.settleMs ?? 400);

        if (route.setup) {
            await session.evaluateRaw(`(async () => { ${route.setup} })()`);
            await session.settle(route.settleMs ?? 300);
        }

        await session.startTracing();

        // The content has to be genuinely re-rendered every frame or there is nothing to measure:
        // cohtml repaints dirty regions only, so a static page settles into presenting the same
        // frame. Nudging the whole document invalidates all of it, which is also what a real UI
        // does whenever a list scrolls or a panel slides.
        await session.evaluateRaw(`(function () {
            var stage = document.body || document.documentElement;
            var n = 0;
            window.__rzMeasureTick = function tick() {
                stage.style.transform = 'translateX(' + (n++ % 2) + 'px)';
                requestAnimationFrame(window.__rzMeasureTick);
            };
            window.__rzMeasureTick();
        })()`);

        await new Promise((resolve) => setTimeout(resolve, traceSeconds * 1000));

        const { events, complete } = await session.stopTracing(20000);
        const durations = collect(events);

        const gpu = durations.get('Coherent_GPU') ?? [];
        const paint = durations.get('Coherent_Paint') ?? [];
        if (!gpu.length && !paint.length) return null;

        return { gpu: median(gpu), paint: median(paint), partial: !complete };
    } finally {
        await session.close();
        await closePlayer(player);
        await new Promise((resolve) => setTimeout(resolve, 600));
    }
}

/** Pairs B/E trace events per (name, thread) and reads the duration off X events. */
function collect(events: any[]): Map<string, number[]> {
    const open = new Map<string, number[]>();
    const durations = new Map<string, number[]>();

    const push = (map: Map<string, number[]>, key: string, value: number) => {
        const list = map.get(key);
        if (list) list.push(value);
        else map.set(key, [value]);
    };

    for (const event of events) {
        const key = `${event.name}|${event.tid}`;
        if (event.ph === 'B') {
            push(open, key, event.ts);
        } else if (event.ph === 'E') {
            const stack = open.get(key);
            if (stack?.length) push(durations, event.name, (event.ts - stack.pop()!) / 1000);
        } else if (event.ph === 'X' && typeof event.dur === 'number') {
            push(durations, event.name, event.dur / 1000);
        }
    }

    return durations;
}

function median(values: number[]): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function format(variants: VariantResult[], change: number | null, repetitions: number): string {
    const [live, baked] = variants;
    const lines = ['', `rasterize measure - ${repetitions} alternating pairs`, ''];

    if (!live.runs.length || !baked.runs.length) {
        lines.push('  no trace data - the Player produced no Coherent_GPU events.', '');
        return lines.join('\n');
    }

    const spread = (v: VariantResult) => (v.spread ? ` +/- ${v.spread.toFixed(2)}` : '');

    lines.push(
        `  live CSS  GPU p50 ${live.gpuP50.toFixed(2)} ms${spread(live)}` +
            `    baked  GPU p50 ${baked.gpuP50.toFixed(2)} ms${spread(baked)}` +
            `   ${change === null ? '' : `${(change * 100).toFixed(1)}%`} (n=${live.runs.length + baked.runs.length})`
    );

    lines.push(
        `  ${' '.repeat(10)}Paint p50 ${live.paintP50.toFixed(3)} ms` +
            `${' '.repeat(6)}       Paint p50 ${baked.paintP50.toFixed(3)} ms`
    );

    // A gap smaller than the run-to-run spread is not a result, and saying so is cheaper than
    // having someone quote it back later.
    const gap = Math.abs(baked.gpuP50 - live.gpuP50);
    const noise = Math.max(live.spread, baked.spread);
    if (noise > 0 && gap < noise) {
        lines.push('', `  The gap (${gap.toFixed(2)} ms) is inside the run-to-run spread (${noise.toFixed(2)} ms).`);
        lines.push('  Run more repetitions before drawing a conclusion from it.');
    }

    const partial = live.partial + baked.partial;
    if (partial) {
        lines.push('', `  ${partial} run(s) returned a partial trace - the Player did not finish shipping it.`);
        lines.push('  Lower --trace-seconds if that happens on every run.');
    }

    lines.push('');
    return lines.join('\n');
}
