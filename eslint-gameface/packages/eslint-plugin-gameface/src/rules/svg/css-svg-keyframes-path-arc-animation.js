import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isKeyframesAtrule,
  reportKeyframesPathArcAnimation,
} from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when @keyframes animates path d with elliptical arc commands (unreliable interpolation in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathArc:
        "Animating path 'd' with elliptical arc (A/a) commands may not interpolate correctly in Gameface.",
    },
    schema: [],
  },
  create(context) {
    return {
      Atrule(node) {
        if (!isKeyframesAtrule(node) || !node.block) {
          return;
        }
        reportKeyframesPathArcAnimation(context, "pathArc", node.block);
      },
    };
  },
};
