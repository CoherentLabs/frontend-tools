import { SVG_SUPPORT_DOC_URL, isPathElementTag } from "../../data/gameface-svg-support.js";
import {
  findStrokeDashInInlineStyle,
  findStrokeDashPresentationAttr,
} from "../../utils/svg-stroke-dash.js";
import {
  isInsideSvelteSvgSubtree,
  svelteElementTagName,
  svelteOpeningAttributeMap,
} from "../../utils/svelte-svg-walk.js";
import { svelteAttributeValueText } from "../../utils/svelte-element.js";
import { walkSvelteStartTagAttributes } from "../../utils/svelte-element.js";
import { defineSvelteMarkupVisitor } from "../../utils/svelte-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow stroke-dasharray and stroke-dashoffset on Svelte SVG elements other than <path>.",
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

    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isInsideSvelteSvgSubtree(node)) {
          return;
        }
        const tag = svelteElementTagName(node);
        if (!tag || isPathElementTag(tag)) {
          return;
        }
        const attrs = svelteOpeningAttributeMap(node);
        let property = findStrokeDashPresentationAttr(attrs);
        if (!property) {
          let styleText = attrs.style || "";
          if (!styleText) {
            walkSvelteStartTagAttributes(node.startTag, (attr, name) => {
              if (name === "style") {
                styleText = svelteAttributeValueText(sc, attr);
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
