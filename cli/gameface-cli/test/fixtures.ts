import type { Registry } from '../types.js';

/**
 * A miniature registry that mirrors the shapes of the real one
 */
export const registry: Registry = {
  version: '1.0.0',
  entries: {
    'Basic/Dropdown': {
      kind: 'component',
      name: 'Dropdown',
      version: '1.1.0',
      category: 'Basic',
      files: [
        { path: 'src/components/Basic/Dropdown/Dropdown.tsx', hash: 'a' },
        { path: 'src/components/Basic/Dropdown/Dropdown.module.scss', hash: 'b' },
      ],
      dependsOn: ['Layout/Scroll', 'BaseComponent'],
      npmDependencies: ['solid-js'],
    },
    'Layout/Scroll': {
      kind: 'component',
      name: 'Scroll',
      version: '1.0.3',
      category: 'Layout',
      files: [{ path: 'src/components/Layout/Scroll/Scroll.tsx', hash: 'c' }],
      dependsOn: ['utils'],
      npmDependencies: [],
    },
    'Basic/Icon': {
      kind: 'component',
      name: 'Icon',
      version: '1.0.0',
      category: 'Basic',
      files: [
        { path: 'src/components/Basic/Icon/Icon.tsx', hash: 'd' },
        { path: 'scripts/gen-icons.mjs', hash: 'e' },
      ],
      dependsOn: [],
      npmDependencies: [],
    },
    // Recipes go through the same pipeline as components, but live in
    // src/recipes/ and are excluded from the "components available" count.
    'HealthBar': {
      kind: 'recipe',
      name: 'HealthBar',
      version: '1.0.0',
      files: [{ path: 'src/recipes/HealthBar/HealthBar.tsx', hash: 'i' }],
      dependsOn: ['Layout/Scroll'],
      npmDependencies: [],
    },
    'utils': {
      kind: 'lib',
      name: 'utils',
      version: '1.0.0',
      files: [{ path: 'src/components/utils/clamp.ts', hash: 'f' }],
      dependsOn: [],
      npmDependencies: [],
    },
    'types': {
      kind: 'lib',
      name: 'types',
      version: '1.0.0',
      files: [{ path: 'src/components/types/index.ts', hash: 'g' }],
      dependsOn: ['BaseComponent'],
      npmDependencies: [],
    },
    'BaseComponent': {
      kind: 'lib',
      name: 'BaseComponent',
      version: '1.2.0',
      files: [{ path: 'src/components/BaseComponent/BaseComponent.tsx', hash: 'h' }],
      dependsOn: ['types'],
      npmDependencies: [],
    },
  },
};

/** Everything `add Dropdown` should pull in, transitively. */
export const DROPDOWN_CLOSURE = {
  Dropdown: '1.1.0',
  Scroll: '1.0.3',
  BaseComponent: '1.2.0',
  types: '1.0.0',
  utils: '1.0.0',
};
