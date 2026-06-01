import { isValidClassToggleValue } from "../../utils/databind-checks.js";
import {
  getJsxAttributeName,
  getJsxAttributeValueText,
  jsxAttributeValueLoc,
} from "../../utils/jsx-databind.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX `data-bind-class-toggle`, class and condition must be present (same as gameface/html-databind-class-toggle).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
    },
    messages: {
      invalid:
        "data-bind-class-toggle must include the name of the class and the condition that would toggle the class. Example: my-class-name:{{Model.name === 'some-name'}};other-class:{{Model.flag}}",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        for (const attr of node.attributes) {
          const name = getJsxAttributeName(attr);
          if (!name?.includes("data-bind-class-toggle")) {
            continue;
          }
          const valueText = getJsxAttributeValueText(sc, attr);
          if (isValidClassToggleValue(valueText)) {
            continue;
          }
          const loc = jsxAttributeValueLoc(attr);
          if (!loc) {
            continue;
          }
          context.report({ loc, messageId: "invalid" });
        }
      },
    };
  },
};
