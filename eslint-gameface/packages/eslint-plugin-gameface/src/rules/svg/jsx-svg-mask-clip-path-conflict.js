import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  isInsideJsxSvgSubtree,
  jsxHasMaskAndClipPathUrlConflict,
  jsxOpeningAttributeMap,
} from "../../utils/svg-jsx-walk.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when a JSX SVG element uses both mask and clip-path with url(#…).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      conflict:
        "SVG element uses both mask and clip-path with url(#…); clip-path takes precedence and mask is ignored in Gameface.",
    },
    schema: [],
  },
  create(context) {
    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        if (!isInsideJsxSvgSubtree(node)) {
          return;
        }
        const attrs = jsxOpeningAttributeMap(node);
        if (!jsxHasMaskAndClipPathUrlConflict(attrs)) {
          return;
        }
        if (!node.loc) {
          return;
        }
        context.report({ loc: node.loc, messageId: "conflict" });
      },
    };
  },
};
