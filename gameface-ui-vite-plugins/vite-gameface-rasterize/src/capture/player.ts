import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:net';

export interface PlayerLaunchOptions {
    executablePath: string;
    port: number;
    url: string;
    /** Exact content viewport. Only honoured together with --enable-gui=false. */
    width: number;
    height: number;
    /** Show the Player's ImGui shell. The shell steals viewport height, so bakes run without it. */
    headed?: boolean;
    /** Working directory for the process - the Player writes PlayerConfig.ini into it. */
    cwd?: string;
    timeoutMs?: number;
}

export interface PlayerHandle {
    process: ChildProcess;
    port: number;
    /** cohtml version reported by the debugger, e.g. "3.2.0.2". Part of every bake key. */
    engineVersion: string;
    /** Most recent stderr from the process - the only clue available when it dies mid-bake. */
    stderrTail: () => string;
}

/** Finds a free TCP port at or after `start`, so parallel builds don't collide. */
export async function findFreePort(start: number): Promise<number> {
    for (let port = start; port < start + 50; port++) {
        const free = await new Promise<boolean>((resolve) => {
            const server = createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => server.close(() => resolve(true)));
            server.listen(port, '127.0.0.1');
        });
        if (free) return port;
    }
    throw new Error(`no free port found in ${start}..${start + 50}`);
}

/**
 * Launches the Gameface Player with its debugger open and waits for it to answer.
 *
 * `--enable-gui=false` is not cosmetic: with the ImGui shell on, a requested 1200px-tall
 * window yields a 743px content viewport, and since the Player supports neither the
 * Emulation domain nor captureBeyondViewport, the viewport is a hard ceiling on how large
 * a single bake can be. With the shell off the viewport matches --width/--height exactly,
 * even past the physical screen size.
 */
export async function launchPlayer(options: PlayerLaunchOptions): Promise<PlayerHandle> {
    const { executablePath, port, url, width, height, headed = false, cwd, timeoutMs = 30000 } = options;

    if (cwd) mkdirSync(cwd, { recursive: true });

    const args = [
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        `--width=${width}`,
        `--height=${height}`,
        ...(headed ? [] : ['--enable-gui=false']),
        url,
    ];

    const child = spawn(executablePath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

    let stderr = '';
    child.stderr?.on('data', (d) => {
        stderr += d.toString();
        if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });

    const spawnFailure = new Promise<never>((_, reject) => {
        child.once('error', (e) => reject(new Error(`failed to spawn the Gameface Player: ${e.message}`)));
    });

    const version = await Promise.race([waitForDebugger(port, timeoutMs, () => stderr), spawnFailure]);

    const browser = `${version.Browser || ''} ${version['User-Agent'] || ''}`;
    if (!browser.toLowerCase().includes('cohtml')) {
        child.kill();
        throw new Error(`"${executablePath}" is not the Gameface Player (its debugger reports "${browser.trim()}").`);
    }

    return {
        process: child,
        port,
        engineVersion: extractVersion(browser) ?? 'unknown',
        stderrTail: () => stderr.trim().slice(-600),
    };
}

async function waitForDebugger(port: number, timeoutMs: number, stderr: () => string): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(`http://localhost:${port}/json/version`);
            if (res.ok) return await res.json();
        } catch {
            // expected while the process is still coming up
        }
        await sleep(120);
    }
    const tail = stderr().trim();
    throw new Error(`the Player's debugger on port ${port} never responded${tail ? `\n  stderr: ${tail.slice(-600)}` : ''}`);
}

function extractVersion(browser: string): string | null {
    const m = browser.match(/cohtml\/(\d+(?:\.\d+)*)/i);
    return m ? m[1] : null;
}

export async function closePlayer(handle: PlayerHandle): Promise<void> {
    const proc = handle.process;
    if (proc.exitCode !== null || proc.killed) return;

    await new Promise<void>((resolve) => {
        const force = setTimeout(() => proc.kill('SIGKILL'), 4000);
        proc.once('exit', () => {
            clearTimeout(force);
            resolve();
        });
        proc.kill();
    });
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
