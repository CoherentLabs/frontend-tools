import crypto from 'node:crypto';
import type { Registry } from '../types.js';

const sha = (contents: string | Buffer) =>
  crypto.createHash('sha256').update(Buffer.from(contents as any)).digest('hex');

/**
 * Contents the track fixtures are built from, keyed by registry path.
 *
 * `track` compares real hashes, so unlike the `add`/`update` fixtures these
 * files have to exist as bytes: the registry below hashes exactly these
 * strings, and tests write them (or deliberately corrupted variants) to disk.
 */
export const FILES = {
  buttonTsx: 'src/components/Basic/Button/Button.tsx',
  buttonScss: 'src/components/Basic/Button/Button.module.scss',
  dropdownTsx: 'src/components/Basic/Dropdown/Dropdown.tsx',
  scrollTsx: 'src/components/Layout/Scroll/Scroll.tsx',
  iconPng: 'src/components/Media/Icon/fallback.png',
  clampTs: 'src/components/utils/clamp.ts',
} as const;

/** Every file's canonical contents — what a pristine project has on disk. */
export const CONTENTS: Record<string, string> = {
  [FILES.buttonTsx]: 'export const Button = () => null;\n',
  [FILES.buttonScss]: '.button {\n  color: $textColor;\n}\n',
  [FILES.dropdownTsx]: 'export const Dropdown = () => null;\n',
  [FILES.scrollTsx]: 'export const Scroll = () => null;\n',
  // Deliberately carries a CRLF pair: a binary is compared byte-exact, so
  // normalising it the way a text file is normalised has to break the match.
  [FILES.iconPng]: 'PNG\r\n\u0000binary-ish\n',
  [FILES.clampTs]: 'export const clamp = () => 0;\n',
};

export const VERSIONS = {
  Button: '1.0.0',
  Dropdown: '1.1.0',
  Scroll: '1.0.3',
  Icon: '1.0.1',
} as const;
/** A pristine copy of the whole project, for tests that start from "clean". */
export const pristine = (): Record<string, string> => ({ ...CONTENTS });

export const registry: Registry = {
  version: '2.0.0',
  entries: {
    'Basic/Button': {
      kind: 'component',
      name: 'Button',
      version: VERSIONS.Button,
      category: 'Basic',
      files: [
        { path: FILES.buttonTsx, hash: sha(CONTENTS[FILES.buttonTsx]) },
        { path: FILES.buttonScss, hash: sha(CONTENTS[FILES.buttonScss]) },
      ],
      dependsOn: [],
      npmDependencies: ['solid-js'],
    },
    'Basic/Dropdown': {
      kind: 'component',
      name: 'Dropdown',
      version: VERSIONS.Dropdown,
      category: 'Basic',
      files: [{ path: FILES.dropdownTsx, hash: sha(CONTENTS[FILES.dropdownTsx]) }],
      dependsOn: ['utils'],
      npmDependencies: ['solid-js'],
    },
    'Layout/Scroll': {
      kind: 'component',
      name: 'Scroll',
      version: VERSIONS.Scroll,
      category: 'Layout',
      files: [{ path: FILES.scrollTsx, hash: sha(CONTENTS[FILES.scrollTsx]) }],
      dependsOn: [],
      npmDependencies: [],
    },
    'Media/Icon': {
      kind: 'component',
      name: 'Icon',
      version: VERSIONS.Icon,
      category: 'Media',
      files: [{ path: FILES.iconPng, hash: sha(CONTENTS[FILES.iconPng]) }],
      dependsOn: [],
      npmDependencies: [],
    },
    // Versionless, exactly like every lib in the real registry.
    'utils': {
      kind: 'lib',
      name: 'utils',
      files: [{ path: FILES.clampTs, hash: sha(CONTENTS[FILES.clampTs]) }],
      dependsOn: [],
      npmDependencies: [],
    } as any,
  },
};
