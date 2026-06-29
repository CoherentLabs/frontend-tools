import { walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import { walkSvelteStyleStringValues } from "../../utils/svelte-inline-style-css.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

export default createSvelteInlineStyleRule(
  {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in Svelte style strings.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
        const ch = decl.value?.children;
        if (ch) {
          reportVarFallbacksInValue(context, "noFallback", ch, sc, baseIndex);
        }
      });
    });
  },
);
