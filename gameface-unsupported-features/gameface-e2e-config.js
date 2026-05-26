/** @type {import('gameface-e2e').GamefaceE2EConfig & { dtsPath?: string, logPath?: string, outputDir?: string }} */
module.exports = {
    /**
     * Path to the Gameface Player executable.
     * Example: "C:/Gameface/Player/Player.exe"
     */
    gamefacePath: "D:\\gameface-packages\\Cohtml-3.1.0.25-Pro-WinDesktop-Fragment\\Player\\Player.exe",

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
