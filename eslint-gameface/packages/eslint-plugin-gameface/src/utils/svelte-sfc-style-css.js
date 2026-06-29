/**
 * @param {import("eslint").AST.Node} styleElement
 * @param {import("eslint").SourceCode} sourceCode
 * @returns {{ cssText: string, baseIndex: number } | null}
 */
export function getSvelteStyleBlockTextRange(styleElement, sourceCode) {
  if (styleElement.type !== "SvelteStyleElement") {
    return null;
  }
  let cssText = "";
  let baseIndex = null;
  for (const child of styleElement.children ?? []) {
    if (child.type === "SvelteText" && typeof child.value === "string") {
      if (baseIndex === null && child.loc) {
        baseIndex = sourceCode.getIndexFromLoc(child.loc.start);
      }
      cssText += child.value;
    }
  }
  if (!cssText.trim() || baseIndex === null) {
    return null;
  }
  return { cssText, baseIndex };
}
