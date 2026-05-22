import { findBindForViolation } from "../../utils/databind-checks.js";
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
        "On JSX `data-bind-for`, iterator syntax must be valid (same as gameface/html-databind-bind-for).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding/#structural-data-binding"
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

    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        for (const attr of node.attributes) {
          const name = getJsxAttributeName(attr);
          if (!name?.includes("data-bind-for")) {
            continue;
          }
          const valueText = getJsxAttributeValueText(sc, attr);
          const loc = jsxAttributeValueLoc(attr);
          if (!loc) {
            continue;
          }
          const messageId = findBindForViolation(valueText);
          if (messageId) {
            context.report({ loc, messageId });
          }
        }
      },
    };
  },
};
