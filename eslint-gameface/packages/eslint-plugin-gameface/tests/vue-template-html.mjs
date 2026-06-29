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
      files: ["packages/eslint-plugin-gameface/tests/fixtures/vue-template-parsed-no-impl-bad.vue"],
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
        "gameface/vue-parsed-no-impl": [
          "error",
          { scope: "curated", ignoreTags: ["meta", "link", "base", "br", "hr", "noscript"] },
        ],
      },
    },
  ],
});

const file = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/vue-template-parsed-no-impl-bad.vue",
);
const results = await eslint.lintFiles([file]);
const ids = (results[0]?.messages || []).map((m) => m.ruleId);

if (!ids.includes("gameface/vue-parsed-no-impl")) {
  throw new Error(`expected vue-parsed-no-impl, got: ${ids.join(", ") || "(none)"}`);
}

console.log("vue-template-html: ok");
