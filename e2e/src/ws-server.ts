import WebSocket from 'ws';
import axios from 'axios';
import { retryIfFails } from './utils';
import { gamefaceCommands } from './commands/commands';
import { player, killPlayer } from './player';
import * as path from 'path';
import Mocha from 'mocha';

const SPEC_TIMEOUT = 10000;
``
const { sendCommands, sendCommand } = gamefaceCommands;

export class WSServer {
    public wsServerUrl: string = '';
    public debuggingPort: number | string = '9444';
    private _ws: WebSocket | null = null;

    constructor() {
        this.createClient = this.createClient.bind(this);
        this.getWebSocketDebuggerUrl = this.getWebSocketDebuggerUrl.bind(this);
        this.runTests = this.runTests.bind(this);
        this.closeClient = this.closeClient.bind(this);
    }

    get ws(): WebSocket | null {
        return this._ws;
    }

    set ws(value: WebSocket | null) {
        this._ws = value;
    }

    /**
     * Will get the websocket debugger URL from the DevTools
     */
    async getWebSocketDebuggerUrl(): Promise<string> {
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
            throw error;
        }
    }

    /**
     * Creates a WebSocket client
     */
    async createClient(debuggingPort: number): Promise<void> {
        this.debuggingPort = debuggingPort;
        this.ws = new WebSocket(await this.getWebSocketDebuggerUrl());

        gamefaceCommands.player = player;
        gamefaceCommands.cohtmlJSPath = path.join(global.config.gamefacePath!, '..', '..', 'Samples', 'uiresources', 'library', 'cohtml.js').replace(/\\/g, '/');
        gamefaceCommands.ws = this.ws;
    }

    /**
     * Will establish a connection with the Gameface DevTools and run the tests
     */
    async runTests(mocha: Mocha): Promise<void> {
        if (!this.ws) {
            throw new Error("WebSocket client not created.");
        }

        this.ws.on('open', async () => {
            try {
                global.log.debug(`Connected to the Gameface Devtools server on port ${this.debuggingPort}.`);

                await sendCommands(['Page.enable', 'DOM.enable', 'CSS.enable', 'Runtime.enable', 'Input.enable']);

                const { root: { nodeId } } = await sendCommand('DOM.getDocument');
                gamefaceCommands.rootNodeId = nodeId;

                global.log.debug('Gameface player is ready to execute tests.');

                mocha.bail(global.config.bail!);
                mocha.timeout(global.config.specTimeout || SPEC_TIMEOUT);
                mocha.run(async (failures: number) => {
                    this.ws!.close();
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
            process.exit(process.exitCode);
        });

        this.ws.on('error', (error) => {
            process.exitCode = 1;

            global.log.error(`WebSocket error: ${error}`, {
                code: "INTERNAL_ERROR_WEBSOCKET",
                exit: false
            });
        });
    }

    async closeClient(): Promise<void> {
        if (this.ws) this.ws.close();
    }
}

export const wsServer = new WSServer();
export const { createClient, closeClient, runTests } = wsServer;