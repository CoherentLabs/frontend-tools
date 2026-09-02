import path from 'node:path';
import { loadDotEnv, resolveOptions, type RasterizeOptions } from './config.js';
import { runPipeline } from './pipeline.js';
import { verify } from './verify.js';
import { measure } from './measure.js';

const HELP = `
gameface-rasterize - bake static CSS decorations into textures with the Gameface Player

Usage:
  gameface-rasterize bake [dist]        capture and write textures into a built output directory
  gameface-rasterize check [dist]       plan and report only - no captures, no files written
  gameface-rasterize check --url <url>  same, against a running dev server
  gameface-rasterize verify [dist]      render baked vs live in the Player and compare (SSIM)
  gameface-rasterize measure [dist]     measure GPU time per frame, live against baked
                                        (frame time cannot see this - the Player paces frames)

The plugin bakes on every "vite build"; these are for the things a build cannot do.
Set verify: true in the plugin options to run verification as part of the build instead.

Options:
  --player <path>       Gameface Player executable (default: $GAMEFACE_PATH)
  --route <path>        page to visit; repeatable (default: index.html)
  --scale <n>           bake scale (default: 2)
  --slice-impl <impl>   border-image | divs (default: border-image)
  --transcode <fmt>     webp, or omit for PNG only
  --budget <mb>         texture budget in megabytes (default: 32)
  --ssim <n>            verification threshold (default: 0.995)
  --out <dir>           asset directory inside the output (default: rz/)
  --report <dir>        where verification diffs are written (default: <dist>/rz/verify)
  --json <file>         write a machine-readable verify summary for CI
  --repetitions <n>     measure: alternating live/baked pairs to run (default 3)
  --trace-seconds <n>   measure: seconds of tracing per run (default 4)
  --no-audit            skip the post-build visual diff of the whole page
  --viewport <WxH>      bake viewport (default: 1920x1080, grown to fit)
  --headed              show the Player window
  --debug               dump every capture and its geometry into the cache directory
  --strict-transitions  make RZ002 an error
  --no-advisor          skip the unmarked-element advisory pass
  -h, --help            this message
`;

interface Args {
    command: string;
    dist: string;
    url?: string;
    report?: string;
    json?: string;
    repetitions?: number;
    traceSeconds?: number;
    options: RasterizeOptions;
}

function parse(argv: string[]): Args {
    const command = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'bake';
    const rest = argv.slice(command === argv[0] ? 1 : 0);

    const options: RasterizeOptions = {};
    const routes: string[] = [];
    let dist = 'dist';
    let url: string | undefined;
    let report: string | undefined;
    let json: string | undefined;
    let repetitions: number | undefined;
    let traceSeconds: number | undefined;
    let positional = 0;

    for (let i = 0; i < rest.length; i++) {
        const arg = rest[i];

        switch (arg) {
            case '--player':
                options.playerPath = rest[++i];
                break;
            case '--route':
                routes.push(rest[++i]);
                break;
            case '--scale':
                options.bakeScale = parseFloat(rest[++i]);
                break;
            case '--slice-impl':
                options.sliceImpl = rest[++i] as RasterizeOptions['sliceImpl'];
                break;
            case '--transcode':
                options.transcode = rest[++i] as RasterizeOptions['transcode'];
                break;
            case '--budget':
                options.textureBudgetMB = parseFloat(rest[++i]);
                break;
            case '--ssim':
                options.ssimThreshold = parseFloat(rest[++i]);
                break;
            case '--out': {
                const value = rest[++i];
                options.outDir = value.endsWith('/') ? value : `${value}/`;
                break;
            }
            case '--report':
                report = rest[++i];
                break;
            case '--json':
                json = rest[++i];
                break;
            case '--repetitions':
                repetitions = parseInt(rest[++i], 10);
                break;
            case '--trace-seconds':
                traceSeconds = parseFloat(rest[++i]);
                break;
            case '--no-audit':
                options.audit = false;
                break;
            case '--url':
                url = rest[++i];
                break;
            case '--viewport': {
                const [w, h] = rest[++i].split('x').map(Number);
                options.viewport = { width: w, height: h };
                break;
            }
            case '--headed':
                options.headed = true;
                break;
            case '--debug':
                options.debug = true;
                break;
            case '--strict-transitions':
                options.strictTransitions = true;
                break;
            case '--no-advisor':
                options.advisor = false;
                break;
            case '-h':
            case '--help':
                console.log(HELP);
                process.exit(0);
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`unknown option: ${arg}`);
                    console.log(HELP);
                    process.exit(1);
                }
                if (positional++ === 0) dist = arg;
                break;
        }
    }

    if (routes.length) options.routes = routes;
    return { command, dist, url, report, json, repetitions, traceSeconds, options };
}

async function main(): Promise<void> {
    const args = parse(process.argv.slice(2));
    const outDir = path.resolve(args.dist);

    let options;
    try {
        // Vite exposes .env on import.meta.env rather than process.env, so the files have to be
        // read directly here. A shell variable still wins.
        options = resolveOptions(args.options, { ...loadDotEnv(process.cwd()), ...process.env });
    } catch (error: any) {
        console.error(error.message);
        process.exit(1);
    }

    const log = (message: string) => console.log(`  ${message}`);

    switch (args.command) {
        case 'bake':
        case 'check': {
            const outcome = await runPipeline({
                outDir,
                options,
                externalUrl: args.url,
                dryRun: args.command === 'check',
                log,
            });

            console.log(outcome.report);
            process.exit(outcome.hadErrors ? 1 : 0);
            break;
        }

        case 'measure': {
            const outcome = await measure({
                outDir,
                options,
                repetitions: args.repetitions,
                traceSeconds: args.traceSeconds,
                log,
            });

            console.log(outcome.report);
            process.exit(outcome.variants.every((v) => v.runs.length) ? 0 : 1);
            break;
        }

        case 'verify': {
            const outcome = await verify({
                outDir,
                options,
                reportDir: args.report ? path.resolve(args.report) : path.join(outDir, options.outDir, 'verify'),
                jsonPath: args.json ? path.resolve(args.json) : undefined,
                log,
            });

            console.log(outcome.report);
            process.exit(outcome.failures.length ? 1 : 0);
            break;
        }

        default:
            console.error(`unknown command: ${args.command}`);
            console.log(HELP);
            process.exit(1);
    }
}

main().catch((error) => {
    console.error(error?.stack ?? error);
    process.exit(1);
});
