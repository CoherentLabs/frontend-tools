import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["**/*"],
      language: "css/css",
      plugins: { gameface },
      rules: {
        "gameface/css-no-unsupported-functions": "error",
      },
    },
  ],
});

const RULE = "gameface/css-no-unsupported-functions";

/**
 * @param {string} snippet
 * @param {string} [filePath]
 */
async function lintCss(snippet, filePath = "virtual/fn-test.css") {
  const [result] = await eslint.lintText(snippet, { filePath });
  return result.messages.filter((m) => m.ruleId === RULE);
}

const clampBad = await lintCss(".box { font-size: clamp(12px, 14px, 16px); }");
if (clampBad.length === 0) {
  throw new Error("clamp() should report unsupported function");
}

const calcOk = await lintCss(".box { font-size: calc(12px + 4px); }");
if (calcOk.length > 0) {
  throw new Error(
    `calc() should be clean, got: ${calcOk.map((m) => m.message).join("; ")}`,
  );
}

const urlOk = await lintCss('.box { background-image: url("data:image/svg+xml,%3Csvg/%3E"); }');
if (urlOk.length > 0) {
  throw new Error("url() unknown-status should not report");
}

const nested = await lintCss(".box { width: calc(min(12px, 16px) * 1px); }");
if (nested.length === 0 || !nested.some((m) => m.message.includes("min"))) {
  throw new Error("nested min() inside calc should report");
}

console.log("css-no-unsupported-functions: ok");
