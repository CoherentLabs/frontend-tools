import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { isInsideHtmlSvgSubtree } from "../../utils/svg-html-walk.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on <tspan> inside SVG <text> (Gameface merges tspan text but does not style tspan separately).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      ignored:
        "<tspan> is ignored as a separate element in Gameface; its text is merged into the parent <text>.",
    },
    schema: [],
  },
  create(context) {
    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        if (!isInsideHtmlSvgSubtree(node)) {
          return;
        }
        const tag = typeof node.name === "string" ? node.name.toLowerCase() : "";
        if (tag !== "tspan") {
          return;
        }
        context.report({
          loc: {
            start: node.openStart.loc.start,
            end: node.openEnd.loc.end,
          },
          messageId: "ignored",
        });
      },
    };
  },
};
