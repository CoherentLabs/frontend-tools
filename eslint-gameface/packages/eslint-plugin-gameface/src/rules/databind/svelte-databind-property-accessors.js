import { findPropertyAccessorViolation } from "../../utils/databind-checks.js";
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
        "On Svelte data-bind values, model property access must be well-formed.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding",
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

    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isSvelteMarkupElement(node)) {
          return;
        }
        walkSvelteDataBindAttributes(sc, node, ({ valueText, attr }) => {
          const messageId = findPropertyAccessorViolation(valueText);
          if (!messageId) {
            return;
          }
          const loc = svelteAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId });
        });
      },
    });
  },
};
