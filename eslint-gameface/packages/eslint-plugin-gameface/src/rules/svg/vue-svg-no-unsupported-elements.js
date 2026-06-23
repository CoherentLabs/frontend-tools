import {
  isUnsupportedSvgElementTag,
  SVG_SUPPORT_DOC_URL,
} from "../../data/gameface-svg-support.js";
import {
  isInsideVueSvgSubtree,
  vueElementTagName,
} from "../../utils/vue-svg-walk.js";
import { defineVueTemplateVisitor } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow unsupported SVG / SMIL elements inside Vue <svg> trees.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unsupported:
        "Element '<{{tag}}>' is not supported inside SVG in Gameface (use CSS animations instead of SMIL).",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreTags: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ ignoreTags: [] }],
  },
  create(context) {
    const [{ ignoreTags }] = context.options;
    const ignore = new Set(
      (ignoreTags || []).filter((t) => typeof t === "string").map((t) => t.toLowerCase()),
    );

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isInsideVueSvgSubtree(node)) {
          return;
        }
        const tag = vueElementTagName(node);
        if (!tag) {
          return;
        }
        const lower = tag.toLowerCase();
        if (ignore.has(lower)) {
          return;
        }
        if (!isUnsupportedSvgElementTag(lower, true)) {
          return;
        }
        if (!node.loc) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "unsupported",
          data: { tag: lower },
        });
      },
    });
  },
};
