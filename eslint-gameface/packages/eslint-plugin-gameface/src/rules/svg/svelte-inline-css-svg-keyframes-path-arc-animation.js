import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createSvelteInlineStyleRule } from "../../utils/create-svelte-inline-style-rule.js";
import { walkSvelteStyleStringValues } from "../../utils/svelte-inline-style-css.js";
import { reportKeyframesPathArcCssTree } from "../../utils/svg-css-keyframes.js";

export default createSvelteInlineStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on path d keyframes with elliptical arcs in Svelte style strings.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathArc:
        "Animating path 'd' with elliptical arc (A/a) commands may not interpolate correctly in Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkSvelteStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineCssContent(sc, baseIndex, inner, {
        onKeyframesBlock(block) {
          reportKeyframesPathArcCssTree(context, "pathArc", block, sc, baseIndex);
        },
      });
    });
  },
);
