import {
  cssValueReferencesSvgUrl,
  jsxHasMaskAndClipPathUrlConflict,
} from "./svg-jsx-walk.js";
import {
  vueAttributeName,
  vueElementTagName,
  walkVueStartTagAttributes,
} from "./vue-element.js";

export { vueElementTagName };

/**
 * @param {import("eslint").AST.Node | null | undefined} node
 * @returns {boolean}
 */
export function isInsideVueSvgSubtree(node) {
  let cur = node;
  while (cur) {
    if (cur.type === "VElement") {
      const name = vueElementTagName(cur);
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
export function vueOpeningAttributeMap(element) {
  /** @type {Record<string, string>} */
  const out = {};
  if (element.type !== "VElement") {
    return out;
  }
  walkVueStartTagAttributes(element.startTag, (attr, key) => {
    if (attr.type === "VAttribute" && attr.value?.type === "VLiteral" && typeof attr.value.value === "string") {
      out[key.toLowerCase()] = attr.value.value;
    }
    if (attr.type === "VDirective" && attr.key?.name === "bind" && attr.value?.type === "VExpressionContainer") {
      const expr = attr.value.expression;
      if (expr?.type === "Literal" && typeof expr.value === "string") {
        out[key.toLowerCase()] = expr.value;
      }
    }
  });
  return out;
}

export { cssValueReferencesSvgUrl, jsxHasMaskAndClipPathUrlConflict as vueHasMaskAndClipPathUrlConflict };
