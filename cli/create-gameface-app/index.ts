#!/usr/bin/env node
import { cancel, text, select, confirm, isCancel, spinner, note, outro } from '@clack/prompts';
import { rmSync, existsSync, readdirSync, readFileSync, writeFileSync, PathLike } from 'node:fs'
import { join } from 'node:path'
import tiged from 'tiged'
import { rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'
import TEMPLATES, { TemplateKey } from './config.js';
import { printHelp } from './help.js';

const REGISTRY_URL = 'https://github.com/CoherentLabs/Gameface-UI/releases/latest/download/registry.json';

/**
 * Records what the template ships under `gameface-ui-components`, so gameface-cli
 * can tell what is installed. Versions come from the registry, not the template.
 */
async function writeComponentsMap(dest: string): Promise<number> {
  const res = await fetch(REGISTRY_URL)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

  const registry = await res.json() as {
    entries: Record<string, { kind: string; name: string; version: string }>
  }

  const components: Record<string, string> = {}
  for (const entry of Object.values(registry.entries)) {
    if (entry.kind === 'component') components[entry.name] = entry.version
  }

  const pkgPath = join(dest, 'package.json')
  const raw = readFileSync(pkgPath, 'utf-8')
  const indent = raw.match(/\n([ \t]+)"/)?.[1] ?? '  '
  const packageJson = JSON.parse(raw)

  packageJson['gameface-ui-components'] = components
  writeFileSync(pkgPath, JSON.stringify(packageJson, null, indent) + '\n')

  return Object.keys(components).length
}

function bail(value: string | symbol | boolean) {
  if (isCancel(value) || value === false) {
    cancel('Operation cancelled')
    process.exit(0)
  }
  return value as string
}

async function handleExistingDirectory(dest: PathLike) {
  if (existsSync(dest) && readdirSync(dest).length > 0) {
    const choice = bail(await select({
      message: `Target directory "${dest}" is not empty. Please choose how to proceed:`,
      options: [
        { value: 'remove', label: 'Delete its contents and continue' },
        { value: 'cancel', label: 'Cancel operation' },
      ],
    }))

    if (choice === 'cancel') { cancel('Operation cancelled'); process.exit(0) }
    if (choice === 'remove') {
      const s = spinner()
      s.start(`Removing ${dest}`)
      await rm(dest, { recursive: true, force: true });
      s.stop(`Removed ${dest}`)
    }
  }
}

function getPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent
  if (!userAgent) return 'npm'
  const name = userAgent.split('/')[0]
  return ['npm', 'yarn', 'pnpm'].includes(name) ? name : 'npm'
}

function install(pm: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(`${pm} install`, {
      cwd,
      stdio: ['ignore', 'ignore', 'pipe'],
      shell: true,
    })
    let stderr = ''
    child.stderr?.on('data', d => { stderr += d })
    child.on('error', reject)
    child.on('close', code =>
      code === 0 ? resolve() : reject(new Error(stderr.trim() || `${pm} install exited with code ${code}`))
    )
  })
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      template: { type: 'string', short: 't' },
      default:  { type: 'boolean', short: 'd' },
      help:     { type: 'boolean', short: 'h' },
    },
  })

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const nameArg = positionals[0]?.trim() || undefined;
  const templateArg = values.template;

  let framework: TemplateKey | undefined = undefined;
  
  if (templateArg) {
    if (!(templateArg in TEMPLATES)) {
      cancel(`Unknown template "${templateArg}". Valid: ${Object.keys(TEMPLATES).join(', ')}`)
      process.exit(1)
    }
    framework = templateArg as TemplateKey;
  }

  const projectName = nameArg ?? bail(await text({
    message: 'Project name?',
    placeholder: 'gameface app',
    defaultValue: 'gameface-app',
  }));

  if (!projectName.trim() || projectName === '.' || projectName === '..' || /[\\/]/.test(projectName)) {
    cancel('Project name must be a single directory name (not a path).')
    process.exit(1)
  }
  
  const dest = join(process.cwd(), projectName);

  // Get user's preferred framework
  !framework && (framework = bail(await select({
    message: 'Choose a template:',
    options: Object.entries(TEMPLATES).map(([value, template]) => ({
      value,
      label: template.label,
    })),
  })) as TemplateKey)

  // Confirm the selection
  if (!values.default) {
    bail(await confirm({
      message: `Create a ${framework} starter project in /${projectName}?`,
    }));
  }
  
  await handleExistingDirectory(dest);
  const emitter = tiged(TEMPLATES[framework].path, { disableCache: true, force: true })

  const s = spinner()
  s.start(`Scaffolding project in ${dest}`)

  try {
    await emitter.clone(dest)
    
    if (framework === 'gameface-ui') {
      for (const dir of ['docs', '.github']) {
        rmSync(join(dest, dir), { recursive: true, force: true })
      }
    }

    if (!existsSync(dest) || readdirSync(dest).length === 0) {
      throw new Error(
        `\nScaffolding failed - the template appears to be empty.\n` +
        `This is likely a problem on our end. Please report it:\n` +
        `https://github.com/CoherentLabs/frontend-tools/issues`
      )
    }

    s.stop(`Created ${projectName} with the ${framework} template!`);
  } catch (error) {
    s.cancel('Scaffolding failed')
    rmSync(dest, { recursive: true, force: true })
    
    if (error instanceof Error) cancel(error.message)
    process.exit(1)
  }

  if (framework === 'gameface-ui') {
    s.start('Recording component versions')
    try {
      const count = await writeComponentsMap(dest)
      s.stop(`Recorded ${count} components in package.json`)
    } catch (error) {
      s.stop('Could not fetch component versions')
      note(
        `The components are installed, but their versions were not recorded, so\n` +
        `"gameface-cli update" will not see them. Re-run the scaffold when online.`,
        'Heads up'
      )
    }
  }

  const pm = getPackageManager()

  let shouldInstall: boolean | symbol = values.default ?? false;
  if (!shouldInstall) shouldInstall = await confirm({ message: `Install dependencies with ${pm}?` })

  if (isCancel(shouldInstall)) {
    cancel('Operation cancelled')
    process.exit(0)
  }

  let depsInstalled = false

  if (shouldInstall) {
    s.start(`Installing dependencies with ${pm}`)
    try {
      await install(pm, dest)
      s.stop('Dependencies installed')
      depsInstalled = true;
    } catch (error) {
      s.stop('Could not install dependencies')
      if (error instanceof Error) note(error.message, 'Install failed')
    }
  }

  const steps = [
    `cd ${projectName}`,
    ...(depsInstalled ? [] : [`${pm} install`]),
    `${pm}${pm === 'npm' ? ' run' : ''} dev`,
  ].join('\n')

  note(steps, 'To start the development server, run the following commands:')
  outro('Your Gameface project is ready!');
}

await main();