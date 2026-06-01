import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isKeyframesAtrule,
  reportKeyframesStrokeDashPathOnly,
} from "../../utils/svg-stroke-dash.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes inside HTML <style> (path-only animation in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
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
          reportKeyframesStrokeDashPathOnly(context, "pathOnly", n.block);
        });
      },
    };
  },
};
