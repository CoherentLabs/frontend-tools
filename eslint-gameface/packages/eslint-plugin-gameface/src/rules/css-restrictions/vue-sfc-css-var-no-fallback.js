import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in Vue `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
        onDeclarationValue(children) {
          reportVarFallbacksInValue(context, "noFallback", children, sc, baseIndex);
        },
      });
    });
  },
);
