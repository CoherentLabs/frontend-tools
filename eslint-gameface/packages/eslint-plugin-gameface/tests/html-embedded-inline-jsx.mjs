import { ESLint } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const eslint = new ESLint({ cwd: root });

const htmlPath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/embedded-accent.html",
);
const jsxInlinePath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/jsx-inline-style-bad.jsx",
);
const jsxCamelPath = path.join(
  root,
  "packages/eslint-plugin-gameface/tests/fixtures/jsx-inline-style-camel-bad.jsx",
);

const results = await eslint.lintFiles([htmlPath, jsxInlinePath, jsxCamelPath]);

function messagesFor(suffix) {
  const hit = results.find((r) => r.filePath.replace(/\\/g, "/").endsWith(suffix));
  return hit ? hit.messages : [];
}

const htmlMsgs = messagesFor("embedded-accent.html");

const htmlIds = htmlMsgs.map((m) => m.ruleId).sort();
const expectedHtml = [
  "gameface/html-embedded-css-no-unsupported-properties",
  "gameface/html-inline-css-no-unsupported-properties",
];
for (const id of expectedHtml) {
  if (!htmlIds.includes(id)) {
    throw new Error(`expected rule ${id} on HTML fixture, got: ${htmlIds.join(", ")}`);
  }
}

const jsxInlineMsgs = messagesFor("jsx-inline-style-bad.jsx");
const jsxPartial = jsxInlineMsgs.filter(
  (m) => m.ruleId === "gameface/jsx-inline-css-partial-property-values",
);
if (jsxPartial.length < 2) {
  throw new Error(
    `expected >=2 jsx inline partial messages, got ${jsxPartial.length}: ${jsxInlineMsgs.map((m) => m.ruleId).join(", ")}`,
  );
}

const jsxCamelMsgs = messagesFor("jsx-inline-style-camel-bad.jsx");
const jsxCamelUnsupported = jsxCamelMsgs.filter(
  (m) => m.ruleId === "gameface/jsx-inline-css-no-unsupported-properties",
);
if (jsxCamelUnsupported.length < 1) {
  throw new Error(
    `expected jsx-inline-css-no-unsupported-properties for camelCase accentColor, got: ${jsxCamelMsgs.map((m) => m.ruleId).join(", ") || "(none)"}`,
  );
}
const jsxCamelPartial = jsxCamelMsgs.filter(
  (m) => m.ruleId === "gameface/jsx-inline-css-partial-property-values",
);
if (jsxCamelPartial.length < 1) {
  throw new Error(
    `expected jsx-inline-css-partial-property-values for camelCase alignContent, got: ${jsxCamelMsgs.map((m) => m.ruleId).join(", ") || "(none)"}`,
  );
}

console.log("html-embedded-inline-jsx: ok");
