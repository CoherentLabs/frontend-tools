import { findBindForViolation } from "../../utils/databind-checks.js";
import {
  svelteAttributeName,
  svelteAttributeValueLoc,
  svelteAttributeValueText,
  walkSvelteStartTagAttributes,
} from "../../utils/svelte-element.js";
import { defineSvelteMarkupVisitor, isSvelteMarkupElement } from "../../utils/svelte-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Svelte `data-bind-for`, iterator syntax must be valid.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding/#structural-data-binding",
    },
    messages: {
      startsWithNumber:
        "data-bind-for item and iterator properties must not start with numbers. Example: index1, iter2 : {{Model.arrayProperty}} or index, iter : [ {{myModel.arrayProperty}}, {{myModel.arrayProperty}} ]",
      missingIterator:
        "data-bind-for must include an iterator and the iterable object. Example: index, iter : {{Model.arrayProperty}} or weapon:{{player.weapons}}",
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
        walkSvelteStartTagAttributes(node.startTag, (attr, name) => {
          if (!name.includes("data-bind-for")) {
            return;
          }
          const valueText = svelteAttributeValueText(sc, attr);
          const loc = svelteAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          const messageId = findBindForViolation(valueText);
          if (messageId) {
            context.report({ loc, messageId });
          }
        });
      },
    });
  },
};
