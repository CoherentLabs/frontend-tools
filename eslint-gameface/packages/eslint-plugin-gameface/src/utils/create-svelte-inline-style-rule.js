import { walkSvelteStyleAttributes } from "./svelte-inline-style-css.js";
import { defineSvelteMarkupVisitor, isSvelteMarkupElement } from "./svelte-visitor.js";

/**
 * @param {import("eslint").Rule.RuleMetaData} meta
 * @param {(context: import("eslint").Rule.RuleContext, sourceCode: import("eslint").SourceCode, attr: import("eslint").AST.Node) => void} visitStyleAttr
 * @returns {import("eslint").Rule.RuleModule}
 */
export function createSvelteInlineStyleRule(meta, visitStyleAttr) {
  return {
    meta,
    create(context) {
      const sc = context.sourceCode || context.getSourceCode();
      return defineSvelteMarkupVisitor(context, {
        SvelteElement(node) {
          if (!isSvelteMarkupElement(node)) {
            return;
          }
          walkSvelteStyleAttributes(sc, node, (attr) => {
            visitStyleAttr(context, sc, attr);
          });
        },
      });
    },
  };
}
