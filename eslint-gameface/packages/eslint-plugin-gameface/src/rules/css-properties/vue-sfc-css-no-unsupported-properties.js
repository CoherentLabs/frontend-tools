import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";
import { walkVueSfcStyleDeclarations, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Vue `<style>` blocks, disallow CSS properties listed as unsupported in gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcStyleDeclarations(sc, cssText, baseIndex, (decl, loc) => {
        reportUnsupportedProperty(context, "unsupported", decl.property, loc);
      });
    });
  },
);
