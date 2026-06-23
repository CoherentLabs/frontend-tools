import { defineVueDocumentVisitor } from "./vue-visitor.js";
import { vueElementTagName } from "./vue-element.js";

/**
 * @param {import("eslint").Rule.RuleMetaData} meta
 * @param {(context: import("eslint").Rule.RuleContext, sourceCode: import("eslint").SourceCode, styleElement: import("eslint").AST.Node) => void} visitStyleBlock
 * @returns {import("eslint").Rule.RuleModule}
 */
export function createVueSfcStyleRule(meta, visitStyleBlock) {
  return {
    meta,
    create(context) {
      const sc = context.sourceCode || context.getSourceCode();
      return defineVueDocumentVisitor(context, {
        VElement(node) {
          const tag = (vueElementTagName(node) ?? "").toLowerCase();
          if (tag !== "style") {
            return;
          }
          visitStyleBlock(context, sc, node);
        },
      });
    },
  };
}
