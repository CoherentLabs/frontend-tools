import { seededSample, slugId } from "../catalog-sampler.mjs";

/** @typedef {import("../catalog-sampler.mjs").FeatureRow} FeatureRow */

/**
 * @typedef {object} MatrixRow
 * @property {string} id
 * @property {string} ruleId
 * @property {string} language
 * @property {string} filePath
 * @property {string} snippet
 * @property {{ reports: boolean, severity?: string }} expect
 * @property {object} [catalog]
 */

/**
 * @param {FeatureRow[]} functionsUnsupported
 * @param {number} seed
 * @param {object} caps
 * @returns {MatrixRow[]}
 */
export function buildFunctionsMatrixRows(functionsUnsupported, seed, caps) {
  /** @type {MatrixRow[]} */
  const rows = [];

  const missing = functionsUnsupported.filter(
    (r) =>
      r.surface === "css-function" &&
      r.status === "missing" &&
      typeof r.name === "string" &&
      r.evidence &&
      typeof r.evidence.testProperty === "string" &&
      typeof r.evidence.canonicalValue === "string",
  );

  const sampled = seededSample(
    missing,
    caps.functionsUnsupported,
    seed,
    (r) => r.name,
    (r) => r.name === "clamp",
  );

  for (const row of sampled) {
    const fn = row.name;
    const prop = /** @type {string} */ (row.evidence.testProperty);
    const value = /** @type {string} */ (row.evidence.canonicalValue);
    const cssSnippet = `.t { ${prop}: ${value}; }`;

    rows.push({
      id: `css-fn-unsupported-${slugId(fn)}`,
      ruleId: "gameface/css-no-unsupported-functions",
      language: "css",
      filePath: "virtual/catalog/test-fn.css",
      snippet: cssSnippet,
      expect: { reports: true, severity: "error" },
      catalog: { file: "functions/unsupported.json", name: fn, status: row.status },
    });
    rows.push({
      id: `html-embedded-css-fn-unsupported-${slugId(fn)}`,
      ruleId: "gameface/html-embedded-css-no-unsupported-functions",
      language: "html",
      filePath: "virtual/catalog/test-fn.html",
      snippet: `<!doctype html><html><head><style>${cssSnippet}</style></head><body></body></html>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "functions/unsupported.json", name: fn, status: row.status },
    });
    rows.push({
      id: `html-inline-css-fn-unsupported-${slugId(fn)}`,
      ruleId: "gameface/html-inline-css-no-unsupported-functions",
      language: "html",
      filePath: "virtual/catalog/test-fn-inline.html",
      snippet: `<div style="${prop}: ${value}"></div>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "functions/unsupported.json", name: fn, status: row.status },
    });
    const styleAttr = `${prop}: ${value.replace(/"/g, "'")}`;
    rows.push({
      id: `jsx-inline-css-fn-unsupported-${slugId(fn)}`,
      ruleId: "gameface/jsx-inline-css-no-unsupported-functions",
      language: "jsx",
      filePath: "virtual/catalog/test-fn.jsx",
      snippet: `export function T() { return <div style="${styleAttr}" />; }`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "functions/unsupported.json", name: fn, status: row.status },
    });
  }

  const calcOk = ".t { font-size: calc(12px + 4px); }";
  rows.push({
    id: "css-fn-control-calc-supported",
    ruleId: "gameface/css-no-unsupported-functions",
    language: "css",
    filePath: "virtual/catalog/test-fn-control.css",
    snippet: calcOk,
    expect: { reports: false },
    catalog: { file: "functions/supported.json", name: "calc", status: "supported" },
  });
  rows.push({
    id: "html-embedded-css-fn-control-calc-supported",
    ruleId: "gameface/html-embedded-css-no-unsupported-functions",
    language: "html",
    filePath: "virtual/catalog/test-fn-control.html",
    snippet: `<!doctype html><html><head><style>${calcOk}</style></head><body></body></html>`,
    expect: { reports: false },
    catalog: { file: "functions/supported.json", name: "calc", status: "supported" },
  });
  rows.push({
    id: "html-inline-css-fn-control-calc-supported",
    ruleId: "gameface/html-inline-css-no-unsupported-functions",
    language: "html",
    filePath: "virtual/catalog/test-fn-control-inline.html",
    snippet: `<div style="font-size: calc(12px + 4px)"></div>`,
    expect: { reports: false },
    catalog: { file: "functions/supported.json", name: "calc", status: "supported" },
  });
  rows.push({
    id: "jsx-inline-css-fn-control-calc-supported",
    ruleId: "gameface/jsx-inline-css-no-unsupported-functions",
    language: "jsx",
    filePath: "virtual/catalog/test-fn-control.jsx",
    snippet: `export function T() { return <div style="font-size: calc(12px + 4px)" />; }`,
    expect: { reports: false },
    catalog: { file: "functions/supported.json", name: "calc", status: "supported" },
  });

  return rows;
}
