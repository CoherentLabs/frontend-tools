import { GAMEPAD_BUTTONS, sleep } from "../utils";
import type { GamefaceCommands } from "./commands";

// Interaction manager by default polls for 200ms so we will timeout on 210;
const PRESS_TIMEOUT = 210;

export type Step = { key: number; timeout?: number } | number;
interface WindowGamepadInternal {
    id: string,
    axes: number[],
    buttons: { touched: boolean, value: 0 | 1, pressed: boolean }[]
}
declare var window: Window & {
    _gamepads: WindowGamepadInternal[];
    _getGamepad: (id: string) => WindowGamepadInternal
}


declare var navigator: {
    getGamepads: () => typeof window._gamepads;
}

/**
 * @class GamefaceGamepad
 */
export class GamefaceGamepad {
    public id: string;
    public pressedKeys: Set<number>;
    private gamefaceCommands: GamefaceCommands;

    /**
     * Private constructor. Use GamefaceGamepad.create() to instantiate.
     */
    private constructor(gamefaceCommands: GamefaceCommands, id: string) {
        this.pressedKeys = new Set();
        this.id = id;
        this.gamefaceCommands = gamefaceCommands;

        // @ts-ignore
        return new Promise(async (resolve, reject) => {
            global.log.debug(`Connecting gamepad with id - ${this.id}.`);

            await this.gamefaceCommands.executeScript((id) => {
                if (!window._gamepads) {
                    window._gamepads = [];
                    navigator.getGamepads = () => window._gamepads;
                }
                if (!window._getGamepad) {
                    window._getGamepad = (id) => window._gamepads.find(gp => gp.id === id);
                }

                window._gamepads.push({ id, axes: [0, 0, 0, 0], buttons: Array(17).fill({}).map(() => ({ touched: false, value: 0, pressed: false })) });
                window.dispatchEvent(new Event('gamepadconnected'));
            }, this.id)

            return resolve(this);
        })
    }

    /**
     * Factory method to create and initialize a Gamepad.
     */
    public static async create(gamefaceCommands: GamefaceCommands, id: string): Promise<GamefaceGamepad> {
        const instance = new GamefaceGamepad(gamefaceCommands, id);

        global.log.debug(`Connecting gamepad with id - ${instance.id}.`);

        await instance.gamefaceCommands.executeScript((id: string) => {
            if (!window._gamepads) {
                window._gamepads = [];
                navigator.getGamepads = () => window._gamepads;
            }

            window._gamepads.push({
                id,
                axes: [0, 0, 0, 0],
                buttons: Array(17).fill(null).map(() => ({ touched: false, value: 0, pressed: false }))
            });
            window.dispatchEvent(new Event('gamepadconnected'));
        }, instance.id);

        return instance;
    }

    private _validateKey(key: number): void {
        global.log.debug(`Checking if "${key}" is a valid gamepad key.`);

        const resolvedKey = Object.values(GAMEPAD_BUTTONS).includes(key);
        if (!resolvedKey) {
            throw new Error(`Key "${key}" is not a valid gamepad button.`);
        }
    }

    /**
     * Press one or more gamepad keys and wait for their release.
     *
     * If `keys` is an array, each key will be pressed and then the method will wait for all keys to be released.
     * If `keys` is a single key, it will be pressed and then the method will wait
     * for that single key to be released.
     */
    public async press(keys: number | number[], timeout: number = PRESS_TIMEOUT): Promise<void> {
        global.log.debug(`Pressing "${keys}" keys of a gamepad with id - ${this.id} for ${timeout}ms.`);

        await this.hold(keys);
        await sleep(timeout);
        await this.release(keys);
    }

    /**
     * Hold one or more gamepad keys for a specified duration.
     */
    public async hold(keys: number | number[]): Promise<void> {
        global.log.debug(`Holding "${keys}" keys of a gamepad with id - ${this.id}.`);

        const keysInternal = Array.isArray(keys) ? keys : [keys];
        for (const key of keysInternal) this._validateKey(key);

        await this.gamefaceCommands.executeScript((id: string, keys: number[]) => {
            if (!window._gamepads) throw new Error(`There are no gamepads connected.`);

            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            for (const key of keys) {
                gamepad.buttons[key].pressed = true;
                gamepad.buttons[key].value = 1;
            }
        }, this.id, keysInternal);

        for (const key of keysInternal) this.pressedKeys.add(key);
    }

    /**
    * Immediately releases a gamepad key. Useful when you are holding a key indefinitely and you want to release it.
    */
    public async release(keys: number | number[]): Promise<void> {
        global.log.debug(`Releasing keys - [${keys}] of gamepad with id - ${this.id}.`);

        const keysInternal = Array.isArray(keys) ? keys : [keys];
        for (const key of keysInternal) {
            this._validateKey(key);
            if (!this.pressedKeys.has(key)) throw new Error(`Key "${key}" is not pressed.`);
        }

        await this.gamefaceCommands.executeScript((id: string, keys: number[]) => {
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
    public async disconnect(): Promise<void> {
        global.log.debug(`Disconnecting gamepad with id - ${this.id}`);

        return this.gamefaceCommands.executeScript((id: string) => {
            const gamepadIndex = window._gamepads.findIndex((gp: any) => gp.id === id);
            if (gamepadIndex === -1) throw new Error(`Gamepad with id "${id}" not found.`);
            window._gamepads.splice(gamepadIndex, 1);
        }, this.id);
    }

    /**
    * Moves gamepad stick to specified position
    */
    private async _moveStick(x: number, y: number, stick: 'left' | 'right'): Promise<void> {
        const axesIndexes = {
            x: stick === 'left' ? 0 : 2,
            y: stick === 'left' ? 1 : 3
        };

        if (x > 1 || x < -1 || y > 1 || y < -1) throw new Error(`Moving gamepad ${stick} stick with x or y out of range. Valid values are between -1 and 1 for x and y arguments. Received - x: ${x}, y: ${y}`);

        await this.gamefaceCommands.executeScript((id: string, x: number, y: number, xAxisIndex: number, yAxisIndex: number) => {
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            gamepad.axes[xAxisIndex] = x;
            gamepad.axes[yAxisIndex] = y;
        }, this.id, x, y, axesIndexes.x, axesIndexes.y);
    }

    /**
    * Moves left gamepad stick to specified position
    * 
    * @param {number} x - Number between -1 and 1
    * @param {number} y - Number between -1 and 1
    */
    public async moveLeftStick(x: number, y: number): Promise<void> {
        global.log.debug(`Moving left gamepad stick to (${x}, ${y}).`);
        await this._moveStick(x, y, 'left');
    }

    /**
     * Moves right gamepad stick to specified position
     * 
     * @param {number} x - Number between -1 and 1
     * @param {number} y - Number between -1 and 1
     */
    public async moveRightStick(x: number, y: number): Promise<void> {
        global.log.debug(`Moving right gamepad stick to (${x}, ${y}).`);
        await this._moveStick(x, y, 'right');
    }

    /**
     * Resets all the gamepad sticks to 0, 0 position
     */
    public async resetSticks(): Promise<void> {
        global.log.debug(`Reseting gamepad sticks to their initial positions.`);

        await this.gamefaceCommands.executeScript((id: string) => {
            const gamepad = window._getGamepad(id);
            if (!gamepad) throw new Error(`Gamepad with id "${id}" not found.`);

            gamepad.axes = [0, 0, 0, 0];
        }, this.id);
    }

    /**
    * Executes combination of pressing gamepad buttons in a sequence.
    *
    * Usefull for example when you want to navigate in your UI menus using a gamepad.
    */
    public async sequence(steps: Step[]): Promise<void> {
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
                await this.press(step as number);
            } else {
                throw new Error(`Unable to execute gamepad sequence. Expected { key:number, timeout?:number} object or a number representing gamepad key in the sequence config. Received - ${JSON.stringify(step)}`);
            }
        }
    }
}