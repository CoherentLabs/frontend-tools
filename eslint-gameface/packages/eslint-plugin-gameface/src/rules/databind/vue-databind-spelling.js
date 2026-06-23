import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import {
  buildStaticDataBindAllowlist,
  isAllowedDataBindAttributeName,
} from "../../utils/html-databind-allowlist.js";
import {
  vueAttributeNameLoc,
  walkVueDataBindAttributes,
} from "../../utils/vue-databind.js";
import { defineVueTemplateVisitor, isVueTemplateElement } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Vue template elements, data-bind attribute names must match the Gameface allowlist.",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding",
    },
    messages: {
      invalid:
        "Attribute '{{name}}' was not found as a valid data-binding attribute.",
    },
    schema: [
      {
        type: "object",
        properties: {
          customDataBindAttributes: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{}],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();
    const [{ customDataBindAttributes }] = context.options;
    const staticSet = buildStaticDataBindAllowlist(context, customDataBindAttributes);

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isVueTemplateElement(node)) {
          return;
        }
        const index = getFeatureIndexForContext(context);
        walkVueDataBindAttributes(sc, node, ({ name, attr }) => {
          if (isAllowedDataBindAttributeName(name, staticSet, index)) {
            return;
          }
          const loc = vueAttributeNameLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId: "invalid", data: { name } });
        });
      },
    });
  },
};
