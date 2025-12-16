import * as child_process from 'node:child_process';
import * as path from 'node:path';
import { detect } from 'detect-port';

export class GamefacePlayer {
    public player: child_process.ChildProcess | null = null;
    public debuggingPort: number;

    constructor(debuggingPort: number = 9444) {
        this.debuggingPort = debuggingPort;
        this.spawnPlayer = this.spawnPlayer.bind(this);
    }

    async setDebuggingPort(): Promise<void> {
        const realPort = await detect(this.debuggingPort);

        if (this.debuggingPort !== realPort) {
            this.debuggingPort = realPort;
        }
    }

    async spawnPlayer(): Promise<{ playerProcess: child_process.ChildProcess; debuggingPort: number }> {
        global.log.debug(`Spawning player executable with path: ${global.config.gamefacePath}`);

        await this.setDebuggingPort();

        return new Promise((resolve, reject) => {
            const playerProcess = child_process.spawn(
                global.config.gamefacePath!,
                [`--url=${path.join(__dirname, '..', 'index.html').replace(/\\/g, '/')}`, `--debugger-port=${this.debuggingPort}`]
            );

            playerProcess.on('spawn', () => {
                this.player = playerProcess;
                global.log.debug(`Player has been spawned.`);
                resolve({ playerProcess, debuggingPort: this.debuggingPort });
            });

            playerProcess.on('close', () => {
                const err = new Error('The player process has been closed.');
                global.log.error(err.message, { code: "PLAYER_ERROR", exit: false });
                reject(err);
            });

            playerProcess.on('disconnect', () => {
                 const err = new Error('The player process has been disconnected.');
                 global.log.error(err.message, { code: "PLAYER_ERROR", exit: false });
                 reject(err);
            });

            playerProcess.on('error', (err) => {
                //@ts-ignore
                playerProcess.exitCode = -1;

                global.log.error(`There was an error when spawning the player process error: ${err}`, {
                    code: "PLAYER_ERROR",
                    suggestions: [
                        'Make sure your "gamefacePath" leads to the correct player executable.',
                    ],
                    exit: false
                });
                reject(err);
            });
        });
    }

    async killPlayer(): Promise<void> {
        if (this.player) this.player.kill();
    }
}

export const player = new GamefacePlayer();
export const killPlayer = player.killPlayer.bind(player);
export const spawnPlayer = player.spawnPlayer.bind(player);