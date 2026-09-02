import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import { ATTR } from './contract.js';
import { DEFAULTS, resolveOptions, type RasterizeOptions } from './config.js';
import { runPipeline } from './pipeline.js';
import { verify } from './verify.js';
import { rzOverlay, type OverlayConfig } from './browser/overlay.js';

export type { RasterizeOptions, RasterizeRoute } from './config.js';
export type { RasterizeManifest, AssetEntry, LivePart } from './contract.js';
export { ATTR, CONTRACT_VERSION } from './contract.js';

/**
 * Bakes static CSS decorations into textures using the Gameface Player.
 *
 * On build the plugin serves the emitted output, loads it in the Player, reads each marked
 * element's real computed decoration and geometry out of the engine, captures it in place, and
 * writes the textures plus a stylesheet and a small runtime back into the output. It then renders
 * the finished build against the same build with the bake stripped out, and writes the pair and
 * their difference to `rz/report/`.
 *
 * In dev it changes nothing about how the page renders - you write normal CSS and see normal CSS -
 * but it does inject an overlay that shows what the build would decide about every marked element,
 * so the question "will this share a texture" does not cost a two-minute production build.
 */
export default function rasterize(options: RasterizeOptions = {}): Plugin {
    let config: ResolvedConfig;
    let buildFailed = false;

    return {
        name: 'gameface-rasterize',

        configResolved(resolved) {
            config = resolved;
        },

        buildStart() {
            buildFailed = false;
        },

        buildEnd(error) {
            // closeBundle runs whether or not the build succeeded. Baking after a failure spends
            // a minute and a half capturing whatever dist happened to contain and then reports
            // confidently on a page that no longer exists.
            if (error) buildFailed = true;
        },

        transformIndexHtml: {
            order: 'post',
            handler(html) {
                if (config.command !== 'serve' || options.overlay === false) return html;

                const overlayConfig: OverlayConfig = {
                    attrs: {
                        mark: ATTR.mark,
                        mode: ATTR.mode,
                        states: ATTR.states,
                        id: ATTR.id,
                        scale: ATTR.scale,
                        live: ATTR.live,
                    },
                    bakeScale: options.bakeScale ?? DEFAULTS.bakeScale,
                    toggleKey: options.overlayKey ?? 'F9',
                    startVisible: options.overlay === true,
                };

                return {
                    html,
                    tags: [
                        {
                            tag: 'script',
                            injectTo: 'body',
                            children: `;(${rzOverlay.toString()})(${JSON.stringify(overlayConfig)});`,
                        },
                    ],
                };
            },
        },

        configureServer(server) {
            server.httpServer?.once('listening', () => {
                const key = options.overlayKey ?? 'F9';
                config.logger.info(
                    `  gameface-rasterize: dev renders live CSS. Press ${key} for what the build would decide, ` +
                        'or run "rasterize check --url <dev url>" for the full report.'
                );
            });
        },

        async closeBundle() {
            if (config.command !== 'build') return;
            // A library or SSR build has no HTML to attach textures to.
            if (config.build.ssr || config.build.lib) return;

            if (buildFailed) {
                config.logger.warn('  gameface-rasterize: skipping the bake - the build failed');
                return;
            }

            // The third argument disables the VITE_ prefix filter; without it GAMEFACE_PATH is
            // dropped. process.env goes last so a real shell variable still wins, which is what
            // CI provides.
            const dotenv = loadEnv(config.mode, config.envDir ?? config.root, '');
            const resolved = resolveOptions(options, { ...dotenv, ...process.env });
            const outDir = path.resolve(config.root, config.build.outDir);

            // A build can also "succeed" without leaving the page behind - an emptied outDir, a
            // route that was renamed. Capturing that produces a report about nothing.
            const missing = resolved.routes
                .map((route) => route.path.split(/[?#]/)[0])
                .filter((file) => !existsSync(path.join(outDir, file)));

            if (missing.length) {
                config.logger.warn(
                    `  gameface-rasterize: skipping the bake - the build did not produce ${missing.join(', ')}`
                );
                return;
            }

            const outcome = await runPipeline({
                outDir,
                options: resolved,
                log: (message) => config.logger.info(`  gameface-rasterize: ${message}`),
            });

            config.logger.info(outcome.report);

            if (outcome.hadErrors) {
                const codes = [...new Set(outcome.bag.errors.map((d) => d.code))].join(', ');
                this.error(`gameface-rasterize: the bake reported errors (${codes}). See the summary above.`);
            }

            // Verification as part of the build, for CI. Deliberately after the error check:
            // there is nothing coherent to verify about a bake that already failed.
            if (resolved.verify && outcome.assetCount) {
                const verification = await verify({
                    outDir,
                    options: resolved,
                    reportDir: path.join(outDir, resolved.outDir, 'verify'),
                    jsonPath: path.join(outDir, resolved.outDir, 'verify.json'),
                    log: (message) => config.logger.info(`  gameface-rasterize: ${message}`),
                });

                config.logger.info(verification.report);

                if (verification.failures.length) {
                    this.error(
                        `gameface-rasterize: ${verification.failures.length} baked asset(s) do not match their live CSS. ` +
                            'See the diffs listed above.'
                    );
                }
            }
        },
    };
}
