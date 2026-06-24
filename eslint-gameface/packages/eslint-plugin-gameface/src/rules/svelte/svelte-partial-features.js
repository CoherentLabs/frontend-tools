import { getFeatureIndexForContext } from "../../gameface-features/index.js";
import { svelteElementTagName, svelteStartTagAttributeNamesLower } from "../../utils/svelte-element.js";
import { defineSvelteMarkupVisitor, isSvelteMarkupElement } from "../../utils/svelte-visitor.js";

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
        "For partial Svelte template elements, warn when markup uses an attribute tied to a false entry in evidence.checks.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/htmlelements/",
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

    return defineSvelteMarkupVisitor(context, {
      /** @param {import("eslint").AST.Node} node */
      SvelteElement(node) {
        if (!isSvelteMarkupElement(node)) {
          return;
        }
        const tag = (svelteElementTagName(node) ?? "").toLowerCase();
        if (!node.loc) {
          return;
        }
        const loc = node.loc;

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
          const attrsPresent = svelteStartTagAttributeNamesLower(node.startTag);
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
    });
  },
};
