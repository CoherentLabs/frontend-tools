import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isInsideSvelteSvgSubtree,
  svelteHasMaskAndClipPathUrlConflict,
  svelteOpeningAttributeMap,
} from "../../utils/svelte-svg-walk.js";
import { defineSvelteMarkupVisitor } from "../../utils/svelte-visitor.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when a Svelte SVG element uses both mask and clip-path with url(#…).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      conflict:
        "SVG element uses both mask and clip-path with url(#…); clip-path takes precedence and mask is ignored in Gameface.",
    },
    schema: [],
  },
  create(context) {
    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isInsideSvelteSvgSubtree(node)) {
          return;
        }
        const attrs = svelteOpeningAttributeMap(node);
        if (!svelteHasMaskAndClipPathUrlConflict(attrs)) {
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
