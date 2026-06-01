/**
 * Normalize a CSS property name for catalog lookup (unsupported / partial maps use kebab-case).
 * Handles JSX object keys written in camelCase (e.g. accentColor → accent-color).
 * @param {string} rawProperty
 * @returns {string}
 */
export function normalizeCssPropertyName(rawProperty) {
  if (typeof rawProperty !== "string") {
    return "";
  }
  const trimmed = rawProperty.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("--")) {
    return trimmed.toLowerCase();
  }
  return trimmed
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "")
    .toLowerCase();
}
