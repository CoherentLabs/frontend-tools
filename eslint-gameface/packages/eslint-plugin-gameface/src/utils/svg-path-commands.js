/** Elliptical arc commands in SVG path data (`A` / `a`). */
const ELLIPTICAL_ARC_IN_PATH = /(^|[^a-zA-Z])[Aa]\s/;

/**
 * @param {string} d
 * @returns {boolean}
 */
export function pathDHasEllipticalArc(d) {
  return typeof d === "string" && ELLIPTICAL_ARC_IN_PATH.test(d);
}
