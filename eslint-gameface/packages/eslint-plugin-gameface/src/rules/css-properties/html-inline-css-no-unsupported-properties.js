import {
  getStyleAttributeInnerRange,
  walkDeclarationValueIdentifiers,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { reportPartialValueIdentifiers, reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

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
        "On HTML `style=\"...\"` attributes, disallow CSS properties listed as unsupported in gameface-features (same catalog as gameface/css-no-unsupported-properties).",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
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
        walkInlineDeclarations(sc, range.baseIndex, range.inner, (decl, loc) => {
          reportUnsupportedProperty(context, "unsupported", decl.property, loc);
        });
      },
    };
  },
};
