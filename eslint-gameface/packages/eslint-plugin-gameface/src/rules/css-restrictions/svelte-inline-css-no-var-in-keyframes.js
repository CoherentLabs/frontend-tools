import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import { walkSvelteStyleStringValues } from "../../utils/svelte-inline-style-css.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";

export default createSvelteInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes in Svelte style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleStringValues(sc, attr, (inner, baseIndex) => {
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
