const dotAccessorInBraces = /^\{\{.*\.\}\}[\.'0-9A-Za-z]+/g;
const dotAccessorForModelProp = /^\{\{.*\.\}\}\{\{/g;
const bracketAccessorInBraces = /^\{\{.*\[.*\]\}\}$/g;

export const propertyAccessorChecks = [
  { regexp: dotAccessorInBraces, messageId: "dotInBraces" },
  { regexp: dotAccessorForModelProp, messageId: "splitBraces" },
  { regexp: bracketAccessorInBraces, messageId: "bracketInBraces" },
];

/** @see https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding/ */
const BIND_EXPR = String.raw`\{\{[\s\S]*?\}\}`;
const BIND_FOR_IDENT = String.raw`[A-Za-z_$][A-Za-z0-9_$]*`;
const BIND_FOR_LEFT = new RegExp(
  String.raw`^(?:(?:${BIND_FOR_IDENT})\s*,\s*)?(?:${BIND_FOR_IDENT})\s*$`,
);
const BIND_FOR_ARRAY = new RegExp(
  String.raw`^\[\s*(?:${BIND_EXPR}\s*,?\s*)+\]$`,
);

const BIND_FOR_IDENT_STARTS_WITH_NUMBER = /(?:^|,)\s*\d[A-Za-z0-9_$]*/;

const CLASS_TOGGLE_CLASS = String.raw`[A-Za-z0-9_-]+`;
const CLASS_TOGGLE_ENTRY = new RegExp(
  String.raw`^${CLASS_TOGGLE_CLASS}\s*:\s*(?=.*\{\{)(?=.*\}\})[\s\S]+$`,
);

/**
 * @param {string} valueText
 * @returns {boolean}
 */
export function isValidBindForValue(valueText) {
  const trimmed = valueText.trim();
  if (!trimmed || !trimmed.includes(":")) {
    return false;
  }
  if (trimmed.includes(";")) {
    return false;
  }
  const colonIdx = trimmed.indexOf(":");
  const left = trimmed.slice(0, colonIdx).trim();
  const right = trimmed.slice(colonIdx + 1).trim();
  if (!left || !right || !right.includes("{{") || !right.includes("}}")) {
    return false;
  }
  if (!BIND_FOR_LEFT.test(left)) {
    return false;
  }
  if (right.startsWith("[")) {
    return BIND_FOR_ARRAY.test(right);
  }
  return true;
}

/**
 * @param {string} valueText
 * @returns {boolean}
 */
export function isValidClassToggleValue(valueText) {
  const trimmed = valueText.trim();
  if (!trimmed) {
    return false;
  }
  const entries = trimmed.split(";").map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) {
    return false;
  }
  return entries.every((entry) => CLASS_TOGGLE_ENTRY.test(entry));
}

/**
 * @param {string} valueText
 * @returns {boolean}
 */
export function hasDataBindCurlyBrackets(valueText) {
  return valueText.includes("{{") && valueText.includes("}}");
}

/**
 * @param {string} valueText
 * @returns {string | null} messageId
 */
export function findPropertyAccessorViolation(valueText) {
  for (const rule of propertyAccessorChecks) {
    rule.regexp.lastIndex = 0;
    if (valueText.match(rule.regexp)) {
      return rule.messageId;
    }
  }
  return null;
}

/**
 * @param {string} valueText
 * @returns {string | null} messageId
 */
export function findBindForViolation(valueText) {
  const trimmed = valueText.trim();
  if (isValidBindForValue(trimmed)) {
    return null;
  }
  const beforeColon = trimmed.includes(":") ? trimmed.slice(0, trimmed.indexOf(":")) : trimmed;
  if (BIND_FOR_IDENT_STARTS_WITH_NUMBER.test(beforeColon)) {
    return "startsWithNumber";
  }
  return "missingIterator";
}
