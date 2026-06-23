import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportUnsupportedCssFunction } from "../../utils/gameface-css-checks.js";
import { walkDeclarationValueFunctions } from "../../utils/html-inline-style-css.js";
import { walkVueSfcStyleDeclarations, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Vue `<style>` blocks, disallow unsupported CSS functions per gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssfunctions/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcStyleDeclarations(sc, cssText, baseIndex, (decl) => {
        walkDeclarationValueFunctions(sc, baseIndex, decl, (name, loc) => {
          reportUnsupportedCssFunction(context, "unsupported", name, loc);
        });
      });
    });
  },
);
