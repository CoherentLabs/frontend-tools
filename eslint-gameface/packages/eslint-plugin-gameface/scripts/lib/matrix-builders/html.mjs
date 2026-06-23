import { seededSample, slugId } from "../catalog-sampler.mjs";
import CURATED_PARSED_NO_IMPL from "../../../src/utils/curated-parsed-no-impl.js";

/** @typedef {import("../catalog-sampler.mjs").FeatureRow} FeatureRow */

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
};

/**
 * @param {FeatureRow[]} htmlUnsupported
 * @param {FeatureRow[]} htmlPartial
 * @param {number} seed
 * @param {object} caps
 */
export function buildHtmlMatrixRows(htmlUnsupported, htmlPartial, seed, caps) {
  /** @type {import("./css.mjs").MatrixRow[]} */
  const rows = [];

  const parsedNoImpl = htmlUnsupported.filter(
    (r) => r.surface === "html" && r.status === "parsed-no-impl" && typeof r.name === "string",
  );
  const curated = parsedNoImpl.filter((r) => CURATED_PARSED_NO_IMPL.has(r.name.toLowerCase()));
  for (const row of seededSample(
    curated,
    caps.htmlParsedNoImpl,
    seed,
    (r) => r.name,
    (r) => r.name === "select",
  )) {
    const tag = row.name;
    rows.push({
      id: `html-parsed-no-impl-${slugId(tag)}`,
      ruleId: "gameface/html-parsed-no-impl",
      language: "html",
      filePath: "virtual/catalog/parsed-no-impl.html",
      snippet: `<!doctype html><html><body><${tag}></${tag}></body></html>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "html/unsupported.json", name: tag, status: "parsed-no-impl" },
    });
  }

  const partialTags = htmlPartial.filter(
    (r) => r.surface === "html" && r.status === "partial" && typeof r.name === "string",
  );
  /** @type {Array<{ tag: string, attr: string, checkKey: string }>} */
  const partialCases = [];
  for (const row of partialTags) {
    const tag = row.name.toLowerCase();
    const checks =
      row.evidence &&
      typeof row.evidence === "object" &&
      row.evidence.checks &&
      typeof row.evidence.checks === "object"
        ? /** @type {Record<string, unknown>} */ (row.evidence.checks)
        : null;
    if (!checks) {
      continue;
    }
    for (const [checkKey, val] of Object.entries(checks)) {
      if (val !== false) {
        continue;
      }
      const attr = CHECK_KEY_TO_HTML_ATTR[checkKey];
      if (!attr) {
        continue;
      }
      partialCases.push({ tag, attr, checkKey });
    }
  }

  for (const { tag, attr, checkKey } of seededSample(
    partialCases,
    caps.htmlPartialAttrs,
    seed + 1,
    (c) => `${c.tag}:${c.attr}`,
    (c) => c.tag === "img" && c.attr === "alt",
  )) {
    const attrPart =
      attr === "value" ? ` value="test"` : attr === "type" ? ` type="text"` : ` ${attr}="x"`;
    rows.push({
      id: `html-partial-${slugId(tag)}-${slugId(attr)}`,
      ruleId: "gameface/html-partial-features",
      language: "html",
      filePath: "virtual/catalog/html-partial.html",
      snippet: `<!doctype html><html><body><${tag}${attrPart}></${tag}></body></html>`,
      expect: { reports: true, severity: "warn" },
      catalog: { file: "html/partial.json", tag, attr, checkKey },
    });
  }

  rows.push({
    id: "html-parsed-no-impl-control-div",
    ruleId: "gameface/html-parsed-no-impl",
    language: "html",
    filePath: "virtual/catalog/parsed-control.html",
    snippet: `<!doctype html><html><body><div></div></body></html>`,
    expect: { reports: false },
    catalog: { control: true, name: "div" },
  });

  return rows;
}
