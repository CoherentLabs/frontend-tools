import { SVG_SUPPORT_DOC_URL, isPathElementTag } from "../../data/gameface-svg-support.js";
import {
  findStrokeDashInInlineStyle,
  findStrokeDashPresentationAttr,
} from "../../utils/svg-stroke-dash.js";
import {
  isInsideVueSvgSubtree,
  vueElementTagName,
  vueOpeningAttributeMap,
} from "../../utils/vue-svg-walk.js";
import { vueAttributeValueText } from "../../utils/vue-element.js";
import { walkVueStartTagAttributes } from "../../utils/vue-element.js";
import { defineVueTemplateVisitor } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow stroke-dasharray and stroke-dashoffset on Vue SVG elements other than <path>.",
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

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isInsideVueSvgSubtree(node)) {
          return;
        }
        const tag = vueElementTagName(node);
        if (!tag || isPathElementTag(tag)) {
          return;
        }
        const attrs = vueOpeningAttributeMap(node);
        let property = findStrokeDashPresentationAttr(attrs);
        if (!property) {
          let styleText = attrs.style || "";
          if (!styleText) {
            walkVueStartTagAttributes(node.startTag, (attr, name) => {
              if (name === "style") {
                styleText = vueAttributeValueText(sc, attr);
              }
            });
          }
          property = findStrokeDashInInlineStyle(styleText);
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
    });
  },
};
