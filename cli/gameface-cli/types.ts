export interface GameFacePackageJson {
  dependencies?: Record<string, string>;
  'gameface-ui-components'?: Record<string, string>;
  [key: string]: unknown;
}

export interface PackageJsonInfo {
  pkgPath: string;
  packageJson: GameFacePackageJson;
  installedComponents: Record<string, string>;
  indent: string
}

export interface RegistryEntry {
  kind: 'component' | 'lib' | 'recipe'
  name: string
  version: string
  category?: string
  files: { path: string; hash: string }[]
  dependsOn: string[]
  npmDependencies: string[]
}

export interface Registry {
  version: string
  entries: Record<string, RegistryEntry>
}

export type Decision =
  | { status: 'install'; name: string; id: string; action: 'add' | 'update' }
  | { status: 'skip';    name: string }
  | { status: 'error';   name: string }
