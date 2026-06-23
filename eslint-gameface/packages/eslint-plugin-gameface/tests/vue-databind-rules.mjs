import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const modelsDir = "packages/eslint-plugin-gameface/tests/fixtures/gameface-models";

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/**/*.vue"],
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
        "gameface/vue-databind-spelling": "error",
        "gameface/vue-databind-model-properties": "error",
      },
      settings: {
        gameface: { modelsDir },
      },
    },
  ],
});

const spellingBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-spelling-bad.vue",
);

const results = await eslint.lintFiles([spellingBad]);

function expectRule(fileSuffix, ruleId) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(fileSuffix));
  const ids = (hit?.messages || []).map((m) => m.ruleId);
  if (!ids.includes(ruleId)) {
    throw new Error(`expected ${ruleId} for ${fileSuffix}, got: ${ids.join(", ") || "(none)"}`);
  }
}

expectRule("databind-spelling-bad.vue", "gameface/vue-databind-spelling");

console.log("vue-databind-rules: ok");
