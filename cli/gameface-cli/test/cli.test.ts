import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { registry, DROPDOWN_CLOSURE } from './fixtures.js';
import { CHANGELOG_URL } from '../helpers.js';
import {
  startFixtureServer, makeProject, removeProject, readInstalled, readRawPackageJson,
  runCli, UNREACHABLE_URL,
  type FixtureServer,
} from './setup.js';

let server: FixtureServer;
const projects: string[] = [];

/** Creates a temp project that gets cleaned up after the test. */
function project(opts?: Parameters<typeof makeProject>[0]) {
  const dir = makeProject(opts);
  projects.push(dir);
  return dir;
}

const run = (dir: string, ...args: string[]) =>
  runCli(args, { cwd: dir, registryUrl: server.url });

/**
 * Asserts the CLI reported a component at a version, on one line, without
 * pinning the phrasing between them. The contract is "say what you installed
 * and which version" — not the parentheses around it.
 */
function expectReported(stdout: string, name: string, version: string) {
  expect(stdout).toMatch(new RegExp(`${name}[^\\n]*${version.replace(/\./g, '\\.')}`));
}

beforeAll(async () => { server = await startFixtureServer(registry); });
afterAll(async () => { await server.close(); });

beforeEach(() => {
  server.hits.length = 0;
  server.reset();
});
afterEach(() => {
  projects.splice(0).forEach(removeProject);
});

describe('add', () => {
  test('writes the component and its whole closure', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(0);
    expectReported(stdout, 'Dropdown', '1.1.0');

    // Files land at their registry paths, relative to the project root
    expect(fs.existsSync(path.join(dir, 'src/components/Basic/Dropdown/Dropdown.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'src/components/Layout/Scroll/Scroll.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'src/components/utils/clamp.ts'))).toBe(true);

    // …and the receipt records every entry, deps included
    expect(readInstalled(dir)).toEqual(DROPDOWN_CLOSURE);
  });

  test('installs entries that depend on each other', async () => {
    const dir = project();
    const { code } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(0);
    expect(readInstalled(dir)).toMatchObject({ BaseComponent: '1.2.0', types: '1.0.0' });
  });

  test('fetches a shared dependency once across multiple roots', async () => {
    const dir = project();
    // Scroll is both an explicit root and a dependency of Dropdown;
    // utils is reachable only through Scroll.
    const { code } = await run(dir, 'add', 'Dropdown', 'Scroll');

    expect(code).toBe(0);
    expect(server.hits.filter(u => u.endsWith('Scroll.tsx'))).toHaveLength(1);
    expect(server.hits.filter(u => u.endsWith('clamp.ts'))).toHaveLength(1);
  });

  test('fetches the registry exactly once for a multi-component add', async () => {
    const dir = project();
    await run(dir, 'add', 'Dropdown', 'Icon');

    expect(server.hits.filter(u => u === '/registry.json')).toHaveLength(1);
  });

  test('is idempotent — a second add skips instead of refetching', async () => {
    const dir = project();
    await run(dir, 'add', 'Dropdown');

    server.hits.length = 0;
    const { code } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(0);
    // Nothing beyond the registry was refetched, which is what idempotent means
    expect(server.hits.filter(u => u !== '/registry.json')).toHaveLength(0);
    expect(readInstalled(dir)).toEqual(DROPDOWN_CLOSURE);
  });

  test('reports an unknown component and exits 1', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Nonsense');

    expect(code).toBe(1);
    expect(stdout).toContain('Nonsense is not a valid component');
    // Nothing to install means resolve() never runs, so package.json is left
    // untouched — the version map key is never even created.
    expect(readInstalled(dir)).toBeUndefined();
  });

  test('installs the valid components even when one name is bad', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Icon', 'Nonsense');

    // Partial success still fails the command…
    expect(code).toBe(1);
    expect(stdout).toContain('1 installed');
    expect(stdout).toContain('1 failed');
    // …but the good one landed
    expect(fs.existsSync(path.join(dir, 'src/components/Basic/Icon/Icon.tsx'))).toBe(true);
  });

  test('writes files that live outside src/components', async () => {
    const dir = project();
    await run(dir, 'add', 'Icon');

    expect(fs.existsSync(path.join(dir, 'scripts/gen-icons.mjs'))).toBe(true);
  });

  test('--yes upgrades an outdated component without prompting', async () => {
    const dir = project({ installed: { Dropdown: '1.0.0' } });
    const { code, stdout } = await run(dir, 'add', 'Dropdown', '--yes');

    expect(code).toBe(0);
    expectReported(stdout, 'Dropdown', '1.1.0');
    expect(readInstalled(dir)).toMatchObject({ Dropdown: '1.1.0' });
  });
});

describe('update', () => {
  test('no-arg sweep upgrades stale entries and leaves current ones alone', async () => {
    const dir = project({ installed: { Dropdown: '1.0.0', utils: '1.0.0' } });
    const { code, stdout } = await run(dir, 'update');

    expect(code).toBe(0);
    expectReported(stdout, 'Dropdown', '1.1.0');
    expect(stdout).toContain('utils is already installed and up to date');
    expect(readInstalled(dir)).toMatchObject({ Dropdown: '1.1.0', utils: '1.0.0' });
  });

  test('reports nothing to do when everything is current', async () => {
    const dir = project({ installed: { utils: '1.0.0' } });
    const { code, stdout } = await run(dir, 'update');

    expect(code).toBe(0);
    expect(stdout).toContain('0 installed');
    expect(server.hits.filter(u => u !== '/registry.json')).toHaveLength(0);
  });

  test('--yes adds a component that is not installed yet', async () => {
    const dir = project();
    const { code } = await run(dir, 'update', 'Icon', '--yes');

    expect(code).toBe(0);
    expect(readInstalled(dir)).toMatchObject({ Icon: '1.0.0' });
  });

  test('--hard reinstalls a component whose version already matches', async () => {
    const dir = project({ installed: { Scroll: '1.0.3' } });
    const file = path.join(dir, 'src/components/Layout/Scroll/Scroll.tsx');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'edited by hand\n');

    const { code } = await run(dir, 'update', 'Scroll', '--hard');

    expect(code).toBe(0);
    // The fixture server invents file bodies, so the contract worth asserting
    // is that the local edit is gone — not what replaced it.
    expect(fs.readFileSync(file, 'utf-8')).not.toBe('edited by hand\n');
  });

  test('leaves an up-to-date component alone without --hard', async () => {
    const dir = project({ installed: { Scroll: '1.0.3' } });
    const file = path.join(dir, 'src/components/Layout/Scroll/Scroll.tsx');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'edited by hand\n');

    await run(dir, 'update', 'Scroll');

    expect(fs.readFileSync(file, 'utf-8')).toBe('edited by hand\n');
  });
});

describe('recipes', () => {
  const getComponentsCount = () => Object.values(registry.entries).filter(e => e.kind === 'component').length;
  
  test('adds a recipe and pulls in the components it uses', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'HealthBar');

    expect(code).toBe(0);
    expectReported(stdout, 'HealthBar', '1.0.0');
    expect(fs.existsSync(path.join(dir, 'src/recipes/HealthBar/HealthBar.tsx'))).toBe(true);
    // Recipes reuse components, so the closure reaches back into src/components
    expect(fs.existsSync(path.join(dir, 'src/components/Layout/Scroll/Scroll.tsx'))).toBe(true);
  });

  test('records the recipe in the version map alongside components', async () => {
    const dir = project();
    await run(dir, 'add', 'HealthBar');

    expect(readInstalled(dir)).toEqual({
      HealthBar: '1.0.0',
      Scroll: '1.0.3',
      utils: '1.0.0',
    });
  });

  test('is not counted among the components available to install', async () => {
    // Only entries with kind 'component' are advertised, so the recipe and the
    // libs must not be counted. Asserted as a bare number so rewording the
    // sentence around it doesn't break the test.
    const dir = project({ installed: { utils: '1.0.0' } });
    const { stdout } = await run(dir, 'status');

    expect(stdout).toMatch(new RegExp(`\\b${getComponentsCount()}\\b.*available`));
  });

  test('is not advertised as available once installed', async () => {
    const dir = project({ installed: { HealthBar: '1.0.0' } });
    const { stdout } = await run(dir, 'status');

    expect(stdout).toMatch(new RegExp(`\\b${getComponentsCount()}\\b.*available`));
    expect(stdout).toContain('HealthBar');   // still listed as installed
  });

  test('is updated by the no-arg sweep like anything else', async () => {
    const dir = project({ installed: { HealthBar: '0.9.0' } });
    const { code, stdout } = await run(dir, 'update');

    expect(code).toBe(0);
    expectReported(stdout, 'HealthBar', '1.0.0');
    expect(readInstalled(dir)).toMatchObject({ HealthBar: '1.0.0' });
  });
});

describe('status', () => {
  test('tells a fresh project there is nothing installed', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'status');

    expect(code).toBe(0);
    expect(stdout).toContain('No components installed');
  });

  test('flags outdated entries and counts the rest', async () => {
    const dir = project({ installed: { Dropdown: '1.0.0', utils: '1.0.0' } });
    const { code, stdout } = await run(dir, 'status');

    expect(code).toBe(0);
    expect(stdout).toContain('Dropdown');
    expect(stdout).toContain('v1.1.0');       // the available upgrade
    expect(stdout).toContain('up to date');   // utils
    expect(stdout).toContain('1 out of 2 outdated');
  });

  test('says so when everything is current', async () => {
    const dir = project({ installed: { utils: '1.0.0' } });
    const { stdout } = await run(dir, 'status');

    expect(stdout).toContain('All components are up to date');
  });

  test('names the components available to add', async () => {
    const dir = project({ installed: { utils: '1.0.0' } });
    const { stdout } = await run(dir, 'status');

    // Every uninstalled component is named, in alphabetical order
    const expected = Object.values(registry.entries)
      .filter(e => e.kind === 'component')
      .map(e => e.name)
      .sort();

    for (const name of expected) expect(stdout).toContain(name);
    expect(stdout).toContain(CHANGELOG_URL);
  });

  test('caps the list and reports the remainder', async () => {
    // More available components than the CLI is willing to list inline
    const many = { version: '1.0.0', entries: { ...registry.entries } };
    for (const name of ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']) {
      many.entries[name] = {
        kind: 'component', name, version: '1.0.0',
        files: [{ path: `src/components/Basic/${name}/${name}.tsx`, hash: 'z' }],
        dependsOn: [], npmDependencies: [],
      };
    }

    const wide = await startFixtureServer(many);
    try {
      const dir = project({ installed: { utils: '1.0.0' } });
      const { stdout } = await runCli(['status'], { cwd: dir, registryUrl: wide.url });

      // 9 components total, 5 named inline, 4 folded into the remainder
      expect(stdout).toContain('Alpha, Bravo, Charlie, Delta, Dropdown and 4 more');
      expect(stdout).not.toContain('Scroll,');
    } finally {
      await wide.close();
    }
  });

  test('does not modify the project', async () => {
    const dir = project({ installed: { utils: '1.0.0' } });
    const before = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8');

    await run(dir, 'status');

    expect(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')).toBe(before);
    expect(fs.existsSync(path.join(dir, 'src'))).toBe(false);
  });
});

describe('package.json formatting', () => {
  test('preserves tab indentation', async () => {
    const dir = project({ indent: '\t' });
    await run(dir, 'add', 'Icon');

    const raw = readRawPackageJson(dir);
    expect(raw).toContain('\n\t"name"');            // top level
    expect(raw).toContain('\n\t\t"Icon"');          // inside gameface-ui-components
    expect(raw).not.toContain('\n  "name"');        // not rewritten to 2 spaces
  });

  test('preserves four-space indentation', async () => {
    const dir = project({ indent: 4 });
    await run(dir, 'add', 'Icon');

    const raw = readRawPackageJson(dir);
    expect(raw).toContain('\n    "name"');
    expect(raw).toContain('\n        "Icon"');
    expect(raw).not.toContain('\n  "name"');
  });

  test('keeps two-space indentation as it was', async () => {
    const dir = project({ indent: 2 });
    await run(dir, 'add', 'Icon');

    const raw = readRawPackageJson(dir);
    expect(raw).toContain('\n  "name"');
    expect(raw).toContain('\n    "Icon"');
  });

  test('leaves unrelated fields untouched', async () => {
    const dir = project({ indent: '\t' });
    await run(dir, 'add', 'Icon');

    const pkg = JSON.parse(readRawPackageJson(dir));
    expect(pkg.name).toBe('fixture-app');
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.dependencies).toEqual({ 'solid-js': '^1.8.0' });
  });
});

describe('registry failures', () => {
  test('reports the library version from the registry', async () => {
    const dir = project({ installed: { utils: '1.0.0' } });
    const { stdout } = await run(dir, 'status');

    expect(stdout).toContain(`Gameface UI v${registry.version}`);
  });

  test('reports the status code when the registry 404s', async () => {
    const dir = project();
    server.failRegistryWith(404);

    const { code, stdout } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(1);
    expect(stdout).toContain('Could not fetch the registry');
    expect(stdout).toContain('404');
    // Nothing was written before the failure
    expect(fs.existsSync(path.join(dir, 'src'))).toBe(false);
  });

  test('reports the status code when GitHub is down', async () => {
    const dir = project();
    server.failRegistryWith(503);

    const { code, stdout } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(1);
    expect(stdout).toContain('503');
  });

  test('reports an unreachable host', async () => {
    const dir = project();
    const { code, stdout } = await runCli(['add', 'Dropdown'], {
      cwd: dir,
      registryUrl: UNREACHABLE_URL,
    });

    expect(code).toBe(1);
    expect(stdout).toContain('Could not fetch the registry');
  });

  test('reports a registry that is not valid JSON', async () => {
    const dir = project();
    server.serveInvalidRegistry();

    const { code, stdout } = await run(dir, 'status');

    expect(code).toBe(1);
    expect(stdout).toContain('Could not fetch the registry');
  });

  test('leaves the project untouched when the registry is unavailable', async () => {
    const dir = project();
    server.failRegistryWith(503);
    const before = readRawPackageJson(dir);

    const { code } = await run(dir, 'add', 'Dropdown');

    expect(code).toBe(1);
    expect(readRawPackageJson(dir)).toBe(before);
    expect(fs.existsSync(path.join(dir, 'src'))).toBe(false);
  });
});

// The messages here come from Node's parseArgs, not from us, so these assert
// that the offending flag is named and the run was rejected — never Node's
// exact wording, which can change between releases.
describe('flag parsing', () => {
  test('rejects an unknown long flag before doing any work', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Dropdown', '--test');

    expect(code).toBe(1);
    expect(stdout).toContain('--test');       // the offending flag is named
    expect(stdout).toContain('Usage');        // help was printed
    expect(server.hits).toHaveLength(0);      // never reached the network
  });

  test('rejects an unknown short flag', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Dropdown', '-x');

    expect(code).toBe(1);
    expect(stdout).toContain('-x');
    expect(stdout).toContain('Usage');
  });

  test('rejects a value passed to a boolean flag', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Dropdown', '--yes=1');

    expect(code).toBe(1);
    expect(stdout).toContain('--yes');
    expect(stdout).toContain('Usage');
  });

  test('trims the parser message to a single line', async () => {
    const dir = project();
    const { stdout } = await run(dir, 'add', 'Dropdown', '--test');

    // Node appends advice about escaping positionals with '--', which is
    // irrelevant when the positionals are component names. We keep the first
    // sentence only; asserting on length rather than on Node's exact prose.
    const errorLine = stdout.split('\n').find(l => l.includes('--test'));
    expect(errorLine).toBeDefined();
    expect(errorLine!.trim().length).toBeLessThan(60);
  });

  test('still accepts the flags it does know', async () => {
    const dir = project({ installed: { Dropdown: '1.0.0' } });
    const { code } = await run(dir, 'add', 'Dropdown', '-y');

    expect(code).toBe(0);
    expect(readInstalled(dir)).toMatchObject({ Dropdown: '1.1.0' });
  });
});

describe('input validation', () => {
  test('rejects an unknown command with the help text', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'lsit');

    expect(code).toBe(1);
    expect(stdout).toContain('Unknown command: lsit');
    expect(stdout).toContain('Usage');
  });

  test('rejects add with no component name', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add');

    expect(code).toBe(1);
    expect(stdout).toContain('Please provide a component name');
  });

  test('accepts commands case-insensitively', async () => {
    const dir = project();
    const { code } = await run(dir, 'ADD', 'Icon');

    expect(code).toBe(0);
    expect(readInstalled(dir)).toMatchObject({ Icon: '1.0.0' });
  });

  test('deduplicates a name repeated on the command line', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, 'add', 'Icon', 'Icon');

    expect(code).toBe(0);
    expect(stdout).toContain('1 installed');
  });

  test('--help exits 0 without touching the project', async () => {
    const dir = project();
    const { code, stdout } = await run(dir, '--help');

    expect(code).toBe(0);
    expect(stdout).toContain('gameface-cli <command> [components...]');
    expect(server.hits).toHaveLength(0);   // help must not hit the network
  });
});
