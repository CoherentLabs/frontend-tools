/**
 * Keyed-delta engine for reconstructing older Gameface feature catalogs from the
 * bundled "latest" snapshot, without storing a full copy of every version.
 *
 * A catalog file (e.g. functions/supported.json) is a flat array of
 * `{ status, surface, name, evidence }` rows. Rows are keyed by `${surface}|${name}`
 * (not `name` alone, since the `html` surface also carries `input-type` rows like
 * `input[type="checkbox"]`). Keying makes comparison order-independent, which matters
 * because the scraper does not emit rows in a stable order.
 */

/**
 * @param {{ surface?: unknown, name?: unknown }} row
 * @returns {string}
 */
export function keyRow(row) {
  const surface = typeof row?.surface === "string" ? row.surface : "";
  const name = typeof row?.name === "string" ? row.name : "";
  return `${surface}|${name}`;
}

/**
 * @param {unknown} rows
 * @returns {Array<Record<string, unknown>>}
 */
function asRows(rows) {
  return Array.isArray(rows) ? rows : [];
}

/**
 * JSON.stringify's output depends on key insertion order, which differs between
 * scraper runs (and predates canonical ordering entirely for older snapshots) even
 * when two rows are semantically identical. Recursively sort object keys before
 * stringifying so equality checks aren't fooled by key order.
 * @param {unknown} value
 * @returns {string}
 */
function stableStringify(value) {
  if (Array.isArray(value)) {
    // Every string-array field in `evidence` (missing members, rejected values, …)
    // represents an unordered set, not a sequence — and pre-canonicalization
    // snapshots may have them in whatever order the scraper discovered them.
    // Sort before comparing so reordering alone doesn't register as a change
    // (mirrors gameface-unsupported-features/src/write/catalog-writer.ts).
    const mapped = value.map(stableStringify);
    if (mapped.length > 0 && value.every((v) => typeof v === "string")) {
      mapped.sort();
    }
    return `[${mapped.join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(/** @type {Record<string, unknown>} */ (value)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @returns {Map<string, Record<string, unknown>>}
 */
export function toRowMap(rows) {
  const map = new Map();
  for (const row of asRows(rows)) {
    map.set(keyRow(row), row);
  }
  return map;
}

/**
 * @typedef {Object} CatalogFileDelta
 * @property {Record<string, Record<string, unknown>>} [added]
 * @property {string[]} [removed]
 * @property {Record<string, Record<string, unknown>>} [changed]
 */

/**
 * Computes a delta describing how to turn `fromRows` into `toRows`: applying the
 * result to `fromRows` (via {@link applyDelta}) reproduces `toRows`.
 * @param {Array<Record<string, unknown>>} fromRows
 * @param {Array<Record<string, unknown>>} toRows
 * @returns {CatalogFileDelta | null} null when the two catalogs are identical, so
 *   callers can omit the file from the delta entirely
 */
export function diffRows(fromRows, toRows) {
  const fromMap = toRowMap(fromRows);
  const toMap = toRowMap(toRows);

  /** @type {Record<string, Record<string, unknown>>} */
  const added = {};
  /** @type {Record<string, Record<string, unknown>>} */
  const changed = {};
  /** @type {string[]} */
  const removed = [];

  for (const [key, toRow] of toMap) {
    if (!fromMap.has(key)) {
      added[key] = toRow;
      continue;
    }
    const fromRow = fromMap.get(key);
    if (stableStringify(fromRow) !== stableStringify(toRow)) {
      changed[key] = toRow;
    }
  }

  for (const key of fromMap.keys()) {
    if (!toMap.has(key)) {
      removed.push(key);
    }
  }

  if (removed.length === 0 && Object.keys(added).length === 0 && Object.keys(changed).length === 0) {
    return null;
  }

  /** @type {CatalogFileDelta} */
  const delta = {};
  if (removed.length > 0) delta.removed = removed;
  if (Object.keys(added).length > 0) delta.added = added;
  if (Object.keys(changed).length > 0) delta.changed = changed;
  return delta;
}

/**
 * Applies a single file's delta (as produced by {@link diffRows}) to a base catalog array.
 * @param {Array<Record<string, unknown>>} baseRows
 * @param {CatalogFileDelta | undefined | null} delta
 * @returns {Array<Record<string, unknown>>}
 */
export function applyDelta(baseRows, delta) {
  const map = toRowMap(baseRows);
  if (!delta) {
    return Array.from(map.values());
  }

  for (const key of delta.removed ?? []) {
    map.delete(key);
  }
  for (const [key, row] of Object.entries(delta.changed ?? {})) {
    map.set(key, row);
  }
  for (const [key, row] of Object.entries(delta.added ?? {})) {
    map.set(key, row);
  }

  return Array.from(map.values());
}

/**
 * @param {string} version
 * @returns {number[]}
 */
function versionParts(version) {
  return String(version)
    .split(".")
    .map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isNaN(n) ? 0 : n;
    });
}

/**
 * Compares two dot-separated version strings numerically, part by part
 * (Cohtml versions like "3.1.0.25" have more parts than semver allows).
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a, b) {
  const pa = versionParts(a);
  const pb = versionParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * @typedef {Object} VersionManifest
 * @property {string} base newest version — the version the plain gameface-features/*.json files represent
 * @property {string[]} chain versions from newest (chain[0] === base) to oldest; consecutive
 *   entries have a delta file (named after the older entry) describing the hop between them
 * @property {Record<string, string>} [aliases] version -> chain entry with identical data
 */

/**
 * @typedef {Object} ResolvedVersion
 * @property {string} version the chain entry (or base) to actually load
 * @property {boolean} exact false when the requested version had no data and a
 *   nearest-lower (or oldest) fallback was used
 */

/** A requested version must look like this to be compared numerically against the chain. */
const VERSION_LIKE_PATTERN = /^\d+(?:\.\d+)*$/;

/**
 * Resolves a requested version setting against the manifest: exact match, alias,
 * nearest-lower fallback (oldest known version if the request is below all of them),
 * or — for a request that isn't recognizable as a version at all (typo, garbage) —
 * the base ("latest"), since guessing a "nearest" match against unrelated text would
 * be more surprising than just using the newest catalogs.
 * @param {string} requested normalized `settings.gameface.version`, or "latest"
 * @param {VersionManifest} manifest
 * @returns {ResolvedVersion}
 */
export function resolveVersion(requested, manifest) {
  const chain = Array.isArray(manifest?.chain) && manifest.chain.length > 0 ? manifest.chain : [manifest?.base];

  if (!requested || requested === "latest") {
    return { version: manifest.base, exact: true };
  }
  if (chain.includes(requested)) {
    return { version: requested, exact: true };
  }
  const aliasTarget = manifest?.aliases?.[requested];
  if (typeof aliasTarget === "string" && chain.includes(aliasTarget)) {
    return { version: aliasTarget, exact: true };
  }
  if (!VERSION_LIKE_PATTERN.test(requested)) {
    return { version: manifest.base, exact: false };
  }

  const ascending = [...chain].sort(compareVersions);
  let candidate = ascending[0];
  for (const v of ascending) {
    if (compareVersions(v, requested) <= 0) {
      candidate = v;
    } else {
      break;
    }
  }
  return { version: candidate, exact: false };
}
