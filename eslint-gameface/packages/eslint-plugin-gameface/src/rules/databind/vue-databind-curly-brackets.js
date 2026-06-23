import { hasDataBindCurlyBrackets } from "../../utils/databind-checks.js";
import {
  vueAttributeValueLoc,
  walkVueDataBindAttributes,
} from "../../utils/vue-databind.js";
import { defineVueTemplateVisitor, isVueTemplateElement } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Vue data-bind attributes, values must contain `{{` and `}}`.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding",
    },
    messages: {
      missingBraces:
        "{{name}} attribute value {{value}} must include opening and closing double curly brackets. Example: {{name}}=\"{{...}}\"",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isVueTemplateElement(node)) {
          return;
        }
        walkVueDataBindAttributes(sc, node, ({ name, valueText, attr }) => {
          if (hasDataBindCurlyBrackets(valueText)) {
            return;
          }
          const loc = vueAttributeValueLoc(attr);
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
    });
  },
};
