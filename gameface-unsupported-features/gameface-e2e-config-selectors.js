/** @type {import('gameface-e2e').GamefaceE2EConfig & { dtsPath?: string, logPath?: string, outputDir?: string }} */
module.exports = {
    /** Path to the Gameface Player executable. */
    gamefacePath: "D:\\gameface-packages\\Cohtml-3.1.0.25-Pro-WinDesktop-Fragment\\Player\\Player.exe",

    /** Selector probe spec — runs FIRST so it gets a clean warning budget. */
    tests: "dist/runner/probe-selectors.spec.js",

    specTimeout: 120000,

    dtsPath: "./src/cohtml.lib.dom.d.ts",
    logPath: "./CohtmlApplication.log",
    outputDir: "",
};
