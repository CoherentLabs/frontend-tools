// See gameface-e2e-config.js for why this needs an explicit path.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

/** @type {import('gameface-e2e').GamefaceE2EConfig & { dtsPath?: string, logPath?: string, outputDir?: string }} */
module.exports = {
    /** Path to the Gameface Player executable. Override with GAMEFACE_PATH. */
    gamefacePath: process.env.GAMEFACE_PATH || "G:\\gameface-0.0.0.0\\Cohtml-3.1.2.1-Pro-WinDesktop-Fragment\\Player\\Player.exe",

    /** Selector probe spec — runs FIRST so it gets a clean warning budget. */
    tests: "dist/runner/probe-selectors.spec.js",

    specTimeout: 120000,

    dtsPath: "./src/cohtml.lib.dom.d.ts",
    logPath: "./CohtmlApplication.log",
    outputDir: "",
};
