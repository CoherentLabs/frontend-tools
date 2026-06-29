import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import {
  pseudoTextForCatalog,
  reportPseudoIfCatalogMatchByText,
} from "../../utils/gameface-css-checks.js";
import { walkSvelteSfcStyleNodes, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Svelte `<style>` blocks, disallow unsupported CSS selectors per gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssselectors/",
    },
    messages: {
      unsupportedSelector: "Selector '{{selector}}' is not supported by Gameface.",
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
        const trimmed = pseudoTextForCatalog(node, () => text);
        reportPseudoIfCatalogMatchByText(context, trimmed, loc, {
          unsupported: "unsupportedSelector",
          partial: null,
        });
      });
    });
  },
);
