import { seededSample, slugId } from "../catalog-sampler.mjs";

/** @typedef {import("../catalog-sampler.mjs").FeatureRow} FeatureRow */

/**
 * @param {FeatureRow[]} jsUnsupported
 * @param {FeatureRow[]} jsPartial
 * @param {number} seed
 * @param {object} caps
 */
export function buildJsMatrixRows(jsUnsupported, jsPartial, seed, caps) {
  /** @type {import("./css.mjs").MatrixRow[]} */
  const rows = [];

  const globals = jsUnsupported.filter((r) => r.surface === "js" && typeof r.name === "string");
  for (const row of seededSample(
    globals,
    caps.jsUnsupported,
    seed,
    (r) => r.name,
    (r) => r.name === "Chrome" || r.name === "AbortController",
  )) {
    const name = row.name;
    rows.push({
      id: `js-unsupported-global-${slugId(name)}`,
      ruleId: "gameface/js-no-unsupported-globals",
      language: "js",
      filePath: "virtual/catalog/global.js",
      snippet: `void ${name};\n`,
      expect: { reports: true, severity: "error" },
      catalog: { file: "js/unsupported.json", name, status: row.status },
    });
  }

  /** @type {Array<{ typeName: string, member: string }>} */
  const memberCases = [];
  for (const row of jsPartial) {
    if (row.surface !== "js" || typeof row.name !== "string") {
      continue;
    }
    const missing = row.evidence?.missing;
    if (!Array.isArray(missing)) {
      continue;
    }
    for (const m of missing) {
      if (typeof m === "string" && m.length > 0 && /^[a-zA-Z_$][\w$]*$/.test(m)) {
        memberCases.push({ typeName: row.name, member: m });
      }
    }
  }
  for (const row of jsUnsupported) {
    if (row.surface !== "js" || typeof row.name !== "string") {
      continue;
    }
    const missing = row.evidence?.missing;
    if (!Array.isArray(missing)) {
      continue;
    }
    for (const m of missing) {
      if (typeof m === "string" && m.length > 0 && /^[a-zA-Z_$][\w$]*$/.test(m)) {
        memberCases.push({ typeName: row.name, member: m });
      }
    }
  }

  const seen = new Set();
  const uniqueMembers = memberCases.filter(({ typeName, member }) => {
    const k = `${typeName}.${member}`;
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });

  for (const { typeName, member } of seededSample(
    uniqueMembers,
    caps.jsPartialMembers,
    seed + 1,
    (c) => `${c.typeName}.${c.member}`,
    (c) => c.typeName === "Animation" && c.member === "effect",
  )) {
    rows.push({
      id: `js-partial-member-${slugId(typeName)}-${slugId(member)}`,
      ruleId: "gameface/js-partial-member-access",
      language: "js",
      filePath: "virtual/catalog/partial-member.js",
      snippet: `void ${typeName}.${member};\n`,
      expect: { reports: true, severity: "warn" },
      catalog: { typeName, member },
    });
  }

  rows.push({
    id: "js-unsupported-global-control-coherent",
    ruleId: "gameface/js-no-unsupported-globals",
    language: "js",
    filePath: "virtual/catalog/global-control.js",
    snippet: "void CoherentDebug;\n",
    expect: { reports: false },
    catalog: { control: true, name: "CoherentDebug" },
  });

  return rows;
}
