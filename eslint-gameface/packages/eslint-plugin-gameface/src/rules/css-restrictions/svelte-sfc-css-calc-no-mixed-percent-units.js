import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow calc() mixing % with other units in Svelte `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface calc() does not support mixing % with other units (e.g. 50% - 20px).",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
        onDeclarationValue(children) {
          reportCalcMixedPercentInValue(context, "mixedPercent", children, sc, baseIndex);
        },
      });
    });
  },
);
