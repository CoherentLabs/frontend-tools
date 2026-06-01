import { reportPartialPseudoIfCatalogMatch } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when a pseudo-class/element source text exactly matches an entry in gameface-features/selectors/partial.json (e.g. :nth-child(2 of .x)); simple :nth-child(2) is not listed and will not warn.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssselectors/"
    },
    messages: {
      partialSelector:
        "Selector '{{selector}}' is only partially supported in Gameface: {{note}}",
    },
    schema: [],
  },
  create(context) {
    return {
      "PseudoClassSelector,PseudoElementSelector"(node) {
        reportPartialPseudoIfCatalogMatch(context, node, "partialSelector");
      },
    };
  },
};
