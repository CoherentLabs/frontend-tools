/**
 * @param {import("eslint").AST.Node | null | undefined} node
 * @returns {string | null}
 */
export function vueElementTagName(node) {
  if (!node || node.type !== "VElement") {
    return null;
  }
  const name = node.rawName ?? node.name;
  return typeof name === "string" ? name : null;
}

/**
 * @param {import("eslint").AST.Node | null | undefined} key
 * @returns {string | null}
 */
function vueDirectiveKeyName(key) {
  if (!key || key.type !== "VDirectiveKey") {
    return null;
  }
  if (typeof key.name === "string") {
    return key.name;
  }
  if (key.name?.type === "VIdentifier") {
    return key.name.name;
  }
  return null;
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {string | null}
 */
export function vueAttributeName(attr) {
  if (attr.type === "VAttribute") {
    const key = attr.key;
    if (key?.type === "VIdentifier") {
      return key.name;
    }
    if (key?.type === "VDirectiveKey") {
      const dName = vueDirectiveKeyName(key);
      if (dName === "bind" && key.argument?.type === "VIdentifier") {
        return key.argument.name;
      }
      if (key.argument?.type === "VIdentifier") {
        return `v-${dName}:${key.argument.name}`;
      }
      return dName ? `v-${dName}` : null;
    }
    return null;
  }
  if (attr.type === "VDirective") {
    const key = attr.key;
    if (!key || key.type !== "VDirectiveKey") {
      return null;
    }
    const dName = vueDirectiveKeyName(key);
    if (dName === "bind" && key.argument?.type === "VIdentifier") {
      return key.argument.name;
    }
    if (dName === "on" && key.argument?.type === "VIdentifier") {
      return `v-on:${key.argument.name}`;
    }
    if (key.argument?.type === "VIdentifier") {
      return `v-${dName}:${key.argument.name}`;
    }
    return dName ? `v-${dName}` : null;
  }
  return null;
}

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("eslint").AST.Node} attr
 * @returns {string}
 */
export function vueAttributeValueText(sourceCode, attr) {
  if (attr.type === "VAttribute") {
    const v = attr.value;
    if (!v) {
      return "";
    }
    if (v.type === "VLiteral") {
      return typeof v.value === "string" ? v.value : sourceCode.getText(v);
    }
    if (v.type === "VExpressionContainer") {
      const e = v.expression;
      if (e?.type === "Literal" && typeof e.value === "string") {
        return e.value;
      }
      if (e) {
        return sourceCode.getText(e);
      }
    }
    return sourceCode.getText(v);
  }
  if (attr.type === "VDirective") {
    const v = attr.value;
    if (!v) {
      return "";
    }
    if (v.type === "VExpressionContainer" && v.expression) {
      const e = v.expression;
      if (e.type === "Literal" && typeof e.value === "string") {
        return e.value;
      }
      return sourceCode.getText(e);
    }
    return sourceCode.getText(v);
  }
  return "";
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function vueAttributeNameLoc(attr) {
  if (attr.type === "VAttribute") {
    return attr.key?.loc ?? attr.loc ?? null;
  }
  if (attr.type === "VDirective") {
    return attr.key?.loc ?? attr.loc ?? null;
  }
  return null;
}

/**
 * @param {import("eslint").AST.Node} attr
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function vueAttributeValueLoc(attr) {
  if (attr.type === "VAttribute") {
    return attr.value?.loc ?? attr.key?.loc ?? attr.loc ?? null;
  }
  if (attr.type === "VDirective") {
    return attr.value?.loc ?? attr.key?.loc ?? attr.loc ?? null;
  }
  return null;
}

/**
 * @param {import("eslint").AST.Node | null | undefined} startTag
 * @returns {Set<string>}
 */
export function vueStartTagAttributeNamesLower(startTag) {
  /** @type {Set<string>} */
  const out = new Set();
  if (!startTag || startTag.type !== "VStartTag") {
    return out;
  }
  for (const attr of startTag.attributes ?? []) {
    const name = vueAttributeName(attr);
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
export function walkVueStartTagAttributes(startTag, onAttribute) {
  if (!startTag || startTag.type !== "VStartTag") {
    return;
  }
  for (const attr of startTag.attributes ?? []) {
    const name = vueAttributeName(attr);
    if (name) {
      onAttribute(attr, name);
    }
  }
}
