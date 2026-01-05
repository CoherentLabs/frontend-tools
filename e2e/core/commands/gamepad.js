const { GAMEPAD_BUTTONS, sleep } = require("../utils");

// Interaction manager by default polls for 200ms so we will timeout on 210;
const PRESS_TIMEOUT = 210;

/**
 * @class GamefaceGamepad
 */
class GamefaceGamepad {
    /**
    * Creates an instance of Gamepad.
    * 
    * @constructor
    * @param {import("gamefaceCommands").GamefaceCommandsMethods} gamefaceCommands - The gameface commands object.
    * @param {string} id - The ID of the gamepad to describe.
    */
    constructor(gamefaceCommands, id) {
        this.pressedKeys = new Set();
        this.id = id;

        /**
         * @private
         * @type {typeof gamefaceCommands}
         */
        this.gamefaceCommands = gamefaceCommands;

        // @ts-ignore
        return new Promise(async (resolve, reject) => {
            global.log.debug(`Connecting gamepad with id - ${this.id}.`);

            await this.gamefaceCommands.executeScript((id) => {
                //@ts-ignore
                if (!window._gamepads) {
                    //@ts-ignore
                    window._gamepads = [];
                    // @ts-ignore
                    navigator.getGamepads = () => window._gamepads;
                }
                //@ts-ignore
                if (!window._getGamepad) {
                    //@ts-ignore
                    window._getGamepad = (id) => window._gamepads.find(gp => gp.id === id);
                }

                //@ts-ignore
                window._gamepads.push({ id, axes: [0, 0, 0, 0], buttons: Array(17).fill().map(() => ({ touched: false, value: 0, pressed: false })) });
                window.dispatchEvent(new Event('gamepadconnected'));
            }, this.id)

            return resolve(this);
        })
    }

    /**
    * @private
    * @param {number} key 
    */
    _validateKey(key) {
        global.log.debug(`Checking if "${key}" is a valid gamepad key.`);

        const resolvedKey = Object.values(GAMEPAD_BUTTONS).includes(key);
        if (resolvedKey === undefined) {
            throw new Error(`Key "${key}" is not a valid gamepad button.`);
        }
    }

    /**
     * Press one or more gamepad keys and wait for their release.
     *
     * If `keys` is an array, each key will be pressed and then the method will wait for all keys to be released.
     * If `keys` is a single key, it will be pressed and then the method will wait
     * for that single key to be released.
     *
     * @async
     * @param {number|Array<number>} keys - A key identifier or an array of key identifiers to press.
     * @param {number} [timeout=PRESS_TIMEOUT] - Maximum time in milliseconds to wait for each press and for key release detection.
     * @returns {Promise<void>} Resolves when the press actions have completed and the corresponding release(s) have been observed.
     * @throws {Error} If an underlying press or release detection operation fails or times out.
     */
    async press(keys, timeout = PRESS_TIMEOUT) {
        global.log.debug(`Pressing "${keys}" keys of a gamepad with id - ${this.id} for ${timeout}ms.`);

        await this.hold(keys);
        await sleep(timeout);
        await this.release(keys);
    }

    /**
     * Hold one or more gamepad keys for a specified duration.
     *
     * @param {number | number[]} keys - A single key identifier or an array of key identifiers to hold.
     * @returns {Promise<void>} Resolves when the hold operation(s) complete.
     */
    async hold(keys, timeout) {
        global.log.debug(`Holding "${keys}" keys of a gamepad with id - ${this.id}.`);

        const keysInternal = Array.isArray(keys) ? keys : [keys];
        for (const key of keysInternal) this._validateKey(key);

        await this.gamefaceCommands.executeScript((id, keys) => {
            //@ts-ignore
            if (!window._gamepads) throw new Error(`There are no gamepads connected.`);
            //@ts-ignore
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            for (const key of keys) {
                gamepad.buttons[key].pressed = true;
                gamepad.buttons[key].value = 1;
            }
        }, this.id, keysInternal)

        for (const key of keysInternal) this.pressedKeys.add(key);
    }

    /**
     * Immediately releases a gamepad key. Useful when you are holding a key indefinitely and you want to release it.
     *
     * @param {number|number[]} keys
     */
    async release(keys) {
        global.log.debug(`Releasing keys - [${keys}] of gamepad with id - ${this.id}.`);

        const keysInternal = Array.isArray(keys) ? keys : [keys];
        for (const key of keysInternal) {
            this._validateKey(key);

            if (!this.pressedKeys.has(key)) throw new Error(`Key "${key}" is not pressed.`);
        }

        await this.gamefaceCommands.executeScript((id, keys) => {
            //@ts-ignore
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            for (const key of keys) {
                gamepad.buttons[key].pressed = false;
                gamepad.buttons[key].value = 0;
            }
        }, this.id, keysInternal);

        for (const key of keysInternal) this.pressedKeys.delete(key);
    }

    /**
     * Disconnects the gamepad
     */
    async disconnect() {
        global.log.debug(`Disconnecting gamepad with id - ${this.id}`);

        return this.gamefaceCommands.executeScript((id) => {
            //@ts-ignore
            const gamepadIndex = window._gamepads.findIndex(gp => gp.id === id);
            if (gamepadIndex === -1) throw new Error(`Gamepad with id "${id}" not found.`);
            //@ts-ignore
            window._gamepads.splice(gamepadIndex, 1);
        }, this.id);
    }

    /**
     * Moves gamepad stick to specified position
     * 
     * @param {number} x - Number between -1 and 1
     * @param {number} y - Number between -1 and 1
     * @param {'left'|'right'} stick - Which stick has been moved
     */
    async _moveStick(x, y, stick) {
        const axesIndexes = {
            x: stick === 'left' ? 0 : 2,
            y: stick === 'left' ? 1 : 3
        }

        if (x > 1 || x < -1 || y > 1 || y < -1) throw new Error(`Moving gamepad ${stick} stick with x or y out of range. Valid values are between -1 and 1 for x and y arguments. Received - x: ${x}, y: ${y}`);
        await this.gamefaceCommands.executeScript((id, x, y, xAxisIndex, yAxisIndex) => {
            //@ts-ignore
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            gamepad.axes[xAxisIndex] = x;
            gamepad.axes[yAxisIndex] = y;
        }, this.id, x, y, axesIndexes.x, axesIndexes.y)
    }

    /**
     * Moves left gamepad stick to specified position
     * 
     * @param {number} x - Number between -1 and 1
     * @param {number} y - Number between -1 and 1
     */
    async moveLeftStick(x, y) {
        global.log.debug(`Moving left gamepad stick to (${x}, ${y}).`);

        await this._moveStick(x, y, 'left');
    }

    /**
     * Moves right gamepad stick to specified position
     * 
     * @param {number} x - Number between -1 and 1
     * @param {number} y - Number between -1 and 1
     */
    async moveRightStick(x, y) {
        global.log.debug(`Moving right gamepad stick to (${x}, ${y}).`);

        await this._moveStick(x, y, 'right');
    }

    /**
     * Resets all the gamepad sticks to 0, 0 position
     */
    async resetSticks() {
        global.log.debug(`Reseting gamepad sticks to their initial positions.`);

        await this.gamefaceCommands.executeScript((id) => {
            //@ts-ignore
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            gamepad.axes = [0, 0, 0, 0];
        }, this.id)
    }

    /** @typedef {{ key: number, timeout?: number }} KeyStep */
    /** @typedef { KeyStep | number } Step */

    /**
     * Executes combination of pressing gamepad buttons in a sequence.
     * 
     * Useful for example when you want to navigate in your UI menus using a gamepad.
     * 
     * @param {Step[]} steps 
     */
    async sequence(steps) {
        global.log.debug(`Running sequence for gamepad with id - ${this.id}.`);

        for (const step of steps) {
            if (typeof step === 'object') {
                if ('key' in step) {
                    const { key, timeout } = step;
                    await this.press(key, timeout);
                } else {
                    throw new Error(`Unable to execute gamepad sequence. Expected { key:number, timeout?:number} object in the sequence config. Received - ${JSON.stringify(step)}`);
                }
            } else if (!isNaN(step)) {
                await this.press(step);
            } else {
                throw new Error(`Unable to execute gamepad sequence. Expected { key:number, timeout?:number} object or a number representing gamepad key in the sequence config. Received - ${JSON.stringify(step)}`);
            }
        }
    }
}

module.exports = GamefaceGamepad;