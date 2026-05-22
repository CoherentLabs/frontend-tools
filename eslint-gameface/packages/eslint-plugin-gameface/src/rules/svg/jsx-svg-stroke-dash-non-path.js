import { SVG_SUPPORT_DOC_URL, isPathElementTag } from "../../data/gameface-svg-support.js";
import {
  findStrokeDashInInlineStyle,
  findStrokeDashPresentationAttr,
} from "../../utils/svg-stroke-dash.js";
import { normalizeCssPropertyName } from "../../utils/css-property-name.js";
import { isInsideJsxSvgSubtree, jsxElementName } from "../../utils/svg-jsx-walk.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow stroke-dasharray and stroke-dashoffset on JSX SVG elements other than <path>.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      nonPath:
        "Property '{{property}}' on '<{{tag}}>' is only supported on SVG <path> elements in Gameface.",
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
        const tag = jsxElementName(node);
        if (!tag || isPathElementTag(tag)) {
          return;
        }
        /** @type {Record<string, string>} */
        const attrs = {};
        for (const attr of node.attributes || []) {
          if (attr.type !== "JSXAttribute" || attr.name?.type !== "JSXIdentifier") {
            continue;
          }
          const key = attr.name.name;
          const v = attr.value;
          if (v?.type === "Literal" && typeof v.value === "string") {
            attrs[key] = v.value;
          }
        }
        let property = findStrokeDashPresentationAttr(attrs);
        if (!property) {
          property = findStrokeDashInInlineStyle(attrs.style || "");
        }
        if (!property || !node.loc) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "nonPath",
          data: { tag: tag.toLowerCase(), property },
        });
      },
    };
  },
};
