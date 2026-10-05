import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gameface from "../src/index.js";

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

console.log("scss-tolerant: ok");
