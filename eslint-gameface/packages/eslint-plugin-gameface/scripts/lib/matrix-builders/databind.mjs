/**
 * Fixed databind scenarios (not sampled from JSON rows).
 * @returns {import("./css.mjs").MatrixRow[]}
 */
export function buildDatabindMatrixRows() {
  /** @type {import("./css.mjs").MatrixRow[]} */
  const rows = [];

  const htmlScenarios = [
    {
      id: "databind-spelling-invalid-html",
      ruleId: "gameface/html-databind-spelling",
      snippet: `<div data-bind-not-in-allowlist="{{Model.value}}"></div>`,
    },
    {
      id: "databind-spelling-style-blocked-html",
      ruleId: "gameface/html-databind-spelling",
      snippet: `<div data-bind-style-accent-color="{{Model.value}}"></div>`,
    },
    {
      id: "databind-curly-missing-html",
      ruleId: "gameface/html-databind-curly-brackets",
      snippet: `<div data-bind-value="no braces"></div>`,
    },
    {
      id: "databind-model-missing-html",
      ruleId: "gameface/html-databind-model-properties",
      snippet: `<div data-bind-value="{{Model.missingProp}}"></div>`,
    },
    {
      id: "databind-accessors-bad-html",
      ruleId: "gameface/html-databind-property-accessors",
      snippet: `<motion.div data-bind-value="{{Model.}}value"></motion.div>`,
    },
    {
      id: "databind-bind-for-bad-html",
      ruleId: "gameface/html-databind-bind-for",
      snippet: `<div data-bind-for="{{Model.gameId}}"></div>`,
    },
    {
      id: "databind-class-toggle-bad-html",
      ruleId: "gameface/html-databind-class-toggle",
      snippet: `<div data-bind-class-toggle="{{Model.gameId}}"></div>`,
    },
    {
      id: "databind-bind-for-semicolon-bad-html",
      ruleId: "gameface/html-databind-bind-for",
      snippet: `<div data-bind-for="lor;af gaeg:{{Model.value}}"></div>`,
    },
    {
      id: "databind-class-toggle-semicolon-bad-html",
      ruleId: "gameface/html-databind-class-toggle",
      snippet: `<div data-bind-class-toggle="af;fae;faef:{{Model.value}}"></div>`,
    },
    {
      id: "databind-spelling-valid-control-html",
      ruleId: "gameface/html-databind-spelling",
      snippet: `<div data-bind-value="{{Model.value}}"></div>`,
      expectReports: false,
    },
  ];

  for (const s of htmlScenarios) {
    rows.push({
      id: s.id,
      ruleId: s.ruleId,
      language: "html",
      filePath: "virtual/catalog/databind.html",
      snippet: `<!doctype html><html><body>${s.snippet}</body></html>`,
      expect: { reports: s.expectReports !== false, severity: "error" },
      catalog: { scenario: s.id },
    });
  }

  const jsxScenarios = [
    {
      id: "databind-spelling-invalid-jsx",
      ruleId: "gameface/jsx-databind-spelling",
      snippet: `<div data-bind-not-in-allowlist="{{Model.value}}" />`,
    },
    {
      id: "databind-curly-missing-jsx",
      ruleId: "gameface/jsx-databind-curly-brackets",
      snippet: `<div data-bind-value="no braces" />`,
    },
    {
      id: "databind-model-missing-jsx",
      ruleId: "gameface/jsx-databind-model-properties",
      snippet: `<div data-bind-value="{{Model.missingProp}}" />`,
    },
  ];

  for (const s of jsxScenarios) {
    rows.push({
      id: s.id,
      ruleId: s.ruleId,
      language: "jsx",
      filePath: "virtual/catalog/databind.jsx",
      snippet: `export function T() { return (${s.snippet}); }`,
      expect: { reports: true, severity: "error" },
      catalog: { scenario: s.id },
    });
  }

  return rows;
}
