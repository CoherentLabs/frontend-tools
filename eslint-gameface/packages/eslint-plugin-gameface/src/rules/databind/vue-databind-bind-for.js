import { findBindForViolation } from "../../utils/databind-checks.js";
import {
  vueAttributeName,
  vueAttributeValueLoc,
  vueAttributeValueText,
  walkVueStartTagAttributes,
} from "../../utils/vue-element.js";
import { defineVueTemplateVisitor, isVueTemplateElement } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Vue `data-bind-for`, iterator syntax must be valid.",
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

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isVueTemplateElement(node)) {
          return;
        }
        walkVueStartTagAttributes(node.startTag, (attr, name) => {
          if (!name.includes("data-bind-for")) {
            return;
          }
          const valueText = vueAttributeValueText(sc, attr);
          const loc = vueAttributeValueLoc(attr);
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
