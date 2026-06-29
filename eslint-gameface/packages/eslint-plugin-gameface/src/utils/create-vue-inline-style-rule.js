import { walkVueStyleAttributes } from "./vue-inline-style-css.js";
import { defineVueTemplateVisitor } from "./vue-visitor.js";

/**
 * @param {import("eslint").Rule.RuleMetaData} meta
 * @param {(context: import("eslint").Rule.RuleContext, sourceCode: import("eslint").SourceCode, attr: import("eslint").AST.Node) => void} visitStyleAttr
 * @returns {import("eslint").Rule.RuleModule}
 */
export function createVueInlineStyleRule(meta, visitStyleAttr) {
  return {
    meta,
    create(context) {
      const sc = context.sourceCode || context.getSourceCode();
      return defineVueTemplateVisitor(context, {
        VElement(node) {
          walkVueStyleAttributes(sc, node, (attr) => {
            visitStyleAttr(context, sc, attr);
          });
        },
      });
    },
  };
}
