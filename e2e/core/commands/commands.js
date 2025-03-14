const { retryIfFails } = require("../utils");
const { DOMElement, DOMElements } = require("./dom-element");

class GamefaceCommandsBase {
    constructor(player, ws) {
        this._ws = ws;
        this.rootNodeId = null;
        this.commandTimeout = 10000;
        this.player = player;
        this.pendingCommands = new Map();
        this.handleMessage = this.handleMessage.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.sendCommands = this.sendCommands.bind(this);
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

                if (response.error) return reject(new Error(`Error handling WebSocket message: ${response.error.message}`));
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
        global.log.debug(`Executing command with method - ${method}, and params - ${JSON.stringify(params)}`);

        if (!method) return reject(new Error(`Command must have a method property`));

        const id = Math.floor(Math.random() * 100000) + 1; // We need + 1 because if the id is 0 the message will fail and no response will be returned
        const message = JSON.stringify({ id, method, params });

        return new Promise((resolve, reject) => {
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

class GamefaceCommands extends GamefaceCommandsBase {
    constructor(player, ws) {
        super(player, ws);
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.contains = this.contains.bind(this);
        this.text = this.text.bind(this);
        this.children = this.children.bind(this);
        this.navigate = this.navigate.bind(this);
    }

    /**
     * Retrieves a DOM element based on the provided selector.
     * @param {string} selector - The CSS selector to query the DOM element.
     * @returns {Promise<DOMElement>} A promise that resolves to the DOMElement instance.
     */
    async get(selector) {
        global.log.debug(`\n[GamefaceCommands] Trying to find element with selector - ${selector}`);

        return await retryIfFails(async () => {
            const { nodeId } = await this.sendCommand('DOM.querySelector', {
                nodeId: this.rootNodeId,
                selector,
            });

            if (!nodeId) throw new Error(`Unable to find element with selector - ${selector}.`)

            return await new DOMElement(this, nodeId);
        });
    }

    /**
     * Retrieves all elements matching the specified selector.
     *
     * @param {string} selector - The CSS selector to match elements against.
     * @returns {Promise<DOMElements>} A promise that resolves to an array of DOMElement instances.
     * @throws {Error} If no elements are found with the specified selector.
     */
    async getAll(selector) {
        global.log.debug(`\n[GamefaceCommands] Trying to find all elements with selector - ${selector}`);

        return await retryIfFails(async () => {
            const { nodeIds } = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: this.rootNodeId,
                selector,
            });

            if (!nodeIds?.length) throw new Error(`Unable to find any elements with selector - ${selector}.`)

            const elements = new DOMElements();

            for (let nodeId of nodeIds) {
                elements.push(await new DOMElement(this, nodeId));
            }

            return elements;
        });
    }

    /**
     * Gets the element containing the given text.
     * @param {string} text - The text to check for within the element.
     * @param {string} selector - The selector used to find the element.
     * @returns {Promise<DOMElement>} - A promise that resolves to DOMElement that contains the text.
     */
    async contains(text, selector) {
        global.log.debug(`\n[GamefaceCommands] Trying to find text - ${text} within node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.contains(text);
    }

    /**
     * Retrieves the text content of the specified element.
     * @param {string} selector - The CSS selector of the element to retrieve.
     * @returns {Promise<string>} A promise that resolves to the text content of the element.
     */
    async text(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting all the text content of node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.text();
    }

    /**
     * Retrieves the children of the specified element.
     * @param {string} selector - The CSS selector of the element to get the children from.
     * @returns {Promise<DOMElements>} A promise that resolves to an array of child elements.
     */
    async children(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting children of node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.children();
    }

    /**
     * Navigates to the specified URL and waits for the page to load.
     * @param {string} url - The URL to navigate to.
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete and the document root node ID is retrieved.
     */
    async navigate(url) {
        global.log.debug(`\n[GamefaceCommands] Navigating to new page with url - ${url}`);

        await this.sendCommand('Page.navigate', { url });
        await this.sendCommand('Page.loadEventFired');
        const { root: { nodeId } } = await this.sendCommand('DOM.getDocument');
        this.rootNodeId = nodeId;
    }
}

module.exports = new GamefaceCommands();