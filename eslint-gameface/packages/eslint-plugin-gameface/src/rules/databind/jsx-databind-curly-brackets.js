import { hasDataBindCurlyBrackets } from "../../utils/databind-checks.js";
import {
  jsxAttributeValueLoc,
  walkJsxDataBindAttributes,
} from "../../utils/jsx-databind.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX data-bind attributes, values must contain `{{` and `}}` (same as gameface/html-databind-curly-brackets).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
    },
    messages: {
      missingBraces:
        "{{name}} attribute value {{value}} must include opening and closing double curly brackets. Example: {{name}}=\"{{...}}\"",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        walkJsxDataBindAttributes(sc, node, ({ name, valueText, attr }) => {
          if (hasDataBindCurlyBrackets(valueText)) {
            return;
          }
          const loc = jsxAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          context.report({
            loc,
            messageId: "missingBraces",
            data: { name, value: valueText.trim() || "(empty)" },
          });
        });
      },
    };
  },
};
