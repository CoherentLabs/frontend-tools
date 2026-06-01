import {
  walkJsxStyleAttributeDeclarations,
  walkJsxStyleObjectProperties,
} from "../../utils/jsx-inline-style-css.js";
import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX `style` props (string or object), disallow CSS properties listed as unsupported in gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("estree").JSXAttribute} node */
      JSXAttribute(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "style") {
          return;
        }
        walkJsxStyleAttributeDeclarations(sc, node, (decl, loc) => {
          reportUnsupportedProperty(context, "unsupported", decl.property, loc);
        });
        walkJsxStyleObjectProperties(sc, node, (property, propLoc) => {
          reportUnsupportedProperty(context, "unsupported", property, propLoc);
        });
      },
    };
  },
};
