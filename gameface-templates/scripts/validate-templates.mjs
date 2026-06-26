import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatesRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const templates = readdirSync(templatesRoot)
  .filter((name) => name.endsWith('-typescript') || name.endsWith('-javascript'))
  .filter((name) => statSync(join(templatesRoot, name)).isDirectory())
  .sort();

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

let failed = false;

for (const template of templates) {
  const dir = join(templatesRoot, template);
  console.log(`\n=== Validating ${template} ===\n`);

  try {
    run('npm', ['install'], dir);
    run('npm', ['run', 'build'], dir);
    console.log(`\n✓ ${template} passed\n`);
  } catch (error) {
    failed = true;
    console.error(`\n✗ ${template} failed: ${error.message}\n`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`All ${templates.length} templates built successfully.`);
