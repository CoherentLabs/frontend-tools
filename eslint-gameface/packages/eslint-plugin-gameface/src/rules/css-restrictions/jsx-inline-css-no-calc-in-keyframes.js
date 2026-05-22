import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow CSS calc() inside @keyframes in JSX style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS calc() is not supported inside @keyframes in Gameface.",
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
          walkInlineCssContent(sc, baseIndex, inner, {
            onKeyframesBlock(block) {
              reportFunctionsInKeyframesBlock(
                context,
                "restricted",
                block,
                (fn) => fn.name.toLowerCase() === "calc",
                sc,
                baseIndex,
              );
            },
          });
        });
      },
    };
  },
};
