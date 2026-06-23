import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow calc() mixing % with other units in Vue style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface does not support calc() expressions that mix % with px/rem/etc.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
        const ch = decl.value?.children;
        if (ch) {
          reportCalcMixedPercentInValue(context, "mixedPercent", ch, sc, baseIndex);
        }
      });
    });
  },
);
