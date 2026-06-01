import {
  getStyleAttributeInnerRange,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

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
      description: "Disallow var() fallback values in HTML style attributes.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
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
          const ch = decl.value?.children;
          if (ch) {
            reportVarFallbacksInValue(context, "noFallback", ch, sc, range.baseIndex);
          }
        });
      },
    };
  },
};
