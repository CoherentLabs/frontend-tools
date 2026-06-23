/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {Record<string, Function>} templateVisitor
 * @param {Record<string, Function>} [scriptVisitor]
 * @returns {import("eslint").Rule.RuleListener}
 */
export function defineVueTemplateVisitor(context, templateVisitor, scriptVisitor = {}) {
  const sc = context.sourceCode || context.getSourceCode();
  if (!sc.parserServices?.defineTemplateBodyVisitor) {
    return {};
  }
  return sc.parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor);
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {Record<string, Function>} documentVisitor
 * @returns {import("eslint").Rule.RuleListener}
 */
export function defineVueDocumentVisitor(context, documentVisitor) {
  const sc = context.sourceCode || context.getSourceCode();
  if (!sc.parserServices?.defineDocumentVisitor) {
    return {};
  }
  return sc.parserServices.defineDocumentVisitor(documentVisitor);
}

/**
 * @param {import("eslint").AST.Node} node
 * @returns {boolean}
 */
export function isVueTemplateElement(node) {
  if (node.type !== "VElement") {
    return false;
  }
  const name = (node.rawName ?? node.name ?? "").toLowerCase();
  return name !== "template" && name !== "script" && name !== "style";
}
