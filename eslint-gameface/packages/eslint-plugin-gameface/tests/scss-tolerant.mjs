import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gameface from "../src/index.js";
import scssProcessor, { rewriteScssAmpersandSuffixes } from "../src/processors/scss.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const scssPath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/sample-user.scss",
);
const scssBadPath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/sample-user-bad.scss",
);

const scssSuffixBadPath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/sample-user-suffix-bad.scss",
);

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [...gameface.configs["flat/recommended"]],
});

const [okResult] = await eslint.lintFiles([scssPath]);
const parseErrors = (okResult.messages || []).filter((m) => m.fatal || m.ruleId === null);
if (parseErrors.length > 0) {
  throw new Error(
    `SCSS fixture should parse with tolerant mode: ${parseErrors.map((m) => m.message).join("; ")}`,
  );
}

const [badResult] = await eslint.lintFiles([scssBadPath]);
const unsupported = (badResult.messages || []).filter(
  (m) => m.ruleId === "gameface/css-no-unsupported-properties",
);
if (unsupported.length === 0) {
  throw new Error("expected gameface/css-no-unsupported-properties in sample-user-bad.scss");
}

// SCSS suffix selectors (`&-x`, `&__x`, `&--x`) must not swallow their blocks as Raw nodes.
const [suffixResult] = await eslint.lintFiles([scssSuffixBadPath]);
const suffixFatal = (suffixResult.messages || []).filter((m) => m.fatal || m.ruleId === null);
if (suffixFatal.length > 0) {
  throw new Error(`unexpected parse errors: ${suffixFatal.map((m) => m.message).join("; ")}`);
}
const gridLines = (suffixResult.messages || [])
  .filter((m) => m.ruleId === "gameface/css-partial-property-values")
  .map((m) => `${m.line}:${m.column}`);
const expectedGridLines = ["6:18", "11:18", "14:22", "20:18"];
if (gridLines.join(",") !== expectedGridLines.join(",")) {
  throw new Error(
    `expected display:grid reports at ${expectedGridLines.join(", ")} in sample-user-suffix-bad.scss, got ${gridLines.join(", ") || "none"}`,
  );
}

// Suffix selectors after comments, non-ASCII / escaped / numeric suffixes must keep their block linted.
const suffixEdgeCases = {
  afterComment: ".a { /* state */&-x { display: grid; } }",
  nonAscii: ".a { &-é { display: grid; } }",
  escaped: String.raw`.a { &-\31 x { display: grid; } }`,
  numeric: ".a { &-2xl { display: grid; } }",
};
for (const [name, code] of Object.entries(suffixEdgeCases)) {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, `${name}.scss`) });
  const grid = result.messages.filter((m) => m.ruleId === "gameface/css-partial-property-values");
  if (grid.length !== 1) {
    throw new Error(`${name}: expected 1 display:grid report, got ${grid.length}`);
  }
}

// Only selector `&` is rewritten — strings and comments stay unchanged.
const untouched = [
  '.a { content: "Save &exit"; }',
  ".a { content: 'Save &exit'; }",
  ".a { /* see &-x */ }",
  "// see &-x\n.a {}",
  String.raw`.a { content: "quote \" &exit"; }`,
  ".a { background: url(http://x.com/a.png); }",
];
for (const code of untouched) {
  const { text, offsets } = rewriteScssAmpersandSuffixes(code);
  if (text !== code || offsets.length !== 0) {
    throw new Error(`expected no rewrite for ${JSON.stringify(code)}, got ${JSON.stringify(text)}`);
  }
}
{
  const code = '.a { content: "&-x"; &-y { } }';
  const { text } = rewriteScssAmpersandSuffixes(code);
  if (text !== '.a { content: "&-x"; .-y { } }') {
    throw new Error(`expected only the selector & rewritten, got ${JSON.stringify(text)}`);
  }
}

// Fixes and suggestions spanning a rewritten `&` are dropped; others are kept.
{
  const code = ".a { &-x { } }";
  scssProcessor.preprocess(code, "fixes.scss");
  const amp = code.indexOf("&");
  const overlapping = { range: [amp, amp + 3], text: ".-x" };
  const safe = { range: [0, 2], text: ".b" };
  const [message] = scssProcessor.postprocess(
    [[{ ruleId: "r", message: "m", line: 1, column: 1, fix: overlapping,
      suggestions: [{ desc: "bad", fix: overlapping }, { desc: "ok", fix: safe }] }]],
    "fixes.scss",
  );
  if (message.fix) throw new Error("expected overlapping fix to be dropped");
  if (message.suggestions?.length !== 1 || message.suggestions[0].desc !== "ok") {
    throw new Error(`expected only the safe suggestion kept, got ${JSON.stringify(message.suggestions)}`);
  }
}

console.log("scss-tolerant: ok");
