#!/usr/bin/env node
/**
 * Builds/updates gameface-features/versions/ from a fresh scrape produced by
 * gameface-unsupported-features (a directory shaped like its results/, or
 * meta.json + css/functions/html/js/selectors subfolders).
 *
 * Usage:
 *   node scripts/build-version-delta.mjs <scrapeDir> [--version X.Y.Z.W] [--dry-run]
 *
 * <scrapeDir>/meta.json's "version" field is used unless --version overrides it
 * (needed for scrapes taken before the scraper recorded a version).
 *
 * Three supported outcomes, chosen automatically by comparing the scraped
 * version against gameface-features/versions/manifest.json:
 *   - No manifest yet            -> bootstrap: scrape becomes the base, chain = [version].
 *   - Newer than the current base -> PROMOTE: scrape becomes the new base; the old
 *     base is preserved as a new delta entry (its content doesn't change, only how
 *     it's stored — as a delta off the new base instead of full files). Every
 *     other existing delta in the chain is untouched: each one is relative to its
 *     own immediate neighbor, none of which changed content.
 *   - Older than everything known -> APPEND: diffed against the current oldest
 *     known version and appended as the new tail of the chain.
 *   - Exact match to an existing non-base chain entry -> REPLACE: regenerates
 *     that entry's delta (re-diffed against the same neighbor it already had),
 *     e.g. to pick up a corrected re-scrape of the same engine build.
 *
 * A version that would need to be inserted BETWEEN two existing non-base chain
 * entries is refused with an explanation — that requires recomputing the older
 * neighbor's existing delta relative to a new midpoint, which this tool doesn't
 * attempt automatically; do it as a deliberate manual step instead.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG_FILES, loadCatalogs, readManifest } from "../src/gameface-features/catalog-loader.js";
import { compareVersions, diffRows } from "../src/gameface-features/delta.js";
import { updateDocsSupportedVersions } from "./update-docs-supported-versions.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEATURES_ROOT = join(__dirname, "..", "gameface-features");

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const positional = [];
  let version;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--version") {
      version = argv[++i];
    } else if (arg.startsWith("--version=")) {
      version = arg.slice("--version=".length);
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    } else {
      throw new Error(`Unrecognized flag: ${arg}`);
    }
  }
  if (positional.length !== 1) {
    throw new Error("Usage: node scripts/build-version-delta.mjs <scrapeDir> [--version X.Y.Z.W] [--dry-run]");
  }
  return { scrapeDir: positional[0], version, dryRun };
}

/**
 * @param {string} dir
 * @returns {Map<string, Array<Record<string, unknown>>>}
 */
function readCatalogsFrom(dir) {
  const missing = CATALOG_FILES.filter((relPath) => !existsSync(join(dir, relPath)));
  if (missing.length > 0) {
    throw new Error(
      `"${dir}" is missing catalog file(s):\n${missing.map((m) => `  - ${m}`).join("\n")}\n` +
        "A partial scrape (e.g. only one of the three probe specs run) can't be safely diffed.",
    );
  }
  const catalogs = new Map();
  for (const relPath of CATALOG_FILES) {
    catalogs.set(relPath, JSON.parse(readFileSync(join(dir, relPath), "utf8")));
  }
  return catalogs;
}

/**
 * @param {string} scrapeDir
 * @param {string | undefined} versionOverride
 * @returns {string}
 */
function resolveScrapeVersion(scrapeDir, versionOverride) {
  if (versionOverride) {
    return versionOverride;
  }
  const metaPath = join(scrapeDir, "meta.json");
  if (existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    if (typeof meta.version === "string" && meta.version) {
      return meta.version;
    }
  }
  throw new Error(
    `Could not determine the scrape's version: "${metaPath}" not found (or has no "version" field) ` +
      "and no --version flag was given.",
  );
}

/**
 * Computes a delta per catalog file: applying it to `fromCatalogs` reproduces `toCatalogs`.
 * @param {Map<string, Array<Record<string, unknown>>>} fromCatalogs
 * @param {Map<string, Array<Record<string, unknown>>>} toCatalogs
 * @returns {{ files: Record<string, import("../src/gameface-features/delta.js").CatalogFileDelta>, stats: Array<{ file: string, added: number, removed: number, changed: number }> }}
 */
function diffCatalogs(fromCatalogs, toCatalogs) {
  /** @type {Record<string, import("../src/gameface-features/delta.js").CatalogFileDelta>} */
  const files = {};
  const stats = [];
  for (const relPath of CATALOG_FILES) {
    const delta = diffRows(fromCatalogs.get(relPath) ?? [], toCatalogs.get(relPath) ?? []);
    if (delta) {
      files[relPath] = delta;
    }
    stats.push({
      file: relPath,
      added: Object.keys(delta?.added ?? {}).length,
      removed: (delta?.removed ?? []).length,
      changed: Object.keys(delta?.changed ?? {}).length,
    });
  }
  return { files, stats };
}

/**
 * @param {Array<{ file: string, added: number, removed: number, changed: number }>} stats
 */
function printStats(stats) {
  const changedOnly = stats.filter((s) => s.added || s.removed || s.changed);
  if (changedOnly.length === 0) {
    console.log("  (no differences in any tracked catalog file)");
    return;
  }
  for (const s of changedOnly) {
    console.log(`  ${s.file}: +${s.added} -${s.removed} ~${s.changed}`);
  }
}

/**
 * @param {string} filePath
 * @param {unknown} data
 * @param {boolean} dryRun
 */
function writeJson(filePath, data, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] would write ${filePath}`);
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote ${filePath}`);
}

function main() {
  const { scrapeDir, version: versionOverride, dryRun } = parseArgs(process.argv.slice(2));
  performUpdate(scrapeDir, versionOverride, dryRun);
  // Regenerated unconditionally regardless of which branch below ran (including
  // the dry-run and no-op cases) so the docs mirror can never silently drift
  // out of sync with the manifest — cheap and idempotent either way.
  updateDocsSupportedVersions(dryRun);
}

/**
 * @param {string} scrapeDir
 * @param {string | undefined} versionOverride
 * @param {boolean} dryRun
 */
function performUpdate(scrapeDir, versionOverride, dryRun) {
  if (!existsSync(scrapeDir)) {
    throw new Error(`Scrape directory not found: "${scrapeDir}"`);
  }

  const version = resolveScrapeVersion(scrapeDir, versionOverride);
  const scrapeCatalogs = readCatalogsFrom(scrapeDir);
  const manifest = readManifest(FEATURES_ROOT);

  if (dryRun) {
    console.log("[dry-run] no files will be written\n");
  }

  // ── Bootstrap: no manifest yet ──────────────────────────────────────────
  if (!manifest || !manifest.base) {
    console.log(`No existing manifest — bootstrapping base = ${version}.`);
    for (const relPath of CATALOG_FILES) {
      writeJson(join(FEATURES_ROOT, relPath), scrapeCatalogs.get(relPath), dryRun);
    }
    writeJson(join(FEATURES_ROOT, "versions", "manifest.json"), { base: version, chain: [version] }, dryRun);
    return;
  }

  const chain = Array.isArray(manifest.chain) && manifest.chain.length > 0 ? manifest.chain : [manifest.base];
  const cmpToBase = compareVersions(version, manifest.base);

  // ── Exact match to the base: REFRESH it in place ────────────────────────
  // A re-scrape of the same engine build can legitimately differ from what's
  // stored — e.g. a scraper test-definition bug (a bad canonicalValue causing
  // a false "unsupported") gets fixed and re-run without the engine changing,
  // or the probe itself is simply non-deterministic run-to-run for some rows.
  if (cmpToBase === 0) {
    const currentBaseCatalogs = readCatalogsFrom(FEATURES_ROOT);
    const { stats } = diffCatalogs(currentBaseCatalogs, scrapeCatalogs);
    const changed = stats.some((s) => s.added || s.removed || s.changed);
    if (!changed) {
      console.log(`${version} is already the base version and matches the stored data. Nothing to do.`);
      return;
    }
    console.log(`${version} is already the base version, but the fresh scrape differs — refreshing it in place.`);
    printStats(stats);

    // The chain's next entry (if any) has a delta computed relative to the OLD
    // base content — refreshing the base invalidates it (it would silently
    // reconstruct slightly wrong data for every version from here down the
    // chain). Capture that entry's true, version-identified content BEFORE
    // touching the base, then recompute its delta against the NEW base. Every
    // entry beyond it stays valid: their deltas are relative to THIS entry's
    // value, which hasn't changed, only how it's derived has.
    const nextVersion = chain[1];
    const nextTrueCatalogs = nextVersion ? loadCatalogs(FEATURES_ROOT, manifest, nextVersion) : undefined;

    for (const relPath of CATALOG_FILES) {
      writeJson(join(FEATURES_ROOT, relPath), scrapeCatalogs.get(relPath), dryRun);
    }

    if (nextVersion && nextTrueCatalogs) {
      const { files: nextFiles, stats: nextStats } = diffCatalogs(scrapeCatalogs, nextTrueCatalogs);
      console.log(`Recomputed delta for ${nextVersion}, relative to the refreshed base:`);
      printStats(nextStats);
      writeJson(join(FEATURES_ROOT, "versions", `${nextVersion}.json`), { version: nextVersion, from: version, files: nextFiles }, dryRun);
    }
    return;
  }

  // ── Newer than the base: PROMOTE ────────────────────────────────────────
  if (cmpToBase > 0) {
    console.log(`${version} is newer than the current base (${manifest.base}) — promoting to base.`);
    const oldBaseVersion = manifest.base;
    const oldBaseCatalogs = readCatalogsFrom(FEATURES_ROOT);

    const { files, stats } = diffCatalogs(scrapeCatalogs, oldBaseCatalogs);
    console.log(`Delta for preserved old base (${oldBaseVersion}), relative to new base (${version}):`);
    printStats(stats);

    for (const relPath of CATALOG_FILES) {
      writeJson(join(FEATURES_ROOT, relPath), scrapeCatalogs.get(relPath), dryRun);
    }
    writeJson(join(FEATURES_ROOT, "versions", `${oldBaseVersion}.json`), { version: oldBaseVersion, from: version, files }, dryRun);
    writeJson(join(FEATURES_ROOT, "versions", "manifest.json"), { ...manifest, base: version, chain: [version, ...chain] }, dryRun);
    return;
  }

  // ── Exact match to an existing non-base chain entry: REPLACE its delta ──
  const existingIndex = chain.indexOf(version);
  if (existingIndex !== -1) {
    const neighbor = chain[existingIndex - 1];
    console.log(`${version} already exists in the chain — regenerating its delta relative to ${neighbor}.`);
    const neighborCatalogs = loadCatalogs(FEATURES_ROOT, manifest, neighbor);
    const { files, stats } = diffCatalogs(neighborCatalogs, scrapeCatalogs);
    console.log(`Delta for ${version}, relative to ${neighbor}:`);
    printStats(stats);
    writeJson(join(FEATURES_ROOT, "versions", `${version}.json`), { version, from: neighbor, files }, dryRun);
    return;
  }

  // ── Older than everything known: APPEND as the new tail ────────────────
  const ascending = [...chain].sort(compareVersions);
  const oldest = ascending[0];
  if (compareVersions(version, oldest) < 0) {
    console.log(`${version} is older than everything known (oldest: ${oldest}) — appending to the chain.`);
    const oldestCatalogs = loadCatalogs(FEATURES_ROOT, manifest, oldest);
    const { files, stats } = diffCatalogs(oldestCatalogs, scrapeCatalogs);
    console.log(`Delta for ${version}, relative to ${oldest}:`);
    printStats(stats);
    writeJson(join(FEATURES_ROOT, "versions", `${version}.json`), { version, from: oldest, files }, dryRun);
    writeJson(join(FEATURES_ROOT, "versions", "manifest.json"), { ...manifest, chain: [...chain, version] }, dryRun);
    return;
  }

  // ── Strictly between two existing entries: not supported automatically ─
  throw new Error(
    `${version} falls between two versions already in the chain (${chain.join(", ")}). ` +
      "Inserting it would require recomputing an existing delta relative to a new neighbor, " +
      "which this tool doesn't do automatically — insert it as a deliberate manual step instead.",
  );
}

main();
