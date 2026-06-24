import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import {
  walkSvelteStyleAttributeDeclarations,
  walkSvelteStyleObjectProperties,
} from "../../utils/svelte-inline-style-css.js";
import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

export default createSvelteInlineStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "On Svelte `:style` / `style` attributes (string or object), disallow CSS properties listed as unsupported in gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleAttributeDeclarations(sc, attr, (decl, loc) => {
      reportUnsupportedProperty(context, "unsupported", decl.property, loc);
    });
    walkSvelteStyleObjectProperties(sc, attr, (property, propLoc) => {
      reportUnsupportedProperty(context, "unsupported", property, propLoc);
    });
  },
);
