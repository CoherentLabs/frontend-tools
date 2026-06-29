import {
  svelteAttributeNameLoc,
  svelteAttributeValueLoc,
  svelteAttributeValueText,
  walkSvelteStartTagAttributes,
} from "./svelte-element.js";

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} element
 * @param {(ctx: { name: string, valueText: string, attr: import("eslint").AST.Node }) => void} onAttribute
 */
export function walkSvelteDataBindAttributes(sourceCode, element, onAttribute) {
  if (element.type !== "SvelteElement" || element.kind !== "html") {
    return;
  }
  walkSvelteStartTagAttributes(element.startTag, (attr, name) => {
    if (!name.includes("data-bind")) {
      return;
    }
    onAttribute({
      name,
      valueText: svelteAttributeValueText(sourceCode, attr),
      attr,
    });
  });
}

export { svelteAttributeNameLoc, svelteAttributeValueLoc };
