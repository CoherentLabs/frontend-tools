import { isValidClassToggleValue } from "../../utils/databind-checks.js";
import {
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
        "On Vue `data-bind-class-toggle`, class and condition must be present.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding",
    },
    messages: {
      invalid:
        "data-bind-class-toggle must include the name of the class and the condition that would toggle the class. Example: my-class-name:{{Model.name === 'some-name'}};other-class:{{Model.flag}}",
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
          if (!name.includes("data-bind-class-toggle")) {
            return;
          }
          const valueText = vueAttributeValueText(sc, attr);
          if (isValidClassToggleValue(valueText)) {
            return;
          }
          const loc = vueAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId: "invalid" });
        });
      },
    });
  },
};
