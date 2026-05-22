import {
  getStyleAttributeInnerRange,
  walkDeclarationValueFunctions,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { reportUnsupportedCssFunction } from "../../utils/gameface-css-checks.js";

function findStyleAttribute(node) {
  for (const attr of node.attributes || []) {
    const k = attr.key?.value;
    if (typeof k === "string" && k.toLowerCase() === "style" && attr.value) {
      return attr;
    }
  }
  return null;
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On HTML `style=\"...\"` attributes, disallow CSS functions listed as missing in gameface-features/functions/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const attr = findStyleAttribute(node);
        if (!attr?.value) {
          return;
        }
        const range = getStyleAttributeInnerRange(sc, attr.value);
        if (!range || !range.inner.trim()) {
          return;
        }
        walkInlineDeclarations(sc, range.baseIndex, range.inner, (decl) => {
          walkDeclarationValueFunctions(sc, range.baseIndex, decl, (name, loc) => {
            reportUnsupportedCssFunction(context, "unsupported", name, loc);
          });
        });
      },
    };
  },
};
