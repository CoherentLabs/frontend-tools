import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportUnsupportedCssFunction } from "../../utils/gameface-css-checks.js";
import { walkDeclarationValueFunctions } from "../../utils/html-inline-style-css.js";
import { walkSvelteSfcStyleDeclarations, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Svelte `<style>` blocks, disallow unsupported CSS functions per gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssfunctions/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcStyleDeclarations(sc, cssText, baseIndex, (decl) => {
        walkDeclarationValueFunctions(sc, baseIndex, decl, (name, loc) => {
          reportUnsupportedCssFunction(context, "unsupported", name, loc);
        });
      });
    });
  },
);
