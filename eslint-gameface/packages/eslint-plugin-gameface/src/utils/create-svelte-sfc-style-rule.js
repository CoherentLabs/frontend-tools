/**
 * @param {import("eslint").Rule.RuleMetaData} meta
 * @param {(context: import("eslint").Rule.RuleContext, sourceCode: import("eslint").SourceCode, styleElement: import("eslint").AST.Node) => void} visitStyleBlock
 * @returns {import("eslint").Rule.RuleModule}
 */
export function createSvelteSfcStyleRule(meta, visitStyleBlock) {
  return {
    meta,
    create(context) {
      const sc = context.sourceCode || context.getSourceCode();
      return {
        SvelteStyleElement(node) {
          visitStyleBlock(context, sc, node);
        },
      };
    },
  };
}
