import path from 'node:path'
import type { RegistryEntry } from './types.js'
import fs from 'node:fs';
import crypto from 'node:crypto';

/** Where users go to see what shipped in a release. */
export const CHANGELOG_URL = 'https://gameface-ui.coherent-labs.com/changelog/';

/** How many available component names `status` lists before collapsing to a count. */
export const MAX_LISTED_COMPONENTS = 5;

/**
 * Compares two dot-separated versions.
 * Returns < 0 when a is older, 0 when equal, > 0 when a is newer.
 * The magnitude is meaningless — only the sign is part of the contract.
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const na = partsA[i] || 0;
    const nb = partsB[i] || 0;
    if (na !== nb) return na - nb; // negative: a < b, positive: a > b
  }
  return 0; // equal
}

export function findComponentId(name: string, components: Record<string, RegistryEntry>): string | undefined {
  return Object.keys(components).find(id => components[id].name?.toLowerCase() === name.toLowerCase());
}

/**
 * Collapses file paths to the distinct directories they live under, for the
 * "Modified:" summary. There is no single common prefix once entries reach
 * outside src/components (Icon writes to scripts/), so this returns a set.
 */
export function touchedDirs(filePaths: string[], depth = 2): string[] {
  const dirs = filePaths.map(p =>
    // Registry paths are always POSIX, regardless of the host OS
    path.posix.dirname(p).split('/').slice(0, depth).join('/')
  );
  return [...new Set(dirs)].filter(d => d !== '.').sort();
}

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf)$/i;
const sha = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');

export function matchesHash(filePath: string, expected: string): boolean {
  const raw = fs.readFileSync(filePath);
  if (sha(raw) === expected) return true;
  if (BINARY.test(filePath)) return false;

  const lf = raw.toString('utf8').replace(/\r\n/g, '\n');
  return sha(Buffer.from(lf)) === expected             // CRLF checkout, LF in registry
      || sha(Buffer.from(lf.replace(/\n/g, '\r\n'))) === expected;  // the inverse
}


export function findInstalledComponent(installedComponents: Record<string, string>, name: string): string | undefined {
  return Object.keys(installedComponents).find(n => n.toLowerCase() === name.toLowerCase());
}

/** Plural suffix for a count: 0 and 2+ get an "s", 1 does not. */
export function plural(count: number) {
  return count === 1 ? '' : 's';
}