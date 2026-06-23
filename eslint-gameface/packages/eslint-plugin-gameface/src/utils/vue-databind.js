import {
  vueAttributeNameLoc,
  vueAttributeValueLoc,
  vueAttributeValueText,
  walkVueStartTagAttributes,
} from "./vue-element.js";

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} element
 * @param {(ctx: { name: string, valueText: string, attr: import("eslint").AST.Node }) => void} onAttribute
 */
export function walkVueDataBindAttributes(sourceCode, element, onAttribute) {
  if (element.type !== "VElement") {
    return;
  }
  walkVueStartTagAttributes(element.startTag, (attr, name) => {
    if (!name.includes("data-bind")) {
      return;
    }
    onAttribute({
      name,
      valueText: vueAttributeValueText(sourceCode, attr),
      attr,
    });
  });
}

export { vueAttributeNameLoc, vueAttributeValueLoc };
