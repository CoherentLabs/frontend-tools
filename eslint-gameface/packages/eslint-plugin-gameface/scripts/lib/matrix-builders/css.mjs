import {
  isLintablePartialKeyword,
  pickPartialDisallowedKeyword,
  seededSample,
  matrixSlugId,
  slugId,
} from "../catalog-sampler.mjs";

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
 * @param {FeatureRow[]} cssUnsupported
 * @param {FeatureRow[]} cssPartial
 * @param {FeatureRow[]} selectorsUnsupported
 * @param {FeatureRow[]} selectorsPartial
 * @param {number} seed
 * @param {object} caps
 * @returns {MatrixRow[]}
 */
export function buildCssMatrixRows(cssUnsupported, cssPartial, selectorsUnsupported, selectorsPartial, seed, caps) {
  /** @type {MatrixRow[]} */
  const rows = [];

  const cssProps = cssUnsupported.filter(
    (r) => r.surface === "css-property" && typeof r.name === "string",
  );
  const sampledUnsupported = seededSample(
    cssProps,
    caps.cssUnsupported,
    seed,
    (r) => r.name,
    (r) => r.name === "accent-color",
  );

  for (const row of sampledUnsupported) {
    const prop = row.name;
    const cssSnippet = `.t { ${prop}: red; }`;
    rows.push({
      id: `css-unsupported-${slugId(prop)}`,
      ruleId: "gameface/css-no-unsupported-properties",
      language: "css",
      filePath: "virtual/catalog/test.css",
      snippet: cssSnippet,
      expect: { reports: true, severity: "error" },
      catalog: { file: "css/unsupported.json", name: prop, status: row.status },
    });
    rows.push({
      id: `html-embedded-css-unsupported-${slugId(prop)}`,
      ruleId: "gameface/html-embedded-css-no-unsupported-properties",
      language: "html",
      filePath: "virtual/catalog/test.html",
      snippet: `<!doctype html><html><head><style>${cssSnippet}</style></head><body></body></html>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "css/unsupported.json", name: prop, status: row.status },
    });
    rows.push({
      id: `html-inline-css-unsupported-${slugId(prop)}`,
      ruleId: "gameface/html-inline-css-no-unsupported-properties",
      language: "html",
      filePath: "virtual/catalog/test-inline.html",
      snippet: `<div style="${prop}: red"></div>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "css/unsupported.json", name: prop, status: row.status },
    });
    rows.push({
      id: `jsx-inline-css-unsupported-${slugId(prop)}`,
      ruleId: "gameface/jsx-inline-css-no-unsupported-properties",
      language: "jsx",
      filePath: "virtual/catalog/test.jsx",
      snippet: `export function T() { return <div style={{ "${prop}": "red" }} />; }`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "css/unsupported.json", name: prop, status: row.status },
    });
  }

  const partialProps = cssPartial.filter(
    (r) => r.surface === "css-property" && r.status === "partial" && typeof r.name === "string",
  );
  const sampledPartial = seededSample(
    partialProps,
    caps.cssPartial,
    seed + 1,
    (r) => r.name,
    (r) => r.name === "align-content",
  );

  for (const row of sampledPartial) {
    const prop = row.name;
    const evidence = row.evidence || {};
    const keyword = pickPartialDisallowedKeyword(evidence);
    if (!keyword || !isLintablePartialKeyword(keyword)) {
      continue;
    }
    const cssSnippet = `.t { ${prop}: ${keyword}; }`;
    const partialRules = [
      ["gameface/css-partial-property-values", "css", "virtual/catalog/partial.css"],
      [
        "gameface/html-embedded-css-partial-property-values",
        "html",
        "virtual/catalog/partial-embed.html",
      ],
      [
        "gameface/html-inline-css-partial-property-values",
        "html",
        "virtual/catalog/partial-inline.html",
      ],
      ["gameface/jsx-inline-css-partial-property-values", "jsx", "virtual/catalog/partial.jsx"],
    ];
    for (const [ruleId, language, filePath] of partialRules) {
      let snippet = cssSnippet;
      if (language === "html" && ruleId.includes("embedded")) {
        snippet = `<!doctype html><html><head><style>${cssSnippet}</style></head><body></body></html>`;
      } else if (language === "html") {
        snippet = `<div style="${prop}: ${keyword}"></div>`;
      } else if (language === "jsx") {
        snippet = `export function T() { return <div style={{ "${prop}": "${keyword}" }} />; }`;
      }
      rows.push({
        id: `${slugId(ruleId)}-${slugId(prop)}-${slugId(keyword)}`,
        ruleId,
        language,
        filePath,
        snippet,
        expect: { reports: true, severity: "error" },
        catalog: { file: "css/partial.json", name: prop, keyword, status: "partial" },
      });
    }
  }

  const unsSel = selectorsUnsupported.filter(
    (r) => r.surface === "css-selector" && typeof r.name === "string",
  );
  for (const row of seededSample(unsSel, caps.selectorsUnsupported, seed + 2, (r) => r.name, (r) => r.name === ":any-link")) {
    const sel = row.name;
    const cssSnippet = `.x ${sel} { color: red; }`;
    rows.push({
      id: `css-selector-unsupported-${matrixSlugId(sel)}`,
      ruleId: "gameface/css-no-unsupported-selectors",
      language: "css",
      filePath: "virtual/catalog/sel.css",
      snippet: cssSnippet,
      expect: { reports: true, severity: "error" },
      catalog: { file: "selectors/unsupported.json", name: sel },
    });
    rows.push({
      id: `html-embedded-selector-unsupported-${matrixSlugId(sel)}`,
      ruleId: "gameface/html-embedded-css-no-unsupported-selectors",
      language: "html",
      filePath: "virtual/catalog/sel.html",
      snippet: `<!doctype html><html><head><style>${cssSnippet}</style></head><body></body></html>`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "selectors/unsupported.json", name: sel },
    });
  }

  const partSel = selectorsPartial.filter(
    (r) => r.surface === "css-selector" && typeof r.name === "string",
  );
  for (const row of seededSample(
    partSel,
    caps.selectorsPartial,
    seed + 3,
    (r) => r.name,
    (r) => r.name.includes("nth-child(2 of"),
  )) {
    const sel = row.name;
    const cssSnippet = `.x ${sel} { color: red; }`;
    rows.push({
      id: `css-selector-partial-${matrixSlugId(sel)}`,
      ruleId: "gameface/css-partial-selectors",
      language: "css",
      filePath: "virtual/catalog/sel-partial.css",
      snippet: cssSnippet,
      expect: { reports: true, severity: "warn" },
      catalog: { file: "selectors/partial.json", name: sel },
    });
    rows.push({
      id: `html-embedded-selector-partial-${matrixSlugId(sel)}`,
      ruleId: "gameface/html-embedded-css-partial-selectors",
      language: "html",
      filePath: "virtual/catalog/sel-partial.html",
      snippet: `<!doctype html><html><head><style>${cssSnippet}</style></head><body></body></html>`,
      expect: { reports: true, severity: "warn" },
      catalog: { file: "selectors/partial.json", name: sel },
    });
  }

  rows.push({
    id: "css-unsupported-control-width",
    ruleId: "gameface/css-no-unsupported-properties",
    language: "css",
    filePath: "virtual/catalog/control.css",
    snippet: ".t { width: 100px; }",
    expect: { reports: false },
    catalog: { control: true, name: "width" },
  });

  rows.push({
    id: "css-partial-control-width-px",
    ruleId: "gameface/css-partial-property-values",
    language: "css",
    filePath: "virtual/catalog/partial-control.css",
    snippet: ".t { width: 10px; }",
    expect: { reports: false },
    catalog: { control: true, name: "width", value: "10px" },
  });

  rows.push({
    id: "jsx-inline-css-unsupported-accent-color-camel",
    ruleId: "gameface/jsx-inline-css-no-unsupported-properties",
    language: "jsx",
    filePath: "virtual/catalog/jsx-camel-unsupported.jsx",
    snippet: `export function T() { return <div style={{ accentColor: "red" }} />; }`,
    expect: { reports: true, severity: "error" },
    catalog: { file: "css/unsupported.json", name: "accent-color", variant: "jsx-camelCase" },
  });

  rows.push({
    id: "jsx-inline-css-partial-align-content-camel",
    ruleId: "gameface/jsx-inline-css-partial-property-values",
    language: "jsx",
    filePath: "virtual/catalog/jsx-camel-partial.jsx",
    snippet: `export function T() { return <motion.div style={{ alignContent: "space-between" }} />; }`,
    expect: { reports: true, severity: "error" },
    catalog: { file: "css/partial.json", name: "align-content", variant: "jsx-camelCase" },
  });

  return rows;
}
