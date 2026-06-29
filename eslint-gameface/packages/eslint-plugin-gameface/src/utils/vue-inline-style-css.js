import { walkInlineDeclarations } from "./html-inline-style-css.js";
import {
  vueAttributeName,
  walkVueStartTagAttributes,
} from "./vue-element.js";

/**
 * @param {import("estree").Node | null | undefined} key
 * @returns {string | null}
 */
export function vueStylePropertyName(key) {
  if (!key) {
    return null;
  }
  if (key.type === "Identifier") {
    return key.name;
  }
  if (key.type === "Literal" && typeof key.value === "string") {
    return key.value;
  }
  return null;
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").Node | import("eslint").AST.Node} literalNode
 * @returns {{ inner: string, baseIndex: number } | null}
 */
export function getVueStringLiteralInnerRange(sourceCode, literalNode) {
  const isVLiteral =
    literalNode.type === "VLiteral" && typeof literalNode.value === "string";
  const isLiteral =
    literalNode.type === "Literal" && typeof literalNode.value === "string";
  if (!isVLiteral && !isLiteral) {
    return null;
  }
  const loc = literalNode.loc;
  if (!loc) {
    return null;
  }
  const full = sourceCode.getText(literalNode);
  let startIdx = sourceCode.getIndexFromLoc(loc.start);
  let endIdx = sourceCode.getIndexFromLoc(loc.end);
  if (full.length >= 2) {
    const q = full[0];
    if ((q === '"' || q === "'") && full[full.length - 1] === q) {
      startIdx += 1;
      endIdx -= 1;
    }
  }
  if (startIdx > endIdx) {
    return null;
  }
  const inner = sourceCode.text.slice(startIdx, endIdx);
  return { inner, baseIndex: startIdx };
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @param {(inner: string, baseIndex: number) => void} onCssText
 */
export function walkVueStyleStringValues(sourceCode, attr, onCssText) {
  if (attr.type === "VAttribute") {
    const v = attr.value;
    if (v?.type === "VLiteral" && typeof v.value === "string") {
      const range = getVueStringLiteralInnerRange(sourceCode, v);
      if (range?.inner.trim()) {
        onCssText(range.inner, range.baseIndex);
      }
      return;
    }
    if (v?.type === "VExpressionContainer") {
      const expr = v.expression;
      if (expr?.type === "Literal" && typeof expr.value === "string") {
        const range = getVueStringLiteralInnerRange(sourceCode, expr);
        if (range?.inner.trim()) {
          onCssText(range.inner, range.baseIndex);
        }
      }
    }
    return;
  }
  if (attr.type === "VDirective") {
    const v = attr.value;
    if (v?.type === "VExpressionContainer") {
      const expr = v.expression;
      if (expr?.type === "Literal" && typeof expr.value === "string") {
        const range = getVueStringLiteralInnerRange(sourceCode, expr);
        if (range?.inner.trim()) {
          onCssText(range.inner, range.baseIndex);
        }
      }
    }
  }
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @param {(property: string, propLoc: import("eslint").AST.SourceLocation, valueChildren: { type: string, name: string, loc: import("eslint").AST.SourceLocation }[]) => void} onObjectProperty
 */
export function walkVueStyleObjectProperties(sourceCode, attr, onObjectProperty) {
  let expr = null;
  if (attr.type === "VAttribute" && attr.value?.type === "VExpressionContainer") {
    expr = attr.value.expression;
  } else if (attr.type === "VDirective" && attr.value?.type === "VExpressionContainer") {
    expr = attr.value.expression;
  }
  if (expr?.type !== "ObjectExpression") {
    return;
  }
  for (const prop of expr.properties) {
    if (prop.type !== "Property") {
      continue;
    }
    const property = vueStylePropertyName(prop.key);
    if (!property || !prop.loc) {
      continue;
    }
    const propLoc = {
      start: prop.key.loc?.start ?? prop.loc.start,
      end: prop.key.loc?.end ?? prop.loc.start,
    };
    /** @type {{ type: string, name: string, loc: import("eslint").AST.SourceLocation }[]} */
    const valueChildren = [];
    const val = prop.value;
    if (val?.type === "Literal" && typeof val.value === "string" && val.loc) {
      valueChildren.push({ type: "Identifier", name: val.value, loc: val.loc });
    }
    onObjectProperty(property, propLoc, valueChildren);
  }
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @param {(decl: import("css-tree").Declaration, loc: import("eslint").AST.SourceLocation) => void} onDeclaration
 */
export function walkVueStyleAttributeDeclarations(sourceCode, attr, onDeclaration) {
  walkVueStyleStringValues(sourceCode, attr, (inner, baseIndex) => {
    walkInlineDeclarations(sourceCode, baseIndex, inner, onDeclaration);
  });
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} element
 * @param {(attr: import("eslint").AST.Node) => void} onStyleAttribute
 */
export function walkVueStyleAttributes(sourceCode, element, onStyleAttribute) {
  if (element.type !== "VElement") {
    return;
  }
  walkVueStartTagAttributes(element.startTag, (attr, name) => {
    if (name === "style") {
      onStyleAttribute(attr);
    }
  });
}
