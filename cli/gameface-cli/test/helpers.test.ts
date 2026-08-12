import { describe, test, expect } from 'vitest';
import { compareVersions, findComponentId, touchedDirs } from '../helpers.js';
import type { RegistryEntry } from '../types.js';

describe('compareVersions', () => {
  test('reports equal versions as 0', () => {
    expect(compareVersions('1.1.0', '1.1.0')).toBe(0);
  });

  // Only the sign is part of the contract — the function returns na - nb, so
  // '1.0.0' vs '3.0.0' is -2. Asserting exact values would be wrong.
  test('orders by most significant differing segment', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
    expect(compareVersions('1.2.0', '1.1.9')).toBeGreaterThan(0);
    expect(compareVersions('1.1.1', '1.1.0')).toBeGreaterThan(0);
  });

  test('compares numerically, not lexically', () => {
    // as strings '1.10.0' sorts before '1.9.0' — the classic version trap
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0);
  });

  test('treats missing trailing segments as zero', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.1', '1.0.9')).toBeGreaterThan(0);
  });

  // Known bug: Number('0-beta') is NaN, and `NaN || 0` collapses it to 0, so
  // the prerelease suffix vanishes and update never fires for '1.1.0-beta.1'.
  // Flip this to a plain `test` once compareVersions handles prereleases.
  test.fails('distinguishes prereleases from their release', () => {
    expect(compareVersions('1.0.0-beta', '1.0.0')).toBeLessThan(0);
  });
});

describe('findComponentId', () => {
  const entries = {
    'Basic/Dropdown': { name: 'Dropdown' },
    'Layout/Scroll': { name: 'Scroll' },
  } as unknown as Record<string, RegistryEntry>;

  test('resolves a display name to its path-derived id', () => {
    expect(findComponentId('Dropdown', entries)).toBe('Basic/Dropdown');
  });

  test('is case-insensitive', () => {
    expect(findComponentId('dropdown', entries)).toBe('Basic/Dropdown');
    expect(findComponentId('SCROLL', entries)).toBe('Layout/Scroll');
  });

  test('returns undefined for an unknown name', () => {
    expect(findComponentId('Nonsense', entries)).toBeUndefined();
  });
});

describe('touchedDirs', () => {
  test('collapses to two segments, dedupes and sorts', () => {
    expect(touchedDirs([
      'src/components/Layout/Scroll/Scroll.tsx',
      'src/components/Basic/Dropdown/Dropdown.tsx',
      'src/components/Basic/Dropdown/Dropdown.module.scss',
      'src/utils/clamp.ts',
    ])).toEqual(['src/components', 'src/utils']);
  });

  // Icon writes to scripts/, which is why there is no single common prefix
  test('handles shallow paths outside src/', () => {
    expect(touchedDirs([
      'src/components/Basic/Icon/Icon.tsx',
      'scripts/gen-icons.mjs',
    ])).toEqual(['scripts', 'src/components']);
  });

  test('drops repo-root files rather than reporting "."', () => {
    expect(touchedDirs(['registry.json'])).toEqual([]);
  });

  test('respects the depth argument', () => {
    expect(touchedDirs(['src/components/Basic/Dropdown/Dropdown.tsx'], 3))
      .toEqual(['src/components/Basic']);
  });

  test('returns an empty list for no files', () => {
    expect(touchedDirs([])).toEqual([]);
  });
});
