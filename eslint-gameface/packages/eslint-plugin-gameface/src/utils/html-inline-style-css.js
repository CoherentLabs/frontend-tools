import { parse, walk } from "css-tree";

/**
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("@html-eslint/types").AttributeValue} valueNode
 * @returns {{ inner: string, baseIndex: number } | null}
 */
export function getStyleAttributeInnerRange(sourceCode, valueNode) {
  const loc = valueNode.loc;
  if (!loc) {
    return null;
  }
  const full = sourceCode.getText(valueNode);
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
 * Map css-tree `positions` loc (offsets relative to parsed `inner`) to ESLint source range.
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex start index of `inner` in the full file
 * @param {{ start: { offset: number }, end: { offset: number } }} treeLoc
 * @returns {import("eslint").AST.SourceLocation}
 */
export function eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, treeLoc) {
  const start = sourceCode.getLocFromIndex(baseIndex + treeLoc.start.offset);
  const end = sourceCode.getLocFromIndex(baseIndex + treeLoc.end.offset);
  return { start, end };
}

/**
 * @param {string} text
 * @param {number} line 1-based
 * @param {number} column 0-based (ESLint)
 */
export function offsetAtLineColumn(text, line, column) {
  let l = 1;
  let i = 0;
  while (l < line && i < text.length) {
    const ch = text[i];
    if (ch === "\n") {
      l++;
      i++;
    } else if (ch === "\r") {
      if (text[i + 1] === "\n") {
        i += 2;
      } else {
        i++;
      }
      l++;
    } else {
      i++;
    }
  }
  return i + column;
}

/**
 * @param {string} text
 * @param {number} offset
 * @returns {{ line: number, column: number }}
 */
export function lineColumnAtOffset(text, offset) {
  let line = 1;
  let column = 0;
  const n = Math.min(Math.max(0, offset), text.length);
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (ch === "\n") {
      line++;
      column = 0;
    } else if (ch === "\r") {
      if (text[i + 1] === "\n") {
        i++;
      }
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return { line, column };
}

/**
 * Parse inline declaration list; on parse error returns false (caller should skip).
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 * @param {string} inner
 * @param {(decl: import("css-tree").Declaration, loc: import("eslint").AST.SourceLocation) => void} onDeclaration
 */
export function walkInlineDeclarations(sourceCode, baseIndex, inner, onDeclaration) {
  let ast;
  try {
    ast = parse(inner, { context: "declarationList", positions: true });
  } catch {
    return false;
  }
  walk(ast, (node) => {
    if (node.type === "Declaration" && node.loc && typeof node.property === "string") {
      const loc = eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc);
      onDeclaration(node, loc);
    }
  });
  return true;
}

/**
 * Walk value identifiers for one declaration (partial keyword checks).
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 * @param {import("css-tree").Declaration} decl
 * @param {(ident: import("css-tree").Identifier, loc: import("eslint").AST.SourceLocation) => void} onIdentifier
 */
export function walkDeclarationValueIdentifiers(sourceCode, baseIndex, decl, onIdentifier) {
  if (!decl.value) {
    return;
  }
  walk(decl.value, (node) => {
    if (node.type === "Identifier" && node.loc && typeof node.name === "string") {
      const loc = eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc);
      onIdentifier(node, loc);
    }
  });
}

/**
 * Walk CSS function calls in one declaration value.
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 * @param {import("css-tree").Declaration} decl
 * @param {(name: string, loc: import("eslint").AST.SourceLocation) => void} onFunction
 */
/**
 * Parse inline CSS as stylesheet (or declaration list fallback); visit keyframes blocks and declarations.
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 * @param {string} inner
 * @param {{
 *   onKeyframesBlock?: (block: import("css-tree").Block) => void;
 *   onDeclarationValue?: (valueChildren: unknown, decl: import("css-tree").Declaration) => void;
 * }} handlers
 * @returns {boolean}
 */
export function walkInlineCssContent(sourceCode, baseIndex, inner, handlers) {
  /** @type {import("css-tree").CssNode | null} */
  let ast = null;
  try {
    ast = parse(inner, { context: "stylesheet", positions: true });
  } catch {
    try {
      ast = parse(inner, { context: "declarationList", positions: true });
    } catch {
      return false;
    }
  }
  walk(ast, (node) => {
    if (node.type === "Atrule" && node.name === "keyframes" && node.block) {
      handlers.onKeyframesBlock?.(node.block);
    }
    if (node.type === "Declaration" && node.value) {
      const ch = node.value.children;
      if (ch) {
        handlers.onDeclarationValue?.(ch, node);
      }
    }
  });
  return true;
}

export function walkDeclarationValueFunctions(sourceCode, baseIndex, decl, onFunction) {
  if (!decl.value) {
    return;
  }
  walk(decl.value, (node) => {
    if (node.type === "Function" && node.loc && typeof node.name === "string") {
      const treeLoc = node.loc;
      const start = sourceCode.getLocFromIndex(baseIndex + treeLoc.start.offset);
      const end = sourceCode.getLocFromIndex(
        baseIndex + treeLoc.start.offset + node.name.length,
      );
      onFunction(node.name, { start, end });
    }
  });
}
