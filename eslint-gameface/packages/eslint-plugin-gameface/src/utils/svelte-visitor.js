/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {Record<string, Function>} markupVisitor
 * @returns {import("eslint").Rule.RuleListener}
 */
export function defineSvelteMarkupVisitor(context, markupVisitor) {
  return markupVisitor;
}

/**
 * @param {import("eslint").AST.Node} node
 * @returns {boolean}
 */
export function isSvelteMarkupElement(node) {
  return node.type === "SvelteElement" && node.kind === "html";
}
