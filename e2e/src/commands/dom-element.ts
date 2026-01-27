import { retryIfFails, getPressedKey, KeyOptions } from "../utils";
import type { GamefaceCommands } from "./commands";

export class DOMElements extends Array<DOMElement> {
    constructor(public parentNodeId?: number | string) {
        super();
    }

    /**
     * Retrieves the first DOM element in the collection.
     * @returns The first DOM element in the collection.
     * @throws If the the array has no items.
     */
    first(): DOMElement {
        if (!this.length) throw new Error(`Unable to get the first node because there are no items.`);
        global.log.debug(`\n[DOMElements] Getting the first node with id - ${this[0].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[0];
    }

    /**
     * Retrieves the last DOM element in the collection.
     * @returns The last DOM element in the collection.
     * @throws If the the array has no items.
     */
    last(): DOMElement {
        if (!this.length) throw new Error(`Unable to get the last node because there are no items.`);
        global.log.debug(`\n[DOMElements] Getting the last node with id - ${this[this.length - 1].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[this.length - 1];
    }

    /**
     * Retrieves the DOM element at the specified index.
     * @param index The index of the desired DOM element.
     * @returns The DOM element at the specified index.
     * @throws If the element at the specified index does not exist.
     */
    nth(index: number): DOMElement {
        if (!this[index]) throw new Error(`Unable to get the node with index - ${index}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}.`);
        global.log.debug(`\n[DOMElements] Getting the node with index - ${index} and id - ${this[index].nodeId}${this.parentNodeId ? ` of parent node with id - ${this.parentNodeId}` : ''}`);
        return this[index];
    }
}

export class DOMElement {
    public nodeId: number | string;
    private gamefaceCommands: GamefaceCommands;
    private node: any;

    /**
     * Private constructor. Use DOMElement.create() to instantiate.
     */
    private constructor(gamefaceCommands: GamefaceCommands, nodeId: number | string) {
        this.nodeId = nodeId;
        this.gamefaceCommands = gamefaceCommands;
    }

    /**
     * Factory method to create and initialize a DOMElement.
     */
    public static async create(gamefaceCommands: GamefaceCommands, nodeId: number | string): Promise<DOMElement> {
        if (!nodeId) {
            global.log.warn(`\n[DOMElement] Unable to create DOMElement because nodeId is not provided.`);
            throw new Error(`Unable to create DOMElement because nodeId is not provided.`);
        }

        const instance = new DOMElement(gamefaceCommands, nodeId);
        global.log.debug(`\n[DOMElement] Creating new DOMElement. Getting data of node with id - ${nodeId}`);

        await instance._getNodeData();

        if (instance.node && instance.node.nodeType !== 3) {
            await instance.setAttribute('data-node-id', String(nodeId));
        }

        return instance;
    }

    private sendCommand(method: string, params?: any): Promise<any> {
        return this.gamefaceCommands.sendCommand(method, params);
    }

    /**
     * Asynchronously retrieves and sets the node data for the current DOM element.
     * Sends a 'DOM.describeNode' command to fetch details about the node using its nodeId.
     * Updates the `node` property with the retrieved node data or sets it to null if no data is found.
     *
     * @returns A promise that resolves when the node data has been retrieved and set.
     */
    private async _getNodeData(): Promise<void> {
        const nodeData = await this.sendCommand('DOM.describeNode', { nodeId: this.nodeId });
        this.node = nodeData.node || null;
    }

    /**
     * Gets the inner HTML content of the DOM element.
     * @returns The inner HTML content if available, otherwise an empty string.
     */
    async getInnerHTML(): Promise<string> {
        global.log.debug(`\n[DOMElement] Getting inner HTML of node with id - ${this.nodeId}`);
        const outerHTML = await this.getOuterHTML();
        const match = outerHTML.match(/^<[^>]+>([\s\S]*)<\/[^>]+>$/);
        return match ? match[1] : "";
    }

    /**
     * Retrieves the outer HTML of the current DOM element.
     * @returns A promise that resolves to the outer HTML of the element.
     */
    async getOuterHTML(): Promise<string> {
        global.log.debug(`\n[DOMElement] Getting outer HTML of node with id - ${this.nodeId}`);
        return (await this.sendCommand('DOM.getOuterHTML', { nodeId: this.nodeId })).outerHTML;
    }

    /**
     * Retrieves the parent element of the current DOM element.
     *
     * @returns A promise that resolves to a new DOMElement instance with the found nodeId.
     */
    async getParent(): Promise<DOMElement> {
        global.log.debug(`\n[DOMElement] Getting parent element of node with id - ${this.nodeId}`);
        if (!this.node.parentId) {
            throw new Error(`Node with id - ${this.nodeId} does not have a parent element.`);
        }
        return await DOMElement.create(this.gamefaceCommands, this.node.parentId);
    }

    /**
     * Retrieves the child elements of the current DOM element.
     *
     * @returns A promise that resolves to an array of child DOM elements.
     */
    async children(): Promise<DOMElements> {
        global.log.debug(`\n[DOMElement] Getting children of node with id - ${this.nodeId}`);
        const children = new DOMElements(this.nodeId);
        if (this.node.children) {
            for (let { nodeId } of this.node.children) {
                children.push(await DOMElement.create(this.gamefaceCommands, nodeId));
            }
        }
        return children;
    }

    /**
     * Finds a DOM element using the specified selector.
     *
     * @param selector The CSS selector to query the DOM element.
     * @returns A promise that resolves to a new DOMElement instance with the found nodeId.
     */
    async find(selector: string): Promise<DOMElement> {
        global.log.debug(`\n[DOMElement] Trying to find element with selector - ${selector} within node with id - ${this.nodeId}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);

        return await retryIfFails(async () => {
            const { nodeId } = await this.sendCommand('DOM.querySelector', {
                nodeId: this.nodeId,
                selector,
            });

            if (!nodeId) throw new Error(`Unable to find element with selector - "${selector}" within node with id - ${this.nodeId}.`);
            return await DOMElement.create(this.gamefaceCommands, nodeId);
        });
    }

    /**
     * Finds all elements matching the given selector within the current node.
     *
     * @param selector The CSS selector to match elements against.
     * @returns A promise that resolves to an array of DOMElement instances matching the selector.
     * @throws If no elements are found matching the selector.
     */
    async findAll(selector: string): Promise<DOMElements> {
        global.log.debug(`\n[DOMElement] Trying to find all elements with selector - ${selector} within node with id - ${this.nodeId}`);
        if (!selector) throw new Error(`Selector must be provided to find elements.`);

        return await retryIfFails(async () => {
            const { nodeIds } = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: this.nodeId,
                selector,
            });

            if (!nodeIds?.length) throw new Error(`Unable to find any elements with selector - ${selector} within node with id - ${this.nodeId}.`);

            const elements = new DOMElements(this.nodeId);
            for (let nodeId of nodeIds) {
                elements.push(await DOMElement.create(this.gamefaceCommands, nodeId));
            }
            return elements;
        });
    }

    /**
     * Recursively searches for a DOM element that contains the specified content.
     * @param content The content to search for within the DOM elements.
     * @param node The current DOM node to search within.
     * @param node.nodeId The ID of the current DOM node.
     * @param node.nodeValue The value of the current DOM node.
     * @param node.children The children of the current DOM node.
     * @returns A promise that resolves to the found DOM element or null if no element is found.
     */
    private async _findElementWithContent(content: string, node: any): Promise<DOMElement | null> {
        if (!node) return null;
        if (node.nodeValue?.match(content)) return DOMElement.create(this.gamefaceCommands, node.nodeId);

        if (node.children) {
            for (const { nodeId } of node.children) {
                const childElement = await this.sendCommand('DOM.describeNode', { nodeId });
                const foundedElement = await this._findElementWithContent(content, childElement.node);
                if (foundedElement) return foundedElement;
            }
        }
        return null;
    }

    /**
     * Searches for a DOM element that contains the specified text starting from current one.
     * @param text The text to search for within the DOM element.
     * @returns A promise that resolves to the found element containing the text, or null if no such element is found.
     */
    async contains(text: string): Promise<DOMElement | null> {
        global.log.debug(`\n[DOMElement] Trying to find text - ${text} within node with id - ${this.nodeId}`);
        await this._getNodeData();
        return this._findElementWithContent(text, this.node);
    }

    /**
     * Recursively retrieves the text content of a DOM node and its children.
     *
     * @param node The DOM node to retrieve text content from.
     * @param node.nodeValue The text content of the node.
     * @param node.children The children of the DOM node.
     * @param node.children[].nodeId The ID of the child node.
     * @returns The concatenated text content of the node and its children.
     */
    private async _getTextContent(node: { nodeValue: string, children: { nodeId: number }[] }): Promise<string> {
        if (!node) return '';
        let value = node.nodeValue || '';
        if (node.children) {
            for (const { nodeId } of node.children) {
                const childDOMEl = await this.sendCommand('DOM.describeNode', { nodeId });
                value += await this._getTextContent(childDOMEl.node);
            }
        }
        return value;
    }

    /**
     * Retrieves the text content of the current DOM element.
     *
     * @returns A promise that resolves to the text content of the element.
     */
    async text(): Promise<string> {
        global.log.debug(`\n[DOMElement] Getting all the text content of node with id - ${this.nodeId}`);
        await this._getNodeData();
        return this._getTextContent(this.node);
    }

    /**
     * Waits for the specified text to appear within the DOM element associated with this instance.
     * Retries the operation if it fails initially.
     *
     * @param text The text to wait for within the DOM element.
     * @returns Resolves to `true` if the text is found, otherwise throws an error.
     * @throws If the specified text is not found within the DOM element after retries.
     */
    async waitForText(text: string): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for text - ${text} in node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const content = await this.text();
            if (content.trim().includes(text)) return true;
            throw new Error(`Text "${text}" not found in node with id - ${this.nodeId}.`);
        });
    }

    /**
     * Retrieves the computed styles for the current DOM element.
     * @returns A promise that resolves to an object containing the computed styles,
     * where each key is a CSS property name and each value is the corresponding CSS value.
     */
    async styles(): Promise<{ [key: string]: string }> {
        global.log.debug(`\n[DOMElement] Getting styles of node with id - ${this.nodeId}`);
        const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });
        return computedStyle.reduce((prev: any, current: any) => {
            prev[current.name] = current.value;
            return prev;
        }, {});
    }

    /**
     * Waits for the specified styles to be applied to the DOM element.
     * This method retries the check until the styles match or the retry limit is reached.
     *
     * @param styles An object representing the CSS styles to wait for, where keys are CSS property names and values are expected values.
     * @returns Resolves to `true` if the styles match successfully.
     * @throws Throws an error if the expected styles are not found within the retry limit.
     */
    async waitForStyles(styles: { [key: string]: string }): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for styles - ${JSON.stringify(styles)} in node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const computedStyles = await this.styles();
            for (const [key, value] of Object.entries(styles)) {
                if (computedStyles[key] !== value) {
                    throw new Error(`Style "${key}" with value "${styles[key]}" not found in node with id - ${this.nodeId}. Received "${computedStyles[key]}" value for the ${key} property instead.`);
                }
            }
            return true;
        });
    }

    /**
     * Checks if the DOM element is hidden.
     * 
     * This method sends a command to get the computed style for the node and 
     * checks if the element is hidden based on its 'display', 'visibility', 
     * or 'opacity' properties.
     * 
     * @returns A promise that resolves to `true` if the element is hidden, otherwise `false`.
     */
    async isHidden(): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is hidden`);
        return retryIfFails(async () => {
            const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });
            return computedStyle.some(
                (style: any) =>
                    (style.name === 'display' && style.value === 'none') ||
                    (style.name === 'visibility' && style.value === 'hidden') ||
                    (style.name === 'opacity' && style.value === '0')
            );
        });
    }

    /**
     * Waits for the visibility state of the DOM element to match the specified condition.
     * Logs the process and retries if the initial check fails.
     *
     * @param visibility The desired visibility state of the DOM element. `true` for visible, `false` for hidden.
     * @returns Resolves to `true` if the visibility state matches the desired condition.
     * @throws Throws an error if the visibility state does not match the desired condition after retries.
     */
    async waitForVisibility(visibility: boolean = true): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for node with id - ${this.nodeId} to be ${visibility ? 'visible' : 'hidden'}`);
        return retryIfFails(async () => {
            const isVisible = await this.isVisible();
            if (isVisible === visibility) return true;
            throw new Error(`Node with id - ${this.nodeId} is not ${visibility ? 'visible' : 'hidden'}`);
        });
    }

    /**
     * Checks if the DOM element is visible.
     *
     * This method sends a command to get the box model of the element and determines
     * if the element is offscreen based on its height and width. It also checks if
     * the element is hidden.
     *
     * @returns A promise that resolves to `true` if the element is visible, otherwise `false`.
     */
    async isVisible(): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is visible`);
        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: this.nodeId });
        if (!model || model.height === 0 || model.width === 0) return false;

        const windowWidth = await this.gamefaceCommands.executeScript(() => window.innerWidth);
        const windowHeight = await this.gamefaceCommands.executeScript(() => window.innerHeight);

        const xPoints = model.content.filter((_: any, i: number) => i % 2 === 0);
        const yPoints = model.content.filter((_: any, i: number) => i % 2 === 1);
        const [maxX, minX, maxY, minY] = [Math.max(...xPoints), Math.min(...xPoints), Math.max(...yPoints), Math.min(...yPoints)];

        const isInViewport = maxX > 0 && minX < windowWidth && maxY > 0 && minY < windowHeight;
        return !await this.isHidden() && isInViewport;
    }

    /**
     * Retrieves the bounding points of a DOM element.
     * @param element The DOM element object containing a `nodeId` property.
     * @returns A promise that resolves to an array containing the following points:
     *   - [0]: The maximum X-coordinate of the element.
     *   - [1]: The minimum X-coordinate of the element.
     *   - [2]: The maximum Y-coordinate of the element.
     *   - [3]: The minimum Y-coordinate of the element.
     */
    private async _getPointsOfElement(element: DOMElement): Promise<number[]> {
        const { model } = await this.sendCommand('DOM.getBoxModel', { nodeId: element.nodeId });
        const elementXPoints = model.content.filter((_: any, i: number) => i % 2 === 0);
        const elementYPoints = model.content.filter((_: any, i: number) => i % 2 === 1);
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
     * @param scrollableArea - The scrollable area to check visibility against. Must be an instance of DOMElement.
     * @returns A promise that resolves to `true` if the element is visible within the scrollable area, otherwise `false`.
     * @throws Throws an error if `scrollableArea` is not provided or is not an instance of DOMElement.
     */
    async isVisibleInScrollableArea(scrollableArea: DOMElement | null): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is visible in scrollable area`);
        if (!await this.isVisible()) return false;

        if (!scrollableArea || !(scrollableArea instanceof DOMElement)) {
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
    * Waits for the visibility of a DOM element within a scrollable area.
    * Retries the check until the element's visibility matches the expected state.
    *
    * @param scrollableArea The scrollable area in which to check the visibility of the element.
    * @param visibility The expected visibility state of the element. 
    *                                       `true` for visible, `false` for hidden.
    * @returns Resolves to `true` if the element's visibility matches the expected state.
    * @throws Throws an error if the element's visibility does not match the expected state after retries.
    */
    async waitForVisibilityInScrollableArea(scrollableArea: DOMElement, visibility: boolean = true): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for node with id - ${this.nodeId} to be ${visibility ? 'visible' : 'hidden'} in scrollable area`);
        return retryIfFails(async () => {
            const isVisible = await this.isVisibleInScrollableArea(scrollableArea);
            if (isVisible === visibility) return true;
            throw new Error(`Node with id - ${this.nodeId} is not ${visibility ? 'visible' : 'hidden'} in scrollable area.`);
        });
    }

    /**
     * Determines if the DOM element associated with the current node is scrollable.
     *
     * This method checks the computed CSS styles (`overflow`, `overflow-x`, and `overflow-y`)
     * of the element to see if they are set to `scroll` or `auto`, which indicates scrollability.
     *
     * @returns A promise that resolves to `true` if the element is scrollable, otherwise `false`.
     */
    async isScrollable(): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} is scrollable`);
        const { computedStyle } = await this.sendCommand('CSS.getComputedStyleForNode', { nodeId: this.nodeId });
        return computedStyle.some((style: any) => {
            return (
                (style.name === 'overflow' || style.name === 'overflow-x' || style.name === 'overflow-y') &&
                (style.value === 'scroll' || style.value === 'auto')
            );
        });
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
     * @returns A promise that resolves to `true` if the element is focusable, otherwise `false`.
     */
    async isFocusable(): Promise<boolean> {
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
     * @returns A promise that resolves to `true` if the element is focused, otherwise `false`.
     */
    async isFocused(): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Checking if node with id - ${this.nodeId} is focused`);
        const isFocused = await this.gamefaceCommands.executeScript((nodeId: string | number) => {
            const el = document.querySelector(`[data-node-id="${nodeId}"]`);
            return document.activeElement && el && document.activeElement.isSameNode(el);
        }, this.nodeId);

        return !!isFocused;
    }

    /**
     * Focuses the DOM element by simulating a click event.
     *
     * @returns A promise that resolves when the element is focused.
     */
    async focus(): Promise<void> {
        global.log.debug(`\n[DOMElement] Focusing on node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to focus text node that is not supported!`);
            return;
        }
        if (await this.isFocused()) return;
        await this._click('left');
    }

    /**
     * Retrieves the list of CSS classes applied to the DOM element represented by this instance.
     *
     * @returns A promise that resolves to an array of class names. 
     *                              If the element has no classes, an empty array is returned.
     */
    async classes(): Promise<string[]> {
        global.log.debug(`\n[DOMElement] Getting classes of node with id - ${this.nodeId}`);
        const className = await this.getAttribute('class');
        return className ? className.split(' ') : [];
    }

    /**
     * Waits for specific classes to be present in the DOM element associated with this instance.
     * Retries if the check fails initially.
     *
     * @param classes An array of class names to check for in the element's class list.
     * @returns Resolves to `true` if all specified classes are found, otherwise retries or throws an error.
     * @throws Throws an error if any of the specified classes are not found after retries.
     */
    async waitForClasses(classes: string[]): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for classes - ${classes} in node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const elementClasses = await this.classes();
            for (const className of classes) {
                if (!elementClasses.includes(className)) {
                    throw new Error(`Class "${className}" not found in node with id - ${this.nodeId}. The current classes are: ${elementClasses.join(', ')}`);
                }
            }
            return true;
        });
    }

    /**
     * Asynchronously retrieves the position of the DOM element on the screen.
     *
     * @returns The position of the element on the screen, or null if not available.
     */
    async getPositionOnScreen(): Promise<{ x: number, y: number } | null> {
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
     * Waits for the DOM element to be at the specified position on the screen.
     * Retries the operation if it fails until the element is at the expected position.
     *
     * @param position The expected position of the DOM element on the screen.
     * @param position.x The expected x-coordinate of the element.
     * @param position.y The expected y-coordinate of the element.
     * @returns Resolves to `true` if the element is at the expected position.
     * @throws Throws an error if the position cannot be retrieved or if the element is not at the expected position.
     */
    async waitForPositionOnScreen(position: { x?: number, y?: number }): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for position on screen - ${JSON.stringify(position)} of node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const currentPosition = await this.getPositionOnScreen();
            if (!currentPosition) throw new Error(`Unable to get position on screen of node with id - ${this.nodeId}.`);

            const hasX = position.x !== undefined;
            const hasY = position.y !== undefined;

            if (hasX && !hasY && currentPosition.x === position.x) return true;
            if (hasY && !hasX && currentPosition.y === position.y) return true;
            if (hasX && hasY && currentPosition.x === position.x && currentPosition.y === position.y) return true;

            throw new Error(`Node with id - ${this.nodeId} is not at the expected position on screen. Expected: ${JSON.stringify(position)}, but got: ${JSON.stringify(currentPosition)}.`);
        });
    }

    /**
     * Asynchronously retrieves the width and height of the DOM element associated with this instance.
     *
     * @returns An object containing the width and height of the element, or null if the size cannot be determined.
     */
    async getSize(): Promise<{ width: number, height: number } | null> {
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
     * Waits for the DOM element to reach the specified size.
     * Retries the operation if it fails until the size matches the expected dimensions.
     *
     * @param size The expected size of the DOM element.
     * @param size.width The expected width of the DOM element.
     * @param size.height The expected height of the DOM element.
     * @returns Resolves to `true` if the DOM element reaches the expected size.
     * @throws Throws an error if the size cannot be retrieved or does not match the expected dimensions.
     */
    async waitForSize(size: { width?: number, height?: number }): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for size - ${JSON.stringify(size)} of node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const currentSize = await this.getSize();
            if (!currentSize) throw new Error(`Unable to get size of node with id - ${this.nodeId}.`);

            if (size.width !== undefined && size.height === undefined && currentSize.width === size.width) return true;
            if (size.height !== undefined && size.width === undefined && currentSize.height === size.height) return true;
            if (currentSize.width === size.width && currentSize.height === size.height) return true;

            throw new Error(`Node with id - ${this.nodeId} is not at the expected size. Expected: ${JSON.stringify(size)}, but got: ${JSON.stringify(currentSize)}.`);
        });
    }

    /**
     * Retrieves the attributes of a DOM element.
     *
     * This method sends a command to the Gameface to get the attributes of the DOM element.
     * It then processes the returned attributes into a key-value
     * map where the keys are attribute names and the values are attribute values.
     * @returns A promise that resolves to an object containing the element's attributes.
     */
    async getAttributes(): Promise<{ [key: string]: string }> {
        global.log.debug(`\n[DOMElement] Getting attributes of node with id - ${this.nodeId}`);
        const { attributes } = await this.sendCommand('DOM.getAttributes', { nodeId: this.nodeId });
        const attrMap: { [key: string]: string } = {};
        for (let i = 0; i < attributes.length; i += 2) {
            attrMap[attributes[i]] = attributes[i + 1];
        }
        return attrMap;
    }

    /**
     * Waits for specific attributes to be present on a DOM element.
     * This method retries the check until the attributes match or the retry limit is reached.
     *
     * @param attributes An object representing the attributes to wait for, where keys are attribute names and values are expected attribute values.
     * @returns Resolves to `true` if the attributes match successfully.
     * @throws Throws an error if the expected attributes are not found within the retry limit.
     */
    async waitForAttributes(attributes: { [key: string]: string }): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for attributes - ${JSON.stringify(attributes)} of node with id - ${this.nodeId}`);
        return retryIfFails(async () => {
            const attrMap = await this.getAttributes();
            for (const [key, value] of Object.entries(attributes)) {
                if (!attrMap.hasOwnProperty(key)) {
                    throw new Error(`Attribute "${key}" not found in node with id - ${this.nodeId}. The current attributes of the element are: ${JSON.stringify(attrMap)}`);
                }
                if (attrMap[key] !== value) {
                    throw new Error(`Attribute "${key}" found in node with id - ${this.nodeId} but the its value is "${attrMap[key]}", expected "${value}". The current attributes of the element are: ${JSON.stringify(attrMap)}`);
                }
            }
            return true;
        });
    }

    /**
     * Retrieves the value of the specified attribute from the element.
     *
     * @param name The name of the attribute to retrieve.
     * @returns A promise that resolves to the value of the attribute, or undefined if the attribute does not exist.
     */
    async getAttribute(name: string): Promise<string | undefined> {
        global.log.debug(`\n[DOMElement] Getting attribute with name '${name}' of node with id - ${this.nodeId}`);
        const attrMap = await this.getAttributes();
        return attrMap[name];
    }

    /**
     * Checks if the DOM element has a specific attribute.
     *
     * @param name The name of the attribute to check for.
     * @returns A promise that resolves to true if the attribute exists, otherwise false.
     */
    async hasAttribute(name: string): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Getting if node with id - ${this.nodeId} has '${name}' attribute`);
        const attrMap = await this.getAttributes();
        return attrMap.hasOwnProperty(name);
    }

    /**
     * Sets an attribute on the DOM element.
     * 
     * Currently we are using setAttributesAsText because setAttributeValue command is not supported by Gameface.
     * Consider changing it when we support setAttributeValue
     * @param name The name of the attribute to set.
     * @param value The value of the attribute to set.
     * @returns A promise that resolves when the attribute has been set.
     */
    async setAttribute(name: string, value: string): Promise<void> {
        global.log.debug(`\n[DOMElement] Setting attribute with name '${name}' and value '${value}' of node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Setting attribute to text node that is not supported!`);
            return;
        }
        await this.sendCommand('DOM.setAttributesAsText', {
            nodeId: this.nodeId,
            text: `${name}="${value}"`,
            name: name
        });
    }

    /**
     * Calculates and returns the center coordinates of the DOM element.
     * @returns A promise that resolves to an array containing the x and y coordinates of the center of the element.
     */
    private async _getCenter(): Promise<[number, number]> {
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
     * @param button The mouse button to use for the click. 
     *                          Possible values are "left", "middle", or "right".
     * @param options Additional options for the click action.
     * @param options.altKey Indicates if the Alt key is pressed during the click.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the click.
     * @param options.metaKey Indicates if the Meta key is pressed during the click.
     * @param options.shiftKey Indicates if the Shift key is pressed during the click.
     * @param clickCount The number of times to click the mouse.
     * @returns Returns null if the node is a text node (nodeType 3) 
     *                          or after successfully dispatching the mouse events.
     * @throws Throws an error if the `DOM.getBoxModel` or `Input.dispatchMouseEvent` commands fail.
     */
    private async _click(button: 'left' | 'middle' | 'right', options?: KeyOptions, clickCount: number = 1): Promise<void> {
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to click on text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();

        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options);

        for (let i = 0; i < clickCount; i++) {
            await this.gamefaceCommands.mousePress(x, y, button, modifiers);
            await this.gamefaceCommands.mouseRelease(x, y, button, modifiers);
        }
    }

    /**
     * Simulates a mouse press action on the current DOM element.
     *
     * @param button The mouse button to press. Can be 'left', 'right', or 'middle'.
     * @param options Additional options for the mousepress action.
     * @param options.altKey Indicates if the Alt key is pressed during the mousepress.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the mousepress.
     * @param options.metaKey Indicates if the Meta key is pressed during the mousepress.
     * @param options.shiftKey Indicates if the Shift key is pressed during the mousepress.
     * @returns Resolves to `null` if the element is a text node, otherwise performs the action.
     */
    async mousePress(button: 'left' | 'middle' | 'right' = 'left', options?: KeyOptions): Promise<void> {
        global.log.debug(`\n[DOMElement] Mouse press with "${button}" button.`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to mouse press on text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();
        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options);
        await this.gamefaceCommands.mousePress(x, y, button, modifiers);
    }

    /**
     * Simulates a mouse release action on the current DOM element.
     *
     * @param button The mouse button to press. Can be 'left', 'right', or 'middle'.
     * @param options Additional options for the mouserelease action.
     * @param options.altKey Indicates if the Alt key is pressed during the mouserelease.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the mouserelease.
     * @param options.metaKey Indicates if the Meta key is pressed during the mouserelease.
     * @param options.shiftKey Indicates if the Shift key is pressed during the mouserelease.
     * @returns Resolves to `null` if the element is a text node, otherwise performs the action.
     */
    async mouseRelease(button: 'left' | 'middle' | 'right' = 'left', options?: KeyOptions): Promise<void> {
        global.log.debug(`\n[DOMElement] Mouse release with "${button}" button.`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to mouse release on text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();
        const [x, y] = await this._getCenter();
        const modifiers = getPressedKey(options);
        await this.gamefaceCommands.mouseRelease(x, y, button, modifiers);
    }

    /**
     * Simulates a mouse wheel event on the current DOM element.
     *
     * @param deltaX The amount to scroll horizontally.
     * @param deltaY The amount to scroll vertically.
     * @returns Resolves when the event is dispatched, or null if the element is a text node.
     */
    async mouseWheel(deltaX: number, deltaY: number): Promise<void> {
        global.log.debug(`\n[DOMElement] Mouse wheel with ${deltaX} ${deltaY}.`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to click on text node that is not supported!`);
            return;
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
     * @param options Additional options for the click action.
     * @param options.altKey Indicates if the Alt key is pressed during the click.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the click.
     * @param options.metaKey Indicates if the Meta key is pressed during the click.
     * @param options.shiftKey Indicates if the Shift key is pressed during the click.
     * 
     * @returns A promise that resolves when the click action is completed.
     */
    async click(options?: KeyOptions): Promise<void> {
        global.log.debug(`\n[DOMElement] Clicking on node with id - ${this.nodeId}`);
        await this._click("left", options);
    }

    /**
     * Performs a right-click action on the DOM element associated with this instance.
     *
     * @param options Additional options for the right click action.
     * @param options.altKey Indicates if the Alt key is pressed during the right click.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the right click.
     * @param options.metaKey Indicates if the Meta key is pressed during the right click.
     * @param options.shiftKey Indicates if the Shift key is pressed during the right click.
     * @returns Resolves when the right-click action is completed.
     */
    async rightClick(options?: KeyOptions): Promise<void> {
        global.log.debug(`\n[DOMElement] Right clicking on node with id - ${this.nodeId}`);
        await this._click("right", options);
    }

    /**
     * Performs a double-click action on the DOM element associated with this instance.
     *
     * @param options Additional options for the double click action.
     * @param options.altKey Indicates if the Alt key is pressed during the double click.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed during the double click.
     * @param options.metaKey Indicates if the Meta key is pressed during the double click.
     * @param options.shiftKey Indicates if the Shift key is pressed during the double click.
     * @returns Resolves when the double-click action is completed.
     */
    async doubleClick(options?: KeyOptions): Promise<void> {
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
     * @returns Returns `null` if the element is a text node, otherwise performs the hover action.
     */
    async hover(): Promise<void> {
        global.log.debug(`\n[DOMElement] Hovering on node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to hover on text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();
        const [x, y] = await this._getCenter();
        await this.gamefaceCommands.mouseMove(x, y);
    }

    /**
     * Drags the DOM element to a specified position.
     *
     * @param x The x-coordinate to drag the element to.
     * @param y The y-coordinate to drag the element to.
     * @returns Resolves when the drag operation is complete. Returns `null` if the element is a text node and cannot be dragged.
     */
    async drag(x: number, y: number): Promise<void> {
        global.log.debug(`\n[DOMElement] Dragging node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to drag text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();
        const [startX, startY] = await this._getCenter();
        await this.gamefaceCommands.mousePress(startX, startY);
        await this.gamefaceCommands.mouseMove(x, y);
        await this.gamefaceCommands.mouseRelease(x, y);
    }

    /**
     * Drags the element by the specified offsets (in pixels) relative to the element's center.
     *
     * @remarks
     * - If the target node is a text node (nodeType === 3), dragging is not supported and the method returns early.
     * - If the element is not visible, the method will attempt to scroll it into view before performing the drag.
     * - The drag sequence is performed by:
     *   1. Determining the element's center as the start point.
     *   2. Performing a mouse press at the start point.
     *   3. Moving the mouse to the computed target point (start + delta).
     *   4. Releasing the mouse at the target point.
     *
     * @param deltaX - Horizontal offset in pixels to move from the element's center. Defaults to 0.
     * @param deltaY - Vertical offset in pixels to move from the element's center. Defaults to 0.
     * @returns A promise that resolves when the drag sequence completes, or rejects if underlying operations fail.
     */
    async dragBy(deltaX: number = 0, deltaY: number = 0): Promise<void> {
        global.log.debug(`\n[DOMElement] Dragging node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to drag text node that is not supported!`);
            return;
        }
        if (!await this.isVisible()) await this.scrollIntoView();
        const [startX, startY] = await this._getCenter();
        const targetX = startX + deltaX;
        const targetY = startY + deltaY;
        await this.gamefaceCommands.mousePress(startX, startY);
        await this.gamefaceCommands.mouseMove(targetX, targetY);
        await this.gamefaceCommands.mouseRelease(targetX, targetY);
    }

    /**
     * Drag this DOM element to a target element or selector on screen.
     *
     * Performs a pointer drag from the center of the current element to a destination point computed
     * relative to the target element. If the current element is not visible it will be scrolled into view
     * before the drag. The destination offsets default to the center of the target when omitted or NaN,
     * and are clamped so the dragged item remains within the visible bounds of the target, taking the
     * dragged element's size into account.
     *
     * @param target - The target DOM element or a selector string used to locate the target element.
     *                 If a selector string is provided the element will be resolved before performing the drag.
     * @param targetOffsetX - Horizontal offset (in pixels) inside the target element to drop onto.
     *                        If undefined or NaN, defaults to target width / 2 (center).
     * @param targetOffsetY - Vertical offset (in pixels) inside the target element to drop onto.
     *                        If undefined or NaN, defaults to target height / 2 (center).
     *
     * @returns A promise that resolves once the drag sequence (press → move → release) completes.
     *
     * @throws Error if `target` is null or undefined.
     * @throws Error if a selector string is provided but no matching target element can be found.
     * @throws Error if the size or screen position of the target element cannot be determined.
     *
     * @remarks
     * - Text nodes are not supported for dragging; in that case the method logs a warning and returns early.
     * - The computed destination is adjusted so that the dragged item does not extend outside the target's area,
     *   using half of the dragged item's dimensions as a buffer when clamping.
     * - The method uses the screen coordinates of the target element to perform the mouse actions.
     *
     * @example
     * // Drag by selector to the center of the target
     * await element.dragTo('#drop-zone');
     *
     * @example
     * // Drag by element instance to a specific point inside the target
     * await element.dragTo(targetElement, 10, 20);
     */
    async dragTo(target: DOMElement | string, targetOffsetX?: number, targetOffsetY?: number): Promise<void> {
        if (!target) throw new Error(`Target element for dragTo cannot be null or undefined.`);

        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to drag text node that is not supported!`);
            return;
        }

        let targetElement: DOMElement;
        if (typeof target === 'string') {
            const found = await this.gamefaceCommands.get(target);
            if (!found) throw new Error(`Could not find target element with selector - ${target}.`);
            targetElement = found;
        } else {
            targetElement = target;
        }

        global.log.debug(`\n[DOMElement] Dragging node ${this.nodeId} into target ${targetElement.nodeId}`);

        if (!await this.isVisible()) await this.scrollIntoView();
        const [startX, startY] = await this._getCenter();
        const itemSize = await this.getSize();
        if (!itemSize) throw new Error(`Could not determine size of source element with id - ${this.nodeId}.`);
        const { width: itemWidth, height: itemHeight } = itemSize;

        const targetSize = await targetElement.getSize();
        const targetPosition = await targetElement.getPositionOnScreen();

        if (!targetSize || !targetPosition) {
            throw new Error(`Could not determine size or position of target element.`);
        }

        let destX = (targetOffsetX === undefined || isNaN(targetOffsetX)) ? targetSize.width / 2 : targetOffsetX;
        let destY = (targetOffsetY === undefined || isNaN(targetOffsetY)) ? targetSize.height / 2 : targetOffsetY;

        const minX = 0;
        const maxX = targetSize.width - (itemWidth / 2);

        const minY = 0;
        const maxY = targetSize.height - (itemHeight / 2);

        destX = Math.min(Math.max(destX, minX), maxX);
        destY = Math.min(Math.max(destY, minY), maxY);

        const finalX = targetPosition.x + destX;
        const finalY = targetPosition.y + destY;

        await this.gamefaceCommands.mousePress(startX, startY);
        await this.gamefaceCommands.mouseMove(finalX, finalY);
        await this.gamefaceCommands.mouseRelease(finalX, finalY);
    }

    /**
     * Scrolls the DOM element by the specified delta values.
     *
     * @param deltaX The amount to scroll horizontally.
     * @param deltaY The amount to scroll vertically.
     * @returns Resolves when the scrolling action is complete.
     */
    async scroll(deltaX: number = 0, deltaY: number = 0): Promise<void> {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return;
        }
        if (!await this.isScrollable()) {
            throw new Error(`Trying to scroll node that is not scrollable!`);
        }
        await this.mouseWheel(deltaX, deltaY);
    }

    /**
     * Scrolls the DOM element to the specified coordinates (x, y).
     *
     * @param x The target x-coordinate to scroll to.
     * @param y The target y-coordinate to scroll to.
     * @returns Resolves when the scrolling operation is complete.
     */
    async scrollTo(x: number, y: number): Promise<void> {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId} to position (${x}, ${y})`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return;
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
     * It traverses up the DOM tree to locate a scrollable parent.
     * 
     * @returns A promise that resolves to the nearest scrollable parent element,
     * or `null` if no scrollable parent is found.
     */
    private async _findElementScrollableArea(): Promise<DOMElement | null> {
        let parent = this.node.parentId ? await DOMElement.create(this.gamefaceCommands, this.node.parentId) : null;
        while (parent) {
            if (await parent.isScrollable()) return parent;
            parent = parent.node.parentId ? await DOMElement.create(this.gamefaceCommands, parent.node.parentId) : null;
        }
        return null;
    }

    /**
     * Scrolls the current DOM element into view within a scrollable area.
     *
     * @param scrollableArea The scrollable area in which the element should be scrolled into view.
     * If not provided, the method attempts to locate a scrollable parent element in the DOM hierarchy.
     * 
     * @throws Throws an error if:
     * - The element is a text node (nodeType === 3), which cannot be scrolled.
     * - A scrollable area cannot be located or is not explicitly provided.
     * - The provided scrollableArea is not an instance of DOMElement.
     * - The scrollable area is not scrollable.
     * - The element cannot be scrolled into view after multiple retry attempts.
     * 
     * @returns Resolves when the element is successfully scrolled into view or if it is already visible.
     * Returns `null` if the element is a text node and cannot be scrolled.
     */
    async scrollIntoView(scrollableArea: DOMElement | null = null): Promise<void> {
        global.log.debug(`\n[DOMElement] Scrolling node with id - ${this.nodeId} into view`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to scroll text node that is not supported!`);
            return;
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
            const [scrollableMaxX, scrollableMinX, scrollableMaxY, scrollableMinY] = await this._getPointsOfElement(scrollableArea!);

            const elementCenterX = (elementMaxX + elementMinX) / 2;
            const elementCenterY = (elementMaxY + elementMinY) / 2;

            const scrollableCenterX = (scrollableMaxX + scrollableMinX) / 2;
            const scrollableCenterY = (scrollableMaxY + scrollableMinY) / 2;

            const diffX = elementCenterX - scrollableCenterX;
            const diffY = elementCenterY - scrollableCenterY;

            await scrollableArea!.scrollTo(scrollableCenterX + diffX, scrollableCenterY + diffY);
            if (!await this.isVisibleInScrollableArea(scrollableArea)) throw new Error(`Unable to scroll element into view. Please check if the element is visible!`);
        }, 5);
    }

    /**
     * Dispatches a keyboard event on the current DOM element.
     * If the element is a text node, the operation is not supported and a warning is logged.

     * @param event The type of keyboard event to dispatch (e.g., 'keydown', 'keyup').
     * @param key The key to simulate.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param repeat Indicates if the key event should be marked as a repeat event.
     * @returns Resolves with `null` if the operation is not supported, otherwise resolves when the event is dispatched.
     */
    private async _keyEvent(event: 'keyDown' | 'keyUp', key: string | number, options?: KeyOptions, repeat: boolean = false): Promise<void> {
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to dispatch ${event} on text node that is not supported!`);
            return;
        }
        await this.focus();
        //@ts-ignore
        await this.gamefaceCommands._keyEvent(event, key, options, repeat);
    }

    /**
     * Simulates a key down event on the current DOM element.
     *
     * @param key The key to simulate pressing.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to simulate the key down event.
     * @returns A promise that resolves when the key down events are completed.
     */
    async keyDown(key: string | number, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[DOMElement] Key down with "${key}" ${count} times.`);
        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyDown', key, options, count > 1);
        }
    }

    /**
     * Simulates a key up event on the current DOM element.
     *
     * @param key The key to simulate pressing.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to simulate the key up event.
     * @returns A promise that resolves when the key up events are completed.
     */
    async keyUp(key: string, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[DOMElement] Key up with "${key}" ${count} times.`);
        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyUp', key, options, count > 1);
        }
    }

    /**
     * Simulates a key press event on the current DOM element.
     *
     * @param key The key to simulate pressing.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to simulate the key press event.
     * @returns A promise that resolves when the key press events are completed.
     */
    async keyPress(key: string, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[DOMElement] Key press with "${key}" ${count} times.`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to keypress on text node that is not supported!`);
            return;
        }
        await this.focus();
        await this.gamefaceCommands.keyPress(key, options, count);
    }

    /**
     * Simulates typing on a DOM element by sending key events.
     * Keypress will simulate - keyDown -> char -> keyUp for each key.
     * If the element is input then it will dispatch just `char` event.
     *
     * @param keys The keys to type. Can be a string or an array of characters.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @returns A promise that resolves when the typing simulation is complete.
     *
     * @example
     * // Typing a string
     * await domElement.type('hello');
     *
     * @example
     * // Typing an array of characters
     * await domElement.type(['h', 'e', 'l', 'l', 'o']);
     */
    async type(keys: string | string[], options?: KeyOptions): Promise<void> {
        global.log.debug(`\n[DOMElement] Typing on node with id - ${this.nodeId}`);
        if (this.node.nodeType === 3) {
            global.log.warn(`Trying to type on text node that is not supported!`);
            return;
        }

        const keysArray = typeof keys === 'string' ? keys.split('') : keys;
        if (!Array.isArray(keysArray)) {
            global.log.warn(`Keys argument of the type method should be array with characters or string! Received: ${keys}`);
            return;
        }

        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
            await this.focus();
        }

        for (let key of keysArray) {
            if (tagName !== 'input' && tagName !== 'textarea') {
                await this.keyPress(key, options);
            } else {
                //@ts-ignore
                await this.gamefaceCommands._keyEvent('char', key, options);
            }
        }
    }

    /**
     * Retrieves the value of the current DOM element if it is an input or textarea.
     *
     * @throws Throws an error if the current element is not an input or textarea.
     * @returns The value of the input or textarea element.
     */
    async getValue(): Promise<string> {
        global.log.debug(`\n[DOMElement] Getting value of node with id - ${this.nodeId}.`);
        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
            throw new Error(`The getValue method is only supported for input or textarea elements. Current element is a '${tagName}'.`);
        }

        return await this.gamefaceCommands.executeScript((nodeId: string | number) => {
            const inputElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLInputElement | HTMLTextAreaElement;
            return inputElement.value;
        }, this.nodeId);
    }

    /**
     * Waits for the value of an input or textarea element to match the specified value.
     * This method retries the check until the value matches or an error is thrown.
     *
     * @param value The expected value to wait for in the input or textarea element.
     * @throws Throws an error if the element is not an input or textarea.
     * @throws Throws an error if the current value does not match the expected value after retries.
     * @returns Resolves to `true` if the value matches the expected value.
     */
    async waitForValue(value: string): Promise<boolean> {
        global.log.debug(`\n[DOMElement] Waiting for value - ${value} in node with id - ${this.nodeId}`);
        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
            throw new Error(`The waitForValue method is only supported for input or textarea elements. Current element is a '${tagName}'.`);
        }
        return retryIfFails(async () => {
            const currentValue = await this.getValue();
            if (currentValue === value) return true;
            throw new Error(`Expected input value - "${value}" is different than the current value - "${currentValue}" in node with id - ${this.nodeId}.`);
        });
    }

    /**
     * Clears the value of the current DOM element if it is an input or textarea.
     * 
     * @throws Throws an error if the current element is not an input or textarea.
     * @returns A promise that resolves when the value has been cleared.
     */
    async clear(): Promise<void> {
        global.log.debug(`\n[DOMElement] Cleaning value of node with id - ${this.nodeId}.`);
        const tagName = this.node?.nodeName?.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
            throw new Error(`The clear method is only supported for input or textarea elements. Current element is a '${tagName}'.`);
        }
        await this.focus();
        await this.gamefaceCommands.executeScript(() => {
            const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
            if (active) active.value = '';
        });
    }

    /**
     * Triggers a custom event on the DOM element identified by the `nodeId`.
     *
     * @param eventName - The name of the custom event to dispatch.
     * @param data Optional data to include in the event's `detail` property.
     * @returns A promise that resolves when the command is sent.
     */
    async trigger(eventName: string, data?: any): Promise<void> {
        global.log.debug(`\n[DOMElement] Triggering custom event "${eventName}" on node with id - ${this.nodeId}.`);
        await this.gamefaceCommands.executeScript((eventName: string, data: any, nodeId: string | number) => {
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