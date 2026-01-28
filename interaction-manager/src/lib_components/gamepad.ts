/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import mappings, { AxisInput, ButtonInput, InternalAction, GamepadInput } from '../utils/gamepad-mappings';
import IM, { GamepadFunction } from '../utils/global-object';
import Actions from './actions';

const AXIS_THRESHOLD = 0.9;
const ACTION_TYPES = ['press', 'hold'] as const;

export type GamepadEventType = typeof ACTION_TYPES[number];

type ButtonGamepadOptions = {
    actions: ButtonInput[],
    type?: 'hold' | 'press',
    callback: ((buttons: GamepadButton[]) => void) | string
};

type AxisGamepadOptions = {
    actions: AxisInput[],
    type?: 'hold',
    callback: ((axes: [number, number]) => void) | string
};
/**
 * Gamepad class that handles all gamepad interactions
 */
class Gamepad {
    private _gamepadEnabled = false
    private _pollingInterval = 200;
    private pollingIntervalRef?: NodeJS.Timeout;
    private _pressedAction: GamepadFunction | null = null;
    private _pressedButtons: GamepadButton[] = [];

    constructor() {
        this.sanitizeAction = this.sanitizeAction.bind(this);
    }
    /**
     * Allow gamepads to be connected
     */
    set enabled(isEnabled: boolean) {
        this._gamepadEnabled = isEnabled;
        this._gamepadEnabled ? this.startPolling() : this.stopPolling();
    }

    set pollingInterval(interval: number) {
        this._pollingInterval = interval;

        if (this._gamepadEnabled) {
            if (this.pollingIntervalRef) this.stopPolling();
            this.startPolling();
        }
    }

    /**
     *
     * @param {Object} options
     * @param {string[] | number[]} options.actions - Action to trigger the callback. Can be name of button or joystick
     * @param {'press' | 'hold'} options.type - The type of action to trigger the callback. The available options are hold and press.
     * @param {function | string} options.callback - Function(s) or action(s) to be triggered on the set action
     */
    on(options: ButtonGamepadOptions): void;
    on(options: AxisGamepadOptions): void;
    on(options: ButtonGamepadOptions | AxisGamepadOptions) {
        const actions = options.actions.map(this.sanitizeAction);
        const isAxisAlias = mappings.axisAliases.some(alias => actions.includes(alias));
        const type = options.type && ACTION_TYPES.includes(options.type) ? options.type : 'hold';

        if (type === 'press' && isAxisAlias) {
            return console.error(`You can't use an axis action with a 'press' type!`);
        }

        if (actions.length > 1 && isAxisAlias) {
            return console.error(`You can't use an axis action in a combination with a button action`);
        }

        const existingEntry = IM.getGamepadAction({actions, type});
        if (existingEntry) {
            return IM.addCallbackToEntry(existingEntry, options.callback, {
                identifier: `Actions: [${actions.join(', ')}]`,
                type
            });
        }

        _IM.gamepadFunctions.push({actions, type, callbacks: [options.callback]});
    }

    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove 
     */
    off(actions: GamepadInput[], callback?: Function | string) {
        const matchingActions = IM.getGamepadActions(actions.map(this.sanitizeAction));

        if (matchingActions.length === 0) {
            return console.error('You are trying to remove a non-existent action!');
        }

        if (callback) {
            const actionsWithCallback = matchingActions.filter(action => action.callbacks.includes(callback));
            if (actionsWithCallback.length === 0) return console.error('You are trying to remove a non-existent callback from this action!');

            actionsWithCallback.forEach((action) => {
                const cbIndex = action.callbacks.indexOf(callback);
                action.callbacks.splice(cbIndex, 1);

                if (action.callbacks.length === 0) {
                    IM.removeGamepadFunction(action)  
                }
            })
        } else {
            matchingActions.forEach(action => IM.removeGamepadFunction(action));
        }
    }

    /**
     * Loop that handles button presses and axis movement
     */
    private startPolling() {
        this.pollingIntervalRef = setInterval(() => {
            const gamepads = navigator.getGamepads();

            if (gamepads.length === 0) return;

            gamepads.forEach((gamepad) => {
                if (!gamepad) return;
                this.handleButtons(gamepad.buttons);
                this.handleJoysticks(gamepad.axes);
            });
        }, this._pollingInterval);
    }

    private stopPolling() {
        if (this.pollingIntervalRef) clearInterval(this.pollingIntervalRef);
    }

    private handleButtons(buttons: readonly GamepadButton[]) {
        const pressedButtons = buttons.reduce<{
          buttonIndexes: number[];
          buttons: GamepadButton[];
        }>(
            (acc, el, index) => {
                if (el.pressed) {
                    acc.buttonIndexes.push(index);
                    acc.buttons.push(el);
                }
                return acc;
            },
            { buttonIndexes: [], buttons: [] }
        );

        const gamepadActions = IM.getGamepadActions(pressedButtons.buttonIndexes, false);

        if (this._pressedAction) {
            if (!gamepadActions.includes(this._pressedAction)) {
                this.executeCallbacks(this._pressedAction, this._pressedButtons);
            }
            this._pressedAction = null;
            this._pressedButtons = [];
        }

        gamepadActions.forEach((gamepadAction) => {
            if (gamepadAction.type === 'press') {
                this._pressedAction = gamepadAction;
                this._pressedButtons = pressedButtons.buttons;
                return;
            }

            this.executeCallbacks(gamepadAction, pressedButtons.buttons);
        });
    }

    /* eslint-disable max-lines-per-function */
    private handleJoysticks(axes: readonly number[]) {
        const joystickActions = this.getJoystickActions();

        joystickActions.forEach((jAction) => {
            switch (jAction.actions[0]) {
                case 'left.joystick':
                    return this.executeCallbacks(jAction, [axes[0], axes[1]]);
                case 'right.joystick':
                    return this.executeCallbacks(jAction, [axes[2], axes[3]]);
                case 'left.joystick.down':
                    if (axes[1] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
                    break;
                case 'left.joystick.up':
                    if (axes[1] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
                    break;
                case 'left.joystick.left':
                    if (axes[0] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
                    break;
                case 'left.joystick.right':
                    if (axes[0] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
                    break;
                case 'right.joystick.down':
                    if (axes[3] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
                    break;
                case 'right.joystick.up':
                    if (axes[3] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
                    break;
                case 'right.joystick.left':
                    if (axes[2] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
                    break;
                case 'right.joystick.right':
                    if (axes[2] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
                    break;
            }
        });
    }

    /**
     * Convert button aliases to indexes or keep joystick aliases
     * @param {string | number} action - Actions to convert
     */
    private sanitizeAction(action: GamepadInput): InternalAction {
        if (typeof action === 'number') return action;

        const actionName = action.toLowerCase();
        if ((mappings.axisAliases as readonly string[]).includes(actionName)) return actionName as AxisInput;
        
        const key = mappings.aliases[actionName as keyof typeof mappings.aliases];
        if (key) return mappings[key];

        throw new Error(`You have entered a non-supported button alias: ${action}`);
    }

    /**
     * Gets all registered Joystick actions
     */
    private getJoystickActions() {
        return _IM.gamepadFunctions.filter(gpFunc => mappings.axisAliases.includes(gpFunc.actions[0] as AxisInput));
    }

    /**
     * Executes the callbacks from the registered action
     */
    private executeCallbacks(action: GamepadFunction, value: GamepadButton[] | number[]): void {
        action.callbacks.forEach(callback => {
            if (typeof callback === 'string') return Actions.execute(callback, value);
    
            (callback as Function)(value);
        });
    }
}

export default new Gamepad();
