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
        "Warn when @keyframes animates stroke-dasharray/stroke-dashoffset (only works on SVG <path> in Gameface).",
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
      Atrule(node) {
        if (!isKeyframesAtrule(node) || !node.block) {
          return;
        }
        reportKeyframesStrokeDashPathOnly(context, "pathOnly", node.block);
      },
    };
  },
};
