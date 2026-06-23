import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isInsideVueSvgSubtree,
  vueHasMaskAndClipPathUrlConflict,
  vueOpeningAttributeMap,
} from "../../utils/vue-svg-walk.js";
import { defineVueTemplateVisitor } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when a Vue SVG element uses both mask and clip-path with url(#…).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      conflict:
        "SVG element uses both mask and clip-path with url(#…); clip-path takes precedence and mask is ignored in Gameface.",
    },
    schema: [],
  },
  create(context) {
    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isInsideVueSvgSubtree(node)) {
          return;
        }
        const attrs = vueOpeningAttributeMap(node);
        if (!vueHasMaskAndClipPathUrlConflict(attrs)) {
          return;
        }
        if (!node.loc) {
          return;
        }
        context.report({ loc: node.loc, messageId: "conflict" });
      },
    });
  },
};
