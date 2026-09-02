import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** A page to visit during the capture pass, plus optional JS to run before introspecting it. */
export interface RasterizeRoute {
    /** Path relative to the built output, e.g. "index.html" or "index.html#/settings". */
    path: string;
    /**
     * JavaScript evaluated in the page before introspection - use it to open the menu,
     * mount the modal or switch to the tab that contains the marked elements. May return
     * a promise; the pipeline awaits it.
     */
    setup?: string;
    /**
     * JavaScript injected into the served HTML *before* the page's own scripts run.
     *
     * `setup` runs after the page has loaded, which is too late for anything decided at module
     * initialisation - a HUD that randomises its starting state on import has already done so by
     * then, and no two renders of it will ever match. Seed it from here instead, so the capture
     * and both audit renders see the same page:
     *
     *     preload: 'Math.random = () => 0.5;'
     */
    preload?: string;
    /** Extra settle time in ms after `setup` resolves. */
    settleMs?: number;
}

export interface RasterizeOptions {
    /**
     * Path to the Gameface Player executable. Falls back to the GAMEFACE_PATH
     * environment variable (which Vite loads from .env for you).
     */
    playerPath?: string;
    /** Pages to visit during capture. Defaults to the build's HTML entry points. */
    routes?: (string | RasterizeRoute)[];
    /** Supersampling factor for bakes. Per-element override via data-rasterize-scale. */
    bakeScale?: number;
    /** Emit a WebP companion next to each PNG. Note: WebP saves disk, not VRAM. */
    transcode?: 'webp' | false;
    /** VRAM budget in megabytes; exceeding it emits RZ006 with the top offenders. */
    textureBudgetMB?: number;
    /** Promote RZ002 (transition on a baked property) from warning to error. */
    strictTransitions?: boolean;
    /** SSIM floor for verification. */
    ssimThreshold?: number;
    /**
     * Run verification as part of the build, on the output the bake just produced, and fail the
     * build on a real difference. Off by default: it launches the Player again and is a gate, so
     * it belongs in CI rather than in every local build.
     */
    verify?: boolean;
    /**
     * Render the finished build against the same build with the bake stripped out, and write the
     * pair plus their difference to `<outDir>/report/`. Two extra page loads per route.
     */
    audit?: boolean;
    /** Share of differing pixels above which the audit reports RZ023. Default 0.5%. */
    diffThreshold?: number;
    /** How 9-slices are drawn. cohtml 3.2 renders border-image correctly; "divs" is the escape hatch. */
    sliceImpl?: 'border-image' | 'divs';
    /** Run the advisory pass that lists unmarked elements using expensive properties. */
    advisor?: boolean;
    /** Asset output directory, relative to the build output directory. */
    outDir?: string;
    /** Where bake results are cached between builds. */
    cacheDir?: string;
    /** Debug port for the Player's CDP endpoint. */
    port?: number;
    /**
     * Viewport used for baking. The capture clip must intersect the viewport (the Player
     * supports neither captureBeyondViewport nor the Emulation domain), so this caps the
     * largest single asset. It is grown automatically to fit the largest planned bake.
     */
    viewport?: { width: number; height: number };
    /** Upper bound the automatic viewport growth will not exceed. */
    maxViewport?: { width: number; height: number };
    /**
     * The dev-mode overlay. `true` draws it immediately, `false` disables it, and the default
     * injects it hidden behind the toggle key. It costs nothing until you press that key.
     */
    overlay?: boolean;
    /** Key that shows and hides the dev overlay. Default F9. */
    overlayKey?: string;
    /** Keep the Player window visible during the bake, for debugging. */
    headed?: boolean;
    /** Keep intermediate captures and harness state in the cache directory. */
    debug?: boolean;
}

export interface ResolvedOptions extends Required<Omit<RasterizeOptions, 'playerPath' | 'routes'>> {
    playerPath: string;
    routes: RasterizeRoute[];
}

export const DEFAULTS = {
    bakeScale: 2,
    transcode: false as const,
    textureBudgetMB: 32,
    strictTransitions: false,
    ssimThreshold: 0.995,
    verify: false,
    audit: true,
    diffThreshold: 0.005,
    sliceImpl: 'border-image' as const,
    advisor: true,
    outDir: 'rz/',
    cacheDir: 'node_modules/.cache/rasterize',
    port: 9444,
    viewport: { width: 1920, height: 1080 },
    maxViewport: { width: 4096, height: 4096 },
    overlay: undefined as boolean | undefined,
    overlayKey: 'F9',
    headed: false,
    debug: false,
};

/**
 * Reads .env files the way Vite orders them, for callers that have no Vite config to lean on.
 *
 * Vite never copies .env into `process.env` - it exposes the values on `import.meta.env`, filtered
 * by `envPrefix`. A plugin reading `process.env` therefore never sees GAMEFACE_PATH, which is what
 * the setup instructions have been telling people to set.
 */
export function loadDotEnv(dir: string, mode = 'production'): Record<string, string> {
    const out: Record<string, string> = {};

    // Later files win, matching Vite's own precedence.
    for (const name of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
        let contents: string;
        try {
            contents = readFileSync(path.join(dir, name), 'utf8');
        } catch {
            continue;
        }

        for (const line of contents.split(/\r?\n/)) {
            const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/);
            if (!match || line.trimStart().startsWith('#')) continue;

            let value = match[2].trim();
            const quoted = value.match(/^(['"`])([\s\S]*)\1$/);
            if (quoted) value = quoted[2];
            else value = value.replace(/\s+#.*$/, '').trim();

            out[match[1]] = value;
        }
    }

    return out;
}

/**
 * Resolves the Player executable: explicit option first, then GAMEFACE_PATH from whatever
 * environment the caller assembled. Callers are responsible for folding .env in - the plugin does
 * it with Vite's own `loadEnv`, the CLI with `loadDotEnv` above.
 */
export function resolvePlayerPath(explicit: string | undefined, env: Record<string, string | undefined>): string {
    const candidate = explicit || env.GAMEFACE_PATH || process.env.GAMEFACE_PATH;

    if (!candidate) {
        throw new Error(
            'vite-gameface-rasterize: no Gameface Player found.\n' +
                '  Set GAMEFACE_PATH in your shell or in .env next to vite.config, or pass playerPath:\n' +
                "    rasterize({ playerPath: 'D:/gameface/Player/Player.exe' })\n" +
                '  Note that Vite does not put .env values into process.env - it exposes them on\n' +
                '  import.meta.env - so the plugin reads them with loadEnv and the CLI reads the\n' +
                '  .env files next to its working directory.'
        );
    }

    const resolved = path.resolve(candidate);
    if (!existsSync(resolved)) {
        throw new Error(`vite-gameface-rasterize: Gameface Player not found at "${resolved}".`);
    }

    return resolved;
}

export function resolveOptions(options: RasterizeOptions, env: Record<string, string | undefined>): ResolvedOptions {
    const routes = (options.routes ?? ['index.html']).map((r) => (typeof r === 'string' ? { path: r } : r));

    return {
        ...DEFAULTS,
        ...stripUndefined(options),
        playerPath: resolvePlayerPath(options.playerPath, env),
        routes,
        viewport: options.viewport ?? DEFAULTS.viewport,
        maxViewport: options.maxViewport ?? DEFAULTS.maxViewport,
    } as ResolvedOptions;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}
