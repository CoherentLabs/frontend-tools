import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import {
  walkVueStyleAttributeDeclarations,
  walkVueStyleObjectProperties,
} from "../../utils/vue-inline-style-css.js";
import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "On Vue `:style` / `style` attributes (string or object), disallow CSS properties listed as unsupported in gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleAttributeDeclarations(sc, attr, (decl, loc) => {
      reportUnsupportedProperty(context, "unsupported", decl.property, loc);
    });
    walkVueStyleObjectProperties(sc, attr, (property, propLoc) => {
      reportUnsupportedProperty(context, "unsupported", property, propLoc);
    });
  },
);
