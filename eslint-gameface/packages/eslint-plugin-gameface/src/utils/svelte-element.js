/**
 * @param {import("eslint").AST.Node | null | undefined} node
 * @returns {string | null}
 */
export function svelteElementTagName(node) {
  if (!node || node.type !== "SvelteElement" || node.kind !== "html") {
    return null;
  }
  const name = node.name?.name;
  return typeof name === "string" ? name : null;
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {string | null}
 */
export function svelteAttributeName(attr) {
  if (attr.type === "SvelteAttribute" || attr.type === "SvelteShorthandAttribute") {
    return typeof attr.key?.name === "string" ? attr.key.name : null;
  }
  if (attr.type === "SvelteDirective") {
    const keyName = attr.key?.name;
    if (keyName?.type === "SvelteName" && typeof keyName.name === "string") {
      if (attr.kind === "Binding") {
        return keyName.name;
      }
      return `${String(attr.kind).toLowerCase()}:${keyName.name}`;
    }
  }
  return null;
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @returns {string}
 */
export function svelteAttributeValueText(sourceCode, attr) {
  if (attr.type === "SvelteAttribute" || attr.type === "SvelteShorthandAttribute") {
    let out = "";
    for (const part of attr.value ?? []) {
      if (part.type === "SvelteLiteral" && typeof part.value === "string") {
        out += part.value;
      }
      if (part.type === "SvelteMustacheTag" && part.expression) {
        const e = part.expression;
        if (e.type === "Literal" && typeof e.value === "string") {
          out += e.value;
        } else {
          out += sourceCode.getText(e);
        }
      }
    }
    return out;
  }
  if (attr.type === "SvelteDirective" && attr.expression) {
    const e = attr.expression;
    if (e.type === "Literal" && typeof e.value === "string") {
      return e.value;
    }
    return sourceCode.getText(e);
  }
  return "";
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function svelteAttributeNameLoc(attr) {
  return attr.key?.loc ?? attr.loc ?? null;
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function svelteAttributeValueLoc(attr) {
  const first = attr.value?.[0];
  if (first?.loc) {
    return first.loc;
  }
  if (attr.expression?.loc) {
    return attr.expression.loc;
  }
  return attr.key?.loc ?? attr.loc ?? null;
}

/**
 * @param {import("eslint").AST.Node | null | undefined} startTag
 * @returns {Set<string>}
 */
export function svelteStartTagAttributeNamesLower(startTag) {
  /** @type {Set<string>} */
  const out = new Set();
  if (!startTag || startTag.type !== "SvelteStartTag") {
    return out;
  }
  for (const attr of startTag.attributes ?? []) {
    const name = svelteAttributeName(attr);
    if (name) {
      out.add(name.toLowerCase());
    }
  }
  return out;
}

/**
 * @param {import("eslint").AST.Node | null | undefined} startTag
 * @param {(attr: import("eslint").AST.Node, name: string) => void} onAttribute
 */
export function walkSvelteStartTagAttributes(startTag, onAttribute) {
  if (!startTag || startTag.type !== "SvelteStartTag") {
    return;
  }
  for (const attr of startTag.attributes ?? []) {
    const name = svelteAttributeName(attr);
    if (name) {
      onAttribute(attr, name);
    }
  }
}
