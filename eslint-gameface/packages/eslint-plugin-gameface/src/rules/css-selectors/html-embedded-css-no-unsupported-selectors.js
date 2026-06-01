import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportPseudoIfCatalogMatch } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inside HTML `<style>` blocks, disallow unsupported CSS selectors per gameface-features/selectors/unsupported.json.",
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
      StyleTag(node) {
        const ss = node.value?.stylesheet;
        if (!ss) {
          return;
        }
        walkEmbeddedCss(ss, (n) => {
          if (
            n.type !== "CssPseudoClassSelector" &&
            n.type !== "CssPseudoElementSelector"
          ) {
            return;
          }
          reportPseudoIfCatalogMatch(context, n, {
            unsupported: "unsupportedSelector",
            partial: null,
          });
        });
      },
    };
  },
};
