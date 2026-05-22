import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportUnsupportedFunctionsInValue } from "../../utils/gameface-css-checks.js";

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
      description:
        "Inside HTML `<style>` blocks, disallow CSS functions listed as missing in gameface-features/functions/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
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
          reportUnsupportedFunctionsInValue(
            context,
            "unsupported",
            valueChildrenIterable(n.value),
          );
        });
      },
    };
  },
};
