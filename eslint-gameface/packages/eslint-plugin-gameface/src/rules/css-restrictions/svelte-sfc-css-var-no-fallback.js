import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in Svelte `<style>` blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
        onDeclarationValue(children) {
          reportVarFallbacksInValue(context, "noFallback", children, sc, baseIndex);
        },
      });
    });
  },
);
