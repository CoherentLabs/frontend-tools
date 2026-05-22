import { reportCalcMixedPercentInValue } from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow calc() expressions that mix % with other length units in Gameface.",
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
      "Rule > Block > Declaration"(node) {
        const children = node.value?.children;
        if (!children) {
          return;
        }
        reportCalcMixedPercentInValue(context, "mixedPercent", children);
      },
    };
  },
};
