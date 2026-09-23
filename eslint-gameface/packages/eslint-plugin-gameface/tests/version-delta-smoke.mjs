import { clearFeatureIndexCache, getFeatureIndex } from "../src/gameface-features/index.js";

// --- sanity: default path resolves and looks reasonable ---

clearFeatureIndexCache();
const latest = getFeatureIndex();

if (latest.cssFunctionsSupportedCount < 50) {
  throw new Error(`expected latest cssFunctionsSupportedCount >= 50, got ${latest.cssFunctionsSupportedCount}`);
}

// --- overrides.json applies on top of every reconstructed version ---

if (latest.cssFunctionsUnsupported.has("repeating-linear-gradient")) {
  throw new Error("latest should treat repeating-linear-gradient as supported (per overrides.json)");
}
if (latest.cssFunctionsUnsupported.has("repeating-radial-gradient")) {
  throw new Error("latest should treat repeating-radial-gradient as supported (per overrides.json)");
}

// --- reconstruction is deterministic: same version resolved twice matches ---

clearFeatureIndexCache();
const latestAgain = getFeatureIndex();
if (latestAgain.cssFunctionsSupportedCount !== latest.cssFunctionsSupportedCount) {
  throw new Error("reconstructing the same version twice should be idempotent");
}

// --- unknown-but-version-shaped request: nearest-lower fallback ---
// Only one version is currently bundled (see gameface-features/versions/manifest.json),
// so both an above-range and a below-range request resolve to that same version.

clearFeatureIndexCache();
const tooNew = getFeatureIndex("9.9.9.9");
if (tooNew.cssFunctionsSupportedCount !== latest.cssFunctionsSupportedCount) {
  throw new Error("a version above everything known should resolve to latest (nearest-lower from above)");
}

const tooOld = getFeatureIndex("1.0.0");
if (tooOld.cssFunctionsSupportedCount !== latest.cssFunctionsSupportedCount) {
  throw new Error("a version below everything known should resolve to the oldest known version");
}

// --- garbage, non-version-shaped request: falls back to latest, not "nearest" ---

const garbage = getFeatureIndex("unknown-version-dir-not-present");
if (garbage.cssSupportedCount !== latest.cssSupportedCount) {
  throw new Error("a non-version-shaped string should fall back to latest catalogs");
}

console.log("version-delta-smoke: ok");
