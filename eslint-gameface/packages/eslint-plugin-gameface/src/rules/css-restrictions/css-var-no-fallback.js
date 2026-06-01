import { reportVarFallbacksInValue } from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow fallback values in var() (Gameface supports var(--name) only).",
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
      "Rule > Block > Declaration"(node) {
        const children = node.value?.children;
        if (!children) {
          return;
        }
        reportVarFallbacksInValue(context, "noFallback", children);
      },
    };
  },
};
