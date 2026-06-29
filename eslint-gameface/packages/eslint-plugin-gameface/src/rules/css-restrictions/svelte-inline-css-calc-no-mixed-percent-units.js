import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import { walkSvelteStyleStringValues } from "../../utils/svelte-inline-style-css.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

export default createSvelteInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow calc() mixing % with other units in Svelte style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface does not support calc() expressions that mix % with px/rem/etc.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
        const ch = decl.value?.children;
        if (ch) {
          reportCalcMixedPercentInValue(context, "mixedPercent", ch, sc, baseIndex);
        }
      });
    });
  },
);
