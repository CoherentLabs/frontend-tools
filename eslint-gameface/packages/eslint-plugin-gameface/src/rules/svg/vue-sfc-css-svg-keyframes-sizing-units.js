import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportKeyframesSizingUnitsCssTree } from "../../utils/svg-css-keyframes.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "In Vue `<style>` @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
        onKeyframesBlock(block) {
          reportKeyframesSizingUnitsCssTree(context, "unitless", block, sc, baseIndex);
        },
      });
    });
  },
);
