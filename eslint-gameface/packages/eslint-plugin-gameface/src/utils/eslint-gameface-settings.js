/**
 * Default catalog: JSON under `gameface-features/` at package root (shipped with the plugin).
 * Set `settings.gameface.version` to load from `gameface-features/versions/<version>/` when that directory exists.
 */
export const DEFAULT_GAMEFACE_VERSION = "latest";

/**
 * @param {unknown} v
 * @returns {v is string}
 */
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim() !== "";
}

/**
 * Reject path segments that could escape `gameface-features/versions/`.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeGamefaceVersionSetting(raw) {
  if (!isNonEmptyString(raw)) {
    return DEFAULT_GAMEFACE_VERSION;
  }
  const v = raw.trim();
  if (v.includes("..") || v.includes("/") || v.includes("\\")) {
    return DEFAULT_GAMEFACE_VERSION;
  }
  return v;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @returns {string}
 */
export function getGamefaceVersionFromContext(context) {
  const g = context.settings?.gameface;
  if (!g || typeof g !== "object") {
    return DEFAULT_GAMEFACE_VERSION;
  }
  return normalizeGamefaceVersionSetting(g.version);
}
