import { functionNameLoc } from "./gameface-css-checks.js";

/**
 * @param {object} node
 * @param {(node: object) => void} visitor
 */
function walkNodeTree(node, visitor) {
  if (!node || typeof node !== "object") {
    return;
  }
  visitor(node);
  const children = /** @type {{ children?: unknown }} */ (node).children;
  if (children == null) {
    return;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const child of list) {
    if (child && typeof child === "object") {
      walkNodeTree(/** @type {object} */ (child), visitor);
    }
  }
}

/** Length units for calc mixed-% check (excludes %, fr, deg, etc.). */
const LENGTH_DIMENSION_UNITS = new Set([
  "px",
  "em",
  "rem",
  "ex",
  "ch",
  "vw",
  "vh",
  "vi",
  "vb",
  "vmin",
  "vmax",
  "svw",
  "svh",
  "lvw",
  "lvh",
  "dvw",
  "dvh",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "q",
  "lh",
  "rlh",
  "cap",
  "ic",
]);

/**
 * @param {unknown} children
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 * @returns {Generator<{ node: object, name: string, loc: import("eslint").AST.SourceLocation }>}
 */
export function* walkFunctionNodesInValueChildren(children, sourceCode, baseIndex) {
  if (children == null) {
    return;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const node = /** @type {{ type?: string, name?: string, loc?: import("eslint").AST.SourceLocation | null, children?: unknown }} */ (
      raw
    );
    if (
      (node.type === "Function" || node.type === "CssFunction") &&
      typeof node.name === "string" &&
      node.loc
    ) {
      const loc = functionNameLoc(node, sourceCode, baseIndex);
      if (loc) {
        yield { node, name: node.name, loc };
      }
    }
    if (node.children != null) {
      yield* walkFunctionNodesInValueChildren(node.children, sourceCode, baseIndex);
    }
  }
}

/**
 * @param {object} node
 * @returns {boolean}
 */
export function isKeyframesAtrule(node) {
  if (!node || typeof node !== "object") {
    return false;
  }
  const n = /** @type {{ type?: string, name?: string }} */ (node);
  return (
    (n.type === "Atrule" || n.type === "CssAtrule") &&
    typeof n.name === "string" &&
    n.name.toLowerCase() === "keyframes"
  );
}

/**
 * @param {object} block
 * @param {(decl: { property?: string, value?: { children?: unknown } }) => void} onDeclaration
 */
export function visitDeclarationsInBlock(block, onDeclaration) {
  if (!block || typeof block !== "object") {
    return;
  }
  const children = /** @type {{ children?: unknown }} */ (block).children;
  if (children == null) {
    return;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const child of list) {
    if (!child || typeof child !== "object") {
      continue;
    }
    const c = /** @type {{ type?: string, block?: object, property?: string, value?: { children?: unknown } }} */ (
      child
    );
    if (c.type === "Rule" || c.type === "CssRule") {
      visitDeclarationsInBlock(c.block, onDeclaration);
    } else if (
      (c.type === "Declaration" || c.type === "CssDeclaration") &&
      c.value
    ) {
      onDeclaration(c);
    }
  }
}

/**
 * @param {object} fnNode Function / CssFunction AST node
 * @returns {boolean}
 */
export function hasVarFallback(fnNode) {
  if (!fnNode || typeof fnNode !== "object") {
    return false;
  }
  const name = /** @type {{ name?: string }} */ (fnNode).name;
  if (typeof name !== "string" || name.toLowerCase() !== "var") {
    return false;
  }
  const children = /** @type {{ children?: unknown }} */ (fnNode).children;
  if (children == null) {
    return false;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const child of list) {
    if (!child || typeof child !== "object") {
      continue;
    }
    const c = /** @type {{ type?: string, value?: string }} */ (child);
    if (c.type === "Operator" && c.value === ",") {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} unit
 * @returns {boolean}
 */
function isLengthDimensionUnit(unit) {
  return typeof unit === "string" && LENGTH_DIMENSION_UNITS.has(unit.toLowerCase());
}

/**
 * @param {object} fnNode calc Function / CssFunction node
 * @returns {boolean}
 */
export function calcMixesPercentWithDimensions(fnNode) {
  if (!fnNode || typeof fnNode !== "object") {
    return false;
  }
  const name = /** @type {{ name?: string }} */ (fnNode).name;
  if (typeof name !== "string" || name.toLowerCase() !== "calc") {
    return false;
  }

  let hasPercent = false;
  let hasLengthDimension = false;

  walkNodeTree(fnNode, (node) => {
    const n = /** @type {{ type?: string, unit?: string }} */ (node);
    if (n.type === "Percentage") {
      hasPercent = true;
    }
    if (n.type === "Dimension" && typeof n.unit === "string") {
      if (n.unit === "%") {
        hasPercent = true;
      } else if (isLengthDimensionUnit(n.unit)) {
        hasLengthDimension = true;
      }
    }
  });

  return hasPercent && hasLengthDimension;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {import("eslint").AST.SourceLocation} loc
 * @param {Record<string, string>} [data]
 */
export function reportRestriction(context, messageId, loc, data = {}) {
  context.report({ loc, messageId, data });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {unknown} valueChildren
 * @param {(fn: { node: object, name: string, loc: import("eslint").AST.SourceLocation }) => boolean} shouldReport
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
export function reportFunctionsInValueWhere(
  context,
  messageId,
  valueChildren,
  shouldReport,
  sourceCode,
  baseIndex,
) {
  for (const fn of walkFunctionNodesInValueChildren(valueChildren, sourceCode, baseIndex)) {
    if (shouldReport(fn)) {
      reportRestriction(context, messageId, fn.loc);
    }
  }
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {object} block
 * @param {(fn: { node: object, name: string, loc: import("eslint").AST.SourceLocation }) => boolean} shouldReport
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
export function reportFunctionsInKeyframesBlock(
  context,
  messageId,
  block,
  shouldReport,
  sourceCode,
  baseIndex,
) {
  visitDeclarationsInBlock(block, (decl) => {
    const children = decl.value?.children;
    if (!children) {
      return;
    }
    reportFunctionsInValueWhere(
      context,
      messageId,
      children,
      shouldReport,
      sourceCode,
      baseIndex,
    );
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {unknown} valueChildren
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
export function reportVarFallbacksInValue(context, messageId, valueChildren, sourceCode, baseIndex) {
  reportFunctionsInValueWhere(
    context,
    messageId,
    valueChildren,
    (fn) => hasVarFallback(fn.node),
    sourceCode,
    baseIndex,
  );
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {unknown} valueChildren
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
export function reportCalcMixedPercentInValue(
  context,
  messageId,
  valueChildren,
  sourceCode,
  baseIndex,
) {
  reportFunctionsInValueWhere(
    context,
    messageId,
    valueChildren,
    (fn) => calcMixesPercentWithDimensions(fn.node),
    sourceCode,
    baseIndex,
  );
}
