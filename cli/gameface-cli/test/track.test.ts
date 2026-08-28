import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { registry, CONTENTS, FILES, pristine } from './track-fixtures.js';
import {
  startFixtureServer, makeProject, removeProject, readInstalled, readRawPackageJson,
  runCli, type FixtureServer,
} from './setup.js';
import { VERSIONS } from './track-fixtures.js';

let server: FixtureServer;
const projects: string[] = [];

function project(opts?: Parameters<typeof makeProject>[0]) {
  const dir = makeProject(opts);
  projects.push(dir);
  return dir;
}

/** Puts files on disk at their registry paths, as an existing project would have them. */
function install(dir: string, files: Record<string, string>) {
  for (const [rel, contents] of Object.entries(files)) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents);
  }
}

const read = (dir: string, rel: string) => fs.readFileSync(path.join(dir, rel), 'utf-8');

// Non-interactive by necessity: the suite spawns the CLI without a TTY, so the
// select prompt would never resolve. --yes takes the record-only branch.
const track = (dir: string, ...args: string[]) =>
  runCli(['track', '--yes', ...args], { cwd: dir, registryUrl: server.url });

beforeAll(async () => { server = await startFixtureServer(registry); });
afterAll(async () => { await server.close(); });
beforeEach(() => { server.hits.length = 0; server.reset(); });
afterEach(() => { projects.splice(0).forEach(removeProject); });

describe('track', () => {
  test('records untouched components at their real version', async () => {
    const dir = project();
    install(dir, pristine());

    const { code } = await track(dir);

    expect(code).toBe(0);
    // Make those read directly from the mock registry -> not hardcoded here, so the test will break if the registry changes.
    // a helper for that may be needed

    // Or expose them as constants and import here and place in registry too
    expect(readInstalled(dir)).toEqual({
      Button: VERSIONS.Button,
      Dropdown: VERSIONS.Dropdown,
      Scroll: VERSIONS.Scroll,
      Icon: VERSIONS.Icon,
    });
  });

  test('records a component as 0.0.0 when any one of its files differs', async () => {
    const dir = project();
    install(dir, { ...pristine(), [FILES.buttonScss]: '.button { color: red; }\n' });

    await track(dir);

    expect(readInstalled(dir)!.Button).toBe('0.0.0');
    expect(readInstalled(dir)!.Dropdown).toBe(VERSIONS.Dropdown);
  });

  test('records a component as 0.0.0 when a file is missing but others remain', async () => {
    const dir = project();
    const files = pristine();
    delete files[FILES.buttonScss];
    install(dir, files);

    await track(dir);

    expect(readInstalled(dir)!.Button).toBe('0.0.0');
  });

  test('skips a component with none of its files present', async () => {
    const dir = project();
    const files = pristine();
    delete files[FILES.scrollTsx];
    install(dir, files);

    await track(dir);

    expect(readInstalled(dir)).not.toHaveProperty('Scroll');
  });

  test('never writes component files', async () => {
    const dir = project();
    const mine = 'export const Button = () => "mine";\n';
    install(dir, { ...pristine(), [FILES.buttonTsx]: mine });

    await track(dir);

    expect(readInstalled(dir)!.Button).toBe('0.0.0');
    expect(read(dir, FILES.buttonTsx)).toBe(mine);
  });

  test('leaves entries that are already tracked untouched', async () => {
    const dir = project({ installed: { Button: '0.9.0' } });
    install(dir, pristine());

    await track(dir);

    expect(readInstalled(dir)!.Button).toBe('0.9.0');
    expect(readInstalled(dir)!.Dropdown).toBe(VERSIONS.Dropdown);
  });

  test('writes nothing when every present component is already tracked', async () => {
    const installed = { Button: VERSIONS.Button, Dropdown: VERSIONS.Dropdown, Scroll: VERSIONS.Scroll, Icon: VERSIONS.Icon };
    const dir = project({ installed });
    install(dir, pristine());
    const before = readRawPackageJson(dir);

    const { code, stdout } = await track(dir);

    expect(code).toBe(0);
    expect(stdout).toMatch(/already tracking/i);
    expect(readRawPackageJson(dir)).toBe(before);
  });

  test('reports an empty project without creating the property', async () => {
    const dir = project();

    const { code, stdout } = await track(dir);

    expect(code).toBe(0);
    expect(stdout).toMatch(/no gameface ui components/i);
    expect(readInstalled(dir)).toBeUndefined();
  });

  test('never records libs, which carry no version', async () => {
    const dir = project();
    install(dir, pristine());

    await track(dir);

    expect(readInstalled(dir)).not.toHaveProperty('utils');
    expect(Object.values(readInstalled(dir)!)).not.toContain(undefined);
  });

  test('matches a text file whose line endings were converted on checkout', async () => {
    const dir = project();
    const files = pristine();
    files[FILES.buttonTsx] = files[FILES.buttonTsx].replace(/\n/g, '\r\n');
    files[FILES.buttonScss] = files[FILES.buttonScss].replace(/\n/g, '\r\n');
    install(dir, files);

    await track(dir);

    expect(readInstalled(dir)!.Button).toBe(VERSIONS.Button);
  });

  test('compares binary files byte for byte', async () => {
    const dir = project();
    install(dir, {
      ...pristine(),
      [FILES.iconPng]: CONTENTS[FILES.iconPng].replace(/\r\n/g, '\n'),
    });

    await track(dir);

    expect(readInstalled(dir)!.Icon).toBe('0.0.0');
  });

  test('preserves the existing package.json indentation', async () => {
    const dir = project({ indent: '\t' });
    install(dir, pristine());

    await track(dir);

    expect(readRawPackageJson(dir)).toContain('\n\t"gameface-ui-components"');
  });

  test('lists the offending files under --verbose', async () => {
    const dir = project();
    install(dir, { ...pristine(), [FILES.buttonScss]: 'changed\n' });

    const { stdout } = await track(dir, '--verbose');

    expect(stdout).toContain(FILES.buttonScss);
  });
});

/**
 * `resolve` skips any file whose contents already match the registry, so an
 * update writes only what genuinely changed instead of rewriting whole
 * component closures. These need the hash-accurate fixture registry: the
 * add/update suite uses placeholder hashes, where nothing ever matches.
 */
describe('resolve skips files that already match', () => {
  /** File paths the CLI asked the server for, ignoring the registry itself. */
  const fetched = () => server.hits.filter(u => u !== '/registry.json');

  test('fetches nothing when every file is already current', async () => {
    // Recorded as behind, but the files on disk are the published ones
    const dir = project({ installed: { Button: '0.0.0' } });
    install(dir, pristine());

    const { code, stdout } = await runCli(['update', 'Button', '--yes'], {
      cwd: dir, registryUrl: server.url,
    });

    expect(code).toBe(0);
    expect(fetched()).toHaveLength(0);
    expect(stdout).toContain('Everything already up to date');
    // The version is still corrected, even though no file moved
    expect(readInstalled(dir)!.Button).toBe(VERSIONS.Button);
    expect(read(dir, FILES.buttonTsx)).toBe(CONTENTS[FILES.buttonTsx]);
  });

  test('fetches only the file that differs, not the whole component', async () => {
    const dir = project({ installed: { Button: '0.0.0' } });
    install(dir, { ...pristine(), [FILES.buttonScss]: 'locally changed\n' });

    await runCli(['update', 'Button', '--yes'], { cwd: dir, registryUrl: server.url });

    expect(fetched()).toEqual(['/' + FILES.buttonScss]);
    // The untouched sibling keeps its bytes — this is what stops a one-file
    // change from showing up as a whole-component diff
    expect(read(dir, FILES.buttonTsx)).toBe(CONTENTS[FILES.buttonTsx]);
    expect(read(dir, FILES.buttonScss)).not.toBe('locally changed\n');
  });

  test('reports only the files it actually wrote', async () => {
    const dir = project({ installed: { Button: '0.0.0' } });
    install(dir, { ...pristine(), [FILES.buttonScss]: 'locally changed\n' });

    const { stdout } = await runCli(['update', 'Button', '--yes', '--verbose'], {
      cwd: dir, registryUrl: server.url,
    });

    expect(stdout).toContain(FILES.buttonScss);
    expect(stdout).not.toContain(FILES.buttonTsx);
  });

  test('--hard on an intact component still writes nothing', async () => {
    // --hard bypasses the version check, not the file check
    const dir = project({ installed: { Button: VERSIONS.Button } });
    install(dir, pristine());

    const { code, stdout } = await runCli(['update', 'Button', '--hard', '--yes'], {
      cwd: dir, registryUrl: server.url,
    });

    expect(code).toBe(0);
    expect(fetched()).toHaveLength(0);
    expect(stdout).toContain('Everything already up to date');
  });
});
