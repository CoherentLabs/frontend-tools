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
      files: ["packages/eslint-plugin-gameface/tests/fixtures/svelte-inline-style-bad.svelte"],
      languageOptions: {
        parser: svelteParser,
        parserOptions: {
          parser: { js: "espree" },
        },
      },
      plugins: { svelte: sveltePlugin, gameface },
      processor: sveltePlugin.processors.svelte,
      rules: {
        "gameface/svelte-inline-css-partial-property-values": "error",
      },
    },
  ],
});

const file = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/svelte-inline-style-bad.svelte",
);
const results = await eslint.lintFiles([file]);
const msgs = results[0]?.messages || [];
const partial = msgs.filter(
  (m) => m.ruleId === "gameface/svelte-inline-css-partial-property-values",
);

if (partial.length < 2) {
  throw new Error(
    `expected >=2 svelte inline partial messages, got ${partial.length}: ${msgs.map((m) => m.ruleId).join(", ") || "(none)"}`,
  );
}

console.log("svelte-inline-style: ok");
