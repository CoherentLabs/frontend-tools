import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["packages/eslint-plugin-gameface/tests/fixtures/databind-*.jsx"],
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { gameface },
      rules: {
        "gameface/jsx-databind-spelling": "error",
        "gameface/jsx-databind-curly-brackets": "error",
        "gameface/jsx-databind-property-accessors": "error",
        "gameface/jsx-databind-bind-for": "error",
        "gameface/jsx-databind-class-toggle": "error",
        "gameface/jsx-databind-model-properties": "error",
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
  "packages/eslint-plugin-gameface/tests/fixtures/databind-spelling-bad.jsx",
);
const modelBad = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/databind-model-bad.jsx",
);

const results = await eslint.lintFiles([spellingBad, modelBad]);

function expectRule(fileSuffix, ruleId) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(fileSuffix));
  const ids = (hit?.messages || []).map((m) => m.ruleId);
  if (!ids.includes(ruleId)) {
    throw new Error(`expected ${ruleId} for ${fileSuffix}, got: ${ids.join(", ") || "(none)"}`);
  }
}

expectRule("databind-spelling-bad.jsx", "gameface/jsx-databind-spelling");
expectRule("databind-model-bad.jsx", "gameface/jsx-databind-model-properties");

console.log("jsx-databind-rules: ok");
