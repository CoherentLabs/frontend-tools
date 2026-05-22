import {
  getStyleAttributeInnerRange,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

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
      description: "Disallow calc() mixing % with other units in HTML style attributes.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface calc() does not support mixing % with other units (e.g. 50% - 20px).",
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
            reportCalcMixedPercentInValue(
              context,
              "mixedPercent",
              ch,
              sc,
              range.baseIndex,
            );
          }
        });
      },
    };
  },
};
