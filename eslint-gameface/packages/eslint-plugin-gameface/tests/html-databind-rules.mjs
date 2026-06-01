import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import html from "@html-eslint/eslint-plugin";
import gameface from "../src/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..", "..", "..");
const htmlBase = html.configs["flat/recommended"];
const htmlRulesOff = Object.fromEntries(
  Object.keys(htmlBase.rules || {}).map((k) => [k, "off"]),
);

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/databind-*.html"],
      ...htmlBase,
      plugins: {
        ...htmlBase.plugins,
        gameface,
      },
      rules: {
        ...htmlRulesOff,
        "gameface/html-databind-spelling": "error",
        "gameface/html-databind-curly-brackets": "error",
        "gameface/html-databind-property-accessors": "error",
        "gameface/html-databind-bind-for": "error",
        "gameface/html-databind-class-toggle": "error",
        "gameface/html-databind-model-properties": "error",
      },
      settings: {
        gameface: {
          modelsDir: "packages/eslint-plugin-gameface/tests/fixtures/gameface-models",
        },
      },
    },
  ],
});

const spellingBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-spelling-bad.html",
);
const curlyBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-curly-bad.html",
);
const styleBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-style-unsupported-bad.html",
);
const modelBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-model-bad.html",
);
const modelSecondBindingBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-model-second-binding-bad.html",
);
const accessorsBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-property-accessors-bad.html",
);
const bindForBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-bind-for-bad.html",
);
const classToggleBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-class-toggle-bad.html",
);
const bindForSemicolonBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-bind-for-semicolon-bad.html",
);
const classToggleSemicolonBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-class-toggle-semicolon-bad.html",
);

const results = await eslint.lintFiles([
  spellingBad,
  curlyBad,
  styleBad,
  modelBad,
  modelSecondBindingBad,
  accessorsBad,
  bindForBad,
  classToggleBad,
  bindForSemicolonBad,
  classToggleSemicolonBad,
]);

function expectRule(fileSuffix, ruleId) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(fileSuffix));
  const ids = (hit?.messages || []).map((m) => m.ruleId);
  if (!ids.includes(ruleId)) {
    throw new Error(`expected ${ruleId} for ${fileSuffix}, got: ${ids.join(", ") || "(none)"}`);
  }
}

expectRule("databind-spelling-bad.html", "gameface/html-databind-spelling");
expectRule("databind-curly-bad.html", "gameface/html-databind-curly-brackets");
expectRule("databind-style-unsupported-bad.html", "gameface/html-databind-spelling");
expectRule("databind-model-bad.html", "gameface/html-databind-model-properties");
expectRule(
  "databind-model-second-binding-bad.html",
  "gameface/html-databind-model-properties",
);
expectRule("databind-property-accessors-bad.html", "gameface/html-databind-property-accessors");
expectRule("databind-bind-for-bad.html", "gameface/html-databind-bind-for");
expectRule("databind-bind-for-semicolon-bad.html", "gameface/html-databind-bind-for");
expectRule("databind-class-toggle-bad.html", "gameface/html-databind-class-toggle");
expectRule("databind-class-toggle-semicolon-bad.html", "gameface/html-databind-class-toggle");

console.log("html-databind-rules: ok");
