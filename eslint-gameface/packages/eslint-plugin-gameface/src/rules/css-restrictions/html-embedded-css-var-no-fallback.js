import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

function valueChildrenIterable(value) {
  if (!value || !value.children) {
    return [];
  }
  const ch = value.children;
  return Array.isArray(ch) ? ch : [...ch];
}

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow var() fallback values in HTML <style> blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      noFallback:
        "Gameface does not support fallback values in var(). Use var(--name) only.",
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
          if (n.type !== "CssDeclaration" || !n.value) {
            return;
          }
          reportVarFallbacksInValue(
            context,
            "noFallback",
            valueChildrenIterable(n.value),
          );
        });
      },
    };
  },
};
