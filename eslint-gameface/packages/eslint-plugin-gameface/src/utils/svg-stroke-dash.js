import {
  isPathOnlyStrokeDashProperty,
  PATH_ONLY_STROKE_DASH_PROPERTIES,
} from "../data/gameface-svg-support.js";
import { normalizeCssPropertyName } from "./css-property-name.js";
import {
  isKeyframesAtrule,
  reportRestriction,
  visitDeclarationsInBlock,
} from "./gameface-css-restrictions.js";
import { eslintLocRangeFromCssTreeOffsets } from "./html-inline-style-css.js";
import { walk as cssTreeWalk } from "css-tree";

export { isPathOnlyStrokeDashProperty };

const STROKE_DASH_INLINE_RE = /(?:^|;)\s*stroke-dash(?:array|offset)\s*:/i;

/**
 * @param {Record<string, string>} attrs lowercased or camelCase keys
 * @returns {string | null}
 */
export function findStrokeDashPresentationAttr(attrs) {
  for (const [key] of Object.entries(attrs)) {
    if (isPathOnlyStrokeDashProperty(normalizeCssPropertyName(key))) {
      return normalizeCssPropertyName(key);
    }
  }
  return null;
}

/**
 * @param {string} inlineStyle
 * @returns {string | null}
 */
export function findStrokeDashInInlineStyle(inlineStyle) {
  if (typeof inlineStyle !== "string" || !STROKE_DASH_INLINE_RE.test(inlineStyle)) {
    return null;
  }
  const m = inlineStyle.match(/stroke-dash(?:array|offset)/i);
  return m ? m[0].toLowerCase() : "stroke-dasharray";
}

/**
 * @param {object} block
 * @param {(decl: { property?: string; loc?: import("eslint").AST.SourceLocation }) => void} onMatch
 */
export function visitStrokeDashDeclarationsInBlock(block, onMatch) {
  visitDeclarationsInBlock(block, (decl) => {
    const prop =
      typeof decl.property === "string" ? normalizeCssPropertyName(decl.property) : "";
    if (!isPathOnlyStrokeDashProperty(prop)) {
      return;
    }
    const loc = /** @type {{ loc?: import("eslint").AST.SourceLocation } } */ (decl).loc;
    if (loc) {
      onMatch({ property: prop, loc });
    }
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {object} block
 */
export function reportKeyframesStrokeDashPathOnly(context, messageId, block) {
  visitStrokeDashDeclarationsInBlock(block, ({ loc, property }) => {
    reportRestriction(context, messageId, loc, { property });
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {import("css-tree").Block} block
 * @param {import("eslint").SourceCode} sourceCode
 * @param {number} baseIndex
 */
export function reportKeyframesStrokeDashPathOnlyCssTree(
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
    if (!isPathOnlyStrokeDashProperty(prop) || !node.loc) {
      return;
    }
    reportRestriction(
      context,
      messageId,
      eslintLocRangeFromCssTreeOffsets(sourceCode, baseIndex, node.loc),
      { property: prop },
    );
  });
}

/**
 * @param {object} node Rule / CssRule with prelude
 * @param {import("eslint").SourceCode} [sourceCode]
 * @returns {string}
 */
export function ruleSelectorText(node, sourceCode) {
  if (!node || typeof node !== "object") {
    return "";
  }
  const prelude = /** @type {{ children?: unknown; loc?: object }} */ (node).prelude;
  if (!prelude) {
    return "";
  }
  if (sourceCode && prelude.loc) {
    const loc = /** @type {{ start: { line: number; column: number }; end: { line: number; column: number } }} */ (
      prelude.loc
    );
    return sourceCode.text.slice(
      sourceCode.getIndexFromLoc(loc.start),
      sourceCode.getIndexFromLoc(loc.end),
    );
  }
  const children = prelude.children;
  if (!children) {
    return "";
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  return list
    .map((c) => {
      if (!c || typeof c !== "object") {
        return "";
      }
      const n = /** @type {{ type?: string; name?: string; value?: string }} */ (c);
      if (n.type === "TypeSelector" || n.type === "CssTypeSelector") {
        return typeof n.name === "string" ? n.name : "";
      }
      if (n.type === "Identifier" || n.type === "CssIdentifier") {
        return typeof n.name === "string" ? n.name : "";
      }
      if (n.type === "ClassSelector" || n.type === "CssClassSelector") {
        return typeof n.name === "string" ? `.${n.name}` : "";
      }
      return "";
    })
    .join("");
}

export { isKeyframesAtrule };
