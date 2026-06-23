import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/vue-inline-style-bad.vue"],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: { js: "espree", jsx: "espree" },
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: { vue: vuePlugin, gameface },
      processor: vuePlugin.processors.vue,
      rules: {
        "gameface/vue-inline-css-partial-property-values": "error",
      },
    },
  ],
});

const file = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/vue-inline-style-bad.vue",
);
const results = await eslint.lintFiles([file]);
const msgs = results[0]?.messages || [];
const partial = msgs.filter(
  (m) => m.ruleId === "gameface/vue-inline-css-partial-property-values",
);

if (partial.length < 2) {
  throw new Error(
    `expected >=2 vue inline partial messages, got ${partial.length}: ${msgs.map((m) => m.ruleId).join(", ") || "(none)"}`,
  );
}

console.log("vue-inline-style: ok");
