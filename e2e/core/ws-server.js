const WebSocket = require('ws');
const axios = require('axios');
const { retryIfFails } = require('./utils');
const gamefaceCommands = require('./commands/commands');
const { sendCommands, sendCommand } = gamefaceCommands;
const { player, killPlayer } = require('./player');
const SPEC_TIMEOUT = 10000;

class WSServer {
    constructor() {
        this.wsServerUrl = '';
        this.debuggingPort = '9444';
        this._ws = null;
        this.createClient = this.createClient.bind(this);
        this.getWebSocketDebuggerUrl = this.getWebSocketDebuggerUrl.bind(this);
        this.runTests = this.runTests.bind(this);
        this.closeClient = this.closeClient.bind(this);
    }

    get ws() {
        return this._ws;
    }

    set ws(value) {
        this._ws = value;
    }

    /**
     * Will get the websocket debugger URL from the DevTools
     * @returns {Promise<string>} WebSocket Debugger URL
     */
    async getWebSocketDebuggerUrl() {
        global.log.debug(`Establishing connection with the Gameface DevTools server on port ${this.debuggingPort}.`);
        try {
            return await retryIfFails(async () => {
                const response = await axios.get(`http://localhost:${this.debuggingPort}/json`);
                const devTools = response.data[0];
                this.wsServerUrl = devTools.webSocketDebuggerUrl;
                return this.wsServerUrl;
            });
        } catch (error) {
            global.log.error(`Error fetching WebSocket Debugger URL\n${error}`, {
                code: "INTERNAL_ERROR_WEBSOCKET_URL",
                suggestions: [
                    `Make sure the path to the Player executable is correct. The current one is: ${global.config.gamefacePath}.`,
                ],
                exit: 1
            });
        }
    }

    /**
     * Creates a WebSocket client
     * @param {number} debuggingPort 
     */
    async createClient(debuggingPort) {
        this.debuggingPort = debuggingPort;
        this.ws = new WebSocket(await this.getWebSocketDebuggerUrl());

        gamefaceCommands.player = player;
        gamefaceCommands.ws = this.ws;
    }

    /**
     * Will establish a connection with the Gameface DevTools and run the tests
     * @param {Mocha} mocha
     */
    async runTests(mocha) {
        this.ws.on('open', async () => {
            try {
                global.log.debug(`Connected to the Gameface Devtools server on port ${this.debuggingPort}.`);

                await sendCommands(['Page.enable', 'DOM.enable', 'CSS.enable', 'Runtime.enable', 'Input.enable']);

                const { root: { nodeId } } = await sendCommand('DOM.getDocument');
                gamefaceCommands.rootNodeId = nodeId;

                global.log.debug('Gameface player is ready to execute tests.');

                mocha.bail(global.config.bail);
                mocha.timeout(global.config.specTimeout || SPEC_TIMEOUT);
                mocha.run(async (failures) => {
                    this.ws.close();
                    if (failures) global.log.error(`Failed tests: ${failures}`, {
                        exit: false
                    });
                    process.exitCode = failures ? 1 : 0;
                    await killPlayer();
                });
            } catch (error) {
                global.log.error(`Something went wrong while executing tests: ${error}`, {
                    code: "INTERNAL_ERROR",
                    exit: false
                });
                process.exitCode = 1;
                process.exit();
            }
        });

        this.ws.on('close', () => {
            global.log.debug('End - disconnected from Chrome DevTools.');
            process.exitCode = 0;
            process.exit();
        });

        this.ws.on('error', (error) => {
            global.log.error(`WebSocket error: ${error}`, {
                code: "INTERNAL_ERROR_WEBSOCKET",
                exit: false
            });
        });
    }

    async closeClient() {
        if (this.ws) this.ws.close();
    }
}

module.exports = new WSServer();