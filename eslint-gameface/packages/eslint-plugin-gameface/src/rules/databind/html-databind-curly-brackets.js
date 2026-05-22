import { getAttributeRawValueText } from "../../utils/html-attribute-text.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Gameface data-bind attribute values must contain `{{` and `}}` (HTMLLint curly-brackets rule).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
    },
    messages: {
      missingBraces:
        "{{name}} attribute value {{value}} must include opening and closing double curly brackets. Example: {{name}}=\"{{...}}\"",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode?.();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        for (const attr of node.attributes || []) {
          const name = attr.key?.value;
          if (typeof name !== "string" || !name.includes("data-bind")) {
            continue;
          }
          const valueText = getAttributeRawValueText(sc, attr);
          if (!valueText.includes("{{") || !valueText.includes("}}")) {
            const loc = attr.value?.loc || attr.key?.loc;
            if (!loc) {
              continue;
            }
            context.report({
              loc,
              messageId: "missingBraces",
              data: { name, value: valueText.trim() || "(empty)" },
            });
          }
        }
      },
    };
  },
};
