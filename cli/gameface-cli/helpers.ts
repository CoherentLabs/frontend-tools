import path from 'node:path'
import type { RegistryEntry } from './types.js'

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
