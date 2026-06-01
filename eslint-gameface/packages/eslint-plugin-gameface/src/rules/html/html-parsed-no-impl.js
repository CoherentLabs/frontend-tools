import { getFeatureIndexForContext } from "../../gameface-features/index.js";

/**
 * In `curated` scope, only these parsed-no-impl tags are reported (e.g. select, tables).
 * Headings and flow content are parsed-no-impl in the catalog too but are omitted here to avoid noise.
 * Use `scope: "all"` to report every parsed-no-impl tag (still subject to `ignoreTags`).
 * @type {ReadonlySet<string>}
 */
const CURATED_PARSED_NO_IMPL = new Set([
  "select",
  "option",
  "optgroup",
  "table",
  "tbody",
  "thead",
  "tfoot",
  "tr",
  "td",
  "th",
  "colgroup",
  "col",
  "iframe",
  "object",
  "embed",
  "audio",
  "map",
  "area",
]);

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow HTML tags listed as parsed-no-impl in gameface-features/html/unsupported.json. Default `curated` scope flags form/table/media-style tags (e.g. select); use `all` for every parsed-no-impl tag.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/htmlelements/"
    },
    messages: {
      parsedNoImpl:
        "Element '<{{tag}}>' is not supported in Gameface (generic HTMLElement / no specialized implementation).",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: { enum: ["curated", "all"] },
          ignoreTags: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      {
        scope: "curated",
        ignoreTags: ["meta", "link", "base", "br", "hr", "noscript"],
      },
    ],
  },
  create(context) {
    const index = getFeatureIndexForContext(context);
    const [{ scope, ignoreTags }] = context.options;
    const ignore = new Set((ignoreTags || []).map((t) => t.toLowerCase()));

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const tag = typeof node.name === "string" ? node.name.toLowerCase() : "";
        if (!index.htmlTagsParsedNoImpl.has(tag) || ignore.has(tag)) {
          return;
        }
        if (scope === "curated" && !CURATED_PARSED_NO_IMPL.has(tag)) {
          return;
        }
        context.report({
          loc: {
            start: node.openStart.loc.start,
            end: node.openEnd.loc.end,
          },
          messageId: "parsedNoImpl",
          data: { tag },
        });
      },
    };
  },
};
