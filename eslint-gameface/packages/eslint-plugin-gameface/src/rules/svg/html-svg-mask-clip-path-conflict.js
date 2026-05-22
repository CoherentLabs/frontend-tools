import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  getStyleAttributeInnerRange,
} from "../../utils/html-inline-style-css.js";
import {
  hasMaskAndClipPathUrlConflict,
  htmlTagAttributeMap,
  isInsideHtmlSvgSubtree,
} from "../../utils/svg-html-walk.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when an SVG element uses both mask and clip-path with url(#…) (clip-path takes precedence).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      conflict:
        "SVG element uses both mask and clip-path with url(#…); clip-path takes precedence and mask is ignored in Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        if (!isInsideHtmlSvgSubtree(node)) {
          return;
        }
        const attrs = htmlTagAttributeMap(node);
        let inlineStyle = "";
        const styleAttr = (node.attributes || []).find(
          (a) => typeof a.key?.value === "string" && a.key.value.toLowerCase() === "style",
        );
        if (styleAttr?.value) {
          const range = getStyleAttributeInnerRange(sc, styleAttr.value);
          if (range) {
            inlineStyle = range.inner;
          }
        }
        if (!hasMaskAndClipPathUrlConflict(attrs, inlineStyle)) {
          return;
        }
        context.report({
          loc: {
            start: node.openStart.loc.start,
            end: node.openEnd.loc.end,
          },
          messageId: "conflict",
        });
      },
    };
  },
};
