import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportKeyframesSizingUnitsCssTree } from "../../utils/svg-css-keyframes.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "In Svelte `<style>` @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
        onKeyframesBlock(block) {
          reportKeyframesSizingUnitsCssTree(context, "unitless", block, sc, baseIndex);
        },
      });
    });
  },
);
