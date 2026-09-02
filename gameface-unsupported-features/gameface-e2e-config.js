// Loads GAMEFACE_PATH (and anything else) from the repo-root .env file.
// dotenv.config() defaults to reading .env from process.cwd(), which is this
// package's own directory when gameface-e2e runs from here — not the repo
// root where .env actually lives — so the path must be given explicitly.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

/** @type {import('gameface-e2e').GamefaceE2EConfig & { dtsPath?: string, logPath?: string, outputDir?: string }} */
module.exports = {
    /**
     * Path to the Gameface Player executable.
     * Override with the GAMEFACE_PATH environment variable (or pass
     * --gamefacePath=<path> directly to gameface-e2e — see also
     * scripts/scrape-and-update-eslint-plugin.js's --player-path flag), instead
     * of editing this file every time you switch engine versions.
     * Example: "C:/Gameface/Player/Player.exe"
     */
    gamefacePath: process.env.GAMEFACE_PATH || "G:\\gameface-0.0.0.0\\Cohtml-3.1.2.1-Pro-WinDesktop-Fragment\\Player\\Player.exe",

    /**
     * Main probe spec (CSS properties, JS, HTML).
     * Selectors run via gameface-e2e-config-selectors.js (first).
     * Functions run via gameface-e2e-config-functions.js (last).
     */
    tests: "dist/runner/probe-runner.spec.js",

    /**
     * Spec timeout in milliseconds.
     * The CSS property probe iterates many properties, so allow extra time.
     */
    specTimeout: 120000,

    /**
     * Path to the Gameface .d.ts file generated from C++ source.
     * Example: "C:/Gameface/SDK/cohtml.d.ts"
     * Leave empty to skip static JS analysis.
     */
    dtsPath: "./src/cohtml.lib.dom.d.ts",

    /**
     * Path to CohtmlApplication.log written by the Gameface Player.
     * Defaults to the same directory as the Player executable when left empty.
     */
    logPath: "./CohtmlApplication.log",

    /**
     * Directory where supported.json, partial.json, unsupported.json are written.
     * Defaults to ./results/ relative to this config file.
     */
    outputDir: "",
};
