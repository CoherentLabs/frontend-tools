import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixtures = "packages/eslint-plugin-gameface/tests/fixtures";

const vueSvgRules = {
  "gameface/vue-svg-no-unsupported-elements": "error",
  "gameface/vue-svg-mask-clip-path-conflict": "warn",
  "gameface/vue-inline-css-svg-keyframes-sizing-units": "error",
  "gameface/vue-svg-stroke-dash-non-path": "error",
};

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/svg/unsupported-bad.vue`],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: { js: "espree", jsx: "espree" },
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: { vue: vuePlugin, gameface },
      processor: vuePlugin.processors.vue,
      rules: vueSvgRules,
    },
  ],
});

const file = path.join(root, `${fixtures}/svg/unsupported-bad.vue`);
const results = await eslint.lintFiles([file]);
const ids = (results[0]?.messages || []).map((m) => m.ruleId);

if (!ids.includes("gameface/vue-svg-no-unsupported-elements")) {
  throw new Error(`expected vue-svg rule, got: ${ids.join(", ") || "(none)"}`);
}

console.log("vue-svg-rules: ok");
