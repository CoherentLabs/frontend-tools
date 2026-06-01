import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

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
      description: "Disallow calc() mixing % with other units in HTML <style> blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      mixedPercent:
        "Gameface calc() does not support mixing % with other units (e.g. 50% - 20px).",
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
          reportCalcMixedPercentInValue(
            context,
            "mixedPercent",
            valueChildrenIterable(n.value),
          );
        });
      },
    };
  },
};
