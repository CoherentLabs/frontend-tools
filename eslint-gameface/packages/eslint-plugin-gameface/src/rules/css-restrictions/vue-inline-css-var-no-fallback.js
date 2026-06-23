import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in Vue style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
        const ch = decl.value?.children;
        if (ch) {
          reportVarFallbacksInValue(context, "noFallback", ch, sc, baseIndex);
        }
      });
    });
  },
);
