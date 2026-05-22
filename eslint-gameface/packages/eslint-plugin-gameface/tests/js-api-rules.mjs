import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixtures = "packages/eslint-plugin-gameface/tests/fixtures";

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/js-*.{js,jsx}`],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { gameface },
      rules: {
        "gameface/js-no-unsupported-globals": "error",
        "gameface/js-partial-member-access": "warn",
      },
    },
    {
      files: [`${fixtures}/js-*.{ts,tsx}`],
      languageOptions: {
        parser: tsParser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { gameface },
      rules: {
        "gameface/js-no-unsupported-globals": "error",
        "gameface/js-partial-member-access": "warn",
      },
    },
  ],
});

const files = [
  path.join(root, `${fixtures}/js-unsupported-global-bad.js`),
  path.join(root, `${fixtures}/js-partial-member-bad.js`),
  path.join(root, `${fixtures}/js-unsupported-global-bad.ts`),
  path.join(root, `${fixtures}/js-partial-member-bad.tsx`),
];

const results = await eslint.lintFiles(files);

function messagesFor(suffix) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(suffix));
  if (!hit) {
    throw new Error(`no results for ${suffix}`);
  }
  return hit.messages;
}

function expectRule(suffix, ruleId, minCount = 1) {
  const msgs = messagesFor(suffix);
  const hits = msgs.filter((m) => m.ruleId === ruleId);
  if (hits.length < minCount) {
    const got = msgs.map((m) => `${m.ruleId}:${m.message}`).join(" | ");
    throw new Error(
      `expected >=${minCount} ${ruleId} for ${suffix}, got ${hits.length} (${got || "none"})`,
    );
  }
}

expectRule("js-unsupported-global-bad.js", "gameface/js-no-unsupported-globals", 2);
expectRule("js-partial-member-bad.js", "gameface/js-partial-member-access", 1);
expectRule("js-unsupported-global-bad.ts", "gameface/js-no-unsupported-globals", 2);
expectRule("js-partial-member-bad.tsx", "gameface/js-partial-member-access", 1);

console.log("js-api-rules: ok");
