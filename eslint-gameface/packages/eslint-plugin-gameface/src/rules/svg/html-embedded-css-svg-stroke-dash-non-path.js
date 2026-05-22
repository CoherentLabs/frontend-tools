import { cssSelectorTargetsNonPathSvgShape, SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { isPathOnlyStrokeDashProperty } from "../../utils/svg-stroke-dash.js";
import { normalizeCssPropertyName } from "../../utils/css-property-name.js";
import { reportRestriction } from "../../utils/gameface-css-restrictions.js";

/**
 * @param {object} ruleNode
 * @param {import("eslint").SourceCode} sourceCode
 * @returns {string}
 */
function embeddedRuleSelectorText(ruleNode, sourceCode) {
  const prelude = /** @type {{ range?: [number, number]; loc?: { start: { line: number; column: number }; end: { line: number; column: number } } } } */ (
    ruleNode
  ).prelude;
  if (!prelude) {
    return "";
  }
  if (Array.isArray(prelude.range) && prelude.range.length === 2) {
    return sourceCode.text.slice(prelude.range[0], prelude.range[1]);
  }
  if (prelude.loc) {
    const start = sourceCode.getIndexFromLoc(prelude.loc.start);
    const end = sourceCode.getIndexFromLoc(prelude.loc.end);
    return sourceCode.text.slice(start, end);
  }
  return "";
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "In HTML <style>, disallow stroke-dash* on CSS rules targeting non-path SVG shapes.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      nonPath:
        "Property '{{property}}' in selector '{{selector}}' is only supported on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      StyleTag(node) {
        const ss = node.value?.stylesheet;
        if (!ss) {
          return;
        }
        walkEmbeddedCss(ss, (n) => {
          if (n.type !== "CssRule" || !n.block) {
            return;
          }
          const selector = embeddedRuleSelectorText(n, sc).trim();
          if (!cssSelectorTargetsNonPathSvgShape(selector)) {
            return;
          }
          walkEmbeddedCss(n.block, (child) => {
            if (
              child.type !== "CssDeclaration" ||
              typeof child.property !== "string" ||
              !child.loc
            ) {
              return;
            }
            const prop = normalizeCssPropertyName(child.property);
            if (!isPathOnlyStrokeDashProperty(prop)) {
              return;
            }
            reportRestriction(context, "nonPath", child.loc, {
              property: prop,
              selector: selector.slice(0, 60),
            });
          });
        });
      },
    };
  },
};
