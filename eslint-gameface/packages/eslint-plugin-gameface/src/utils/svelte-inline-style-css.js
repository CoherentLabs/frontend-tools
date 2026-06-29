import { walkInlineDeclarations } from "./html-inline-style-css.js";
import { walkSvelteStartTagAttributes } from "./svelte-element.js";

/**
 * @param {import("estree").Node | null | undefined} key
 * @returns {string | null}
 */
export function svelteStylePropertyName(key) {
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
 * @param {import("estree").Node} literalNode
 * @returns {{ inner: string, baseIndex: number } | null}
 */
export function getSvelteStringLiteralInnerRange(sourceCode, literalNode) {
  if (literalNode.type !== "Literal" || typeof literalNode.value !== "string") {
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
  return { inner: sourceCode.text.slice(startIdx, endIdx), baseIndex: startIdx };
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").Node} expr
 * @param {(inner: string, baseIndex: number) => void} onCssText
 */
function walkStyleExpression(sourceCode, expr, onCssText) {
  if (!expr) {
    return;
  }
  if (expr.type === "Literal" && typeof expr.value === "string" && expr.loc) {
    const range = getSvelteStringLiteralInnerRange(sourceCode, expr);
    if (range?.inner.trim()) {
      onCssText(range.inner, range.baseIndex);
    }
    return;
  }
  if (expr.type === "TemplateLiteral" && expr.loc) {
    const start = sourceCode.getIndexFromLoc(expr.loc.start);
    const end = sourceCode.getIndexFromLoc(expr.loc.end);
    const raw = sourceCode.text.slice(start, end);
    const inner = raw.length >= 2 && raw[0] === "`" && raw[raw.length - 1] === "`"
      ? raw.slice(1, -1)
      : raw;
    if (inner.trim()) {
      onCssText(inner, start + (raw[0] === "`" ? 1 : 0));
    }
    return;
  }
  if (expr.type === "ConditionalExpression") {
    walkStyleExpression(sourceCode, expr.consequent, onCssText);
    walkStyleExpression(sourceCode, expr.alternate, onCssText);
  }
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @param {(inner: string, baseIndex: number) => void} onCssText
 */
export function walkSvelteStyleStringValues(sourceCode, attr, onCssText) {
  if (attr.type === "SvelteAttribute" || attr.type === "SvelteShorthandAttribute") {
    for (const part of attr.value ?? []) {
      if (part.type === "SvelteLiteral" && typeof part.value === "string" && part.loc) {
        const start = sourceCode.getIndexFromLoc(part.loc.start);
        const end = sourceCode.getIndexFromLoc(part.loc.end);
        const inner = sourceCode.text.slice(start, end);
        if (inner.trim()) {
          onCssText(inner, start);
        }
      }
      if (part.type === "SvelteMustacheTag" && part.expression) {
        walkStyleExpression(sourceCode, part.expression, onCssText);
      }
    }
    return;
  }
  if (attr.type === "SvelteDirective" && attr.kind === "Binding" && attr.expression) {
    walkStyleExpression(sourceCode, attr.expression, onCssText);
  }
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @param {(property: string, propLoc: import("eslint").AST.SourceLocation, valueChildren: { type: string, name: string, loc: import("eslint").AST.SourceLocation }[]) => void} onObjectProperty
 */
export function walkSvelteStyleObjectProperties(sourceCode, attr, onObjectProperty) {
  let expr = null;
  if (attr.type === "SvelteAttribute" || attr.type === "SvelteShorthandAttribute") {
    const part = attr.value?.find((p) => p.type === "SvelteMustacheTag");
    expr = part?.expression ?? null;
  } else if (attr.type === "SvelteDirective" && attr.kind === "Binding") {
    expr = attr.expression ?? null;
  }
  if (expr?.type !== "ObjectExpression") {
    return;
  }
  for (const prop of expr.properties) {
    if (prop.type !== "Property") {
      continue;
    }
    const property = svelteStylePropertyName(prop.key);
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
export function walkSvelteStyleAttributeDeclarations(sourceCode, attr, onDeclaration) {
  walkSvelteStyleStringValues(sourceCode, attr, (inner, baseIndex) => {
    walkInlineDeclarations(sourceCode, baseIndex, inner, onDeclaration);
  });
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} element
 * @param {(attr: import("eslint").AST.Node) => void} onStyleAttribute
 */
export function walkSvelteStyleAttributes(sourceCode, element, onStyleAttribute) {
  if (element.type !== "SvelteElement" || element.kind !== "html") {
    return;
  }
  walkSvelteStartTagAttributes(element.startTag, (attr, name) => {
    if (name === "style") {
      onStyleAttribute(attr);
    }
  });
}
