import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes in Vue `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
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
