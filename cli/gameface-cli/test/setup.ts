import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';

const CLI_PATH = fileURLToPath(new URL('../dist/index.js', import.meta.url));

/** Clack emits colours and cursor codes; strip them before asserting on output. */
const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g;
const strip = (s: string) => s.replace(ANSI, '');

export interface FixtureServer {
  url: string;
  /** Every path requested, in order. Duplicate entries mean a duplicate fetch. */
  hits: string[];
  /** Make /registry.json respond with this status instead of the fixture. */
  failRegistryWith: (status: number) => void;
  /** Make /registry.json respond 200 with a body that isn't JSON. */
  serveInvalidRegistry: () => void;
  /** Restore normal registry serving. */
  reset: () => void;
  close: () => Promise<void>;
}

/**
 * Stands in for raw.githubusercontent.com. Serves the registry at
 * /registry.json and synthesises contents for every other path, so fixtures
 * only have to declare file paths, not file bodies.
 */
export async function startFixtureServer(registry: unknown): Promise<FixtureServer> {
  const hits: string[] = [];
  const state = { registryStatus: 200, registryBody: null as string | null };

  const server = http.createServer((req, res) => {
    const url = req.url ?? '';
    hits.push(url);

    if (url === '/registry.json') {
      if (state.registryStatus !== 200) {
        res.writeHead(state.registryStatus, { 'content-type': 'text/plain' });
        res.end('registry unavailable');
        return;
      }

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(state.registryBody ?? JSON.stringify(registry));
      return;
    }

    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end(`// fixture contents for ${url}\n`);
  });

  // Port 0 lets the OS pick a free one, so parallel test files never collide
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    hits,
    failRegistryWith: (status: number) => { state.registryStatus = status; },
    serveInvalidRegistry: () => { state.registryBody = '<html>not json</html>'; },
    reset: () => { state.registryStatus = 200; state.registryBody = null; },
    close: () => new Promise<void>(resolve => { server.close(() => resolve()); }),
  };
}

/** A port with nothing listening on it, for simulating an unreachable host. */
export const UNREACHABLE_URL = 'http://127.0.0.1:1';

/**
 * A throwaway SolidJS project.
 *
 * `dependencies` must list every npm package the fixture components declare —
 * findDeps only queues packages that are missing, so a complete list keeps the
 * suite from shelling out to a real `npm i`.
 */
export function makeProject(opts: {
  dependencies?: Record<string, string>;
  installed?: Record<string, string>;
  /** Indentation to write package.json with — '\t', 4, etc. Defaults to 2 spaces. */
  indent?: string | number;
} = {}): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gameface-cli-'));

  const packageJson: Record<string, unknown> = {
    name: 'fixture-app',
    version: '1.0.0',
    dependencies: opts.dependencies ?? { 'solid-js': '^1.8.0' },
  };

  if (opts.installed) packageJson['gameface-ui-components'] = opts.installed;

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(packageJson, null, opts.indent ?? 2) + '\n',
  );
  return dir;
}

/** The project's package.json as written on disk, whitespace and all. */
export function readRawPackageJson(dir: string): string {
  return fs.readFileSync(path.join(dir, 'package.json'), 'utf-8');
}

export function removeProject(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
}

export function readInstalled(dir: string): Record<string, string> | undefined {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
  return pkg['gameface-ui-components'];
}

export interface CliResult {
  stdout: string;
  stderr: string;
  code: number;
}

/** Spawns the built CLI against a temp project and a fixture registry. */
export function runCli(args: string[], opts: { cwd: string; registryUrl: string }): Promise<CliResult> {
  return new Promise(resolve => {
    execFile(
      process.execPath,
      [CLI_PATH, ...args],
      {
        cwd: opts.cwd,
        env: { ...process.env, GAMEFACE_REGISTRY_URL: opts.registryUrl },
      },
      (err, stdout, stderr) => {
        const code = typeof (err as any)?.code === 'number' ? (err as any).code : err ? 1 : 0;
        resolve({ stdout: strip(stdout), stderr: strip(stderr), code });
      },
    );
  });
}
