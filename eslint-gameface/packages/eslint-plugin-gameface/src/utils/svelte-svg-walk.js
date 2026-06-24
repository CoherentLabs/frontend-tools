import {
  cssValueReferencesSvgUrl,
  jsxHasMaskAndClipPathUrlConflict,
} from "./svg-jsx-walk.js";
import {
  svelteAttributeName,
  svelteElementTagName,
  walkSvelteStartTagAttributes,
} from "./svelte-element.js";

export { svelteElementTagName };

/**
 * @param {import("eslint").AST.Node | null | undefined} node
 * @returns {boolean}
 */
export function isInsideSvelteSvgSubtree(node) {
  let cur = node;
  while (cur) {
    if (cur.type === "SvelteElement" && cur.kind === "html") {
      const name = svelteElementTagName(cur);
      if (name?.toLowerCase() === "svg") {
        return true;
      }
    }
    cur = /** @type {{ parent?: import("eslint").AST.Node | null }} */ (cur).parent;
  }
  return false;
}

/**
 * @param {import("eslint").AST.Node} element
 * @returns {Record<string, string>}
 */
export function svelteOpeningAttributeMap(element) {
  /** @type {Record<string, string>} */
  const out = {};
  if (element.type !== "SvelteElement" || element.kind !== "html") {
    return out;
  }
  walkSvelteStartTagAttributes(element.startTag, (attr, key) => {
    if (attr.type === "SvelteAttribute") {
      for (const part of attr.value ?? []) {
        if (part.type === "SvelteLiteral" && typeof part.value === "string") {
          out[key.toLowerCase()] = part.value;
        }
      }
    }
    if (attr.type === "SvelteDirective" && attr.kind === "Binding" && attr.expression?.type === "Literal") {
      if (typeof attr.expression.value === "string") {
        out[key.toLowerCase()] = attr.expression.value;
      }
    }
  });
  return out;
}

export {
  cssValueReferencesSvgUrl,
  jsxHasMaskAndClipPathUrlConflict as svelteHasMaskAndClipPathUrlConflict,
};
