import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import html from "@html-eslint/eslint-plugin";
import gameface from "../src/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..", "..", "..");
const fixtures = "packages/eslint-plugin-gameface/tests/fixtures/svg";
const htmlBase = html.configs["flat/recommended"];
const htmlRulesOff = Object.fromEntries(
  Object.keys(htmlBase.rules || {}).map((k) => [k, "off"]),
);

const svgHtmlRules = {
  "gameface/html-svg-no-unsupported-elements": "error",
  "gameface/html-svg-mask-clip-path-conflict": "warn",
  "gameface/html-embedded-css-svg-keyframes-sizing-units": "error",
  "gameface/html-inline-css-svg-keyframes-sizing-units": "error",
  "gameface/html-embedded-css-svg-keyframes-path-arc-animation": "warn",
  "gameface/html-svg-stroke-dash-non-path": "error",
  "gameface/html-embedded-css-svg-stroke-dash-non-path": "error",
  "gameface/html-embedded-css-svg-keyframes-stroke-dash-path-only": "warn",
};

const svgCssRules = {
  "gameface/css-svg-keyframes-sizing-units": "error",
  "gameface/css-svg-keyframes-path-arc-animation": "warn",
  "gameface/css-svg-stroke-dash-non-path": "error",
  "gameface/css-svg-keyframes-stroke-dash-path-only": "warn",
};

const svgJsxRules = {
  "gameface/jsx-svg-no-unsupported-elements": "error",
  "gameface/jsx-svg-mask-clip-path-conflict": "warn",
  "gameface/jsx-inline-css-svg-keyframes-sizing-units": "error",
  "gameface/jsx-svg-stroke-dash-non-path": "error",
};

const eslintHtml = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/**/*.html`],
      ...htmlBase,
      plugins: { ...htmlBase.plugins, gameface },
      rules: { ...htmlRulesOff, ...svgHtmlRules },
    },
  ],
});

const eslintCss = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/**/*.css`],
      language: "css/css",
      plugins: { gameface },
      rules: svgCssRules,
    },
  ],
});

const eslintJsx = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: [`${fixtures}/**/*.jsx`],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { gameface },
      rules: svgJsxRules,
    },
  ],
});

/**
 * @param {import("eslint").ESLint} eslint
 * @param {string} file
 */
async function messagesFor(eslint, file) {
  const results = await eslint.lintFiles([path.join(root, file)]);
  return results[0]?.messages ?? [];
}

function expectRule(msgs, ruleId, min = 1) {
  const n = msgs.filter((m) => m.ruleId === ruleId).length;
  if (n < min) {
    throw new Error(`expected >=${min} ${ruleId}, got ${n}: ${msgs.map((m) => m.ruleId).join(", ")}`);
  }
}

function expectNoRule(msgs, ruleId) {
  if (msgs.some((m) => m.ruleId === ruleId)) {
    throw new Error(`expected no ${ruleId}`);
  }
}

const badHtml = await messagesFor(eslintHtml, `${fixtures}/unsupported-bad.html`);
expectRule(badHtml, "gameface/html-svg-no-unsupported-elements", 2);

const goodHtml = await messagesFor(eslintHtml, `${fixtures}/unsupported-good.html`);
expectNoRule(goodHtml, "gameface/html-svg-no-unsupported-elements");

const maskHtml = await messagesFor(eslintHtml, `${fixtures}/mask-clip-bad.html`);
expectRule(maskHtml, "gameface/html-svg-mask-clip-path-conflict", 1);

const badCss = await messagesFor(eslintCss, `${fixtures}/keyframes-units-bad.css`);
expectRule(badCss, "gameface/css-svg-keyframes-sizing-units", 1);

const goodCss = await messagesFor(eslintCss, `${fixtures}/keyframes-units-good.css`);
expectNoRule(goodCss, "gameface/css-svg-keyframes-sizing-units");

const arcCss = await messagesFor(eslintCss, `${fixtures}/keyframes-path-arc-bad.css`);
expectRule(arcCss, "gameface/css-svg-keyframes-path-arc-animation", 1);

const badJsx = await messagesFor(eslintJsx, `${fixtures}/unsupported-bad.jsx`);
expectRule(badJsx, "gameface/jsx-svg-no-unsupported-elements", 2);

const strokeDashHtml = await messagesFor(eslintHtml, `${fixtures}/stroke-dash-bad.html`);
expectRule(strokeDashHtml, "gameface/html-svg-stroke-dash-non-path", 1);
expectRule(strokeDashHtml, "gameface/html-embedded-css-svg-stroke-dash-non-path", 1);

const strokeDashGood = await messagesFor(eslintHtml, `${fixtures}/stroke-dash-good.html`);
expectNoRule(strokeDashGood, "gameface/html-svg-stroke-dash-non-path");

const strokeDashCss = await messagesFor(eslintCss, `${fixtures}/stroke-dash-keyframes-bad.css`);
expectRule(strokeDashCss, "gameface/css-svg-keyframes-stroke-dash-path-only", 2);

const strokeDashJsx = await messagesFor(eslintJsx, `${fixtures}/stroke-dash-bad.jsx`);
expectRule(strokeDashJsx, "gameface/jsx-svg-stroke-dash-non-path", 1);

console.log("svg-support-rules: ok");
