export interface GameFacePackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  'gameface-ui-components'?: Record<string, string>;
  [key: string]: unknown;
}

export interface PackageJsonInfo {
  pkgPath: string;
  packageJson: GameFacePackageJson;
  installedComponents: Record<string, string>;
  indent: string;
  isFirstRun: boolean;
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
  /** Git tag the files live at. Falls back to `v${version}` when absent. */
  tag?: string
  entries: Record<string, RegistryEntry>
}

export type Decision =
  | { status: 'install'; name: string; id: string; action: 'add' | 'update' }
  | { status: 'skip';    name: string }
  | { status: 'error';   name: string }

export const COMMANDS = ['add', 'update', 'status', 'track'] as const;
export type Command = typeof COMMANDS[number];

export type Context = {
  command: Command;
  names: string[];
  yes: boolean;
  hard: boolean;
  verbose: boolean;
  registry: Registry;
  entries: Registry['entries'];
  pkg: PackageJsonInfo;
};

export type Boot = { ok: true;  ctx: Context } | { ok: false; code: number };
