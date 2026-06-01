import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import {
  isKeyframesAtrule,
  reportFunctionsInKeyframesBlock,
} from "../../utils/gameface-css-restrictions.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow CSS var() inside @keyframes in HTML <style> blocks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      restricted: "CSS var() is not supported inside @keyframes in Gameface.",
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
          if (!isKeyframesAtrule(n) || !n.block) {
            return;
          }
          reportFunctionsInKeyframesBlock(context, "restricted", n.block, (fn) =>
            fn.name.toLowerCase() === "var",
          );
        });
      },
    };
  },
};
