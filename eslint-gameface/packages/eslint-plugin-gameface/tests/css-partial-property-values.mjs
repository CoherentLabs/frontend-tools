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
        "gameface/css-partial-property-values": "error",
      },
    },
  ],
});

const RULE = "gameface/css-partial-property-values";

/**
 * @param {string} snippet
 * @param {string} [filePath]
 */
async function lintCss(snippet, filePath = "virtual/partial-test.css") {
  const [result] = await eslint.lintText(snippet, { filePath });
  return result.messages.filter((m) => m.ruleId === RULE);
}

const widthOk = await lintCss(".box { width: 10px; }");
if (widthOk.length > 0) {
  throw new Error(
    `width: 10px should not report partial lint, got: ${widthOk.map((m) => m.message).join("; ")}`,
  );
}

const widthBadKeyword = await lintCss(".box { width: fit-content; }");
if (widthBadKeyword.length === 0) {
  throw new Error("width: fit-content should report unsupported keyword");
}

const alignBad = await lintCss(".box { align-content: space-between; }");
if (alignBad.length === 0) {
  throw new Error("align-content: space-between should report");
}
if (alignBad.some((m) => m.messageId === "partialPropertyCatalog")) {
  throw new Error("align-content should use keyword message, not declaration-level partialPropertyCatalog");
}

const alignOk = await lintCss(".box { align-content: center; }");
if (alignOk.length > 0) {
  throw new Error(
    `align-content: center should be clean, got: ${alignOk.map((m) => m.message).join("; ")}`,
  );
}

console.log("css-partial-property-values: ok");
