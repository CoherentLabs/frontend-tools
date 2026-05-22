import { walk as cssTreeWalk } from "css-tree";
import { KEYFRAME_SIZING_PROPERTY_SET } from "../data/gameface-svg-support.js";
import { normalizeCssPropertyName } from "./css-property-name.js";
import { functionNameLoc } from "./gameface-css-checks.js";
import {
  isKeyframesAtrule,
  reportRestriction,
  visitDeclarationsInBlock,
} from "./gameface-css-restrictions.js";
import { eslintLocRangeFromCssTreeOffsets } from "./html-inline-style-css.js";
import { pathDHasEllipticalArc } from "./svg-path-commands.js";

/**
 * @param {unknown} children
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 * @returns {string}
 */
function rawValueTextFromChildren(children, sourceCode, baseIndex) {
  if (!children || !sourceCode) {
    return "";
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  let out = "";
  for (const raw of list) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const node = /** @type {{ type?: string; name?: string; value?: string; loc?: object; children?: unknown }} */ (
      raw
    );
    if (node.type === "Identifier" && typeof node.name === "string") {
      out += `${node.name} `;
    }
    if ((node.type === "Number" || node.type === "CssNumber") && node.loc && baseIndex != null) {
      const loc = functionNameLoc(node, sourceCode, baseIndex);
      if (loc) {
        out += `${sourceCode.text.slice(sourceCode.getIndexFromLoc(loc.start), sourceCode.getIndexFromLoc(loc.end))} `;
      }
    }
    if ((node.type === "Dimension" || node.type === "CssDimension") && node.loc && baseIndex != null) {
      const loc = functionNameLoc(node, sourceCode, baseIndex);
      if (loc) {
        out += `${sourceCode.text.slice(sourceCode.getIndexFromLoc(loc.start), sourceCode.getIndexFromLoc(loc.end))} `;
      }
    }
    if (node.type === "String" || node.type === "CssString") {
      if (typeof node.value === "string") {
        out += node.value;
      }
    }
    if (node.children != null) {
      out += rawValueTextFromChildren(node.children, sourceCode, baseIndex);
    }
  }
  return out.trim();
}

/**
 * @param {unknown} children
 * @returns {boolean}
 */
export function cssValueChildrenAreUnitlessNumber(children) {
  if (children == null) {
    return false;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  let sawNumber = false;
  let sawDimensionWithUnit = false;
  for (const raw of list) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const node = /** @type {{ type?: string; unit?: string; children?: unknown }} */ (raw);
    if (node.type === "Number" || node.type === "CssNumber") {
      sawNumber = true;
    }
    if (node.type === "Dimension" || node.type === "CssDimension") {
      const unit = typeof node.unit === "string" ? node.unit.trim() : "";
      if (unit === "" || unit === "unknown") {
        sawNumber = true;
      } else {
        sawDimensionWithUnit = true;
      }
    }
    if (node.children != null && cssValueChildrenAreUnitlessNumber(node.children)) {
      sawNumber = true;
    }
  }
  return sawNumber && !sawDimensionWithUnit;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {object} block
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
export function reportKeyframesSizingUnits(
  context,
  messageId,
  block,
  sourceCode,
  baseIndex,
) {
  visitDeclarationsInBlock(block, (decl) => {
    const prop =
      typeof decl.property === "string"
        ? normalizeCssPropertyName(decl.property)
        : "";
    if (!KEYFRAME_SIZING_PROPERTY_SET.has(prop)) {
      return;
    }
    const children = decl.value?.children;
    if (!children || !cssValueChildrenAreUnitlessNumber(children)) {
      return;
    }
    const loc =
      /** @type {{ loc?: import("eslint").AST.SourceLocation } } */ (decl).loc ||
      (sourceCode && baseIndex != null
        ? undefined
        : undefined);
    if (loc) {
      reportRestriction(context, messageId, loc, { property: prop });
    }
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {object} block
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 */
/**
 * @param {unknown} children
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 * @returns {boolean}
 */
function valueChildrenContainPathArc(children, sourceCode, baseIndex) {
  const text = rawValueTextFromChildren(children, sourceCode, baseIndex);
  if (pathDHasEllipticalArc(text)) {
    return true;
  }
  if (children == null) {
    return false;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const node = /** @type {{ type?: string; name?: string; value?: string; children?: unknown }} */ (
      raw
    );
    if (
      (node.type === "Function" || node.type === "CssFunction") &&
      typeof node.name === "string" &&
      node.name.toLowerCase() === "path"
    ) {
      const inner = rawValueTextFromChildren(node.children, sourceCode, baseIndex);
      if (pathDHasEllipticalArc(inner)) {
        return true;
      }
    }
    if (node.type === "String" || node.type === "CssString") {
      if (typeof node.value === "string" && pathDHasEllipticalArc(node.value)) {
        return true;
      }
    }
    if (node.children != null && valueChildrenContainPathArc(node.children, sourceCode, baseIndex)) {
      return true;
    }
  }
  return false;
}

export function reportKeyframesPathArcAnimation(
  context,
  messageId,
  block,
  sourceCode,
  baseIndex,
) {
  visitDeclarationsInBlock(block, (decl) => {
    const prop =
      typeof decl.property === "string" ? decl.property.toLowerCase().trim() : "";
    if (prop !== "d") {
      return;
    }
    if (!valueChildrenContainPathArc(decl.value?.children, sourceCode, baseIndex)) {
      return;
    }
    const loc = /** @type {{ loc?: import("eslint").AST.SourceLocation } } */ (decl).loc;
    if (loc) {
      reportRestriction(context, messageId, loc);
    }
  });
}

/**
 * @param {import("css-tree").Value | import("css-tree").Raw | null | undefined} valueNode
 * @returns {boolean}
 */
function cssTreeValueIsUnitless(valueNode) {
  if (!valueNode) {
    return false;
  }
  let unitless = false;
  let hasUnit = false;
  cssTreeWalk(valueNode, (n) => {
    if (n.type === "Number") {
      unitless = true;
    }
    if (n.type === "Dimension") {
      if (!n.unit || n.unit === "") {
        unitless = true;
      } else {
        hasUnit = true;
      }
    }
    if (n.type === "Percentage") {
      hasUnit = true;
    }
  });
  return unitless && !hasUnit;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {import("css-tree").Block} block
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 */
export function reportKeyframesSizingUnitsCssTree(
  context,
  messageId,
  block,
  sourceCode,
  baseIndex,
) {
  cssTreeWalk(block, (node) => {
    if (node.type !== "Declaration") {
      return;
    }
    const prop = normalizeCssPropertyName(String(node.property));
    if (!KEYFRAME_SIZING_PROPERTY_SET.has(prop) || !node.value) {
      return;
    }
    if (!cssTreeValueIsUnitless(node.value)) {
      return;
    }
    if (node.loc) {
      reportRestriction(
        context,
        messageId,
        eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc),
        { property: prop },
      );
    }
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {import("css-tree").Block} block
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 */
export function reportKeyframesPathArcCssTree(
  context,
  messageId,
  block,
  sourceCode,
  baseIndex,
) {
  cssTreeWalk(block, (node) => {
    if (node.type !== "Declaration") {
      return;
    }
    const prop = String(node.property).toLowerCase().trim();
    if (prop !== "d" || !node.value) {
      return;
    }
    let text = "";
    cssTreeWalk(node.value, (vn) => {
      if (vn.type === "String" && typeof vn.value === "string") {
        text += vn.value;
      }
      if (vn.type === "Raw" && typeof vn.value === "string") {
        text += vn.value;
      }
      if (vn.type === "Function" && vn.name === "path") {
        cssTreeWalk(vn, (inner) => {
          if (inner.type === "String" && typeof inner.value === "string") {
            text += inner.value;
          }
        });
      }
    });
    if (!pathDHasEllipticalArc(text) || !node.loc) {
      return;
    }
    reportRestriction(
      context,
      messageId,
      eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc),
    );
  });
}

export { isKeyframesAtrule };
