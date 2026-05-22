import { SVG_SUPPORT_DOC_URL, isPathElementTag } from "../../data/gameface-svg-support.js";
import { getStyleAttributeInnerRange } from "../../utils/html-inline-style-css.js";
import {
  findStrokeDashInInlineStyle,
  findStrokeDashPresentationAttr,
} from "../../utils/svg-stroke-dash.js";
import { htmlTagAttributeMap, isInsideHtmlSvgSubtree } from "../../utils/svg-html-walk.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow stroke-dasharray and stroke-dashoffset on SVG elements other than <path> (Gameface engine limit).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      nonPath:
        "Property '{{property}}' on '<{{tag}}>' is only supported on SVG <path> elements in Gameface.",
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
        const tag = typeof node.name === "string" ? node.name.toLowerCase() : "";
        if (!tag || isPathElementTag(tag)) {
          return;
        }
        const attrs = htmlTagAttributeMap(node);
        let property = findStrokeDashPresentationAttr(attrs);
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
        if (!property) {
          property = findStrokeDashInInlineStyle(inlineStyle);
        }
        if (!property) {
          return;
        }
        context.report({
          loc: {
            start: node.openStart.loc.start,
            end: node.openEnd.loc.end,
          },
          messageId: "nonPath",
          data: { tag, property },
        });
      },
    };
  },
};
