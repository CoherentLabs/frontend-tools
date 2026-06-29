import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/svelte-embedded-style-bad.svelte"],
      languageOptions: {
        parser: svelteParser,
        parserOptions: {
          parser: { js: "espree" },
        },
      },
      plugins: { svelte: sveltePlugin, gameface },
      processor: sveltePlugin.processors.svelte,
      rules: {
        "gameface/svelte-sfc-css-svg-keyframes-sizing-units": "error",
      },
    },
  ],
});

const file = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/svelte-embedded-style-bad.svelte",
);
const results = await eslint.lintFiles([file]);
const ids = (results[0]?.messages || []).map((m) => m.ruleId);

if (!ids.includes("gameface/svelte-sfc-css-svg-keyframes-sizing-units")) {
  throw new Error(`expected svelte-sfc style rule, got: ${ids.join(", ") || "(none)"}`);
}

console.log("svelte-embedded-style: ok");
