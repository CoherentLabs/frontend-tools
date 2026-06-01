/**
 * @param {import("estree").JSXElement | import("estree").JSXOpeningElement | null | undefined} node
 * @returns {boolean}
 */
export function isInsideJsxSvgSubtree(node) {
  let cur = /** @type {import("estree").Node | null | undefined} */ (node);
  while (cur) {
    if (cur.type === "JSXElement") {
      const name = jsxElementName(cur.openingElement);
      if (name?.toLowerCase() === "svg") {
        return true;
      }
    }
    cur = /** @type {{ parent?: import("estree").Node | null } } */ (cur).parent;
  }
  return false;
}

/**
 * @param {import("estree").JSXOpeningElement} opening
 * @returns {string | null}
 */
export function jsxElementName(opening) {
  const n = opening.name;
  if (!n) {
    return null;
  }
  if (n.type === "JSXIdentifier") {
    return n.name;
  }
  if (n.type === "JSXMemberExpression") {
    return n.property.type === "JSXIdentifier" ? n.property.name : null;
  }
  return null;
}

/**
 * @param {import("estree").JSXOpeningElement} opening
 * @returns {Record<string, string>}
 */
export function jsxOpeningAttributeMap(opening) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const attr of opening.attributes || []) {
    if (attr.type !== "JSXAttribute") {
      continue;
    }
    const key =
      attr.name?.type === "JSXIdentifier"
        ? attr.name.name
        : attr.name?.type === "JSXNamespacedName"
          ? `${attr.name.namespace.name}:${attr.name.name.name}`
          : null;
    if (!key) {
      continue;
    }
    const v = attr.value;
    if (v?.type === "Literal" && typeof v.value === "string") {
      out[key.toLowerCase()] = v.value;
    } else if (v?.type === "JSXExpressionContainer" && v.expression?.type === "Literal") {
      const lit = /** @type {import("estree").Literal} */ (v.expression);
      if (typeof lit.value === "string") {
        out[key.toLowerCase()] = lit.value;
      }
    }
  }
  return out;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function cssValueReferencesSvgUrl(value) {
  return typeof value === "string" && /url\s*\(\s*#/i.test(value);
}

/**
 * @param {Record<string, string>} attrs
 * @returns {boolean}
 */
export function jsxHasMaskAndClipPathUrlConflict(attrs) {
  const mask = attrs.mask || "";
  const clip = attrs["clip-path"] || "";
  return cssValueReferencesSvgUrl(mask) && cssValueReferencesSvgUrl(clip);
}
