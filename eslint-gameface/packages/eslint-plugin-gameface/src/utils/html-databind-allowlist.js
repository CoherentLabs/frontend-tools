import {
  HTML_DATABIND_BASE_ATTRIBUTE_NAMES,
  HTML_DATABIND_STYLE_LEGACY_FULL_NAMES,
} from "../data/html-databind-base-names.js";
import { isCssPropertyAllowedForDataBindStyle } from "../gameface-features/index.js";

const STYLE_PREFIX = "data-bind-style-";

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string[] | undefined} optionCustom
 * @returns {Set<string>} lowercased static allowlist (base + legacy + custom); does not include dynamic style keys.
 */
export function buildStaticDataBindAllowlist(context, optionCustom) {
  const set = new Set();
  for (const n of HTML_DATABIND_BASE_ATTRIBUTE_NAMES) {
    set.add(n.toLowerCase());
  }
  for (const n of HTML_DATABIND_STYLE_LEGACY_FULL_NAMES) {
    set.add(n.toLowerCase());
  }
  for (const c of getCustomDataBindAttributeNames(context, optionCustom)) {
    set.add(c.toLowerCase());
  }
  return set;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string[] | undefined} optionCustom
 * @returns {string[]}
 */
export function getCustomDataBindAttributeNames(context, optionCustom) {
  const fromSettings = context.settings?.gameface?.customDataBindAttributes;
  const a = Array.isArray(fromSettings) ? fromSettings.filter((x) => typeof x === "string") : [];
  const b = Array.isArray(optionCustom) ? optionCustom.filter((x) => typeof x === "string") : [];
  return [...a, ...b];
}

/**
 * @param {string} attrName
 * @param {Set<string>} staticAllowlistLower
 * @param {import("../gameface-features/index.js").GamefaceFeatureIndex} index
 */
export function isAllowedDataBindAttributeName(attrName, staticAllowlistLower, index) {
  if (typeof attrName !== "string" || !attrName.includes("data-bind")) {
    return true;
  }
  const lower = attrName.toLowerCase();
  if (staticAllowlistLower.has(lower)) {
    return true;
  }
  if (lower.startsWith(STYLE_PREFIX)) {
    const suffix = attrName.slice(STYLE_PREFIX.length);
    return isCssPropertyAllowedForDataBindStyle(suffix, index);
  }
  return false;
}
