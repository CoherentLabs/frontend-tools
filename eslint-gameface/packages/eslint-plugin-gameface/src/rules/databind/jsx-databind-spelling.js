import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import {
  buildStaticDataBindAllowlist,
  isAllowedDataBindAttributeName,
} from "../../utils/html-databind-allowlist.js";
import {
  jsxAttributeNameLoc,
  walkJsxDataBindAttributes,
} from "../../utils/jsx-databind.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX elements, data-bind attribute names must match the Gameface allowlist (same as gameface/html-databind-spelling).",
      url: "https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding"
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

    return {
      /** @param {import("estree").JSXOpeningElement} node */
      JSXOpeningElement(node) {
        const index = getFeatureIndexForContext(context);
        walkJsxDataBindAttributes(sc, node, ({ name, attr }) => {
          if (isAllowedDataBindAttributeName(name, staticSet, index)) {
            return;
          }
          const loc = jsxAttributeNameLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId: "invalid", data: { name } });
        });
      },
    };
  },
};
