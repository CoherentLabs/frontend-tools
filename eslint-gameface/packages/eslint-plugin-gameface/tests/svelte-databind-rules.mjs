import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const modelsDir = "packages/eslint-plugin-gameface/tests/fixtures/gameface-models";

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/**/*.svelte"],
      languageOptions: {
        parser: svelteParser,
        parserOptions: {
          parser: { js: "espree" },
        },
      },
      plugins: { svelte: sveltePlugin, gameface },
      processor: sveltePlugin.processors.svelte,
      rules: {
        "gameface/svelte-databind-spelling": "error",
        "gameface/svelte-databind-model-properties": "error",
      },
      settings: {
        gameface: { modelsDir },
      },
    },
  ],
});

const spellingBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-spelling-bad.svelte",
);

const results = await eslint.lintFiles([spellingBad]);

function expectRule(fileSuffix, ruleId) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(fileSuffix));
  const ids = (hit?.messages || []).map((m) => m.ruleId);
  if (!ids.includes(ruleId)) {
    throw new Error(`expected ${ruleId} for ${fileSuffix}, got: ${ids.join(", ") || "(none)"}`);
  }
}

expectRule("databind-spelling-bad.svelte", "gameface/svelte-databind-spelling");

console.log("svelte-databind-rules: ok");
