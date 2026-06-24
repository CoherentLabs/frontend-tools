import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportFunctionsInKeyframesBlock } from "../../utils/gameface-css-restrictions.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes in Svelte `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
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
