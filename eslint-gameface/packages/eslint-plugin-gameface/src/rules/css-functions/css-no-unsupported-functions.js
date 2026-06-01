import { reportUnsupportedFunctionsInValue } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow CSS functions that Gameface marks as missing in gameface-features/functions/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupported: "CSS function '{{function}}' is not supported by Gameface.",
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
        reportUnsupportedFunctionsInValue(context, "unsupported", children);
      },
    };
  },
};
