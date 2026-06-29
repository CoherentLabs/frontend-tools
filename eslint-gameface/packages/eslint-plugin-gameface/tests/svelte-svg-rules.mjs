import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixtures = "packages/eslint-plugin-gameface/tests/fixtures";

const svelteSvgRules = {
  "gameface/svelte-svg-no-unsupported-elements": "error",
  "gameface/svelte-svg-mask-clip-path-conflict": "warn",
  "gameface/svelte-inline-css-svg-keyframes-sizing-units": "error",
  "gameface/svelte-svg-stroke-dash-non-path": "error",
};

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/svg/unsupported-bad.svelte`],
      languageOptions: {
        parser: svelteParser,
        parserOptions: {
          parser: { js: "espree" },
        },
      },
      plugins: { svelte: sveltePlugin, gameface },
      processor: sveltePlugin.processors.svelte,
      rules: svelteSvgRules,
    },
  ],
});

const file = path.join(root, `${fixtures}/svg/unsupported-bad.svelte`);
const results = await eslint.lintFiles([file]);
const ids = (results[0]?.messages || []).map((m) => m.ruleId);

if (!ids.includes("gameface/svelte-svg-no-unsupported-elements")) {
  throw new Error(`expected svelte-svg rule, got: ${ids.join(", ") || "(none)"}`);
}

console.log("svelte-svg-rules: ok");
