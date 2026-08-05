#!/usr/bin/env node
import { cancel, confirm, isCancel, spinner, note, outro, log, intro } from '@clack/prompts';
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { parseArgs, promisify } from 'node:util'

const execAsync = promisify(exec)

interface GameFacePackageJson {
  dependencies?: Record<string, string>;
  'gameface-ui-components'?: Record<string, string>;
  [key: string]: unknown;
}

interface PackageJsonInfo {
  pkgPath: string;
  packageJson: GameFacePackageJson;
  installedComponents: Record<string, string>;
}

interface RegistryEntry {
  kind: 'component' | 'lib' | 'recipe'
  name: string
  version: string
  category?: string
  files: { path: string; hash: string }[]
  dependsOn: string[]
  npmDependencies: string[]
}

interface Registry {
  version: string
  entries: Record<string, RegistryEntry>
}

type Decision =
  | { status: 'install'; name: string; id: string; action: 'add' | 'update' }
  | { status: 'skip';    name: string }
  | { status: 'error';   name: string }


const BASE_URL_ROOT = 'https://raw.githubusercontent.com/CoherentLabs/Gameface-UI/cli-temp';
const REGISTRY_URL = `${BASE_URL_ROOT}/registry.json`;
let isFirstRun = false;

async function fetchRegistry(): Promise<Registry> {
  const res = await fetch(REGISTRY_URL)

  if (!res.ok) {
    throw new Error(`Failed to fetch registry: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function findProjectRoot(startDir: string): string {
  let dir = startDir;

  while (true) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;

    const parent = path.dirname(dir);

    // No package.json at all: not a project. Can't proceed.
    if (parent === dir) {
      console.log('No package.json found. Start a GamefaceUI or SolidJS project first:');
      console.log('  npm create gameface-app my-app');
      process.exit(1);
    }

    dir = parent;
  }
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const na = partsA[i] || 0;
    const nb = partsB[i] || 0;
    if (na !== nb) return na - nb; // negative: a < b, positive: a > b
  }
  return 0; // equal
}

function getPackageJson (): PackageJsonInfo {
  const root = findProjectRoot(process.cwd());
  const pkgPath = path.join(root, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const hasSolid = packageJson.dependencies?.['solid-js'] ?? packageJson.devDependencies?.['solid-js'];
  if (!hasSolid) {
    console.log('Gameface UI requires a SolidJS project. Start a new project with:');
    console.log('  npm create gameface-app my-app');
    process.exit(1);
  }

  if (!packageJson['gameface-ui-components']) {
    packageJson['gameface-ui-components'] = {};
    isFirstRun = true;
  }

  return { pkgPath, packageJson, installedComponents: packageJson['gameface-ui-components'] }
}

function findComponentId(name: string, components: Record<string, RegistryEntry>): string | undefined {
  return Object.keys(components).find(id => components[id].name?.toLowerCase() === name.toLowerCase());
}

function validateInput(command: string, names: string[]) {
  if (!command || !['add', 'update', 'status'].includes(command.toLowerCase())) {
    cancel(command ? `Unknown command: ${command}` : 'Please provide a command.');
    printHelp();
    process.exit(1);
  }

  if (command.toLowerCase() === 'add' && names.length === 0) {
    cancel('Please provide a component name to add.');
    process.exit(1);
  }
}

function touchedDirs(filePaths: string[], depth = 2): string[] {
  const dirs = filePaths.map(p =>
    path.posix.dirname(p).split('/').slice(0, depth).join('/')
  );
  return [...new Set(dirs)].filter(d => d !== '.').sort();
}

function printHelp() {
  console.log(`
gameface-cli — add and update Gameface UI components in a SolidJS project

Usage
  gameface-cli <command> [components...]

Commands
  add <components...>      Add components, with their dependencies
  update [components...]   Update to the latest version (all installed if omitted)
  status                   Show installed components and available updates

Options
  -h, --help               Show this message

Examples
  gameface-cli add Dropdown
  gameface-cli add Dropdown Scroll
  gameface-cli update
  gameface-cli update Dropdown
  gameface-cli status
`);
}

async function main() {

  async function decideAdd(name: string): Promise<Decision> {
    const id = findComponentId(name, entries);

    // Invalid component
    if (!id) {
      log.error(`${name} is not a valid component.`);
      return { status: 'error', name };
    }

    const installedName = Object.keys(installedComponents).find(n => n.toLowerCase() === name.toLowerCase());
    // Not installed -> Add
    if (!installedName) return { status: 'install', name, id, action: 'add' };

    // Already installed? Compare versions
    const currVer = installedComponents[installedName];
    const remoteVer = entries[id].version;

    if (compareVersions(currVer, remoteVer) === 0) {
      log.info(`${name} is already installed and up to date (v${currVer}).`);
      return { status: 'skip', name };
    }

    const shouldUpdate = await confirm({
      message: `${name} is installed at v${currVer}. Update to v${remoteVer}?`,
    });

    if (isCancel(shouldUpdate) || !shouldUpdate) {
      log.warn(`Skipped ${name}.`);
      return { status: 'skip', name };
    }

    return { status: 'install', name, id, action: 'add' };
  }

  async function decideUpdate(name: string): Promise<Decision> {
    const id = findComponentId(name, entries);

    if (!id) {
      log.error(`${name} is not a valid component.`);
      return { status: 'error', name };
    }

    // Check if the component is missing from the installed components
    const installedName = Object.keys(installedComponents).find(n => n.toLowerCase() === name.toLowerCase());

    if (!installedName) {
      const shouldInstall = await confirm({
        message: `${name} is not installed. Do you wish to add it now?`,
      });

      if (isCancel(shouldInstall) || !shouldInstall) {
        log.warn(`Skipped ${name}.`);
        return { status: 'skip', name };
      }

      return { status: 'install', name, id, action: 'add' };
    }

    // Compare versions
    const currVer = installedComponents[entries[id].name];
    const remoteVer = entries[id].version;
    const areEqual = compareVersions(currVer, remoteVer) === 0;

    if (areEqual) {
      log.info(`${name} is already installed and up to date (v${currVer}).`);
      return { status: 'skip', name };
    }

    return { status: 'install', name, id, action: 'update' };
  }

  async function resolve(rootIds: string[]) {
    const componentsToCopy = new Set<string>();
    const npmDepsToInstall = new Set<string>();
    const root = path.dirname(pkgPath);
    const spin = spinner();
    spin.start(`Resolving ${rootIds.length} component${rootIds.length > 1 ? 's' : ''}...`);
    let filesCount = 0;

    function findDeps(id: string) {
      if (componentsToCopy.has(id)) return;

      componentsToCopy.add(id);
      // Resolve npm deps
      entries[id].npmDependencies.forEach(npmDep => {
        !Object.hasOwn(packageJson.dependencies ?? {}, npmDep) && npmDepsToInstall.add(npmDep) 
      });

      // Resolve component deps
      entries[id].dependsOn.forEach(depId => findDeps(depId));
    }

    rootIds.forEach(id => findDeps(id));

    try {
      for (const id of componentsToCopy) {
        const entry = entries[id];
        if (entry.name) spin.message(`Fetching ${entry.name}...`);
        installedComponents[entry.name] = entry.version;

        for (const file of entry.files) {
          const res = await fetch(`${BASE_URL_ROOT}/${file.path}`);

          if (!res.ok) {
            throw new Error(`Failed to fetch ${file.path}: ${res.status} ${res.statusText}`);
          }

          const destPath = path.join(root, file.path);

          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.writeFileSync(destPath, await res.text());
          filesCount++;
        }
      }

      fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2) + '\n');
      spin.stop(`Fetched ${componentsToCopy.size} components · ${filesCount} files`);
    } catch (err) {
      spin.stop(`Failed to fetch component files`);
      throw err;
    }

    // Files are already on disk by now, so a failed npm i degrades to a warning
    // rather than failing the whole operation. The user retries it by hand.
    let npmFailed: string[] = [];

    if (npmDepsToInstall.size > 0) {
      const deps = Array.from(npmDepsToInstall);
      const installSpin = spinner();
      installSpin.start(`Installing npm deps: ${deps.join(', ')}`);

      try {
        await execAsync(`npm i ${deps.join(' ')}`);
        installSpin.stop(`Installed npm deps: ${deps.join(', ')}`);
      } catch (err: any) {
        installSpin.stop(`Could not install npm deps`);
        npmFailed = deps;
      }
    }

    // Safe to log again only now that both spinners have stopped
    for (const id of rootIds) {
      log.success(`${entries[id].name} (v${entries[id].version})`);
    }

    const depsCount = componentsToCopy.size - rootIds.length;
    const npmCount = npmDepsToInstall.size - npmFailed.length;

    if (depsCount > 0 || npmCount > 0) {
      log.message(`+ ${depsCount} dependencies · ${npmCount} npm packages`);
    }

    const touched = touchedDirs(
      [...componentsToCopy].flatMap(id => entries[id].files.map(f => f.path))
    );
    log.message(`Modified: ${touched.join(', ')}`);

    if (npmFailed.length > 0) {
      log.warn(
        `npm installation failed. Install the dependencies manually:\n\n` +
        `  npm i ${npmFailed.join(' ')}`
      );
    }
  }
  
  // ENTRY POINT
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
    },
  })
  
  if (values.help) {
    printHelp()
    return
  }
  
  const [command, ...rest] = positionals
  const names = [...new Set(rest)]

  validateInput(command, names);

  intro('gameface-cli')

  const { pkgPath, packageJson, installedComponents } = getPackageJson();
  const { entries } = await fetchRegistry()

  if (command.toLowerCase() === 'status') {
    const localComponents = Object.keys(installedComponents);

    if (localComponents.length === 0) {
      log.info('No components installed.');
      outro('Run "gameface-cli add <component>" to install a component.');
      return;
    }

    let outdatedCount = 0;
    const componentStatus = []
    const available = Object.values(entries).filter(c => c.kind === 'component' && !localComponents.includes(c.name));
    // For alignment
    const nameWidth = Math.max(...localComponents.map(n => n.length));
    
    for (const id of localComponents) {
      const localVersion = installedComponents[id];
      const componentId = findComponentId(id, entries);

      if (!componentId) continue; // Component not found in registry, skip

      const componentName = entries[componentId].name;
      const remoteVersion = entries[componentId].version;
      const equal = compareVersions(localVersion, remoteVersion) === 0;

      if (!equal) outdatedCount++;

      const status = equal ? '(up to date)' :`→ v${remoteVersion}`
      componentStatus.push(`${componentName.padEnd(nameWidth)} v${localVersion} ${status}`)
    }

    note(componentStatus.join('\n'), 'Installed Components');

    if (available.length > 0) {
      log.info(`${available.length} more component${available.length > 1 ? 's' : ''} available in the library.`);
    }

    outro(outdatedCount === 0
      ? 'All components are up to date!'
      : `${outdatedCount} out of ${localComponents.length} outdated · run \`gameface-cli update\` to upgrade`);
    return;
  }

  const action = command.toLowerCase() === 'add' ? decideAdd : decideUpdate;

  const targets = command.toLowerCase() === 'update' && names.length === 0
    ? Object.keys(installedComponents)   // no-arg sweep; these are names, which is what decide takes
    : names;

  const decisions: Decision[] = [];
  for (const name of targets) decisions.push(await action(name));

  const rootIds = decisions.flatMap(d => d.status === 'install' ? [d.id] : []);

  if (rootIds.length > 0) {
    try {
      await resolve(rootIds);
    } catch (err: any) {
      log.error(err.message ?? String(err));
      outro('Installation failed.');
      process.exitCode = 1;
      return;
    }

    if (isFirstRun) {
      note(
        `Add the @components alias to tsconfig.json and vite.config\nPoint @assets/scss/variables at your style tokens`,
        'Setup required'
      );
    }
  }

  const skipped = decisions.filter(d => d.status === 'skip').length;
  const failed = decisions.filter(d => d.status === 'error').length;

  outro(`${rootIds.length} installed · ${skipped} skipped · ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
}

await main();