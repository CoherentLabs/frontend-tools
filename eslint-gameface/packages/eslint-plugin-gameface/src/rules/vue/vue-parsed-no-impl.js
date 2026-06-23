import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import { vueElementTagName } from "../../utils/vue-element.js";
import { defineVueTemplateVisitor, isVueTemplateElement } from "../../utils/vue-visitor.js";
import CURATED_PARSED_NO_IMPL from "../../utils/curated-parsed-no-impl.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Vue template tags listed as parsed-no-impl in gameface-features/html/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/htmlelements/",
    },
    messages: {
      parsedNoImpl:
        "Element '<{{tag}}>' is not supported in Gameface (generic HTMLElement / no specialized implementation).",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: { enum: ["curated", "all"] },
          ignoreTags: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      {
        scope: "curated",
        ignoreTags: ["meta", "link", "base", "br", "hr", "noscript"],
      },
    ],
  },
  create(context) {
    const index = getFeatureIndexForContext(context);
    const [{ scope, ignoreTags }] = context.options;
    const ignore = new Set((ignoreTags || []).map((t) => t.toLowerCase()));

    return defineVueTemplateVisitor(context, {
      /** @param {import("eslint").AST.Node} node */
      VElement(node) {
        if (!isVueTemplateElement(node)) {
          return;
        }
        const tag = (vueElementTagName(node) ?? "").toLowerCase();
        if (!index.htmlTagsParsedNoImpl.has(tag) || ignore.has(tag)) {
          return;
        }
        if (scope === "curated" && !CURATED_PARSED_NO_IMPL.has(tag)) {
          return;
        }
        if (!node.loc) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "parsedNoImpl",
          data: { tag },
        });
      },
    });
  },
};
