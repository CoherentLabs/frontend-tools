/**
 * Gameface SVG Support doc mirror (internal; not ESLint settings).
 * @see https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/svgsupport/
 */

export const SVG_SUPPORT_DOC_URL =
  "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/svgsupport/";

/** Elements not supported inside inline SVG (lowercase). `a` only flagged inside SVG subtree. */
export const UNSUPPORTED_SVG_ELEMENTS = [
  "foreignobject",
  "marker",
  "pattern",
  "view",
  "script",
  "image",
  "metadata",
  "switch",
  "textpath",
  "a",
];

/** SMIL animation elements — use CSS animations instead. */
export const SMIL_ANIMATION_ELEMENTS = [
  "animate",
  "animatemotion",
  "animatetransform",
  "set",
  "animatecolor",
];

/** In @keyframes, these must include length units for Gameface SVG CSS animation. */
export const KEYFRAME_PROPERTIES_REQUIRE_UNITS = ["width", "height", "font-size"];

/** Documented as allowed unitless in SVG keyframes (not linted). */
export const KEYFRAME_PROPERTIES_ALLOW_UNITLESS = ["x", "y"];

/**
 * Gameface engine limit (not on SVG Support doc): only `<path>` supports these;
 * CSS animation of them also applies only to path.
 */
export const PATH_ONLY_STROKE_DASH_PROPERTIES = ["stroke-dasharray", "stroke-dashoffset"];

/** SVG shape tags for which stroke-dash* is not supported (lowercase). */
export const NON_PATH_SVG_SHAPE_TAGS = [
  "circle",
  "rect",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "g",
  "use",
  "svg",
  "defs",
  "clippath",
  "mask",
  "lineargradient",
  "radialgradient",
  "stop",
  "symbol",
  "image",
];

/** @type {ReadonlySet<string>} */
export const PATH_ONLY_STROKE_DASH_PROPERTY_SET = new Set(
  PATH_ONLY_STROKE_DASH_PROPERTIES.map((p) => p.toLowerCase()),
);

/** @type {ReadonlySet<string>} */
export const NON_PATH_SVG_SHAPE_TAG_SET = new Set(NON_PATH_SVG_SHAPE_TAGS);

const NON_PATH_SVG_SELECTOR_RE = new RegExp(
  `\\b(?:${NON_PATH_SVG_SHAPE_TAGS.join("|")})\\b`,
  "i",
);

/**
 * @param {string} property
 * @returns {boolean}
 */
export function isPathOnlyStrokeDashProperty(property) {
  if (typeof property !== "string") {
    return false;
  }
  return PATH_ONLY_STROKE_DASH_PROPERTY_SET.has(
    property.trim().toLowerCase().replace(/([A-Z])/g, "-$1").replace(/^-/, ""),
  );
}

/**
 * @param {string} tagName
 * @returns {boolean}
 */
export function isPathElementTag(tagName) {
  return typeof tagName === "string" && tagName.toLowerCase() === "path";
}

/**
 * @param {string} selectorText
 * @returns {boolean}
 */
export function cssSelectorTargetsNonPathSvgShape(selectorText) {
  if (typeof selectorText !== "string" || selectorText.trim() === "") {
    return false;
  }
  if (/\bpath\b/i.test(selectorText) && !NON_PATH_SVG_SELECTOR_RE.test(selectorText)) {
    return false;
  }
  return NON_PATH_SVG_SELECTOR_RE.test(selectorText);
}

/** @type {ReadonlySet<string>} */
export const UNSUPPORTED_SVG_ELEMENT_SET = new Set(UNSUPPORTED_SVG_ELEMENTS);

/** @type {ReadonlySet<string>} */
export const SMIL_ANIMATION_ELEMENT_SET = new Set(SMIL_ANIMATION_ELEMENTS);

/** @type {ReadonlySet<string>} */
export const KEYFRAME_SIZING_PROPERTY_SET = new Set(
  KEYFRAME_PROPERTIES_REQUIRE_UNITS.map((p) => p.toLowerCase()),
);

/**
 * @param {string} tagName
 * @returns {boolean}
 */
export function isSmilAnimationTag(tagName) {
  return typeof tagName === "string" && SMIL_ANIMATION_ELEMENT_SET.has(tagName.toLowerCase());
}

/**
 * @param {string} tagName
 * @param {boolean} insideSvgSubtree
 * @returns {boolean}
 */
export function isUnsupportedSvgElementTag(tagName, insideSvgSubtree) {
  if (!insideSvgSubtree || typeof tagName !== "string") {
    return false;
  }
  const t = tagName.toLowerCase();
  return UNSUPPORTED_SVG_ELEMENT_SET.has(t) || SMIL_ANIMATION_ELEMENT_SET.has(t);
}
