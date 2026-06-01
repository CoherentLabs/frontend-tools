import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import {
  buildStaticDataBindAllowlist,
  isAllowedDataBindAttributeName,
} from "../../utils/html-databind-allowlist.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Gameface data-bind attribute names must match the HTMLLint spelling rule: static allowlist, dynamic `data-bind-style-*` from css/unsupported.json, plus custom names.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
    },
    messages: {
      invalid:
        "Attribute '{{name}}' was not found as a valid data-binding attribute.",
    },
    schema: [
      {
        type: "object",
        properties: {
          customDataBindAttributes: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{}],
  },
  create(context) {
    const [{ customDataBindAttributes }] = context.options;
    const staticSet = buildStaticDataBindAllowlist(context, customDataBindAttributes);

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const index = getFeatureIndexForContext(context);
        for (const attr of node.attributes || []) {
          const name = attr.key?.value;
          if (typeof name !== "string" || !name.includes("data-bind")) {
            continue;
          }
          if (!isAllowedDataBindAttributeName(name, staticSet, index)) {
            const loc = attr.key?.loc || node.openStart?.loc;
            if (!loc) {
              continue;
            }
            context.report({
              loc,
              messageId: "invalid",
              data: { name },
            });
          }
        }
      },
    };
  },
};
