import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportPartialPseudoIfCatalogMatch } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Inside HTML `<style>` blocks, warn on selectors that exactly match gameface-features/selectors/partial.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
    },
    messages: {
      partialSelector:
        "Selector '{{selector}}' is only partially supported in Gameface: {{note}}",
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
          reportPartialPseudoIfCatalogMatch(context, n, "partialSelector");
        });
      },
    };
  },
};
