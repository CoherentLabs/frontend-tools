import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportKeyframesSizingUnitsCssTree } from "../../utils/svg-css-keyframes.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "In Vue style string @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineCssContent(sc, baseIndex, inner, {
        onKeyframesBlock(block) {
          reportKeyframesSizingUnitsCssTree(
            context,
            "unitless",
            block,
            sc,
            baseIndex,
          );
        },
      });
    });
  },
);
