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
        "In @keyframes, width/height/font-size must include units for Gameface SVG CSS animation.",
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
      Atrule(node) {
        if (!isKeyframesAtrule(node) || !node.block) {
          return;
        }
        reportKeyframesSizingUnits(context, "unitless", node.block);
      },
    };
  },
};
