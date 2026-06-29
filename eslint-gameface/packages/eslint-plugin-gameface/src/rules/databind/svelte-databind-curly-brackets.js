import { hasDataBindCurlyBrackets } from "../../utils/databind-checks.js";
import {
  svelteAttributeValueLoc,
  walkSvelteDataBindAttributes,
} from "../../utils/svelte-databind.js";
import { defineSvelteMarkupVisitor, isSvelteMarkupElement } from "../../utils/svelte-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Svelte data-bind attributes, values must contain `{{` and `}}`.",
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

    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isSvelteMarkupElement(node)) {
          return;
        }
        walkSvelteDataBindAttributes(sc, node, ({ name, valueText, attr }) => {
          if (hasDataBindCurlyBrackets(valueText)) {
            return;
          }
          const loc = svelteAttributeValueLoc(attr);
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
