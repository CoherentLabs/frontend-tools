import * as csstree from "css-tree";
import { vueElementTagName } from "./vue-element.js";

/**
 * @param {import("eslint").AST.Node} styleElement
 * @param {import("eslint").SourceCode} sourceCode
 * @returns {{ cssText: string, baseIndex: number } | null}
 */
export function getVueStyleBlockTextRange(styleElement, sourceCode) {
  if (styleElement.type !== "VElement") {
    return null;
  }
  const name = (vueElementTagName(styleElement) ?? "").toLowerCase();
  if (name !== "style") {
    return null;
  }
  let cssText = "";
  let baseIndex = null;
  for (const child of styleElement.children ?? []) {
    if (child.type === "VText" && typeof child.value === "string") {
      if (baseIndex === null && child.loc) {
        baseIndex = sourceCode.getIndexFromLoc(child.loc.start);
      }
      cssText += child.value;
    }
  }
  if (!cssText.trim() || baseIndex === null) {
    return null;
  }
  return { cssText, baseIndex };
}

/**
 * @param {import("eslint").AST.Node} styleElement
 * @returns {string}
 */
export function getVueStyleBlockText(styleElement) {
  if (styleElement.type !== "VElement") {
    return "";
  }
  const name = (vueElementTagName(styleElement) ?? "").toLowerCase();
  if (name !== "style") {
    return "";
  }
  let cssText = "";
  for (const child of styleElement.children ?? []) {
    if (child.type === "VText" && typeof child.value === "string") {
      cssText += child.value;
    }
  }
  return cssText;
}

/**
 * @param {import("eslint").AST.Node} styleElement
 * @param {(node: import("css-tree").CssNode) => void} visitor
 */
export function walkVueStyleBlockCss(styleElement, visitor) {
  const cssText = getVueStyleBlockText(styleElement);
  if (!cssText.trim()) {
    return;
  }
  let ast;
  try {
    ast = csstree.parse(cssText, { positions: true });
  } catch {
    return;
  }
  csstree.walk(ast, (node) => {
    visitor(node);
  });
}
