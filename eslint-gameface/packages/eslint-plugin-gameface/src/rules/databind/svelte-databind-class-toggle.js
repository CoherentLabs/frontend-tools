import { isValidClassToggleValue } from "../../utils/databind-checks.js";
import {
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
        "On Svelte `data-bind-class-toggle`, class and condition must be present.",
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

    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isSvelteMarkupElement(node)) {
          return;
        }
        walkSvelteStartTagAttributes(node.startTag, (attr, name) => {
          if (!name.includes("data-bind-class-toggle")) {
            return;
          }
          const valueText = svelteAttributeValueText(sc, attr);
          if (isValidClassToggleValue(valueText)) {
            return;
          }
          const loc = svelteAttributeValueLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId: "invalid" });
        });
      },
    });
  },
};
