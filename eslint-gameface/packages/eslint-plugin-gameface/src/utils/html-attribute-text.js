/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("@html-eslint/types").Attribute} attr
 * @returns {string}
 */
export function getAttributeRawValueText(sourceCode, attr) {
  if (!attr.value) {
    return "";
  }
  return sourceCode.getText(attr.value);
}
