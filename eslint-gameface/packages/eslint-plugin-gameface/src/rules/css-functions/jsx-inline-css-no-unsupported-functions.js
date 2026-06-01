import {
  walkDeclarationValueFunctions,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { reportUnsupportedCssFunction } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX `style` props (string styles), disallow CSS functions listed as missing in gameface-features/functions/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
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
        walkJsxStyleStringValues(sc, node, (inner, baseIndex) => {
          walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
            walkDeclarationValueFunctions(sc, baseIndex, decl, (fnName, loc) => {
              reportUnsupportedCssFunction(context, "unsupported", fnName, loc);
            });
          });
        });
      },
    };
  },
};
