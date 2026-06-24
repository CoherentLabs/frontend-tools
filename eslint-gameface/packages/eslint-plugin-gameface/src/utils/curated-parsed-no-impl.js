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

export default CURATED_PARSED_NO_IMPL;