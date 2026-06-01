import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow calc() mixing % with other units in JSX style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface calc() does not support mixing % with other units (e.g. 50% - 20px).",
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
              reportCalcMixedPercentInValue(
                context,
                "mixedPercent",
                ch,
                sc,
                baseIndex,
              );
            }
          });
        });
      },
    };
  },
};
