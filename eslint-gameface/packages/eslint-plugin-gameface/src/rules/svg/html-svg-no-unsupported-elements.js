import {
  isUnsupportedSvgElementTag,
  SVG_SUPPORT_DOC_URL,
} from "../../data/gameface-svg-support.js";
import { isInsideHtmlSvgSubtree } from "../../utils/svg-html-walk.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow SVG elements and SMIL animation tags not supported by Gameface inside inline <svg>.",
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

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        if (!isInsideHtmlSvgSubtree(node)) {
          return;
        }
        const tag = typeof node.name === "string" ? node.name.toLowerCase() : "";
        if (!tag || ignore.has(tag)) {
          return;
        }
        if (!isUnsupportedSvgElementTag(tag, true)) {
          return;
        }
        context.report({
          loc: {
            start: node.openStart.loc.start,
            end: node.openEnd.loc.end,
          },
          messageId: "unsupported",
          data: { tag },
        });
      },
    };
  },
};
