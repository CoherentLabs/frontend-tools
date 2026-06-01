import {
  getStyleAttributeInnerRange,
  walkInlineCssContent,
} from "../../utils/html-inline-style-css.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";

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
      description: "Disallow CSS calc() inside @keyframes in HTML style attributes.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS calc() is not supported inside @keyframes in Gameface.",
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
        walkInlineCssContent(sc, range.baseIndex, range.inner, {
          onKeyframesBlock(block) {
            reportFunctionsInKeyframesBlock(
              context,
              "restricted",
              block,
              (fn) => fn.name.toLowerCase() === "calc",
              sc,
              range.baseIndex,
            );
          },
        });
      },
    };
  },
};
