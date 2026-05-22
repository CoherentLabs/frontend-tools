/** @typedef {import("./css.mjs").MatrixRow} MatrixRow */

/**
 * Fixed matrix rows for Gameface documentation CSS constraints.
 * @returns {MatrixRow[]}
 */
export function buildRestrictionsMatrixRows() {
  const kf = "@keyframes k { from { opacity: 1; } }";
  const kfVar = "@keyframes k { from { width: var(--x); } }";
  const kfCalc = "@keyframes k { from { width: calc(10px + 5px); } }";
  const varFb = ".t { width: var(--a, 10px); }";
  const varOk = ".t { width: var(--a); }";
  const calcMix = ".t { width: calc(50% - 20px); }";
  const calcOk = ".t { width: calc(12px + 4px); }";

  /** @type {MatrixRow[]} */
  const rows = [];

  const cssPairs = [
    ["gameface/css-no-var-in-keyframes", kfVar, true],
    ["gameface/css-no-calc-in-keyframes", kfCalc, true],
    ["gameface/css-no-var-in-keyframes", kf, false],
    ["gameface/css-var-no-fallback", varFb, true],
    ["gameface/css-var-no-fallback", varOk, false],
    ["gameface/css-calc-no-mixed-percent-units", calcMix, true],
    ["gameface/css-calc-no-mixed-percent-units", calcOk, false],
  ];

  let cssIdx = 0;
  for (const [ruleId, snippet, reports] of cssPairs) {
    const slug = ruleId.replace("gameface/", "").replace(/\//g, "-");
    rows.push({
      id: `restriction-${slug}-${reports ? "bad" : "ok"}-${cssIdx++}`,
      ruleId,
      language: "css",
      filePath: `virtual/restrictions/${slug}.css`,
      snippet,
      expect: { reports, severity: "error" },
      catalog: { source: "gameface-docs", restriction: ruleId },
    });
  }

  rows.push({
    id: "restriction-html-embedded-css-no-var-in-keyframes",
    ruleId: "gameface/html-embedded-css-no-var-in-keyframes",
    language: "html",
    filePath: "virtual/restrictions/kf-var.html",
    snippet: `<!doctype html><html><head><style>${kfVar}</style></head><body></body></html>`,
    expect: { reports: true, severity: "error" },
    catalog: { source: "gameface-docs" },
  });

  rows.push({
    id: "restriction-html-inline-css-var-no-fallback",
    ruleId: "gameface/html-inline-css-var-no-fallback",
    language: "html",
    filePath: "virtual/restrictions/var-fb-inline.html",
    snippet: `<div style="width: var(--a, 10px)"></div>`,
    expect: { reports: true, severity: "error" },
    catalog: { source: "gameface-docs" },
  });

  rows.push({
    id: "restriction-jsx-inline-css-calc-no-mixed-percent-units",
    ruleId: "gameface/jsx-inline-css-calc-no-mixed-percent-units",
    language: "jsx",
    filePath: "virtual/restrictions/calc-mix.jsx",
    snippet: `export function T() { return <div style="width: calc(50% - 20px)" />; }`,
    expect: { reports: true, severity: "error" },
    catalog: { source: "gameface-docs" },
  });

  rows.push({
    id: "restriction-jsx-inline-css-calc-mixed-percent-control",
    ruleId: "gameface/jsx-inline-css-calc-no-mixed-percent-units",
    language: "jsx",
    filePath: "virtual/restrictions/calc-ok.jsx",
    snippet: `export function T() { return <div style="width: calc(12px + 4px)" />; }`,
    expect: { reports: false },
    catalog: { source: "gameface-docs", control: true },
  });

  return rows;
}
