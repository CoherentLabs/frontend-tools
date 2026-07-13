#!/usr/bin/env node
import { cancel, text, select, confirm, isCancel, spinner } from '@clack/prompts';
import { rmSync, existsSync, readdirSync, PathLike } from 'node:fs'
import { join } from 'node:path'
import tiged from 'tiged'
import TEMPLATES, { TemplateKey } from './config.js';

function bail(value: string | symbol | boolean) {
  if (isCancel(value) || value === false) {
    cancel('Operation cancelled')
    process.exit(1)
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
    if (choice === 'remove') rmSync(dest, { recursive: true, force: true })
  }
}

async function main() {
  const projectName = bail(await text({
    message: 'Project name?',
    placeholder: 'gameface app',
    defaultValue: 'gameface-app',
  }));

  const dest = join(process.cwd(), projectName);
  await handleExistingDirectory(dest);

  // Get user's preferred framework
  const framework = bail(await select({
    message: 'Choose a template:',
    options: Object.entries(TEMPLATES).map(([value, template]) => ({
      value,
      label: template.label,
      hint: template.hint,
    })),
  })) as TemplateKey;

  // Confirm the selection
  bail(await confirm({
    message: `Create a ${framework} starter project in /${projectName}?`,
  }));
  
  const emitter = tiged(TEMPLATES[framework].path, { disableCache: true, force: true })

  const s = spinner()
  s.start('Scaffolding project')

  try {
    await emitter.clone(dest)
    
    if (framework === 'gameface-ui') {
      for (const dir of ['docs', 'tests', '.github']) {
        rmSync(join(dest, dir), { recursive: true, force: true })
      }
    }

    if (!existsSync(dest) || readdirSync(dest).length === 0) {
      throw new Error(
        `\nScaffolding failed - the template appears to be empty.\n` +
        `This is likely a problem on our end. Please report it:\n` +
        `https://github.com/CoherentLabs/Gameface-UI/issues`
      )
    }

    s.stop(`Operation completed! Your project is ready at ${dest}`)
  } catch (error) {
    s.cancel('Scaffolding failed')
    rmSync(dest, { recursive: true, force: true })
    
    if (error instanceof Error) cancel(error.message)
    process.exit(1)
  }
}

await main();