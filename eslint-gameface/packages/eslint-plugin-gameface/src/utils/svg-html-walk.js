/**
 * @param {import("@html-eslint/types").Tag | { type?: string; name?: string; parent?: unknown } | null | undefined} node
 * @returns {boolean}
 */
export function isInsideHtmlSvgSubtree(node) {
  let cur = /** @type {{ type?: string; name?: string; parent?: unknown } | null | undefined} */ (node);
  while (cur) {
    if (cur.type === "Tag" && typeof cur.name === "string" && cur.name.toLowerCase() === "svg") {
      return true;
    }
    cur = /** @type {{ parent?: unknown } | null | undefined} */ (cur).parent;
  }
  return false;
}

/**
 * @param {import("@html-eslint/types").Tag} node
 * @returns {Record<string, string>}
 */
export function htmlTagAttributeMap(node) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const attr of node.attributes || []) {
    const key = attr.key?.value;
    const val = attr.value?.value;
    if (typeof key === "string" && typeof val === "string") {
      out[key.toLowerCase()] = val;
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
 * @param {string} [inlineStyle]
 * @returns {boolean}
 */
export function hasMaskAndClipPathUrlConflict(attrs, inlineStyle) {
  let mask = attrs.mask || "";
  let clip = attrs["clip-path"] || "";
  if (inlineStyle) {
    const maskM = inlineStyle.match(/(?:^|;)\s*mask\s*:\s*([^;]+)/i);
    const clipM = inlineStyle.match(/(?:^|;)\s*clip-path\s*:\s*([^;]+)/i);
    if (maskM) {
      mask = maskM[1].trim();
    }
    if (clipM) {
      clip = clipM[1].trim();
    }
  }
  return cssValueReferencesSvgUrl(mask) && cssValueReferencesSvgUrl(clip);
}
