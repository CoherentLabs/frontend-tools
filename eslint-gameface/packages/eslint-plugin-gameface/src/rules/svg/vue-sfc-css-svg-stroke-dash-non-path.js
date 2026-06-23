import { parse, walk } from "css-tree";
import {
  cssSelectorTargetsNonPathSvgShape,
  SVG_SUPPORT_DOC_URL,
} from "../../data/gameface-svg-support.js";
import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { normalizeCssPropertyName } from "../../utils/css-property-name.js";
import { reportRestriction } from "../../utils/gameface-css-restrictions.js";
import { eslintLocRangeFromCssTreeOffsets } from "../../utils/html-inline-style-css.js";
import { isPathOnlyStrokeDashProperty } from "../../utils/svg-stroke-dash.js";
import { withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "In Vue `<style>`, disallow stroke-dash* on CSS rules targeting non-path SVG shapes.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      nonPath:
        "Property '{{property}}' in selector '{{selector}}' is only supported on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      let ast;
      try {
        ast = parse(cssText, { context: "stylesheet", positions: true });
      } catch {
        return;
      }
      walk(ast, (node) => {
        if (node.type !== "Rule" || !node.prelude?.loc || !node.block) {
          return;
        }
        const selector = sc.text.slice(
          sc.getIndexFromLoc(
            eslintLocRangeFromCssTreeOffsets(sc, baseIndex, node.prelude.loc).start,
          ),
          sc.getIndexFromLoc(
            eslintLocRangeFromCssTreeOffsets(sc, baseIndex, node.prelude.loc).end,
          ),
        ).trim();
        if (!cssSelectorTargetsNonPathSvgShape(selector)) {
          return;
        }
        walk(node.block, (decl) => {
          if (decl.type !== "Declaration" || !decl.loc || typeof decl.property !== "string") {
            return;
          }
          const prop = normalizeCssPropertyName(decl.property);
          if (!isPathOnlyStrokeDashProperty(prop)) {
            return;
          }
          reportRestriction(
            context,
            "nonPath",
            eslintLocRangeFromCssTreeOffsets(sc, baseIndex, decl.loc),
            { property: prop, selector: selector.slice(0, 60) },
          );
        });
      });
    });
  },
);
