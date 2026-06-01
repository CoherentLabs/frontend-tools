import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isKeyframesAtrule,
  reportKeyframesSizingUnits,
} from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "In HTML <style> @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
    },
    schema: [],
  },
  create(context) {
    return {
      StyleTag(node) {
        const ss = node.value?.stylesheet;
        if (!ss) {
          return;
        }
        walkEmbeddedCss(ss, (n) => {
          if (!isKeyframesAtrule(n) || !n.block) {
            return;
          }
          reportKeyframesSizingUnits(context, "unitless", n.block);
        });
      },
    };
  },
};
