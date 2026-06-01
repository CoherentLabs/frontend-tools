import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { cssVisitorKeys } = require("@html-eslint/parser/lib/css-visitor-keys.js");

/**
 * Depth-first walk of @html-eslint embedded CSS (Css-prefixed nodes).
 * @param {object} node
 * @param {(node: object) => void} visitor
 */
export function walkEmbeddedCss(node, visitor) {
  if (!node || typeof node !== "object") {
    return;
  }
  visitor(node);
  const keys = cssVisitorKeys[node.type];
  if (!keys) {
    return;
  }
  for (const key of keys) {
    const child = node[key];
    if (!child) {
      continue;
    }
    if (Array.isArray(child)) {
      for (const c of child) {
        walkEmbeddedCss(c, visitor);
      }
    } else if (typeof child === "object" && child.type) {
      walkEmbeddedCss(child, visitor);
    }
  }
}
