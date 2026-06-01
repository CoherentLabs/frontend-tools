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

console.log("scss-tolerant: ok");
