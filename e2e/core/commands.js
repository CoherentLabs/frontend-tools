const { retryIfFails } = require("./utils");

class GamefaceCommands {
    constructor(player, ws) {
        this._ws = ws;
        this.rootNodeId = null;
        this.commandTimeout = 10000;
        this.player = player;
        this.handleMessage = this.handleMessage.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.sendCommands = this.sendCommands.bind(this);
        this.pendingCommands = new Map();
    }

    set ws(value) {
        this.ws?.off('message', this.handleMessage);
        this._ws = value;
        this.ws.on('message', this.handleMessage);
    }

    get ws() {
        return this._ws;
    }

    /**
     * Handler for DevTools protocol messages when commands are sent to the player
     * @param {string} data
     */
    handleMessage(data) {
        try {
            const response = JSON.parse(data);
            if (response.id && this.pendingCommands.has(response.id)) {
                const { resolve, reject } = this.pendingCommands.get(response.id);
                this.pendingCommands.delete(response.id);

                if (response.error) return reject(new Error(response.error.message));

                resolve(response.result);
            }
        } catch (err) {
            throw new Error(`Error handling WebSocket message: ${err}`)
        }
    }

    /**
     * Will send DevTool command to the player
     * @param {string} method - DevTools protocol method
     * @param {object} params
     * @returns 
     */
    async sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            if (!method) return reject(new Error(`Command must have a method property`));

            const id = Math.floor(Math.random() * 100000) + 1; // We need + 1 because if the id is 0 the message will fail and no response will be returned
            const message = JSON.stringify({ id, method, params });

            this.pendingCommands.set(id, { resolve, reject });
            this.ws.send(message);

            setTimeout(() => {
                if (!this.pendingCommands.has(id)) return;
                this.pendingCommands.delete(id);
                reject(new Error(`Timeout waiting for response to command: ${method}`));
            }, this.commandTimeout);
        });
    }

    /**
     * Will send mutiple DevTools commands to the player
     * @param {Array<string|object>} commands
     * @returns {Promise<Array<any>>}
     */
    async sendCommands(commands) {
        const responses = [];

        for (let command of commands) {
            if (typeof command === 'string') {
                responses.push(await this.sendCommand(command));
                continue;
            }

            if (typeof command !== 'object') throw new Error(`Command "${command}" must be with object type`);
            if (!command.method) throw new Error(`Command "${command}" must have a "method" property`);
            responses.push(await this.sendCommand(command.method, command.params));
        }

        return responses;
    }
}

module.exports = new GamefaceCommands();