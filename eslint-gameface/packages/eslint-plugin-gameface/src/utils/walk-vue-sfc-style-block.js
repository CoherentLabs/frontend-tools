import { parse, walk } from "css-tree";
import { eslintLocRangeFromCssTreeOffsets, walkInlineCssContent } from "./html-inline-style-css.js";
import { getVueStyleBlockTextRange } from "./vue-sfc-style-css.js";

/**
 * @param {import("eslint").AST.Node} styleElement
 * @param {import("eslint").SourceCode} sourceCode
 * @param {(cssText: string, baseIndex: number) => void} visitor
 */
export function withVueStyleBlockText(styleElement, sourceCode, visitor) {
  const range = getVueStyleBlockTextRange(styleElement, sourceCode);
  if (!range) {
    return;
  }
  visitor(range.cssText, range.baseIndex);
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {string} cssText
 * @param {number} baseIndex
 * @param {(decl: import("css-tree").Declaration, loc: import("eslint").AST.SourceLocation) => void} onDeclaration
 */
export function walkVueSfcStyleDeclarations(sourceCode, cssText, baseIndex, onDeclaration) {
  let ast;
  try {
    ast = parse(cssText, { context: "stylesheet", positions: true });
  } catch {
    return;
  }
  walk(ast, (node) => {
    if (node.type === "Declaration" && node.loc && typeof node.property === "string") {
      onDeclaration(node, eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc));
    }
  });
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {string} cssText
 * @param {number} baseIndex
 * @param {(node: import("css-tree").CssNode, loc: import("eslint").AST.SourceLocation) => void} onNode
 */
export function walkVueSfcStyleNodes(sourceCode, cssText, baseIndex, onNode) {
  let ast;
  try {
    ast = parse(cssText, { context: "stylesheet", positions: true });
  } catch {
    return;
  }
  walk(ast, (node) => {
    if (!node.loc) {
      return;
    }
    onNode(node, eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc));
  });
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {string} cssText
 * @param {number} baseIndex
 * @param {Parameters<typeof walkInlineCssContent>[3]} handlers
 */
export function walkVueSfcInlineCssContent(sourceCode, cssText, baseIndex, handlers) {
  walkInlineCssContent(sourceCode, baseIndex, cssText, handlers);
}
