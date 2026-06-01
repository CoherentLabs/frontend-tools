import { cssSelectorTargetsNonPathSvgShape, SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { isPathOnlyStrokeDashProperty } from "../../utils/svg-stroke-dash.js";
import { normalizeCssPropertyName } from "../../utils/css-property-name.js";
import { reportRestriction } from "../../utils/gameface-css-restrictions.js";
import { ruleSelectorText } from "../../utils/svg-stroke-dash.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow stroke-dasharray/stroke-dashoffset in CSS rules that target non-path SVG shapes.",
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
      Rule(node) {
        const selector = ruleSelectorText(node, sc).trim() || sc.getText(/** @type {object} */ (node)).slice(0, 80);
        if (!cssSelectorTargetsNonPathSvgShape(selector)) {
          return;
        }
        const block = /** @type {{ block?: object }} */ (node).block;
        if (!block) {
          return;
        }
        const children = /** @type {{ children?: unknown }} */ (block).children;
        if (children == null) {
          return;
        }
        const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
        for (const child of list) {
          if (!child || typeof child !== "object") {
            continue;
          }
          const decl = /** @type {{ type?: string; property?: string; loc?: import("eslint").AST.SourceLocation }} */ (
            child
          );
          if (
            (decl.type !== "Declaration" && decl.type !== "CssDeclaration") ||
            !decl.property ||
            !decl.loc
          ) {
            continue;
          }
          const prop = normalizeCssPropertyName(decl.property);
          if (!isPathOnlyStrokeDashProperty(prop)) {
            continue;
          }
          reportRestriction(context, "nonPath", decl.loc, {
            property: prop,
            selector: selector.slice(0, 60),
          });
        }
      },
    };
  },
};
