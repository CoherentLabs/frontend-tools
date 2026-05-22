import { reportPseudoIfCatalogMatch } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow CSS pseudo-classes/elements that exactly match gameface-features/selectors/unsupported.json entries.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssselectors/"

    },
    messages: {
      unsupportedSelector:
        "Selector '{{selector}}' is not supported by Gameface.",
    },
    schema: [],
  },
  create(context) {
    return {
      "PseudoClassSelector,PseudoElementSelector"(node) {
        reportPseudoIfCatalogMatch(context, node, {
          unsupported: "unsupportedSelector",
          partial: null,
        });
      },
    };
  },
};
