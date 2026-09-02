import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, "..");
const manifestPath = join(pluginRoot, "gameface-features", "versions", "manifest.json");
const mirrorPath = join(pluginRoot, "docs", "supported-versions.json");

/**
 * Mirrors gameface-features/versions/manifest.json into docs/supported-versions.json.
 *
 * docs/ is the folder symlinked wholesale into the documentation site
 * (docs/src/content/docs/eslint-plugin-gameface -> this docs/ folder), so
 * anything placed HERE travels with that symlink automatically. The real
 * manifest, by contrast, lives outside docs/ entirely — a site component
 * reading it directly would have to assume the eslint-gameface and docs
 * packages sit at a fixed relative offset from each other wherever the site
 * gets built/deployed, which isn't guaranteed once the docs get uploaded
 * separately from the rest of the monorepo. This mirror removes that
 * assumption: the site only ever needs to reach INTO its own symlinked
 * content, never OUT to a sibling package.
 *
 * Called automatically at the end of build-version-delta.mjs; safe to re-run
 * any time (e.g. `npm run update-docs-supported-versions`).
 * @param {boolean} [dryRun]
 */
export function updateDocsSupportedVersions(dryRun = false) {
  if (!existsSync(manifestPath)) {
    console.log(`No manifest at "${manifestPath}" yet — skipping docs mirror.`);
    return;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (dryRun) {
    console.log(`[dry-run] would write "${mirrorPath}" (base: ${manifest.base})`);
    return;
  }
  writeFileSync(mirrorPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`Wrote "${mirrorPath}" (base: ${manifest.base})`);
}

// Only run automatically when this file is executed directly
// (`node scripts/update-docs-supported-versions.mjs`), not when imported as a module.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  updateDocsSupportedVersions(process.argv.includes("--dry-run"));
}
