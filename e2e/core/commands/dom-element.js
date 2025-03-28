/**
 * @class DOMElements
 * @extends {Array<DOMElement>}
 * @classdesc A custom array class that holds DOMElement instances and provides methods to access the first and last elements.
 * @param {string} parentNodeId - The ID of the parent node.
 */
class DOMElements extends Array {
    constructor(parentNodeId) {
        super();
        this.parentNodeId = parentNodeId;
    }

    /**
     * Retrieves the first DOM element in the collection.
     * @returns {DOMElement} The first DOM element in the collection.
     * @throws {Error} If the the array has no items.
     */
    first() {
        if (!this.length) throw new Error(`Unable to get the first node because there are no items.`);

        global.log.debug(`\n[DOMElements] Getting the first node with id - ${this[0].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[0];
    }

    /**
     * Retrieves the last DOM element in the collection.
     * @returns {DOMElement} The last DOM element in the collection.
     * @throws {Error} If the the array has no items.
     */
    last() {
        if (!this.length) throw new Error(`Unable to get the last node because there are no items.`);

        global.log.debug(`\n[DOMElements] Getting the last node with id - ${this[0].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[this.length - 1];
    }

    /**
     * Retrieves the DOM element at the specified index.
     * @param {number} index - The index of the desired DOM element.
     * @returns {DOMElement} The DOM element at the specified index.
     * @throws {Error} If the element at the specified index does not exist.
     */
    nth(index) {
        if (!this[index]) throw new Error(`Unable to get the node with index - ${index}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}.`);

        global.log.debug(`\n[DOMElements] Getting the node with index - ${index} and id - ${this[index].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[index];
    }
}

class DOMElement {
    /**
     * Creates an instance of DOMElement.
     * 
     * @constructor
     * @param {Object} gamefaceCommands - The gameface commands object.
     * @param {number} nodeId - The ID of the node to describe.
     * @returns {Promise<DOMElement>} A promise that resolves to the created DOMElement instance.
     */
    constructor(gamefaceCommands, nodeId) {
        this.nodeId = nodeId;
        /**@private*/this.gamefaceCommands = gamefaceCommands;
        /**@private*/this.sendCommand = gamefaceCommands.sendCommand;

        return new Promise(async (resolve, reject) => {
            global.log.debug(`\n[DOMElement] Creating new DOMElement. Getting data of node with id - ${this.nodeId}`);
            const nodeData = await this.sendCommand('DOM.describeNode', { nodeId: this.nodeId });
            this.node = nodeData.node || null;
            return resolve(this);
        })
    }

    /**
     * Gets the inner HTML content of the DOM element.
     * @returns {string} The inner HTML content if available, otherwise an empty string.
     */
    async getInnerHTML() {
        global.log.debug(`\n[DOMElement] Getting inner HTML of node with id - ${this.nodeId}`);

        const outerHTML = await this.getOuterHTML();
        const match = outerHTML.match(/^<[^>]+>([\s\S]*)<\/[^>]+>$/);
        return match ? match[1] : "";
    }

    /**
     * Retrieves the outer HTML of the current DOM element.
     * @returns {Promise<string>} A promise that resolves to the outer HTML of the element.
     */
    async getOuterHTML() {
        global.log.debug(`\n[DOMElement] Getting outer HTML of node with id - ${this.nodeId}`);

        return (await this.sendCommand('DOM.getOuterHTML', { nodeId: this.nodeId })).outerHTML;
    }

    /**
     * Retrieves the child elements of the current DOM element.
     *
     * @returns {Promise<DOMElements>} A promise that resolves to an array of child DOM elements.
     */
    async children() {
        global.log.debug(`\n[DOMElement] Getting children of node with id - ${this.nodeId}`);

        const children = new DOMElements(this.nodeId);

        for (let { nodeId } of this.node.children) {
            children.push(await new DOMElement(this.gamefaceCommands, nodeId));
        }

        return children;
    }

    /**
     * Finds a DOM element using the specified selector.
     *
     * @param {string} selector - The CSS selector to query the DOM element.
     * @returns {Promise<DOMElement>} A promise that resolves to a new DOMElement instance with the found nodeId.
     */
    async find(selector) {
        global.log.debug(`\n[DOMElement] Trying to find element with selector - ${selector} within node with id - ${this.nodeId}`);

        const { nodeId } = await this.sendCommand('DOM.querySelector', {
            nodeId: this.nodeId,
            selector,
        });

        return await new DOMElement(this.gamefaceCommands, nodeId);
    }

    /**
     * Finds all elements matching the given selector within the current node.
     *
     * @param {string} selector - The CSS selector to match elements against.
     * @returns {Promise<DOMElements>} A promise that resolves to an array of DOMElement instances matching the selector.
     * @throws {Error} If no elements are found matching the selector.
     */
    async findAll(selector) {
        global.log.debug(`\n[DOMElement] Trying to find all elements with selector - ${selector} within node with id - ${this.nodeId}`);

        const { nodeIds } = await this.sendCommand('DOM.querySelectorAll', {
            nodeId: this.nodeId,
            selector,
        });

        if (!nodeIds?.length) throw new Error(`Unable to find any elements with selector - ${selector} within node with id - ${this.nodeId}.`)

        const elements = new DOMElements(this.nodeId);

        for (let nodeId of nodeIds) {
            elements.push(await new DOMElement(this.gamefaceCommands, nodeId));
        }

        return elements;
    }

    /**
     * @private
     * Recursively searches for a DOM element that contains the specified content.
     * @param {string} content - The content to search for within the DOM elements.
     * @param {Object} node - The current DOM node to search within.
     * @param {number} node.nodeId - The ID of the current DOM node.
     * @param {string} node.nodeValue - The value of the current DOM node.
     * @param {Array<Object>} node.children - The children of the current DOM node.
     * @returns {Promise<DOMElement|null>} A promise that resolves to the found DOM element or null if no element is found.
     */
    async _findElementWithContent(content, node) {
        if (!node) return null;

        if (node.nodeValue?.match(content)) return new DOMElement(this.gamefaceCommands, node.nodeId);

        for (const { nodeId } of node.children) {
            const childElement = await this.sendCommand('DOM.describeNode', { nodeId });
            const foundedElement = await this._findElementWithContent(content, childElement.node);
            if (foundedElement) return foundedElement;
        }

        return null;
    }

    /**
     * Searches for a DOM element that contains the specified text starting from current one.
     * @param {string} text - The text to search for within the DOM element.
     * @returns {Promise<DOMElement|null>} A promise that resolves to the found element containing the text, or null if no such element is found.
     */
    async contains(text) {
        global.log.debug(`\n[DOMElement] Trying to find text - ${text} within node with id - ${this.nodeId}`);

        return this._findElementWithContent(text, this.node);
    }

    /**
     * @private
     * Recursively retrieves the text content of a DOM node and its children.
     *
     * @param {Object} node - The DOM node to retrieve text content from.
     * @param {string} node.nodeValue - The text content of the node.
     * @param {Array} node.children - The child nodes of the DOM node.
     * @param {number} node.children[].nodeId - The ID of the child node.
     * @returns {Promise<string>} The concatenated text content of the node and its children.
     */
    async _getTextContent(node) {
        if (!node) return '';
        let value = node.nodeValue;

        for (const { nodeId } of node.children) {
            const childDOMEl = await this.sendCommand('DOM.describeNode', { nodeId });
            value += await this._getTextContent(childDOMEl.node);
        }

        return value;
    }

    /**
     * Retrieves the text content of the current DOM element.
     *
     * @returns {Promise<string>} A promise that resolves to the text content of the element.
     */
    async text() {
        global.log.debug(`\n[DOMElement] Getting all the text content of node with id - ${this.nodeId}`);

        return this._getTextContent(this.node);
    }

    /**
     * Retrieves the computed styles for the current DOM element.
     * @returns {Promise<Object>} A promise that resolves to an object containing the computed styles,
     * where each key is a CSS property name and each value is the corresponding CSS value.
     */
    async styles() {
        global.log.debug(`\n[DOMElement] Getting styles of node with id - ${this.nodeId}`);

        const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });

        return computedStyle.reduce((prev, current) => {
            prev[current.name] = current.value;
            return prev;
        }, {});
    }

    /**
     * Checks if the DOM element is hidden.
     * 
     * This method sends a command to get the computed style for the node and 
     * checks if the element is hidden based on its 'display', 'visibility', 
     * or 'opacity' properties.
     * 
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is hidden, otherwise `false`.
     */
    async isHidden() {
        global.log.debug(`\n[DOMElement] Getting if of node with id - ${this.nodeId} is hidden`);

        return retryIfFails(async () => {
            const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });
            return computedStyle.some(
                (style) =>
                    (style.name === 'display' && style.value === 'none') ||
                    (style.name === 'visibility' && style.value === 'hidden') ||
                    (style.name === 'opacity' && style.value === '0')
            );
        })
    }

    /**
     * Checks if the DOM element is visible.
     *
     * This method sends a command to get the box model of the element and determines
     * if the element is offscreen based on its height and width. It also checks if
     * the element is hidden.
     *
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is visible, otherwise `false`.
     */
    async isVisible() {
        global.log.debug(`\n[DOMElement] Getting if of node with id - ${this.nodeId} is visible`);

        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        const isOffscreen = !model || model.height === 0 || model.width === 0;

        return !(await this.isHidden()) && !isOffscreen;
    }

    /**
     * Asynchronously retrieves the position of the DOM element on the screen.
     *
     * @returns {Promise<{x: number, y: number} | null>} The position of the element on the screen, or null if not available.
     */
    async getPositionOnScreen() {
        global.log.debug(`\n[DOMElement] Getting position on screen of node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            console.warn(`Trying to get position on screen of text node that is not supported!`);
            return null;
        }
        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        if (!model?.border) return null;

        const [x, y] = model.border;
        return { x, y };
    }

    /**
     * Asynchronously retrieves the width and height of the DOM element associated with this instance.
     *
     * @returns {Promise<{width: number, height: number} | null>} An object containing the width and height of the element, or null if the size cannot be determined.
     */
    async getSize() {
        global.log.debug(`\n[DOMElement] Getting width and height of node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to get width and height of text node that is not supported!`);
            return null;
        }

        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        if (!model) return null;

        const { width, height } = model;
        return { width, height };
    }

    /**
     * Retrieves the attributes of a DOM element.
     *
     * This method sends a command to the Gameface to get the attributes of the DOM element.
     * It then processes the returned attributes into a key-value
     * map where the keys are attribute names and the values are attribute values.
     * @returns {Promise<Object>} A promise that resolves to an object containing the element's attributes.
     */
    async getAttributes() {
        const { attributes } = await this.sendCommand('DOM.getAttributes', { nodeId: this.nodeId });

        const attrMap = {};
        for (let i = 0; i < attributes.length; i += 2) {
            attrMap[attributes[i]] = attributes[i + 1];
        }

        return attrMap;
    }

    /**
     * Retrieves the value of the specified attribute from the element.
     *
     * @param {string} name - The name of the attribute to retrieve.
     * @returns {Promise<string|undefined>} A promise that resolves to the value of the attribute, or undefined if the attribute does not exist.
     */
    async getAttribute(name) {
        const attrMap = await this.getAttributes();
        return attrMap[name];
    }

    /**
     * Checks if the DOM element has a specific attribute.
     *
     * @param {string} name - The name of the attribute to check for.
     * @returns {Promise<boolean>} - A promise that resolves to true if the attribute exists, otherwise false.
     */
    async hasAttribute(name) {
        const attrMap = await this.getAttributes();
        return attrMap.hasOwnProperty(name);
    }

    /**
     * Sets an attribute on the DOM element.
     * 
     * Currently we are using setAttributesAsText because setAttributeValue command is not supported by Gameface.
     * Consider changing it when we support setAttributeValue
     * @param {string} name - The name of the attribute to set.
     * @param {string} value - The value of the attribute to set.
     * @returns {Promise<void>} A promise that resolves when the attribute has been set.
     */
    async setAttribute(name, value) {
        await this.sendCommand('DOM.setAttributesAsText', {
            nodeId: this.nodeId,
            text: `${name}="${value}"`
        });
    }

    /**
     * Simulates a click event on the DOM element represented by this instance.
     * 
     * This method retrieves the bounding box model of the element and calculates
     * the center coordinates. It then dispatches a mouse pressed and mouse released
     * event at the calculated coordinates to simulate a click.
     * @returns {Promise<void>} A promise that resolves when the click action is completed.
     */
    async click() {
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to click on text node that is not supported!`);
            return null;
        }

        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        const { content } = model;
        const x = (content[0] + content[2]) / 2;
        const y = (content[1] + content[5]) / 2;

        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x,
            y,
            button: 'left',
            clickCount: 1,
        });
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x,
            y,
            button: 'left',
            clickCount: 1,
        });
    }
}

module.exports = { DOMElement, DOMElements };