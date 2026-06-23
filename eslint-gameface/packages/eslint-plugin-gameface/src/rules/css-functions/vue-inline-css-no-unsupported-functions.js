import {
  walkDeclarationValueFunctions,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportUnsupportedCssFunction } from "../../utils/gameface-css-checks.js";

export default createVueInlineStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "On Vue `style` string attributes, disallow CSS functions listed as missing in gameface-features/functions/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineDeclarations(sc, baseIndex, inner, (decl) => {
        walkDeclarationValueFunctions(sc, baseIndex, decl, (fnName, loc) => {
          reportUnsupportedCssFunction(context, "unsupported", fnName, loc);
        });
      });
    });
  },
);
