import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in JSX style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      JSXAttribute(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "style") {
          return;
        }
        walkJsxStyleStringValues(sc, node, (inner, baseIndex) => {
          walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
            const ch = decl.value?.children;
            if (ch) {
              reportVarFallbacksInValue(context, "noFallback", ch, sc, baseIndex);
            }
          });
        });
      },
    };
  },
};
