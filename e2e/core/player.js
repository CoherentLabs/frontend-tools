const child_process = require('node:child_process');
const path = require('node:path');

class GamefacePlayer {
    constructor() {
        this.player = null;
        this.spawnPlayer = this.spawnPlayer.bind(this);
    }

    async spawnPlayer() {
        global.log.debug(`Spawning player executable with path: ${global.config.gamefacePath}`);

        return new Promise((resolve, reject) => {
            const playerProcess = child_process.spawn(global.config.gamefacePath, [`--url=${path.join(__dirname, '..', 'index.html').replace(/\\/g, '/')}`]);
            playerProcess.on('spawn', () => {
                this.player = playerProcess;
                global.log.debug(`Player has been spawned.`);
                resolve(playerProcess);
            });
            playerProcess.on('close', () => {
                reject(global.log.error(`The player process has been closed.`, {
                    code: "PLAYER_ERROR",
                    exit: false
                }));
            });
            playerProcess.on('disconnect', () => {
                reject(global.log.error(`The player process has been disconnected.`, {
                    code: "PLAYER_ERROR",
                    exit: false
                }));
            });
            playerProcess.on('error', (err) => {
                playerProcess.exitCode = -1;

                reject(global.log.error(`There was an error when spawning the player process error: ${err}`, {
                    code: "PLAYER_ERROR",
                    suggestions: [
                        'Make sure your "gamefacePath" leads to the correct player executable.',
                    ],
                    exit: false
                }));
            })
        })
    }

    async killPlayer() {
        if (this.player) this.player.kill();
    }
}

module.exports = new GamefacePlayer();
