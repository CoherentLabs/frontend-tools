import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gameface from "../src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * @param {Record<string, string>} rules
 * @param {string} snippet
 * @param {string} filePath
 */
async function lintCss(rules, snippet, filePath = "virtual/restrictions.css") {
  const eslint = new ESLint({
    cwd: root,
    overrideConfig: [
      {
        files: ["**/*"],
        language: "css/css",
        plugins: { gameface },
        rules,
      },
    ],
  });
  const [result] = await eslint.lintText(snippet, { filePath });
  return result.messages;
}

const kfVar = await lintCss(
  { "gameface/css-no-var-in-keyframes": "error" },
  "@keyframes k { from { opacity: var(--x); } }",
);
if (!kfVar.some((m) => m.ruleId === "gameface/css-no-var-in-keyframes")) {
  throw new Error("expected var in keyframes report");
}

const kfCalc = await lintCss(
  { "gameface/css-no-calc-in-keyframes": "error" },
  "@keyframes k { from { width: calc(10px + 5px); } }",
);
if (!kfCalc.some((m) => m.ruleId === "gameface/css-no-calc-in-keyframes")) {
  throw new Error("expected calc in keyframes report");
}

const kfOk = await lintCss(
  {
    "gameface/css-no-var-in-keyframes": "error",
    "gameface/css-no-calc-in-keyframes": "error",
  },
  "@keyframes k { from { opacity: 1; } }",
);
if (kfOk.some((m) => m.ruleId?.includes("keyframes"))) {
  throw new Error("plain keyframes values should not report");
}

const varFb = await lintCss(
  { "gameface/css-var-no-fallback": "error" },
  ".x { width: var(--a, 10px); }",
);
if (!varFb.some((m) => m.ruleId === "gameface/css-var-no-fallback")) {
  throw new Error("expected var fallback report");
}

const varOk = await lintCss(
  { "gameface/css-var-no-fallback": "error" },
  ".x { width: var(--a); }",
);
if (varOk.some((m) => m.ruleId === "gameface/css-var-no-fallback")) {
  throw new Error("var without fallback should be clean");
}

const calcMix = await lintCss(
  { "gameface/css-calc-no-mixed-percent-units": "error" },
  ".x { width: calc(50% - 20px); }",
);
if (!calcMix.some((m) => m.ruleId === "gameface/css-calc-no-mixed-percent-units")) {
  throw new Error("expected calc mixed percent report");
}

const calcMixOk = await lintCss(
  { "gameface/css-calc-no-mixed-percent-units": "error" },
  ".x { width: calc(12px + 4px); }",
);
if (calcMixOk.some((m) => m.ruleId === "gameface/css-calc-no-mixed-percent-units")) {
  throw new Error("calc px+px should be clean");
}

const badFixtureLine = await lintCss(
  { "gameface/css-calc-no-mixed-percent-units": "error" },
  ".bad-fn { font-size: calc(12px + 100%); }",
);
if (!badFixtureLine.some((m) => m.ruleId === "gameface/css-calc-no-mixed-percent-units")) {
  throw new Error("calc(12px + 100%) should report mixed percent");
}

console.log("css-restrictions: ok");
