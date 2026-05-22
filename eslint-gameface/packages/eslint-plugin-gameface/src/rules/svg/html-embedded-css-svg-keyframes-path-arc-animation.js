import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
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
        "Warn on path d keyframes with elliptical arcs in HTML <style> blocks.",
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
      StyleTag(node) {
        const ss = node.value?.stylesheet;
        if (!ss) {
          return;
        }
        walkEmbeddedCss(ss, (n) => {
          if (!isKeyframesAtrule(n) || !n.block) {
            return;
          }
          reportKeyframesPathArcAnimation(context, "pathArc", n.block);
        });
      },
    };
  },
};
