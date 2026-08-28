#!/usr/bin/env node
import { cancel, confirm, isCancel, spinner, note, outro, log, intro, select } from '@clack/prompts';
import detectIndent from 'detect-indent';
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { parseArgs, promisify } from 'node:util'
import { printHelp } from './help.js';
import { compareVersions, findComponentId, touchedDirs, CHANGELOG_URL, SETUP_URL, MAX_LISTED_COMPONENTS, findInstalledComponent, missingSetupSteps, plural, matchesHash } from './helpers.js';
import { COMMANDS, type Boot, type Command, type Context, type Decision, type GameFacePackageJson, type PackageJsonInfo, type Registry } from './types.js';

const execAsync = promisify(exec)
const REPO = 'CoherentLabs/Gameface-UI';
const ORIGIN_OVERRIDE = process.env.GAMEFACE_REGISTRY_URL;
// `releases/latest` always resolves to the newest published release
const REGISTRY_URL = ORIGIN_OVERRIDE
  ? `${ORIGIN_OVERRIDE}/registry.json`
  : `https://github.com/${REPO}/releases/latest/download/registry.json`;
// Files come from the tag the registry names, so a run is one consistent snapshot
function filesBaseUrl(registry: Registry): string {
  const ref = registry.tag ?? `v${registry.version}`;
  return ORIGIN_OVERRIDE ?? `https://raw.githubusercontent.com/${REPO}/${ref}`;
}

async function fetchRegistry(): Promise<Registry> {
  const spin = spinner();
  spin.start('Fetching component registry...');

  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const registry = await res.json() as Registry;
    spin.stop(`Gameface UI v${registry.version}`);
    return registry;
  } catch (err: any) {
    spin.stop();
    throw new Error(
      `Could not fetch the registry (${err.message}).\n` +
      `Check your internet connection and try again. If the problem persists, ` +
      `submit an issue at https://github.com/${REPO}/issues.`
    );
  }
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

function getPackageJson(): PackageJsonInfo {
  const root = findProjectRoot(process.cwd());
  const pkgPath = path.join(root, 'package.json');
  const raw = fs.readFileSync(pkgPath, 'utf-8')
  const packageJson: GameFacePackageJson = JSON.parse(raw);
  const { indent } = detectIndent(raw);

  const hasSolid = packageJson.dependencies?.['solid-js'] ?? packageJson.devDependencies?.['solid-js'];
  if (!hasSolid) {
    console.log('Gameface UI components require a SolidJS project. Start a new project with:');
    console.log('  npm create gameface-app my-app');
    process.exit(1);
  }

  if (!packageJson['gameface-ui-components']) {
    packageJson['gameface-ui-components'] = {};
  }

  return { 
    pkgPath, 
    packageJson, 
    installedComponents: packageJson['gameface-ui-components'], 
    indent,
    missingSetup: missingSetupSteps(root)
  }
}

const isValidCommand = (v: string): v is Command => (COMMANDS as readonly string[]).includes(v);

function validateInput(command: string, names: string[]): Command | null {
  const cmd = command?.toLowerCase();

  if (!cmd || !isValidCommand(cmd)) {
    cancel(command ? `Unknown command: ${command}` : 'Please provide a command.');
    printHelp();
    return null;
  }

  if (cmd === 'add' && names.length === 0) {
    cancel('Please provide a component name to add.');
    return null;
  }
  return cmd;
}

async function decideAdd(ctx: Context, name: string): Promise<Decision> {
  const { entries, pkg: { installedComponents } } = ctx;

  const id = findComponentId(name, entries);

  // Invalid component
  if (!id) {
    log.error(`${name} is not a valid component.`);
    return { status: 'error', name };
  }

  const installedName = findInstalledComponent(installedComponents, name);
  // Not installed -> Add
  if (!installedName) return { status: 'install', name, id, action: 'add' };

  // Already installed? Compare versions
  const currVer = installedComponents[installedName];
  const remoteVer = entries[id].version;

  if (compareVersions(currVer, remoteVer) === 0) {
    log.info(`${name} is already installed and up to date (v${currVer}).`);
    return { status: 'skip', name };
  }

  if (!ctx.yes) {
    const shouldUpdate = await confirm({
      message: `${name} is installed at v${currVer}. Update to v${remoteVer}?`,
    });

    if (isCancel(shouldUpdate) || !shouldUpdate) {
      log.warn(`Skipped ${name}.`);
      return { status: 'skip', name };
    }
  }

  return { status: 'install', name, id, action: 'add' };
}

async function decideUpdate(ctx: Context, name: string): Promise<Decision> {
  const { entries, pkg: { installedComponents } } = ctx;

  const id = findComponentId(name, entries);

  if (!id) {
    log.error(`${name} is not a valid component.`);
    return { status: 'error', name };
  }

  // Check if the component is missing from the installed components
  const installedName = findInstalledComponent(installedComponents, name)

  if (!installedName) {
    if (!ctx.yes) {
      const shouldInstall = await confirm({
        message: `${name} is not installed. Do you wish to add it now?`,
      });

      if (isCancel(shouldInstall) || !shouldInstall) {
        log.warn(`Skipped ${name}.`);
        return { status: 'skip', name };
      }
    }

    return { status: 'install', name, id, action: 'add' };
  }

  // Compare versions
  if (!ctx.hard) {
    const currVer = installedComponents[installedName];
    const remoteVer = entries[id].version;
    const areEqual = compareVersions(currVer, remoteVer) === 0;
  
    if (areEqual) {
      log.info(`${name} is already installed and up to date (v${currVer}).`);
      return { status: 'skip', name };
    }
  }

  return { status: 'install', name, id, action: 'update' };
}

async function resolve(ctx: Context, rootIds: string[]) {
  const { 
    entries, 
    pkg: { installedComponents, packageJson, pkgPath, indent }, 
    registry,
    verbose
  } = ctx;

  const componentsToCopy = new Set<string>();
  const npmDepsToInstall = new Set<string>();
  const root = path.dirname(pkgPath);
  const changedComponents = new Set<string>();
  /** Registry paths actually written, for the counts and the summary below. */
  const writtenPaths: string[] = [];

  const spin = spinner();
  spin.start(`Resolving ${rootIds.length} component${plural(rootIds.length)}...`);

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
    const fileBaseUrl = filesBaseUrl(registry);
    for (const id of componentsToCopy) {
      const entry = entries[id];
      if (entry.name) spin.message(`Fetching ${entry.name}...`);
      installedComponents[entry.name] = entry.version;

      for (const file of entry.files) {
        const destPath = path.join(root, file.path);
        // Do not overwrite files that are already the absolute same as the remote version
        if (fs.existsSync(destPath) && matchesHash(destPath, file.hash)) continue;

        const res = await fetch(`${fileBaseUrl}/${file.path}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch ${file.path}: ${res.status} ${res.statusText}`);
        }

        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
        changedComponents.add(id);
        writtenPaths.push(file.path);
      }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, indent) + '\n');
    spin.stop(
      writtenPaths.length > 0
        ? `Wrote ${writtenPaths.length} file${plural(writtenPaths.length)}`
        : `Everything already up to date`);
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

  // Only roots that actually changed count against the total.
  const changedRoots = rootIds.filter(id => changedComponents.has(id));
  const libDeps = Array.from(changedComponents).filter(id => !changedRoots.includes(id));
  const npmCount = npmDepsToInstall.size - npmFailed.length;

  if (libDeps.length > 0 || npmCount > 0) {
    const detail = verbose ? libDeps.map(id => `\n  ${id}`).join('') : '';
    log.message(`+ ${libDeps.length} dependencies · ${npmCount} npm packages${detail}`);
  }

  if (writtenPaths.length === 0) return;

  if (verbose) {
    // Every file that was written, in full
    const listed = [...writtenPaths].sort().map(p => `  ${p}`);
    log.message(['Modified:', ...listed].join('\n'));
  } else {
    // Just the top-level directories they live in, for a concise summary
    log.message(`Modified: ${touchedDirs(writtenPaths).join(", ")}`);
  }

  if (npmFailed.length > 0) {
    log.warn(
      `npm installation failed. Install the dependencies manually:\n\n` +
      `  npm i ${npmFailed.join(' ')}`
    );
  }
}

function handleStatus(ctx: Context) {
  const { entries, pkg: { installedComponents } } = ctx;
  const localComponents = Object.keys(installedComponents);

  if (localComponents.length === 0) {
    log.info('No components installed.');
    outro('Run "gameface-cli add <component>" to install a component.');
    return 0;
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
    // Sorted so the list is stable between runs — an entry appearing or
    // disappearing then actually means something.
    const names = available.map(c => c.name).sort();
    const shown = names.slice(0, MAX_LISTED_COMPONENTS);
    const rest = names.length - shown.length;

    log.info(
      `${available.length} component${available.length > 1 ? 's' : ''} available to add: ` +
      (rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', '))
    );
    log.message(`See what's new at ${CHANGELOG_URL}`);
  }

  outro(outdatedCount === 0
    ? 'All components are up to date!'
    : `${outdatedCount} out of ${localComponents.length} outdated · run \`gameface-cli update\` to upgrade`);
  
  return 0;
}

async function handleInstall(ctx: Context) {
  const { command, names, pkg } = ctx;

  const action = command === 'add' 
    ? decideAdd 
    : decideUpdate;

  const targets = (command === 'update' && names.length === 0)
    ? Object.keys(pkg.installedComponents) // update all
    : names;

  const decisions: Decision[] = [];
  for (const name of targets) decisions.push(await action(ctx, name));

  const rootIds = decisions.flatMap(d => d.status === 'install' ? [d.id] : []);

  if (rootIds.length > 0) {
    try {
      await resolve(ctx, rootIds);
    } catch (err: any) {
      log.error(err.message ?? String(err));
      outro('Installation failed.');
      return 1;
    }

    if (pkg.missingSetup.length > 0) {
      note(
        [
          `This project is missing ${pkg.missingSetup.join(' and ')}.`,
          'Components will not resolve until that is in place:',
          SETUP_URL,
        ].join('\n'),
        'Setup required'
      );
    }
  }

  const skipped = decisions.filter(d => d.status === 'skip').length;
  const failed = decisions.filter(d => d.status === 'error').length;

  outro(`${rootIds.length} installed · ${skipped} skipped · ${failed} failed`);
  return failed > 0 ? 1 : 0;
}

async function handleTrack(ctx: Context) {
  const {
    entries, 
    pkg: { installedComponents, packageJson, pkgPath, indent },
    yes,
    verbose
  } = ctx;
  const root = path.dirname(pkgPath);
  

  let needUpdate = [] as string[];
  let upToDate = 0, alreadyTracked = 0;
  
  Object.entries(entries).forEach(([id, data]) => {
    if (data.kind === "lib") return;

    if (findInstalledComponent(installedComponents, data.name)) {
      alreadyTracked++;
      return;
    }

    const all = data.files.length;

    const info = {
      differ: [] as string[],
      missing: [] as string[],
    }

    data.files.forEach((file) => {
      const localFilePath = path.join(root, file.path);

      if (!fs.existsSync(localFilePath)) {
        info.missing.push(file.path);
        return;
      }

      if (!matchesHash(localFilePath, file.hash)) info.differ.push(file.path);
    })

    // skip, not installed
    if (info.missing.length === all) {
      if (verbose && data.kind !== 'recipe') {
        log.info(`${data.name} is not installed, skipping.`);
      }
      return;
    }

    // stale
    if (info.missing.length > 0 || info.differ.length > 0) {
      needUpdate.push(data.name);
      installedComponents[data.name] = "0.0.0";

      const { missing, differ } = info;
      const summary = [
        missing.length ? `${missing.length} missing file${plural(missing.length)}` : null,
        differ.length ? `${differ.length} modified file${plural(differ.length)}` : null,
      ].filter(Boolean).join(' and ');

      const lines = [`${data.name} has ${summary}. Recording as v0.0.0`];

      if (verbose) {
        for (const f of missing) lines.push(`  missing   ${f}`);
        for (const f of differ) lines.push(`  modified  ${f}`);
      }
      log.warn(lines.join('\n'));

      return;
    }

    // up to date
    installedComponents[data.name] = data.version;
    verbose && log.success(`${data.name} is up to date (v${data.version})`);
    upToDate++;
  })

  const total = needUpdate.length + upToDate;
  if (total === 0) {
    if (alreadyTracked > 0) {
      outro(`Already tracking ${alreadyTracked} component${plural(alreadyTracked)}. Nothing new to record.`);
      return 0;
    }
    log.info('No Gameface UI components detected in target project.');
    outro('Run "gameface-cli add <component>" to install a component.');
    return 0;
  }

  const options = [
    { value: 'record', label: 'Record versions only', hint: 'Writes component versions to package.json' },
    ...(needUpdate.length > 0 ? [{ value: 'update', label: 'Record and update now', hint: 'Overwrites component files' }] : []),
    { value: 'cancel', label: 'Cancel', hint: 'Abort the operation' },
  ]

  log.message(`Detected ${needUpdate.length} component${plural(needUpdate.length)} to update and ${upToDate} component${plural(upToDate)} up to date.`);

  const action = yes ? 'record' : await select({
    message: `Record ${needUpdate.length + upToDate} component${plural(needUpdate.length + upToDate)}?`,
    options
  });

  if (isCancel(action) || action === 'cancel') {
    cancel('Aborted.');
    return 1;
  }

  // Record the component versions to package.json
  fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, indent) + '\n');

  if (action === 'update') {
    return handleInstall({ ...ctx, command: 'update', names: needUpdate });
  }
  
  log.success(`Tracking complete. ${needUpdate.length} component${plural(needUpdate.length)} to update.`);
  outro(`${upToDate} component${plural(upToDate)} up to date.`);

  return 0;
}

async function bootStrap(): Promise<Boot> {
  let values: Record<string, boolean | undefined>;
  let positionals: string[];

  try {
    ({ values, positionals } = parseArgs({
      allowPositionals: true,
      options: {
        help: { type: 'boolean', short: 'h' },
        yes: { type: 'boolean', short: 'y' },
        hard: { type: 'boolean' },
        verbose: { type: 'boolean', short: 'v' },
      },
    }));
  } catch (err: any) {
    cancel(err.message.split('.')[0]);
    printHelp();
    return { ok: false, code: 1 };
  }

  if (values.help) {
    printHelp();
    return { ok: false, code: 0 };
  }

  const [command, ...rest] = positionals
  const names = [...new Set(rest)]
  // Early exit if input is invalid, so we don't fetch the registry unnecessarily
  const validatedCommand = validateInput(command, names);
  if (!validatedCommand) return { ok: false, code: 1 };

  // CLI entry after input validation
  intro('gameface-cli')

  const pkg = getPackageJson();
  let registry: Registry;

  try {
    registry = await fetchRegistry();
  } catch (err: any) {
    log.error(err.message);
    outro('Aborted.');
    return { ok: false, code: 1 };
  }

  return { ok: true, ctx: {
    command: validatedCommand,
    names,
    pkg,
    registry,
    entries: registry.entries,
    yes: Boolean(values.yes),
    hard: Boolean(values.hard),
    verbose: Boolean(values.verbose),
  }}
}

async function main() {
  const boot = await bootStrap();
  if (!boot.ok) return boot.code;

  switch (boot.ctx.command) {
    case 'track': return handleTrack(boot.ctx);
    case 'status': return handleStatus(boot.ctx);
    case 'add':
    case 'update': return handleInstall(boot.ctx);
  }
}

process.exitCode = await main();