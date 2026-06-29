import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import { walkSvelteStyleStringValues } from "../../utils/svelte-inline-style-css.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";

export default createSvelteInlineStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes in Svelte style strings (path-only in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineCssContent(sc, baseIndex, inner, {
        onKeyframesBlock(block) {
          reportKeyframesStrokeDashPathOnlyCssTree(
            context,
            "pathOnly",
            block,
            sc,
            baseIndex,
          );
        },
      });
    });
  },
);
