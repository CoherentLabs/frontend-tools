import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  getStyleAttributeInnerRange,
  walkInlineCssContent,
} from "../../utils/html-inline-style-css.js";
import { reportKeyframesSizingUnitsCssTree } from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "In HTML style attribute @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const styleAttr = (node.attributes || []).find(
          (a) => typeof a.key?.value === "string" && a.key.value.toLowerCase() === "style",
        );
        if (!styleAttr?.value) {
          return;
        }
        const range = getStyleAttributeInnerRange(sc, styleAttr.value);
        if (!range?.inner.trim()) {
          return;
        }
        walkInlineCssContent(sc, range.baseIndex, range.inner, {
          onKeyframesBlock(block) {
            reportKeyframesSizingUnitsCssTree(
              context,
              "unitless",
              block,
              sc,
              range.baseIndex,
            );
          },
        });
      },
    };
  },
};
