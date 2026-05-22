import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportPartialValueIdentifiers, reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inside HTML `<style>` blocks, disallow CSS properties listed as unsupported in gameface-features (same data as gameface/css-no-unsupported-properties).",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
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
          if (n.type !== "CssDeclaration" || typeof n.property !== "string" || !n.loc) {
            return;
          }
          reportUnsupportedProperty(context, "unsupported", n.property, n.loc);
        });
      },
    };
  },
};
