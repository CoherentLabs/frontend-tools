import {
  isKeyframesAtrule,
  reportFunctionsInKeyframesBlock,
} from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes (Gameface documentation constraint).",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
    },
    schema: [],
  },
  create(context) {
    return {
      Atrule(node) {
        if (!isKeyframesAtrule(node) || !node.block) {
          return;
        }
        reportFunctionsInKeyframesBlock(context, "restricted", node.block, (fn) =>
          fn.name.toLowerCase() === "var",
        );
      },
    };
  },
};
