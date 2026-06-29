import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import {
  pseudoTextForCatalog,
  reportPartialPseudoIfCatalogMatch,
} from "../../utils/gameface-css-checks.js";
import { walkSvelteSfcStyleNodes, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Inside Svelte `<style>` blocks, warn on partially supported CSS selectors per gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssselectors/",
    },
    messages: {
      partialSelector:
        "Selector '{{selector}}' is only partially supported in Gameface: {{note}}",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcStyleNodes(sc, cssText, baseIndex, (node, loc) => {
        if (node.type !== "PseudoClassSelector" && node.type !== "PseudoElementSelector") {
          return;
        }
        const text = sc.text.slice(sc.getIndexFromLoc(loc.start), sc.getIndexFromLoc(loc.end));
        reportPartialPseudoIfCatalogMatch(
          context,
          { ...node, loc },
          "partialSelector",
          () => pseudoTextForCatalog(node, () => text),
        );
      });
    });
  },
);
