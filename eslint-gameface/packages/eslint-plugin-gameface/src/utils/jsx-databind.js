/**
 * @param {import("estree").JSXAttribute} attr
 * @returns {string | null}
 */
export function getJsxAttributeName(attr) {
  if (attr.type !== "JSXAttribute") {
    return null;
  }
  const n = attr.name;
  if (n.type === "JSXIdentifier") {
    return n.name;
  }
  if (n.type === "JSXNamespacedName") {
    return `${n.namespace.name}:${n.name.name}`;
  }
  return null;
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").JSXAttribute} attr
 * @returns {string}
 */
export function getJsxAttributeValueText(sourceCode, attr) {
  const v = attr.value;
  if (!v) {
    return "";
  }
  if (v.type === "Literal" && typeof v.value === "string") {
    return sourceCode.getText(v);
  }
  if (v.type === "JSXExpressionContainer") {
    const e = v.expression;
    if (e.type === "Literal" && typeof e.value === "string") {
      return sourceCode.getText(e);
    }
    if (e.type === "TemplateLiteral" && e.expressions.length === 0 && e.quasis.length === 1) {
      return e.quasis[0].value.cooked ?? e.quasis[0].value.raw ?? "";
    }
    return sourceCode.getText(e);
  }
  return sourceCode.getText(v);
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").JSXOpeningElement} node
 * @param {(ctx: { name: string, valueText: string, attr: import("estree").JSXAttribute }) => void} onAttribute
 */
export function walkJsxDataBindAttributes(sourceCode, node, onAttribute) {
  for (const attr of node.attributes) {
    if (attr.type !== "JSXAttribute") {
      continue;
    }
    const name = getJsxAttributeName(attr);
    if (!name || !name.includes("data-bind")) {
      continue;
    }
    onAttribute({
      name,
      valueText: getJsxAttributeValueText(sourceCode, attr),
      attr,
    });
  }
}

/**
 * @param {import("estree").JSXAttribute} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function jsxAttributeNameLoc(attr) {
  return attr.name?.loc ?? null;
}

/**
 * @param {import("estree").JSXAttribute} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function jsxAttributeValueLoc(attr) {
  return attr.value?.loc ?? attr.name?.loc ?? null;
}
