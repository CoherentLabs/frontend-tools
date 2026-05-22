/** @typedef {{ status?: string, surface?: string, name?: string, evidence?: Record<string, unknown> }} FeatureRow */

/**
 * Mulberry32 PRNG for deterministic sampling.
 * @param {number} seed
 */
export function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {string} key
 * @param {number} seed
 */
export function hashScore(key, seed) {
  const rng = createRng(seed ^ hashString(key));
  return rng();
}

/**
 * @param {string} s
 */
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministically sample up to `max` items from `items`, always including `mustInclude` matches.
 * @template T
 * @param {T[]} items
 * @param {number} max
 * @param {number} seed
 * @param {(item: T) => string} keyFn
 * @param {(item: T) => boolean} [mustInclude]
 */
export function seededSample(items, max, seed, keyFn, mustInclude = () => false) {
  const required = items.filter(mustInclude);
  const rest = items.filter((item) => !mustInclude(item));
  rest.sort((a, b) => hashScore(keyFn(a), seed) - hashScore(keyFn(b), seed));
  const slots = Math.max(0, max - required.length);
  return [...required, ...rest.slice(0, slots)];
}

/**
 * @param {string} name
 */
export function slugId(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Stable matrix row id suffix; avoids collisions when {@link slugId} maps distinct names to the same slug.
 * @param {string} name
 */
export function matrixSlugId(name) {
  const base = slugId(name);
  const h = hashString(String(name)).toString(16).slice(0, 8);
  return `${base}-${h}`;
}

/**
 * Partial CSS rules only match Identifier/CssIdentifier value tokens (not numeric literals).
 * @param {string} value
 */
export function isLintablePartialKeyword(value) {
  const t = value.trim();
  if (!t) {
    return false;
  }
  return !/^-?\d+(\.\d+)?(%|[a-z]{1,4})?$/i.test(t);
}

/**
 * Pick first disallowed keyword from partial evidence (mirrors buildPartialKeywordGate).
 * Prefers identifier-like values the CSS partial rules can actually flag.
 * @param {Record<string, unknown>} evidence
 * @returns {string | null}
 */
export function pickPartialDisallowedKeyword(evidence) {
  const supported = asStringList(evidence.supportedValues).map((s) => s.toLowerCase());
  const supportedSet = new Set(supported);
  const candidates = [
    ...asStringList(evidence.unsupportedValues),
    ...asStringList(evidence.logRejectedValues),
  ];
  let numericFallback = null;
  for (const raw of candidates) {
    const lower = raw.toLowerCase();
    if (supportedSet.has(lower)) {
      continue;
    }
    if (isLintablePartialKeyword(raw)) {
      return raw;
    }
    if (!numericFallback) {
      numericFallback = raw;
    }
  }
  return numericFallback;
}

/**
 * @param {unknown} v
 * @returns {string[]}
 */
function asStringList(v) {
  if (!Array.isArray(v)) {
    return [];
  }
  return v.filter((x) => typeof x === "string");
}
