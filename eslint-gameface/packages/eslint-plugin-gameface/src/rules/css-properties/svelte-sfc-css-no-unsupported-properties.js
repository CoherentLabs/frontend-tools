import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";
import { walkSvelteSfcStyleDeclarations, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Svelte `<style>` blocks, disallow CSS properties listed as unsupported in gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcStyleDeclarations(sc, cssText, baseIndex, (decl, loc) => {
        reportUnsupportedProperty(context, "unsupported", decl.property, loc);
      });
    });
  },
);
