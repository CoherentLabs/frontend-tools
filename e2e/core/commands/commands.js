const { retryIfFails } = require("../utils");
const { DOMElement, DOMElements } = require("./dom-element");
const path = require('path');
const URL = require('url');

function isURL(input) {
    try {
        const url = URL.parse(input);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

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

        const id = Math.floor(Math.random() * 100000) + 1; // We need + 1 because if the id is 0 the message will fail and no response will be returned
        const message = JSON.stringify({ id, method, params });

        return new Promise((resolve, reject) => {
            if (!method) return reject(new Error(`Command must have a method property`));

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
        this.isHidden = this.isHidden.bind(this);
        this.isVisible = this.isVisible.bind(this);
        this.isScrollable = this.isScrollable.bind(this);
        this.isFocusable = this.isFocusable.bind(this);
        this.hasAttribute = this.hasAttribute.bind(this);
        this.getAttribute = this.getAttribute.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.getClasses = this.getClasses.bind(this);
        this.click = this.click.bind(this);
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
     * Retrieves a DOM element containing the specified text.
     * @param {string} text - The text to search for in the DOM element.
     * @param {string} selector - The selector used to find the element that the search will be started from.
     * @returns {Promise<DOMElement>} - A promise that resolves to DOMElement that contains the text.
     */
    async contains(text, selector) {
        global.log.debug(`\n[GamefaceCommands] Trying to find text - ${text} within node with selector - ${selector}`);
        if (!text) throw new Error(`Text must be provided to search for.`);

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

        if (!isURL(url)) {
            url = path.resolve(global.config.gamefacePath, url).replace(/\\/g, '/');
        }

        await this.sendCommand('Page.navigate', { url });
        await this.sendCommand('Page.loadEventFired');
        const { root: { nodeId } } = await this.sendCommand('DOM.getDocument');
        this.rootNodeId = nodeId;
    }

    /**
     * Checks if the element matching the given selector is hidden.
     *
     * @param {string} selector - The CSS selector of the element to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is hidden, otherwise `false`.
     */
    async isHidden(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is hidden`);

        const element = await this.get(selector);
        return element.isHidden();
    }

    /**
     * Checks if the element matching the given selector is visible on the page.
     *
     * @param {string} selector - The CSS selector of the element to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is visible, otherwise `false`.
     */
    async isVisible(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is visible`);

        const element = await this.get(selector);
        return element.isVisible();
    }

    /**
     * Checks if the element identified by the given selector is scrollable.
     *
     * @param {string} selector - The CSS selector of the element to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is scrollable, otherwise `false`.
     */
    async isScrollable(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is scrollable`);

        const element = await this.get(selector);
        return element.isScrollable();
    }

    /**
     * Checks if the element identified by the given selector is focusable.
     *
     * @param {string} selector - The CSS selector of the element to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is focusable, otherwise `false`.
     */
    async isFocusable(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is focusable`);

        const element = await this.get(selector);
        return element.isFocusable();
    }

    /**
     * Checks if the element matching the given selector has the specified attribute.
     *
     * @param {string} selector - The CSS selector of the element to check.
     * @param {string} name - The name of the attribute to check for.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element has the attribute, otherwise `false`.
     */
    async hasAttribute(selector, name) {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} has '${name}' attribute`);

        const element = await this.get(selector);
        return element.hasAttribute(name);
    }

    /**
     * Retrieves the value of a specified attribute from an element identified by a selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to retrieve the attribute from.
     * @param {string} name - The name of the attribute to retrieve.
     * @returns {Promise<string|null>} A promise that resolves to the value of the attribute, or `null` if the attribute does not exist.
     */
    async getAttribute(selector, name) {
        global.log.debug(`\n[GamefaceCommands] Getting attribute with name '${name}' of node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.getAttribute(name);
    }

    /**
     * Retrieves the computed styles of a DOM element identified by the given selector.
     *
     * @param {string} selector - The CSS selector of the target DOM element.
     * @returns {Promise<Object>} A promise that resolves to an object containing the computed styles of the element.
     */
    async getStyles(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting styles of node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.styles();
    }

    /**
     * Retrieves the list of CSS classes for the DOM element matching the given selector.
     *
     * @param {string} selector - The CSS selector used to locate the DOM element.
     * @returns {Promise<string[]>} A promise that resolves to an array of class names for the selected element.
     * @throws {Error} Throws an error if the element cannot be found or if there is an issue retrieving the classes.
     */
    async getClasses(selector) {
        global.log.debug(`\n[GamefaceCommands] Getting classes of node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.classes();
    }

    /**
     * Clicks on a DOM element specified by the given selector.
     *
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is completed.
     * @throws {Error} If the element cannot be found or the click action fails.
     */
    async click(selector) {
        global.log.debug(`\n[GamefaceCommands] Clicking on node with selector - ${selector}`);

        const element = await this.get(selector);
        return element.click();
    }
}

module.exports = new GamefaceCommands();