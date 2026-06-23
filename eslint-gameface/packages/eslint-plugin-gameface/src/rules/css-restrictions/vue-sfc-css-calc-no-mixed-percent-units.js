import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow calc() mixing % with other units in Vue `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface calc() does not support mixing % with other units (e.g. 50% - 20px).",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
        onDeclarationValue(children) {
          reportCalcMixedPercentInValue(context, "mixedPercent", children, sc, baseIndex);
        },
      });
    });
  },
);
