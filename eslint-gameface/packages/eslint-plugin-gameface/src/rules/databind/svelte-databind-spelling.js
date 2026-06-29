import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import {
  buildStaticDataBindAllowlist,
  isAllowedDataBindAttributeName,
} from "../../utils/html-databind-allowlist.js";
import {
  svelteAttributeNameLoc,
  walkSvelteDataBindAttributes,
} from "../../utils/svelte-databind.js";
import { defineSvelteMarkupVisitor, isSvelteMarkupElement } from "../../utils/svelte-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Svelte template elements, data-bind attribute names must match the Gameface allowlist.",
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

    return defineSvelteMarkupVisitor(context, {
      SvelteElement(node) {
        if (!isSvelteMarkupElement(node)) {
          return;
        }
        const index = getFeatureIndexForContext(context);
        walkSvelteDataBindAttributes(sc, node, ({ name, attr }) => {
          if (isAllowedDataBindAttributeName(name, staticSet, index)) {
            return;
          }
          const loc = svelteAttributeNameLoc(attr);
          if (!loc) {
            return;
          }
          context.report({ loc, messageId: "invalid", data: { name } });
        });
      },
    });
  },
};
