import { getFeatureIndexForContext } from "../gameface-features/index.js";
import { normalizeCssPropertyName } from "./css-property-name.js";

/**
 * @param {unknown} v
 * @returns {string[]}
 */
export function asStringList(v) {
  if (!Array.isArray(v)) {
    return [];
  }
  return v.filter((x) => typeof x === "string");
}

/**
 * @param {string[]} values
 * @param {number} [max]
 * @returns {string}
 */
export function formatListForMessage(values, max = 14) {
  if (values.length === 0) {
    return "(none listed in catalog)";
  }
  const shown = values.slice(0, max);
  const tail = values.length > max ? ", …" : "";
  return `${shown.join(", ")}${tail}`;
}

/**
 * @param {Record<string, unknown>} evidence
 * @returns {{ disallowed: Set<string>, supportedDisplay: string[], unsupportedDisplay: string[] }}
 */
export function buildPartialKeywordGate(evidence) {
  const supportedRaw = asStringList(evidence.supportedValues);
  const unsupportedRaw = asStringList(evidence.unsupportedValues);
  const loggedRaw = asStringList(evidence.logRejectedValues);

  const supportedLower = new Set(supportedRaw.map((s) => s.toLowerCase()));

  /** @type {Set<string>} */
  const disallowed = new Set();
  for (const s of unsupportedRaw) {
    disallowed.add(s.toLowerCase());
  }
  for (const s of loggedRaw) {
    disallowed.add(s.toLowerCase());
  }

  if (supportedLower.size > 0) {
    for (const s of supportedLower) {
      disallowed.delete(s);
    }
  }

  return {
    disallowed,
    supportedDisplay: supportedRaw,
    unsupportedDisplay: unsupportedRaw.length > 0 ? unsupportedRaw : loggedRaw,
  };
}

/**
 * Partial rows whose `probe` means the engine accepts the declaration; we skip declaration-level lint.
 * (Keyword-level checks from supportedValues / unsupportedValues / logRejectedValues still apply.)
 */
const SUPPRESSED_PARTIAL_PROBES_FOR_DECLARATION_LINT = new Set(["value-accepted-but-not-computed"]);

/** Catalog fields we do not lint yet (unit lists are informational until unit checks exist). */
const PARTIAL_EVIDENCE_METADATA_KEYS = new Set([
  "supportedValues",
  "unsupportedValues",
  "logRejectedValues",
  "probe",
  "supportedUnits",
  "unsupportedUnits",
  "logRejectedUnits",
]);

/**
 * @param {Record<string, unknown>} evidence
 * @returns {boolean}
 */
function partialEvidenceHasKeywordLists(evidence) {
  return (
    asStringList(evidence.supportedValues).length > 0 ||
    asStringList(evidence.unsupportedValues).length > 0 ||
    asStringList(evidence.logRejectedValues).length > 0
  );
}

/**
 * Partial css/partial.json rows with only `probe` / `note` / etc. (no keyword lists) may surface in lint.
 * Probes listed in {@link SUPPRESSED_PARTIAL_PROBES_FOR_DECLARATION_LINT} are ignored unless other signals exist.
 * @param {Record<string, unknown>} evidence
 * @returns {boolean}
 */
function partialEvidenceHasNonKeywordSignal(evidence) {
  const probeStr = typeof evidence.probe === "string" ? evidence.probe.trim() : "";
  if (probeStr && !SUPPRESSED_PARTIAL_PROBES_FOR_DECLARATION_LINT.has(probeStr)) {
    return true;
  }
  if (evidence.probe === true) {
    return true;
  }
  const note = evidence.note;
  if (typeof note === "string" && note.trim() !== "") {
    return true;
  }
  const skip = PARTIAL_EVIDENCE_METADATA_KEYS;
  for (const k of Object.keys(evidence)) {
    if (skip.has(k)) {
      continue;
    }
    const v = evidence[k];
    if (v == null || v === false) {
      continue;
    }
    if (typeof v === "string" && v.trim() === "") {
      continue;
    }
    if (Array.isArray(v) && v.length === 0) {
      continue;
    }
    return true;
  }
  return false;
}

/**
 * @param {Record<string, unknown>} evidence
 * @returns {string}
 */
function formatPartialEvidenceDetail(evidence) {
  if (typeof evidence.probe === "string" && evidence.probe.trim() !== "") {
    return `probe: ${evidence.probe}`;
  }
  if (typeof evidence.note === "string" && evidence.note.trim() !== "") {
    return evidence.note;
  }
  return "";
}

/**
 * @param {string} rawProperty
 * @param {import("eslint").Rule.RuleContext} context
 * @returns {boolean}
 */
export function isUnsupportedCssProperty(rawProperty, context) {
  if (typeof rawProperty !== "string" || rawProperty.startsWith("--")) {
    return false;
  }
  const { cssPropertiesUnsupported } = getFeatureIndexForContext(context);
  return cssPropertiesUnsupported.has(normalizeCssPropertyName(rawProperty));
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {string} rawProperty
 * @param {import("eslint").AST.SourceLocation} loc
 */
export function reportUnsupportedProperty(context, messageId, rawProperty, loc) {
  if (!isUnsupportedCssProperty(rawProperty, context)) {
    return;
  }
  context.report({
    loc,
    messageId,
    data: { property: rawProperty },
  });
}

/**
 * @param {string} rawFunctionName
 * @param {import("eslint").Rule.RuleContext} context
 * @returns {boolean}
 */
export function isUnsupportedCssFunction(rawFunctionName, context) {
  if (typeof rawFunctionName !== "string" || rawFunctionName.length === 0) {
    return false;
  }
  const { cssFunctionsUnsupported } = getFeatureIndexForContext(context);
  return cssFunctionsUnsupported.has(rawFunctionName.toLowerCase());
}

/**
 * Loc spanning the function name token (not the full `name(...)` node).
 * @param {{ name?: string, loc?: import("eslint").AST.SourceLocation | { start: { offset?: number }, end?: { offset?: number } } | null }} node
 * @param {import("eslint").SourceCode} [sourceCode]
 * @param {number} [baseIndex]
 * @returns {import("eslint").AST.SourceLocation | null}
 */
export function functionNameLoc(node, sourceCode, baseIndex) {
  const name = node?.name;
  if (typeof name !== "string" || name.length === 0) {
    return null;
  }
  const loc = node?.loc;
  if (
    sourceCode != null &&
    baseIndex != null &&
    loc &&
    typeof loc === "object" &&
    "start" in loc &&
    loc.start &&
    typeof loc.start === "object" &&
    "offset" in loc.start &&
    typeof loc.start.offset === "number"
  ) {
    const start = sourceCode.getLocFromIndex(baseIndex + loc.start.offset);
    const end = sourceCode.getLocFromIndex(baseIndex + loc.start.offset + name.length);
    return { start, end };
  }
  if (!loc || !("line" in loc.start)) {
    return null;
  }
  return {
    start: loc.start,
    end: {
      line: loc.start.line,
      column: loc.start.column + name.length,
    },
  };
}

/**
 * Depth-first over declaration value children (`Function`, `CssFunction`, nested).
 * @param {unknown} children
 * @returns {Generator<{ name: string, loc: import("eslint").AST.SourceLocation }>}
 */
export function* collectFunctionsFromValueChildren(children, sourceCode, baseIndex) {
  if (children == null) {
    return;
  }
  const list = Array.isArray(children) ? children : [.../** @type {Iterable<unknown>} */ (children)];
  for (const node of list) {
    if (!node || typeof node !== "object") {
      continue;
    }
    const n = /** @type {{ type?: string, name?: string, loc?: import("eslint").AST.SourceLocation | null, children?: unknown }} */ (
      node
    );
    if (
      (n.type === "Function" || n.type === "CssFunction") &&
      typeof n.name === "string" &&
      n.loc
    ) {
      const loc = functionNameLoc(n, sourceCode, baseIndex);
      if (loc) {
        yield { name: n.name, loc };
      }
    }
    if (n.children != null) {
      yield* collectFunctionsFromValueChildren(n.children, sourceCode, baseIndex);
    }
  }
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {string} rawFunctionName
 * @param {import("eslint").AST.SourceLocation} loc
 */
export function reportUnsupportedCssFunction(context, messageId, rawFunctionName, loc) {
  if (!isUnsupportedCssFunction(rawFunctionName, context)) {
    return;
  }
  context.report({
    loc,
    messageId,
    data: { function: rawFunctionName },
  });
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} messageId
 * @param {unknown} valueChildren
 */
export function reportUnsupportedFunctionsInValue(context, messageId, valueChildren) {
  for (const fn of collectFunctionsFromValueChildren(valueChildren)) {
    reportUnsupportedCssFunction(context, messageId, fn.name, fn.loc);
  }
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {{ long: string, short: string, declaration?: string }} messageIds
 * @param {string} rawProperty
 * @param {Iterable<{ type?: string, name?: string, loc?: import("eslint").AST.SourceLocation | null }>} valueChildren
 * @param {import("eslint").AST.SourceLocation | null} [declarationLoc] property span for probe-only partial rows
 */
export function reportPartialValueIdentifiers(
  context,
  messageIds,
  rawProperty,
  valueChildren,
  declarationLoc,
) {
  if (typeof rawProperty !== "string" || rawProperty.startsWith("--")) {
    return;
  }
  const { cssPropertiesPartial } = getFeatureIndexForContext(context);
  const prop = normalizeCssPropertyName(rawProperty);
  const evidence = cssPropertiesPartial.get(prop);
  if (!evidence || typeof evidence !== "object") {
    return;
  }
  const { disallowed, supportedDisplay, unsupportedDisplay } = buildPartialKeywordGate(evidence);
  const supportedList = formatListForMessage(supportedDisplay);
  const unsupportedList = formatListForMessage(unsupportedDisplay);
  const hasCatalogLists = supportedDisplay.length > 0 || unsupportedDisplay.length > 0;

  let reportedKeyword = false;
  if (disallowed.size > 0) {
    for (const child of valueChildren) {
      const isId =
        (child.type === "Identifier" || child.type === "CssIdentifier") &&
        typeof child.name === "string" &&
        child.loc;
      if (isId) {
        const id = child.name.toLowerCase();
        if (disallowed.has(id)) {
          reportedKeyword = true;
          context.report({
            loc: child.loc,
            messageId: hasCatalogLists ? messageIds.long : messageIds.short,
            data: {
              property: rawProperty,
              value: child.name,
              supportedList,
              unsupportedList,
            },
          });
        }
      }
    }
  }

  if (
    !reportedKeyword &&
    messageIds.declaration &&
    declarationLoc &&
    !partialEvidenceHasKeywordLists(evidence) &&
    partialEvidenceHasNonKeywordSignal(evidence)
  ) {
    context.report({
      loc: declarationLoc,
      messageId: messageIds.declaration,
      data: {
        property: rawProperty,
        detail: formatPartialEvidenceDetail(evidence),
      },
    });
  }
}

/**
 * Text used to match gameface-features/selectors/*.json `name` fields.
 * @param {object} node
 * @param {() => string} getTextFallback
 * @returns {string}
 */
export function pseudoTextForCatalog(node, getTextFallback) {
  if (!node || typeof node !== "object") {
    return "";
  }
  const full = getTextFallback().trim();
  if (node.type === "CssPseudoClassSelector" || node.type === "PseudoClassSelector") {
    if (full.includes("(")) {
      return full;
    }
    const n = typeof node.name === "string" ? node.name : "";
    return n ? `:${n}` : full;
  }
  if (node.type === "CssPseudoElementSelector" || node.type === "PseudoElementSelector") {
    if (full.startsWith("::")) {
      return full;
    }
    const n = typeof node.name === "string" ? node.name : "";
    return n ? `::${n}` : full;
  }
  return full;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {object} node
 * @param {{ unsupported: string, partial: string }} messageIds
 * @param {() => string} [getText]
 */
export function reportPseudoIfCatalogMatch(context, node, messageIds, getText) {
  const loc = node.loc;
  if (!loc) {
    return;
  }
  const sc = context.sourceCode || context.getSourceCode?.();
  const fallback = () => (sc && typeof sc.getText === "function" ? sc.getText(node) : "");
  const trimmed = pseudoTextForCatalog(node, getText || fallback);
  reportPseudoIfCatalogMatchByText(context, trimmed, loc, messageIds);
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {string} trimmedPseudoText
 * @param {import("eslint").AST.SourceLocation | null | undefined} loc
 * @param {{ unsupported: string, partial: string }} messageIds
 */
export function reportPseudoIfCatalogMatchByText(context, trimmedPseudoText, loc, messageIds) {
  if (!loc || !trimmedPseudoText) {
    return;
  }
  const index = getFeatureIndexForContext(context);
  const text = trimmedPseudoText.trim();
  if (index.selectorNamesUnsupported.has(text)) {
    context.report({
      loc,
      messageId: messageIds.unsupported,
      data: { selector: text },
    });
    return;
  }
  if (messageIds.partial && index.selectorNamesPartial.has(text)) {
    const ev = index.selectorNamesPartial.get(text) || {};
    const note =
      typeof ev.note === "string"
        ? ev.note
        : typeof ev.partialSpec === "string"
          ? ev.partialSpec
          : "";
    context.report({
      loc,
      messageId: messageIds.partial,
      data: { selector: text, note },
    });
  }
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {object} node
 * @param {string} messageId
 * @param {() => string} [getText]
 */
export function reportPartialPseudoIfCatalogMatch(context, node, messageId, getText) {
  const loc = node.loc;
  if (!loc) {
    return;
  }
  const sc = context.sourceCode || context.getSourceCode?.();
  const fallback = () => (sc && typeof sc.getText === "function" ? sc.getText(node) : "");
  const trimmed = pseudoTextForCatalog(node, getText || fallback);
  const text = trimmed.trim();
  const index = getFeatureIndexForContext(context);
  if (index.selectorNamesUnsupported.has(text) || !index.selectorNamesPartial.has(text)) {
    return;
  }
  const ev = index.selectorNamesPartial.get(text) || {};
  const note =
    typeof ev.note === "string"
      ? ev.note
      : typeof ev.partialSpec === "string"
        ? ev.partialSpec
        : "";
  context.report({
    loc,
    messageId,
    data: { selector: text, note },
  });
}

