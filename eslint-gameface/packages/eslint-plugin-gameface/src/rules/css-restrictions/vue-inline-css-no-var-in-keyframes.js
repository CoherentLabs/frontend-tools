import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes in Vue style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineCssContent(sc, baseIndex, inner, {
        onKeyframesBlock(block) {
          reportFunctionsInKeyframesBlock(
            context,
            "restricted",
            block,
            (fn) => fn.name.toLowerCase() === "var",
            sc,
            baseIndex,
          );
        },
      });
    });
  },
);
