const { retryIfFails, getPressedKey } = require("../utils");

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
     * @param {import("gamefaceCommands").GamefaceCommandsMethods} gamefaceCommands - The gameface commands object.
     * @param {number|string} nodeId - The ID of the node to describe.
     * Resolves to the created DOMElement instance.
     */
    constructor(gamefaceCommands, nodeId) {
        this.nodeId = nodeId;
        /**
         * @private
         * @type {typeof gamefaceCommands}
         */
        this.gamefaceCommands = gamefaceCommands;
        /**
         * @private
         * @type {typeof gamefaceCommands.sendCommand}
         */
        this.sendCommand = gamefaceCommands.sendCommand;

        // @ts-ignore
        return new Promise(async (resolve, reject) => {
            if (!this.nodeId) {
                global.log.warn(`\n[DOMElement] Unable to create DOMElement because nodeId is not provided.`);
                return reject(new Error(`Unable to create DOMElement because nodeId is not provided.`));
            }

            global.log.debug(`\n[DOMElement] Creating new DOMElement. Getting data of node with id - ${this.nodeId}`);
            await this._getNodeData();
            if (this.node.nodeType !== 3) {
                await this.setAttribute('data-node-id', String(this.nodeId))
            }

            return resolve(this);
        })
    }

    /**
     * Asynchronously retrieves and sets the node data for the current DOM element.
     * Sends a 'DOM.describeNode' command to fetch details about the node using its nodeId.
     * Updates the `node` property with the retrieved node data or sets it to null if no data is found.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the node data has been retrieved and set.
     */
    async _getNodeData() {
        const nodeData = await this.sendCommand('DOM.describeNode', { nodeId: this.nodeId });
        this.node = nodeData.node || null;
    }

    /**
     * Gets the inner HTML content of the DOM element.
     * @returns {Promise<string>} The inner HTML content if available, otherwise an empty string.
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

        if (!nodeId) throw new Error(`Unable to find element with selector - "${selector}" within node with id - ${this.nodeId}.`);

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

        await this._getNodeData();

        return this._findElementWithContent(text, this.node);
    }

    /**
     * @private
     * Recursively retrieves the text content of a DOM node and its children.
     *
     * @param {Object} node - The DOM node to retrieve text content from.
     * @param {string} node.nodeValue - The text content of the node.
     * @param {Array<{nodeId: string}>} node.children - The child nodes of the DOM node.
     * @param {Object} node.children - The children of the DOM node.
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

        await this._getNodeData();

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
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is hidden`);

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
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is visible`);

        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });

        if (!model || model.height === 0 || model.width === 0) return false;

        const windowWidth = await this.gamefaceCommands.executeScript(() => window.innerWidth);
        const windowHeight = await this.gamefaceCommands.executeScript(() => window.innerHeight);

        const xPoints = model.content.filter((_, i) => i % 2 === 0);
        const yPoints = model.content.filter((_, i) => i % 2 === 1);
        const [maxX, minX, maxY, minY] = [Math.max(...xPoints), Math.min(...xPoints), Math.max(...yPoints), Math.min(...yPoints)];

        const isInViewport =
            maxX > 0 && minX < windowWidth &&
            maxY > 0 && minY < windowHeight;

        return !await this.isHidden() && isInViewport;
    }

    /**
     * Retrieves the bounding points of a DOM element.
     * @private
     * @param {Object} element - The DOM element object containing a `nodeId` property.
     * @returns {Promise<number[]>} A promise that resolves to an array containing the following points:
     *   - [0]: The maximum X-coordinate of the element.
     *   - [1]: The minimum X-coordinate of the element.
     *   - [2]: The maximum Y-coordinate of the element.
     *   - [3]: The minimum Y-coordinate of the element.
     */
    async _getPointsOfElement(element) {
        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: element.nodeId });

        const elementXPoints = model.content.filter((_, i) => i % 2 === 0);
        const elementYPoints = model.content.filter((_, i) => i % 2 === 1);
        return [
            Math.max(...elementXPoints),
            Math.min(...elementXPoints),
            Math.max(...elementYPoints),
            Math.min(...elementYPoints),
        ];
    }

    /**
     * Determines if the current DOM element is visible within a specified scrollable area.
     *
     * @async
     * @param {DOMElement} scrollableArea - The scrollable area to check visibility against. Must be an instance of DOMElement.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is visible within the scrollable area, otherwise `false`.
     * @throws {Error} Throws an error if `scrollableArea` is not provided or is not an instance of DOMElement.
     */
    async isVisibleInScrollableArea(scrollableArea) {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is visible in scrollable area`);

        if (!this.isVisible()) return false;
        if (!scrollableArea && !(scrollableArea instanceof DOMElement)) {
            throw new Error(`"isVisibleInScrollableArea" expects scrollableArea to be a DOMElement instance! Received ${scrollableArea}`);
        }

        const [elementMaxX, elementMinX, elementMaxY, elementMinY] = await this._getPointsOfElement(this);
        const [scrollableMaxX, scrollableMinX, scrollableMaxY, scrollableMinY] = await this._getPointsOfElement(scrollableArea);

        const isInScrollableArea =
            elementMaxX > scrollableMinX &&
            elementMinX < scrollableMaxX &&
            elementMaxY > scrollableMinY &&
            elementMinY < scrollableMaxY;

        return !await this.isHidden() && isInScrollableArea;
    }

    /**
     * Determines if the DOM element associated with the current node is scrollable.
     *
     * This method checks the computed CSS styles (`overflow`, `overflow-x`, and `overflow-y`)
     * of the element to see if they are set to `scroll` or `auto`, which indicates scrollability.
     *
     * @async
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is scrollable, otherwise `false`.
     */
    async isScrollable() {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is scrollable`);

        const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });

        const isScrollable = computedStyle.some((style) => {
            return (
                (style.name === 'overflow' || style.name === 'overflow-x' || style.name === 'overflow-y') &&
                (style.value === 'scroll' || style.value === 'auto')
            );
        });

        return isScrollable;
    }

    /**
     * Determines if the current DOM element is focusable.
     *
     * A DOM element is considered focusable if:
     * - It is not hidden.
     * - It is not disabled (does not have the "disabled" attribute).
     * - It either has a "tabindex" attribute or is one of the following tag types: 
     *   'a', 'button', 'input', 'textarea'.
     *
     * @async
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is focusable, otherwise `false`.
     */
    async isFocusable() {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is focusable`);

        if (await this.isHidden()) return false;

        const attrMap = await this.getAttributes();
        const tagName = this.node?.nodeName?.toLowerCase();
        const hasTabindex = attrMap['tabindex'] !== undefined;
        const isDisabled = attrMap['disabled'] !== undefined;
        return !isDisabled && (hasTabindex || ['a', 'button', 'input', 'textarea'].includes(tagName));
    }

    /**
     * Checks if the DOM element is currently focused.
     *
     * @returns {Promise<boolean>} A promise that resolves to `true` if the element is focused, otherwise `false`.
     */
    async isFocused() {
        global.log.debug(`\n[DOMElement] Checking if node with id - ${this.nodeId} is focused`);

        return await this.gamefaceCommands.executeScript((nodeId) => {
            return document.activeElement && document.activeElement.isSameNode(document.querySelector(`[data-node-id="${nodeId}"]`));
        }, this.nodeId);
    }

    /**
     * Focuses the DOM element by simulating a click event.
     *
     * @returns {Promise<void>} A promise that resolves when the element is focused.
     */
    async focus() {
        global.log.debug(`\n[DOMElement] Focusing on node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to focus text node that is not supported!`);
            return null;
        }

        if (await this.isFocused()) return;
        await this._click('left');
    }

    /**
     * Retrieves the list of CSS classes applied to the DOM element represented by this instance.
     *
     * @async
     * @returns {Promise<string[]>} A promise that resolves to an array of class names. 
     *                              If the element has no classes, an empty array is returned.
     */
    async classes() {
        global.log.debug(`\n[DOMElement] Getting classes of node with id - ${this.nodeId}`);

        const className = await this.getAttribute('class');
        return className ? className.split(' ') : [];
    }

    /**
     * Asynchronously retrieves the position of the DOM element on the screen.
     *
     * @returns {Promise<{x: number, y: number} | null>} The position of the element on the screen, or null if not available.
     */
    async getPositionOnScreen() {
        global.log.debug(`\n[DOMElement] Getting position on screen of node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to get position on screen of text node that is not supported!`);
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
        global.log.debug(`\n[DOMElement] Getting attributes of node with id - ${this.nodeId}`);

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
        global.log.debug(`\n[DOMElement] Getting attribute with name '${name}' of node with id - ${this.nodeId}`);

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
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} has '${name}' attribute`);

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
        global.log.debug(`\n[DOMElement] Setting attribute with name '${name}' and value '${value}' of node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Setting attribute to text node that is not supported!`);
            return null;
        }

        await this.sendCommand('DOM.setAttributesAsText', {
            nodeId: this.nodeId,
            text: `${name}="${value}"`,
            name: name
        });
    }

    /**
     * Calculates and returns the center coordinates of the DOM element.
     * @private
     * @async
     * @returns {Promise<number[]>} A promise that resolves to an array containing the x and y coordinates of the center of the element.
     */
    async _getCenter() {
        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        const { content } = model;
        const x = (content[0] + content[2]) / 2;
        const y = (content[1] + content[5]) / 2;
        return [x, y];
    }

    /**
     * @private
     * Simulates a mouse click on the current DOM element.
     *
     * @param {'left'|'middle'|'right'} button - The mouse button to use for the click. 
     *                          Possible values are "left", "middle", or "right".
     * @param {Object} [options] - Additional options for the click action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the click.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the click.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the click.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the click.
     * @param {number} [clickCount=1] - The number of times to click the mouse.
     * @returns {Promise<null>} Returns null if the node is a text node (nodeType 3) 
     *                          or after successfully dispatching the mouse events.
     * @throws {Error} Throws an error if the `DOM.getBoxModel` or `Input.dispatchMouseEvent` commands fail.
     */
    async _click(button, options, clickCount = 1) {
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to click on text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options)

        for (let i = 0; i < clickCount; i++) {
            await this.gamefaceCommands.mousePress(x, y, button, modifiers);
            await this.gamefaceCommands.mouseRelease(x, y, button, modifiers);
        }
    }

    /**
     * Simulates a mouse press action on the current DOM element.
     *
     * @param {'left'|'middle'|'right'} [button='left'] - The mouse button to press. Can be 'left', 'right', or 'middle'.
     * @param {Object} [options] - Additional options for the mousepress action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the mousepress.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the mousepress.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the mousepress.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the mousepress.
     * @returns {Promise<null|void>} Resolves to `null` if the element is a text node, otherwise performs the action.
     */
    async mousePress(button = 'left', options) {
        global.log.debug(`\n[DOMElement] Mouse press with "${button}" button.`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to mouse press on text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options);
        await this.gamefaceCommands.mousePress(x, y, button, modifiers);
    }

    /**
     * Simulates a mouse release action on the current DOM element.
     *
     * @param {'left'|'middle'|'right'} [button='left'] - The mouse button to press. Can be 'left', 'right', or 'middle'.
     * @param {Object} [options] - Additional options for the mouserelease action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the mouserelease.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the mouserelease.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the mouserelease.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the mouserelease.
     * @returns {Promise<null|void>} Resolves to `null` if the element is a text node, otherwise performs the action.
     */
    async mouseRelease(button = 'left', options) {
        global.log.debug(`\n[DOMElement] Mouse release with "${button}" button.`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to mouse release on text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options);
        await this.gamefaceCommands.mouseRelease(x, y, button, modifiers);
    }

    /**
     * Simulates a mouse wheel event on the current DOM element.
     *
     * @async
     * @param {number} deltaX - The amount to scroll horizontally.
     * @param {number} deltaY - The amount to scroll vertically.
     * @returns {Promise<void|null>} Resolves when the event is dispatched, or null if the element is a text node.
     */
    async mouseWheel(deltaX, deltaY) {
        global.log.debug(`\n[DOMElement] Mouse wheel with ${deltaX} ${deltaY}.`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to click on text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x,
            y,
            deltaX,
            deltaY,
        });
    }

    /**
     * Simulates a click event on the DOM element represented by this instance.
     * 
     * This method retrieves the bounding box model of the element and calculates
     * the center coordinates. It then dispatches a mouse pressed and mouse released
     * event at the calculated coordinates to simulate a click.
     * 
     * @param {Object} [options] - Additional options for the click action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the click.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the click.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the click.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the click.
     * 
     * @returns {Promise<void>} A promise that resolves when the click action is completed.
     */
    async click(options) {
        global.log.debug(`\n[DOMElement] Clicking on node with id - ${this.nodeId}`);

        await this._click("left", options);
    }

    /**
     * Performs a right-click action on the DOM element associated with this instance.
     *
     * @param {Object} [options] - Additional options for the right click action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the right click.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the right click.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the right click.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the right click.
     * @returns {Promise<void>} Resolves when the right-click action is completed.
     */
    async rightClick(options) {
        global.log.debug(`\n[DOMElement] Right clicking on node with id - ${this.nodeId}`);

        await this._click("right", options);
    }

    /**
     * Performs a double-click action on the DOM element associated with this instance.
     *
     * @param {Object} [options] - Additional options for the double click action.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed during the double click.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed during the double click.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed during the double click.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed during the double click.
     * @returns {Promise<void>} Resolves when the double-click action is completed.
     */
    async doubleClick(options) {
        global.log.debug(`\n[DOMElement] Double clicking on node with id - ${this.nodeId}`);

        await this._click("left", options, 2);
    }

    /**
     * Simulates hovering over a DOM element.
     * Logs the action and performs necessary checks to ensure the element is interactable.
     * If the element is a text node, a warning is logged and the operation is aborted.
     * If the element is not visible, it scrolls into view before proceeding.
     * Finally, it calculates the center of the element and moves the mouse to that position.
     *
     * @async
     * @returns {Promise<null|void>} Returns `null` if the element is a text node, otherwise performs the hover action.
     */
    async hover() {
        global.log.debug(`\n[DOMElement] Hovering on node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to hover on text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        await this.gamefaceCommands.moveMouse(x, y);
    }

    /**
     * Drags the DOM element to a specified position.
     *
     * @async
     * @param {number} x - The x-coordinate to drag the element to.
     * @param {number} y - The y-coordinate to drag the element to.
     * @returns {Promise<void|null>} Resolves when the drag operation is complete. Returns `null` if the element is a text node and cannot be dragged.
     */
    async drag(x, y) {
        global.log.debug(`\n[DOMElement] Dragging node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to drag text node that is not supported!`);
            return null;
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [startX, startY] = await this._getCenter();

        await this.gamefaceCommands.mousePress(startX, startY);
        await this.gamefaceCommands.moveMouse(x, y);
        await this.gamefaceCommands.mouseRelease(x, y);
    }

    /**
     * Scrolls the DOM element by the specified delta values.
     *
     * @async
     * @param {number} deltaX - The amount to scroll horizontally.
     * @param {number} deltaY - The amount to scroll vertically.
     * @returns {Promise<void>} Resolves when the scrolling action is complete.
     */
    async scroll(deltaX = 0, deltaY = 0) {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return null;
        }

        if (!await this.isScrollable()) {
            throw new Error(`Trying to scroll node that is not scrollable!`);
        }

        await this.mouseWheel(deltaX, deltaY);
    }

    /**
     * Scrolls the DOM element to the specified coordinates (x, y).
     *
     * @async
     * @param {number} x - The target x-coordinate to scroll to.
     * @param {number} y - The target y-coordinate to scroll to.
     * @returns {Promise<void>} Resolves when the scrolling operation is complete.
     */
    async scrollTo(x, y) {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId} to position (${x}, ${y})`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return null;
        }

        if (!await this.isScrollable()) {
            throw new Error(`Trying to scroll node that is not scrollable!`);
        }

        if (!await this.isVisible()) await this.scrollIntoView();

        const [currentX, currentY] = await this._getCenter();
        const deltaX = x - currentX;
        const deltaY = y - currentY;

        await this.mouseWheel(deltaX, deltaY);
    }

    /**
     * Asynchronously finds the nearest scrollable parent element of the current DOM element.
     * If the current element is not visible, it traverses up the DOM tree to locate a scrollable parent.
     * @private
     * @async
     * @returns {Promise<DOMElement|null>} A promise that resolves to the nearest scrollable parent element,
     * or `null` if no scrollable parent is found.
     */
    async _findElementScrollableArea() {
        if (!await this.isVisible()) {
            let parent = this.node.parentId ? await new DOMElement(this.gamefaceCommands, this.node.parentId) : null;

            while (parent) {
                if (await parent.isScrollable()) return parent;

                parent = parent.node.parentId ? await new DOMElement(this.gamefaceCommands, parent.node.parentId) : null;
            }
        }
    }

    /**
     * Scrolls the current DOM element into view within a scrollable area.
     *
     * @param {DOMElement|null} [scrollableArea=null] - The scrollable area in which the element should be scrolled into view.
     * If not provided, the method attempts to locate a scrollable parent element in the DOM hierarchy.
     * 
     * @throws {Error} Throws an error if:
     * - The element is a text node (nodeType === 3), which cannot be scrolled.
     * - A scrollable area cannot be located or is not explicitly provided.
     * - The provided scrollableArea is not an instance of DOMElement.
     * - The scrollable area is not scrollable.
     * - The element cannot be scrolled into view after multiple retry attempts.
     * 
     * @returns {Promise<void|null>} Resolves when the element is successfully scrolled into view or if it is already visible.
     * Returns `null` if the element is a text node and cannot be scrolled.
     */
    async scrollIntoView(scrollableArea = null) {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId} into view`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return null;
        }

        if (!scrollableArea) {
            scrollableArea = await this._findElementScrollableArea();

            if (!scrollableArea) {
                throw new Error(`Could not locate a scrollable area for the element. Ensure the element has a scrollable parent in the DOM hierarchy or explicitly provide the scrollable area to the "scrollIntoView" method using the "scrollableArea" parameter.`);
            }
        }

        if (!(scrollableArea instanceof DOMElement)) {
            throw new Error(`"scrollIntoView" argument expects scrollableArea to be a DOMElement instance! Received ${scrollableArea}`);
        }

        if (!await scrollableArea.isScrollable()) {
            throw new Error(`Trying to scroll node that is not scrollable!`);
        }

        if (await this.isVisibleInScrollableArea(scrollableArea)) {
            return;
        }

        await retryIfFails(async () => {
            const [elementMaxX, elementMinX, elementMaxY, elementMinY] = await this._getPointsOfElement(this);
            const [scrollableMaxX, scrollableMinX, scrollableMaxY, scrollableMinY] = await this._getPointsOfElement(scrollableArea);

            const elementCenterX = (elementMaxX + elementMinX) / 2;
            const elementCenterY = (elementMaxY + elementMinY) / 2;

            const scrollableCenterX = (scrollableMaxX + scrollableMinX) / 2;
            const scrollableCenterY = (scrollableMaxY + scrollableMinY) / 2;

            const diffX = elementCenterX - scrollableCenterX;
            const diffY = elementCenterY - scrollableCenterY;

            await scrollableArea.scrollTo(scrollableCenterX + diffX, scrollableCenterY + diffY);
            if (!await this.isVisibleInScrollableArea(scrollableArea)) throw new Error(`Unable to scroll element into view. Please check if the element is visible!`);
        }, 5);
    }

    /**
     * Dispatches a keyboard event on the current DOM element.
     * If the element is a text node, the operation is not supported and a warning is logged.
     * @private
     * @param {'keyDown'|'keyUp'} event - The type of keyboard event to dispatch (e.g., 'keydown', 'keyup').
     * @param {string|number} key - The key to simulate.
     * @param {Object} [options] - Additional options for the keyboard event.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed.
     * @returns {Promise<null|void>} Resolves with `null` if the operation is not supported, otherwise resolves when the event is dispatched.
     */
    async _keyEvent(event, key, options) {
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to dispatch ${event} on text node that is not supported!`);
            return null;
        }

        await this.focus();
        // @ts-ignore
        await this.gamefaceCommands._keyEvent(event, key, options);
    }

    /**
     * Simulates a key down event on the current DOM element.
     *
     * @param {string|number} key - The key to simulate pressing.
     * @param {Object} [options] - Additional options for the keyboard event.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed.
     * @param {number} [count=1] - The number of times to simulate the key down event.
     * @returns {Promise<void>} A promise that resolves when the key down events are completed.
     */
    async keyDown(key, options, count = 1) {
        global.log.debug(`\n[DOMElement] Key down with "${key}" ${count} times.`);

        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyDown', key, options);
        }
    }

    /**
     * Simulates a key up event on the current DOM element.
     *
     * @param {string} key - The key to simulate pressing.
     * @param {Object} [options] - Additional options for the keyboard event.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed.
     * @param {number} [count=1] - The number of times to simulate the key up event.
     * @returns {Promise<void>} A promise that resolves when the key up events are completed.
     */
    async keyUp(key, options, count = 1) {
        global.log.debug(`\n[DOMElement] Key up with "${key}" ${count} times.`);

        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyUp', key, options);
        }
    }

    /**
     * Simulates a key press event on the current DOM element.
     *
     * @param {string} key - The key to simulate pressing.
     * @param {Object} [options] - Additional options for the keyboard event.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed.
     * @param {number} [count=1] - The number of times to simulate the key press event.
     * @returns {Promise<void>} A promise that resolves when the key press events are completed.
     */
    async keyPress(key, options, count = 1) {
        global.log.debug(`\n[DOMElement] Key press with "${key}" ${count} times.`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to keypress on text node that is not supported!`);
            return null;
        }

        await this.focus();
        await this.gamefaceCommands.keyPress(key, options, count);
    }

    /**
     * Simulates typing on a DOM element by sending key events.
     * Keypress will simulate - keyDown -> char -> keyUp for each key.
     * If the element is input then it will dispatch just `char` event.
     *
     * @param {string|string[]} keys - The keys to type. Can be a string or an array of characters.
     * @param {Object} [options] - Additional options for the keyboard event.
     * @param {boolean} [options.altKey] - Indicates if the Alt key is pressed.
     * @param {boolean} [options.ctrlKey] - Indicates if the Ctrl key is pressed.
     * @param {boolean} [options.metaKey] - Indicates if the Meta key is pressed.
     * @param {boolean} [options.shiftKey] - Indicates if the Shift key is pressed.
     * @returns {Promise<void>} A promise that resolves when the typing simulation is complete.
     *
     * @example
     * // Typing a string
     * await domElement.type('hello');
     *
     * @example
     * // Typing an array of characters
     * await domElement.type(['h', 'e', 'l', 'l', 'o']);
     */
    async type(keys, options) {
        global.log.debug(`\n[DOMElement] Typing on node with id - ${this.nodeId}`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to type on text node that is not supported!`);
            return;
        }

        if (typeof keys === 'string') {
            keys = keys.split('');
        }

        if (!Array.isArray(keys)) {
            global.log.warn(`Keys argument of the type method should be array with characters or string! Received: ${keys}`);
            return;
        }

        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
            await this.focus();
        }

        for (let key of keys) {
            if (tagName !== 'input' && tagName !== 'textarea') {
                await this.keyPress(key, options);
            } else {
                // @ts-ignore
                await this.gamefaceCommands._keyEvent('char', key, options);
            }
        }
    }

    /**
     * Retrieves the value of the current DOM element if it is an input or textarea.
    *
    * @async
     * @throws {Error} Throws an error if the current element is not an input or textarea.
     * @returns {Promise<string>} The value of the input or textarea element.
     */
    async getValue() {
        global.log.debug(`\n[DOMElement] Getting value of node with id - ${this.nodeId}.`);

        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
            throw new Error(`The getValue method is only supported for input or textarea elements. Current element is a '${tagName}'.`);
        }

        return await this.gamefaceCommands.executeScript((nodeId) => {
            /**@type {HTMLInputElement|HTMLTextAreaElement} */
            const inputElement = document.querySelector(`[data-node-id="${nodeId}"]`);
            return inputElement.value;
        }, this.nodeId);
    }

    /**
     * Clears the value of the current DOM element if it is an input or textarea.
     * 
     * @throws {Error} Throws an error if the current element is not an input or textarea.
     * @returns {Promise<void>} A promise that resolves when the value has been cleared.
     */
    async clear() {
        global.log.debug(`\n[DOMElement] Cleaning value of node with id - ${this.nodeId}.`);

        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
            throw new Error(`The clear method is only supported for input or textarea elements. Current element is a '${tagName}'.`);
        }

        await this.focus();

        //@ts-ignore
        await this.gamefaceCommands.executeScript(() => document.activeElement.value = '');
    }

    /**
     * Triggers a custom event on the DOM element identified by the `nodeId`.
     *
     * @param {string} eventName - The name of the custom event to dispatch.
     * @param {Object} [data] - Optional data to include in the event's `detail` property.
     * @returns {Promise<void>} A promise that resolves when the command is sent.
     */
    async trigger(eventName, data) {
        global.log.debug(`\n[DOMElement] Triggering custom event "${eventName}" on node with id - ${this.nodeId}.`);

        await this.gamefaceCommands.executeScript((eventName, data, nodeId) => {
            const el = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (el) {
                el.dispatchEvent(new CustomEvent(eventName, {
                    detail: data,
                }));
            } else {
                throw new Error(`Failed to trigger custom event "${eventName}" because the element could not be located.`);
            }
        }, eventName, data, this.nodeId);
    }
}

module.exports = { DOMElement, DOMElements };