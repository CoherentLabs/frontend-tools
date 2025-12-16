import { retryIfFails, getPressedKey, sleep, KeyOptions } from "../utils";
import { DOMElement, DOMElements } from "./dom-element";
import { eventEmitter, waitDevtoolsEvent } from "../event-emitter";
import * as path from 'path';
import * as URL from 'url';
import { GamefaceGamepad } from './gamepad';
import { GamefacePlayer } from '../player';
import WebSocket from 'ws';

function isURL(input: string): boolean {
    try {
        const url = URL.parse(input);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

export class GamefaceCommandsBase {
    public _ws: WebSocket | null = null;
    public rootNodeId: number | null = null;
    public _cohtmlJSPath: string | null = null;
    public commandTimeout: number = 10000;
    public player: GamefacePlayer | null;
    public pendingCommands: Map<number, { resolve: (val: any) => void; reject: (err: Error) => void }>;

    constructor(player: GamefacePlayer | null = null, ws: WebSocket | null = null) {
        this._ws = ws;
        this.player = player;
        this.pendingCommands = new Map();
        this.handleMessage = this.handleMessage.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.sendCommands = this.sendCommands.bind(this);
    }

    set ws(value: WebSocket) {
        if (this._ws) this._ws.off('message', this.handleMessage);
        this._ws = value;
        if (this._ws) this._ws.on('message', this.handleMessage);
    }

    get ws(): WebSocket {
        return this._ws!;
    }

    set cohtmlJSPath(value: string) {
        this._cohtmlJSPath = value;
    }

    get cohtmlJSPath(): string {
        return this._cohtmlJSPath!;
    }

    /**
     * Handler for DevTools protocol messages when commands are sent to the player
     */
    handleMessage(data: string) {
        try {
            const response = JSON.parse(data);
            if (response.method) eventEmitter.emit(response.method, response.params);
            if (response.id && this.pendingCommands.has(response.id)) {
                const { resolve, reject } = this.pendingCommands.get(response.id)!;
                this.pendingCommands.delete(response.id);

                if (response.error) return reject(new Error(`Error handling WebSocket message: ${response.error.message}`));
                resolve(response.result);
            }
        } catch (err) {
            throw new Error(`Error handling WebSocket message: ${err}`);
        }
    }

    /**
     * Will send DevTool command to the player
     */
    async sendCommand(method: string, params: any = {}): Promise<any> {
        global.log.debug(`Executing command with method - ${method}, and params - ${JSON.stringify(params)}`);

        const id = Math.floor(Math.random() * 100000) + 1;
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
    */
    async sendCommands(commands: (string | { method: string; params: any })[]): Promise<any[]> {
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

export class GamefaceCommands extends GamefaceCommandsBase {
    public gamepads: Map<string, GamefaceGamepad>;

    constructor(player: GamefacePlayer | null = null, ws: WebSocket | null = null) {
        super(player, ws);
        this.gamepads = new Map();
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.contains = this.contains.bind(this);
        this.text = this.text.bind(this);
        this.getParent = this.getParent.bind(this);
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
        this.mousePress = this.mousePress.bind(this);
        this.mouseRelease = this.mouseRelease.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseWheel = this.mouseWheel.bind(this);
        this._keyEvent = this._keyEvent.bind(this);
        this.keyPress = this.keyPress.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.trigger = this.trigger.bind(this);
        this.executeScript = this.executeScript.bind(this);
        this.executeBindingScript = this.executeBindingScript.bind(this);
        this.createModel = this.createModel.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.triggerEngineEvent = this.triggerEngineEvent.bind(this);
        this.onEngineEvent = this.onEngineEvent.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.connectGamepad = this.connectGamepad.bind(this);
        this.disconnectGamepad = this.disconnectGamepad.bind(this);
        this.getGamepad = this.getGamepad.bind(this);
    }

    /**
     * Asynchronously creates and registers a GamefaceGamepad for the provided identifier.
     *
     * Instantiates a new GamefaceGamepad with this context and the supplied id, awaits
     * its initialization, stores it in this.gamepads keyed by the created gamepad's id,
     * and returns the created gamepad instance.
     *
     * @async
     * @param id Identifier for the gamepad to connect.
     * @returns Promise that resolves to the created and registered GamefaceGamepad.
     * @throws If instantiation or initialization of the GamefaceGamepad fails.
     */
    async connectGamepad(id: string): Promise<GamefaceGamepad> {
        global.log.debug(`Connecting new gamepad with id - ${id}.`);

        if (!id) throw new Error('Connecting a gamepad without id is not permitted. Please provide id when executing gf.connectGamepad!');
        if (this.gamepads.has(id)) throw new Error(`Trying to connect gamepad with id - ${id} that has been already connected.`);

        // Updated to use static create
        const gamepad = await GamefaceGamepad.create(this, id);
        this.gamepads.set(gamepad.id, gamepad);
        return gamepad;
    }

    /**
     * Disconnects a connected gamepad and removes it from the internal registry.
     *
     * Calls the connected gamepad's async disconnect() method and, once it
     * completes, deletes the gamepad entry from this.gamepads.
     *
     * @async
     * @param id Identifier of the gamepad to disconnect.
     * @returns Resolves when the gamepad has been disconnected and removed.
     * @throws If no gamepad with the given id is currently connected.
     */
    async disconnectGamepad(id: string): Promise<void> {
        global.log.debug(`Disconnecting gamepad with id - ${id}.`);

        if (!this.gamepads.has(id)) throw new Error(`Gamepad with id "${id}" is not connected.`);
        await this.gamepads.get(id)!.disconnect();
        this.gamepads.delete(id);
    }

    /**
     * Retrieve a connected gamepad by its identifier.
     *
     * @param id The identifier of the gamepad to retrieve.
     * @throws If no gamepad with the given id is connected (message: `Gamepad with id "<id>" is not connected.`).
     * @returns The gamepad instance associated with the provided id.
     */
    getGamepad(id: string): GamefaceGamepad {
        global.log.debug(`Getting gamepad object with id - ${id}.`);
        if (!this.gamepads.has(id)) throw new Error(`Gamepad with id "${id}" is not connected.`);
        return this.gamepads.get(id)!;
    }

    /**
     * Retrieves a DOM element based on the provided selector.
     * @param selector The CSS selector to query the DOM element.
     * @returns A promise that resolves to the DOMElement instance.
     */
    async get(selector: string): Promise<DOMElement> {
        global.log.debug(`\n[GamefaceCommands] Trying to find element with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);

        return await retryIfFails(async () => {
            const { nodeId } = await this.sendCommand('DOM.querySelector', {
                nodeId: this.rootNodeId,
                selector,
            });

            if (!nodeId) throw new Error(`Unable to find element with selector - ${selector}.`);
            // Updated to use static create
            return await DOMElement.create(this, nodeId);
        });
    }

    /**
     * Retrieves all elements matching the specified selector.
     *
     * @param selector The CSS selector to match elements against.
     * @returns A promise that resolves to an array of DOMElement instances.
     * @throws If no elements are found with the specified selector.
     */
    async getAll(selector: string): Promise<DOMElements> {
        global.log.debug(`\n[GamefaceCommands] Trying to find all elements with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find elements.`);

        return await retryIfFails(async () => {
            const { nodeIds } = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: this.rootNodeId,
                selector,
            });

            if (!nodeIds?.length) throw new Error(`Unable to find any elements with selector - ${selector}.`);

            const elements = new DOMElements();
            for (let nodeId of nodeIds) {
                // Updated to use static create
                elements.push(await DOMElement.create(this, nodeId));
            }
            return elements;
        });
    }

    /**
     * Retrieves a DOM element containing the specified text.
     * @param text The text to search for in the DOM element.
     * @param selector The selector used to find the element that the search will be started from.
     * @returns A promise that resolves to DOMElement that contains the text.
     */
    async contains(text: string, selector: string): Promise<DOMElement | null> {
        global.log.debug(`\n[GamefaceCommands] Trying to find text - ${text} within node with selector - ${selector}`);
        if (!text) throw new Error(`Text must be provided to search for.`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);

        const element = await this.get(selector);
        return element.contains(text);
    }

    /**
     * Retrieves the text content of the specified element.
     * @param selector The CSS selector of the element to retrieve.
     * @returns A promise that resolves to the text content of the element.
     */
    async text(selector: string): Promise<string> {
        global.log.debug(`\n[GamefaceCommands] Getting all the text content of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.text();
    }

    /**
     * Retrieves the parent of the specified element.
     * @param selector The CSS selector of the element to get the parent from.
     * @returns A promise that resolves to the DOMElement instance of the parent element.
     */
    async getParent(selector: string): Promise<DOMElement> {
        global.log.debug(`\n[DOMElement] Getting parent element of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.getParent();
    }

    /**
     * Retrieves the children of the specified element.
     * @param selector The CSS selector of the element to get the children from.
     * @returns A promise that resolves to an array of child elements.
     */
    async children(selector: string): Promise<DOMElements> {
        global.log.debug(`\n[GamefaceCommands] Getting children of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.children();
    }

    /**
     * Navigates to the specified URL and waits for the page to load.
     * @param url The URL to navigate to.
     * @returns A promise that resolves when the navigation is complete and the document root node ID is retrieved.
     */
    async navigate(url: string): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Navigating to new page with url - ${url}`);

        if (!isURL(url)) {
            url = path.resolve(global.config.gamefacePath!, url).replace(/\\/g, '/');
        }

        await waitDevtoolsEvent('DOM.documentUpdated', async () => {
            await this.sendCommand('Page.navigate', { url });
        });
        await this.sendCommand('Page.loadEventFired');

        const { root: { nodeId } } = await this.sendCommand('DOM.getDocument');
        this.rootNodeId = nodeId;

        global.log.debug(`\n[GamefaceCommands] Loading cohtml.js with path - ${this.cohtmlJSPath}`);

        await this.executeScript(() => {
            // @ts-ignore
            window.loadCohtmlJS = async (cohtmlPath: string) => {
                await new Promise((resolve, reject) => {
                    const cohtmlJS = document.createElement('script');
                    cohtmlJS.type = "text/javascript";
                    cohtmlJS.src = cohtmlPath;
                    cohtmlJS.addEventListener('load', resolve);
                    cohtmlJS.addEventListener('error', reject);
                    document.body.appendChild(cohtmlJS);
                });
            };
        });
    }
    /**
     * Checks if the element matching the given selector is hidden.
     *
     * @param selector The CSS selector of the element to check.
     * @returns A promise that resolves to `true` if the element is hidden, otherwise `false`.
     */
    async isHidden(selector: string): Promise<boolean> {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is hidden`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.isHidden();
    }

    /**
     * Checks if the element matching the given selector is visible on the page.
     *
     * @param selector The CSS selector of the element to check.
     * @returns A promise that resolves to `true` if the element is visible, otherwise `false`.
     */
    async isVisible(selector: string): Promise<boolean> {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is visible`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.isVisible();
    }

    /**
     * Checks if the element identified by the given selector is scrollable.
     *
     * @param selector The CSS selector of the element to check.
     * @returns A promise that resolves to `true` if the element is scrollable, otherwise `false`.
     */
    async isScrollable(selector: string): Promise<boolean> {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is scrollable`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.isScrollable();
    }

    /**
     * Checks if the element identified by the given selector is focusable.
     *
     * @param selector The CSS selector of the element to check.
     * @returns A promise that resolves to `true` if the element is focusable, otherwise `false`.
     */
    async isFocusable(selector: string): Promise<boolean> {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} is focusable`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.isFocusable();
    }

    /**
     * Checks if the element matching the given selector has the specified attribute.
     *
     * @param selector The CSS selector of the element to check.
     * @param name The name of the attribute to check for.
     * @returns A promise that resolves to `true` if the element has the attribute, otherwise `false`.
     */
    async hasAttribute(selector: string, name: string): Promise<boolean> {
        global.log.debug(`\n[GamefaceCommands] Getting if node with selector - ${selector} has '${name}' attribute`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.hasAttribute(name);
    }

    /**
     * Retrieves the value of a specified attribute from an element identified by a selector.
     *
     * @async
     * @param selector The CSS selector of the element to retrieve the attribute from.
     * @param name The name of the attribute to retrieve.
     * @returns A promise that resolves to the value of the attribute, or `undefined` if the attribute does not exist.
     */
    async getAttribute(selector: string, name: string): Promise<string | undefined> {
        global.log.debug(`\n[GamefaceCommands] Getting attribute with name '${name}' of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.getAttribute(name);
    }

    /**
     * Retrieves the computed styles of a DOM element identified by the given selector.
     *
     * @param selector The CSS selector of the target DOM element.
     * @returns A promise that resolves to an object containing the computed styles of the element.
     */
    async getStyles(selector: string): Promise<{ [key: string]: string }> {
        global.log.debug(`\n[GamefaceCommands] Getting styles of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.styles();
    }

    /**
     * Retrieves the list of CSS classes for the DOM element matching the given selector.
     *
     * @param selector The CSS selector used to locate the DOM element.
     * @returns A promise that resolves to an array of class names for the selected element.
     * @throws Throws an error if the element cannot be found or if there is an issue retrieving the classes.
     */
    async getClasses(selector: string): Promise<string[]> {
        global.log.debug(`\n[GamefaceCommands] Getting classes of node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.classes();
    }

    /**
     * Clicks on a DOM element specified by the given selector.
     *
     * @param selector The CSS selector of the element to click.
     * @returns A promise that resolves when the click action is completed.
     * @throws If the element cannot be found or the click action fails.
     */
    async click(selector: string): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Clicking on node with selector - ${selector}`);
        if (!selector) throw new Error(`Selector must be provided to find an element.`);
        const element = await this.get(selector);
        return element.click();
    }

    /**
     * Simulates a mouse press event at the specified coordinates.
     *
     * @param x The x-coordinate of the mouse press event.
     * @param y The y-coordinate of the mouse press event.
     * @param button The mouse button to press ('left', 'middle', 'right').
     * @param modifiers Bitfield representing modifier keys (e.g., Alt, Ctrl, Meta, Shift).
     * @returns A promise that resolves when the mouse press event is dispatched.
     */
    async mousePress(x: number = 0, y: number = 0, button: 'left' | 'middle' | 'right' = 'left', modifiers: number = 0): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Mouse pressing on ${x} ${y} with "${button}" button.`);
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x,
            y,
            button,
            clickCount: 1,
            modifiers
        });
    }

    /**
     * Simulates a mouse release event at the specified coordinates.
     *
     * @param x The x-coordinate of the mouse pointer.
     * @param y The y-coordinate of the mouse pointer.
     * @param button The mouse button to release. Possible values are 'left', 'middle', or 'right'.
     * @param modifiers Bit field representing keyboard modifiers (e.g., Alt, Ctrl, Meta, Shift).
     * @returns A promise that resolves when the mouse release event is dispatched.
     */
    async mouseRelease(x: number = 0, y: number = 0, button: 'left' | 'middle' | 'right' = 'left', modifiers: number = 0): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Mouse releasing on ${x} ${y} with "${button}" button.`);
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x,
            y,
            button,
            clickCount: 1,
            modifiers
        });
    }

    /**
     * Moves the mouse pointer to the specified coordinates.
     *
     * @param x The x-coordinate to move the mouse to.
     * @param y The y-coordinate to move the mouse to.
     * @returns A promise that resolves when the mouse movement is complete.
     */
    async mouseMove(x: number, y: number): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Mouse moving on ${x} ${y}.`);
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x,
            y,
        });
    }

    /**
     * Simulates a mouse wheel event at the specified coordinates with the given deltas.
     *
     * @param x The x-coordinate of the mouse pointer where the event occurs.
     * @param y The y-coordinate of the mouse pointer where the event occurs.
     * @param deltaX The horizontal scroll amount. Positive values scroll right, negative values scroll left.
     * @param deltaY The vertical scroll amount. Positive values scroll down, negative values scroll up.
     * @returns A promise that resolves when the mouse wheel event has been dispatched.
     */
    async mouseWheel(x: number, y: number, deltaX: number, deltaY: number): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Mouse wheel on ${x} ${y}`);
        await this.sendCommand('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x,
            y,
            deltaX,
            deltaY,
        });
    }

    /**
     * Dispatches a key event to the input system.
     *
     * @param type The type of key event (e.g., "keyDown", "keyUp", "char").
     * @param key The key to be dispatched. Can be a character or its key code.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param repeat Indicates if the key event should be marked as a repeat (key held down).
     * @returns A promise that resolves when the key event is dispatched.
     */
    private async _keyEvent(type: 'keyDown' | 'keyUp' | 'char', key: string | number, options?: KeyOptions, repeat: boolean = false): Promise<void> {
        if (!key) {
            global.log.warn(`The key argument when executing key event is not specified!`);
            return;
        }

        const modifiers = getPressedKey(options);
        const keyCode = typeof key === 'number' ? key : key.charCodeAt(0);
        const params: any = {
            type,
            modifiers,
            keyIdentifier: keyCode,
            windowsVirtualKeyCode: keyCode
        };
        if (repeat) params.autoRepeat = true;
        await this.sendCommand('Input.dispatchKeyEvent', params);
    }

    /**
     * Simulates a key press event by performing a sequence of keyDown, key event, and keyUp actions.
     *
     * @param key The key to be pressed.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to repeat the key press sequence.
     * @returns A promise that resolves when all key press actions are completed.
     */
    async keyPress(key: string, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Key press event with "${key}" ${count} times.`);
        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyDown', key, options, count > 1);
            await this._keyEvent('char', key, options, count > 1);
            await this._keyEvent('keyUp', key, options, count > 1);
        }
    }

    /**
     * Simulates a key down event for the specified key.
     *
     * @param key The key to simulate pressing down.
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to repeat the key down event.
     * @returns A promise that resolves when the key down events are completed.
     */
    async keyDown(key: string | number, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Key down event with "${key}" ${count} times.`);
        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyDown', key, options, count > 1);
        }
    }

    /**
     * Simulates a key release event (keyUp) for the specified key.
     *
     * @param key The key to release (e.g., 'Enter', 'ArrowUp').
     * @param options Additional options for the keyboard event.
     * @param options.altKey Indicates if the Alt key is pressed.
     * @param options.ctrlKey Indicates if the Ctrl key is pressed.
     * @param options.metaKey Indicates if the Meta key is pressed.
     * @param options.shiftKey Indicates if the Shift key is pressed.
     * @param count The number of times to trigger the keyUp event.
     * @returns A promise that resolves when the keyUp event(s) have been triggered.
     */
    async keyUp(key: string | number, options?: KeyOptions, count: number = 1): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Key up event with "${key}" ${count} times.`);
        for (let i = 0; i < count; i++) {
            await this._keyEvent('keyUp', key, options, count > 1);
        }
    }

    /**
     * Triggers a custom DOM event with the specified name and data.
     *
     * @param eventName The name of the custom event to dispatch.
     * @param data The data to include in the event's `detail` property.
     * @returns A promise that resolves when the command is sent.
     */
    async trigger(eventName: string, data?: any): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Triggering ${eventName} custom event.`);
        await this.executeScript((eventName: string, data: any) => {
            document.dispatchEvent(new CustomEvent(eventName, {
                detail: data,
            }));
        }, eventName, data);
    }

    /**
     * Executes a JavaScript function in the context of the browser runtime.
     *
     * @param fn The function to be executed. It will be serialized and executed in the browser context.
     * @param args The arguments to pass to the function being executed.
     * @returns A promise that resolves to the return value of the executed function.
     * @throws Throws an error if there are exception details in the execution result.
     */
    async executeScript<T>(fn: (...args: any[]) => T | Promise<T>, ...args: any[]): Promise<T> {
        const expression = `(${fn.toString()})(${args.map((arg) => JSON.stringify(arg)).join(',')})`;
        global.log.debug(`\n[GamefaceCommands] Executing script - ${expression}.`);

        const res = await this.sendCommand('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true,
        });

        if (res?.exceptionDetails) {
            throw new Error(`"${res?.exceptionDetails?.exception?.description || res?.exceptionDetails?.text}" in executing the following script: ${expression}.`);
        }

        return res?.result?.value;
    }

    /**
     * Executes a binding script within the context of Gameface.
     *
     * This method serializes the provided function and its arguments, then executes
     * the script in the browser environment. It ensures that the engine is
     * initialized and ready before executing the script. If the engine is not
     * initialized, it attempts to load the cohtml.js library dynamically.
     *
     * @param fn The function to be executed in the browser context. This function will be serialized and reconstructed.
     * @param args The arguments to pass to the function `fn`.
     * @returns A promise that resolves with the result of the executed function.
     * @throws If the Cohtml engine is not initialized and cannot be loaded.
     */
    async executeBindingScript(fn: (...args: any[]) => any, ...args: any[]): Promise<any> {
        global.log.debug(`\n[GamefaceCommands] Executing binding script.`);
        const serializedFn = fn.toString();
        return await this.executeScript(async (cohtmlPath: string, serializedFn: string, ...args: any[]) => {
            return await new Promise(async (resolve) => {
                // @ts-ignore
                if (!engine || !engine._Initialized) {
                    if (document.querySelector(`[src="${cohtmlPath}"]`)) {
                        throw new Error('cohtml.js is already included in the document, but the "engine" has not been initialized. Please manually import cohtml.js into your UI before testing the UI\'s data-binding functionality.');
                    }
                    await window.loadCohtmlJS(cohtmlPath);
                }
                // @ts-ignore
                if (!engine._BindingsReady) {
                    // @ts-ignore
                    await engine.whenReady;
                }
                const fn = new Function(`return (${serializedFn})`)();
                return resolve(fn(...args));
            });
        }, this.cohtmlJSPath, serializedFn, ...args);
    }

    /**
     * Creates a model and binds it to the UI.
     * @param name The name of the model to be created.
     * @param model The model object to be created and synchronized.
     * @returns A promise that resolves to the created model.
     */
    async createModel<T>(name: string, model: T): Promise<T> {
        global.log.debug(`\n[GamefaceCommands] Creating binding model with name - ${name} and data - ${JSON.stringify(model)}.`);
        await this.executeBindingScript((name: string, model: any) => {
            // @ts-ignore
            const engine = window.engine || globalThis.engine;
            // @ts-ignore
            window[name] = model;
            // @ts-ignore
            engine.createJSModel(name, window[name]);
            engine.synchronizeModels();
        }, name, model);
        return model;
    }

    /**
     * Updates a model and synchronizes the UI.
     * @param modelName The name of the model to be created.
     * @param fn The function to be executed. It will be serialized and executed in the browser context.
     * @param args The arguments to pass to the function being executed.
     * @returns A promise that resolves when the model is updated.
     */
    async updateModel(modelName: string, fn: (...args: any[]) => void, ...args: any[]): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Updating binding model with name - ${modelName}.`);
        const serializedFn = fn.toString();
        await this.executeBindingScript((modelName: string, serializedFn: string, ...args: any[]) => {
            const fn = new Function(`return (${serializedFn})`)();
            fn(...args);
            // @ts-ignore
            engine.updateWholeModel(window[modelName]);
            // @ts-ignore
            engine.synchronizeModels();
        }, modelName, serializedFn, ...args);
    }

    /**
     * Triggers an engine event with the specified event name and data.
     *
     * @param eventName The name of the event to trigger.
     * @param data The data to pass along with the event.
     * @returns A promise that resolves when the event has been triggered.
     */
    async triggerEngineEvent(eventName: string, data?: any): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Triggering engine event - ${eventName} to the UI.`);
        await this.executeBindingScript((eventName: string, data: any) => {
            // @ts-ignore
            engine.trigger(eventName, data);
        }, eventName, data);
    }

    /**
     * Handles an engine event by setting up a listener for the specified event,
     * triggering an action, and resolving with the event data once the event occurs.
     *
     * @param eventName The name of the engine event to listen for.
     * @param triggerEventAction A function that triggers the event.
     * @returns A promise that resolves with the data from the triggered event.
     */
    async onEngineEvent(eventName: string, triggerEventAction: () => Promise<void>): Promise<any> {
        global.log.debug(`\n[GamefaceCommands] Listening for engine event - ${eventName} from the UI.`);
        const promise = this.executeBindingScript((eventName: string) => {
            return new Promise((resolve) => {
                function callback(data: any) {
                    // @ts-ignore
                    engine.off(eventName, callback);
                    resolve(data);
                }
                // @ts-ignore
                engine.on(eventName, callback);
            });
        }, eventName);

        await triggerEventAction();
        return await promise;
    }

    /**
     * Scrolls the document to the specified x and y coordinates.
     *
     * @param x The horizontal coordinate to scroll to.
     * @param y The vertical coordinate to scroll to.
     * @returns Resolves when the scrolling is complete.
     */
    async scrollTo(x: number, y: number): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Scrolling document to ${x} ${y}.`);
        const documentElement = await this.get('html');
        await documentElement.scrollTo(x, y);
    }

    /**
     * Scrolls the document to the top of the page.
     * Utilizes the `scrollTo` method to set the scroll position to (0, 0).
     * 
     * @returns Resolves when the scrolling action is complete.
     */
    async scrollToTop(): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Scrolling document to the top.`);
        await this.scrollTo(0, 0);
    }

    /**
     * Scrolls the document to the bottom of the page.
     * Utilizes the window's inner height to determine the scroll position.
     * 
     * @returns Resolves when the scrolling action is complete.
     */
    async scrollToBottom(): Promise<void> {
        global.log.debug(`\n[GamefaceCommands] Scrolling document to the bottom.`);
        const windowHeight = await this.executeScript(() => window.innerHeight);
        await this.scrollTo(0, windowHeight);
    }
}

export const gamefaceCommands = new GamefaceCommands();