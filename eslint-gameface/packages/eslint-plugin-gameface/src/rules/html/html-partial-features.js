import { getFeatureIndexForContext } from "../../gameface-features/index.js";

/**
 * @type {Record<string, string | null>}
 */
const CHECK_KEY_TO_HTML_ATTR = {
  altProperty: "alt",
  srcProperty: "src",
  relProperty: "rel",
  hrefProperty: "href",
  valueAssignable: "value",
  typeAssignable: "type",
  nameAssignable: "name",
  placeholderAssignable: "placeholder",
  widthAssignable: "width",
  heightAssignable: "height",
  idAssignable: "id",
  sheetProperty: null,
  completeProperty: null,
  naturalWidthProperty: null,
  naturalHeightProperty: null,
  getContext2d: null,
  toDataURL: null,
  checkValidity: null,
  focusMethod: null,
  blurMethod: null,
  selectMethod: null,
};

/**
 * @param {import("@html-eslint/types").Tag} node
 */
function tagAttributeNamesLower(node) {
  /** @type {Set<string>} */
  const out = new Set();
  for (const attr of node.attributes || []) {
    const v = attr.key?.value;
    if (typeof v === "string") {
      out.add(v.toLowerCase());
    }
  }
  return out;
}

/**
 * @param {Record<string, unknown>} checks
 */
function unsupportedChecksAsAttrs(checks) {
  /** @type {Array<{ checkKey: string, attrName: string }>} */
  const out = [];
  for (const [checkKey, val] of Object.entries(checks)) {
    if (val !== false) {
      continue;
    }
    const mapped = Object.prototype.hasOwnProperty.call(CHECK_KEY_TO_HTML_ATTR, checkKey)
      ? CHECK_KEY_TO_HTML_ATTR[checkKey]
      : null;
    if (!mapped) {
      continue;
    }
    out.push({ checkKey, attrName: mapped });
  }
  return out;
}

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "For partial HTML elements, warn when markup uses an attribute tied to a false entry in evidence.checks; optional blanket tag warning or supported-list mode.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/htmlelements/"
    },
    messages: {
      partialUnsupportedAttr:
        "On '<{{tag}}>', attribute '{{attr}}' uses a capability Gameface marks unsupported for this element.",
      partialTagGeneric:
        "Element '<{{tag}}>' has only partial support in Gameface.",
      notAllowlisted:
        "Element '<{{tag}}>' is not fully supported.",
    },
    schema: [
      {
        type: "object",
        properties: {
          mode: { enum: ["attribute-checks", "tag-warn", "off"] },
          warnAllowlist: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ mode: "attribute-checks", warnAllowlist: false }],
  },
  create(context) {
    const index = getFeatureIndexForContext(context);
    const [{ mode, warnAllowlist }] = context.options;

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const tag = typeof node.name === "string" ? node.name.toLowerCase() : "";
        const loc = {
          start: node.openStart.loc.start,
          end: node.openEnd.loc.end,
        };

        if (warnAllowlist && !index.htmlTagsSupported.has(tag)) {
          context.report({
            loc,
            messageId: "notAllowlisted",
            data: { tag },
          });
        }

        if (mode === "off") {
          return;
        }

        if (mode === "tag-warn" && index.htmlTagsPartial.has(tag)) {
          context.report({
            loc,
            messageId: "partialTagGeneric",
            data: { tag },
          });
          return;
        }

        if (mode === "attribute-checks" && index.htmlTagsPartial.has(tag)) {
          const evidence = index.htmlTagsPartial.get(tag);
          const checks =
            evidence && typeof evidence === "object" && evidence.checks && typeof evidence.checks === "object"
              ? /** @type {Record<string, unknown>} */ (evidence.checks)
              : null;
          if (!checks) {
            return;
          }
          const attrsPresent = tagAttributeNamesLower(node);
          for (const { checkKey, attrName } of unsupportedChecksAsAttrs(checks)) {
            if (attrsPresent.has(attrName.toLowerCase())) {
              context.report({
                loc,
                messageId: "partialUnsupportedAttr",
                data: { tag, attr: attrName, checkKey },
              });
            }
          }
        }
      },
    };
  },
};
