import { getAttributeRawValueText } from "../../utils/html-attribute-text.js";

const dotAccessorInBraces = /^\{\{.*\.\}\}[\.'0-9A-Za-z]+/g;
const dotAccessorForModelProp = /^\{\{.*\.\}\}\{\{/g;
const bracketAccessorInBraces = /^\{\{.*\[.*\]\}\}$/g;

const rules = [
  { regexp: dotAccessorInBraces, messageId: "dotInBraces" },
  { regexp: dotAccessorForModelProp, messageId: "splitBraces" },
  { regexp: bracketAccessorInBraces, messageId: "bracketInBraces" },
];

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Gameface data-bind values must access model properties correctly (HTMLLint property-accessors).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
    },
    messages: {
      dotInBraces:
        "Incorrect property access: put the dot outside the brackets or the property name inside. Example: {{Model.property}} or {{Model}}.property",
      splitBraces:
        "Incorrect property access: put the dot outside the curly braces. Example: {{Model}}.{{property}} or {{Model}}[{{property}}]",
      bracketInBraces:
        "Incorrect property access: put bracket accessors outside the curly braces. Example: {{Model}}['property']",
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
          for (const rule of rules) {
            rule.regexp.lastIndex = 0;
            if (valueText.match(rule.regexp)) {
              const loc = attr.value?.loc || attr.key?.loc;
              if (!loc) {
                continue;
              }
              context.report({
                loc,
                messageId: rule.messageId,
              });
            }
          }
        }
      },
    };
  },
};
