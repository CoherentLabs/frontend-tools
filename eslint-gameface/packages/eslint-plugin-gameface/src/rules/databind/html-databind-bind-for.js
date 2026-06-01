import { findBindForViolation } from "../../utils/databind-checks.js";
import { getAttributeRawValueText } from "../../utils/html-attribute-text.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Gameface `data-bind-for` must use `iter:{{collection}}` or `index, iter:{{collection}}` syntax.",
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
    const sc = context.sourceCode || context.getSourceCode?.();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        for (const attr of node.attributes || []) {
          const name = attr.key?.value;
          if (typeof name !== "string" || !name.includes("data-bind-for")) {
            continue;
          }
          const valueText = getAttributeRawValueText(sc, attr);
          const loc = attr.value?.loc || attr.key?.loc;
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
