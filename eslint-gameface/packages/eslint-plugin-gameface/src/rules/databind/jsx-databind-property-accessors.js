import { findPropertyAccessorViolation } from "../../utils/databind-checks.js";
import {
  jsxAttributeValueLoc,
  walkJsxDataBindAttributes,
} from "../../utils/jsx-databind.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX data-bind values, model property access must be well-formed (same as gameface/html-databind-property-accessors).",
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
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        walkJsxDataBindAttributes(sc, node, ({ valueText, attr }) => {
          const messageId = findPropertyAccessorViolation(valueText);
          if (!messageId) {
            return;
          }
          const loc = jsxAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId });
        });
      },
    };
  },
};
