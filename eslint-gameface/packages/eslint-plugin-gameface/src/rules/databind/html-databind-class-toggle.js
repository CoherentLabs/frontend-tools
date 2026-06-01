import { isValidClassToggleValue } from "../../utils/databind-checks.js";
import { getAttributeRawValueText } from "../../utils/html-attribute-text.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Gameface `data-bind-class-toggle` must use `class-name:condition` entries separated by `;`.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding/",
    },
    messages: {
      invalid:
        "data-bind-class-toggle must include the name of the class and the condition that would toggle the class. Example: my-class-name:{{Model.name === 'some-name'}};other-class:{{Model.flag}}",
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
          if (typeof name !== "string" || !name.includes("data-bind-class-toggle")) {
            continue;
          }
          const valueText = getAttributeRawValueText(sc, attr);
          if (isValidClassToggleValue(valueText)) {
            continue;
          }
          const loc = attr.value?.loc || attr.key?.loc;
          if (!loc) {
            continue;
          }
          context.report({ loc, messageId: "invalid" });
        }
      },
    };
  },
};
