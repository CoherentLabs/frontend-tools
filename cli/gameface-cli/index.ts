#!/usr/bin/env node
import { cancel, text, select, confirm, isCancel, spinner, note, outro, log } from '@clack/prompts';
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

async function main() {

  async function resolveComponent(componentId: string, components: Record<string, RegistryEntry>) {
    const componentsToCopy = new Set<string>();
    const npmDepsToInstall = new Set<string>();

    const componentName = components[componentId].name;

    function findDeps(id: string) {
      if (!id || componentsToCopy.has(id)) return;

      componentsToCopy.add(id);

      // Resolve npm deps
      components[id].npmDependencies.forEach(npmDep => {
        !Object.hasOwn(packageJson.dependencies ?? {}, npmDep) && npmDepsToInstall.add(npmDep) 
      });

      // Resolve component deps
      components[id].dependsOn.forEach(depId => findDeps(depId));
    }

    Object.keys(components).forEach(id => id === componentId && findDeps(id));

    const root = path.dirname(pkgPath);

    const spin = spinner();
    spin.start(`Resolving ${componentName}...`);
    let filesCount = 0;

    for (const id of componentsToCopy) {
      const entry = components[id];
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
    spin.stop(`Fetched ${componentName} files`);

    if (npmDepsToInstall.size > 0) {
      const deps = Array.from(npmDepsToInstall);
      const installSpin = spinner();
      installSpin.start(`Installing npm deps: ${deps.join(', ')}`);
      
      try {
        await execAsync(`npm i ${deps.join(' ')}`);
        installSpin.stop(`Installed npm deps: ${deps.join(', ')}`);
      } catch (err: any) {
        installSpin.stop(`Failed to install npm deps`);
        throw err;
      }
    }

    const depsCount = npmDepsToInstall.size + componentsToCopy.size - 1;
    log.success(`✓ ${componentName} installed (v${components[componentId].version})`);
    log.message(`+ ${depsCount} dependencies · ${filesCount} files`);
  }

  async function add(name: string) {
    if (!name) {
      cancel('Please provide a component name to add.');
      process.exit(1);
    }

    const { entries } = await fetchRegistry();
    const componentId = findComponentId(name, entries);

    if (!componentId) {
      cancel(`${name} is not a valid component. Please check the name and try again.`);
      process.exit(1);
    }

    // Check if the component is already installed
    if (Object.keys(installedComponents).find(n => name.toLowerCase() === n.toLowerCase())) {
      const currVer = installedComponents[entries[componentId].name];
      const remoteVer = entries[componentId].version;

      const areEqual = compareVersions(currVer, remoteVer) === 0;

      if (areEqual) {
        outro(`The ${name} component is already installed and up to date.`);
        process.exit(0);
      } else {
        const shouldUpdate = await confirm({
          message: `The ${name} component is already installed (version ${currVer}). Do you want to update it to version ${remoteVer}?`,
        })
        if (shouldUpdate) await resolveComponent(componentId, entries);
        else {
          outro(`Update canceled.`);
          process.exit(0);
        }
      }

      return;
    }

    await resolveComponent(componentId, entries);
  }

  async function update(name: string) {
    // Read package json and extract version
    const { entries } = await fetchRegistry();
    // if no name is provided update all
    if (!name) {
      console.log('Updating all components...');
      process.exit(0);
    }

    const componentId = findComponentId(name, entries);
    if (!componentId) {
      cancel(`${name} is not a valid component. Please check the name and try again.`);
      process.exit(1);
    }

    // Check if the component is missing from the installed components
    if (!Object.hasOwn(installedComponents, name)) {
      const shouldInstall = await confirm({
        message: `The ${name} component is not installed. Do you wish to add it now?`,
      });
      if (shouldInstall) await add(name);
      else {
        outro(`Update canceled.`);
        process.exit(0);
      }
      return;
    }

    const currVer = installedComponents[entries[componentId].name];
    const remoteVer = entries[componentId].version;
    const areEqual = compareVersions(currVer, remoteVer) === 0;

    if (areEqual) {
      outro(`The ${name} component is already installed and up to date.`);
      process.exit(0);
    } else {
      await resolveComponent(componentId, entries);
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
    console.log('gameface-cli')
    process.exit(0)
  }
  
  const [command, name] = positionals;
  // Shared setup logic
  const { pkgPath, packageJson, installedComponents } = getPackageJson();

  if (command === 'add') {
    add(name)
  } else if (command === 'update') {
    update(name)
  }
}

await main();