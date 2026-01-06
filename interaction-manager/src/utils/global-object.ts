/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyboardEventType } from "../lib_components/keyboard";
import { InternalAction } from "./gamepad-mappings";
import { KeyboardKey } from "./keyboard-mappings";
import { GamepadEventType } from "../lib_components/gamepad";

/**
 * Represents a keyboard function binding
 */
export interface KeyboardFunction {
    /** Array of key combinations */
    keys: KeyboardKey[];
    /** Array of callbacks or action names */
    callbacks: (Function | string)[];
    /** Type of key action */
    type: KeyboardEventType;
}

/**
 * Represents a gamepad function binding
 */
export interface GamepadFunction {
    /** Array of gamepad actions (button indexes or joystick aliases) */
    actions: InternalAction[];
    /** Array of callback functions or action names */
    callbacks: (Function | string)[];
    /** Type of gamepad action */
    type: GamepadEventType;
}

/**
 * Represents a registered action
 */
export interface ActionFunction {
    /** Name of the action */
    name: string;
    /** Callback function to execute */
    callback: Function;
}

/**
 * Error context for callback registration
 */
interface ErrorContext {
    /** String identifying the keys/actions */
    identifier: string;
    /** The type of action */
    type: string;
}

declare global {
    interface Window {
        _IM: IM;
    }
    var _IM: IM;
}

/**
 * Global object class
 */
class IM {
    // eslint-disable-next-line require-jsdoc
    actions: ActionFunction[] = [];
    keyboardFunctions: KeyboardFunction[] = [];
    gamepadFunctions: GamepadFunction[] = [];

    /**
     * Initialize global object
     */
    init() {
        if (!window._IM) window._IM = new IM();
    }

    /**
     * Get keyboard functions matching the given keys
     */
    getKeys(keys: KeyboardKey[]): KeyboardFunction[] {
        return _IM.keyboardFunctions.filter(keyFunction => keyFunction.keys.every(key => keys.includes(key)));
    }

    /**
     * Get the index of a keyboard function matching the given keys
     */
    getKeysIndex(keys: KeyboardKey[]): number {
        return _IM.keyboardFunctions.findIndex(keyFunction => keyFunction.keys.every(key => keys.includes(key)));
    }

    /**
     * Get a gamepad function matching the given button actions and type
     */
    getGamepadAction({ actions, type }: { actions: InternalAction[], type: GamepadEventType}) {
        return _IM.gamepadFunctions.find((gpFunc) => {
            return (
                gpFunc.actions.every(action => actions.includes(action)) &&
                gpFunc.type === type && gpFunc.actions.length === actions.length
            );
        });
    }

    /**
     * Get all gamepad functions matching the given button actions
     */
    getGamepadActions(actions: InternalAction[], exactMatch = true) {
        return _IM.gamepadFunctions.filter(
            gpFunc => gpFunc.actions.every(action => actions.includes(action)) &&
                (exactMatch ? gpFunc.actions.length === actions.length : true)
        );
    }

    /**
     * Get the index of a gamepad function matching the given button actions
     */
    getGamepadActionIndex(actions: InternalAction[]) {
        return _IM.gamepadFunctions.findIndex(gpFunc => gpFunc.actions.every(action => actions.includes(action)));
    }

    /**
     * Get an action by name
     * @param {string} action - Action to search for
     */
    getAction(action: string) {
        return _IM.actions.find(actionObj => actionObj.name === action);
    }

    /**
     * Get the index of an action by name
     */
    getActionIndex(action: string) {
        return _IM.actions.findIndex(actionObj => actionObj.name === action);
    }

    /**
     * Checks if a callback already exists in a registered function entry
     */
    hasDuplicateCallback(functionEntry: KeyboardFunction | GamepadFunction, callback: Function | string) {
        return functionEntry.callbacks.some(cb => cb === callback);
    }

    /**
     * Adds a callback to an existing function entry if it's not a duplicate
     * @param {KeyboardFunction | GamepadFunction} functionEntry - The function entry to add the callback to
     * @param {Function | string} callback - The callback to add
     * @param {Object} errorContext - Context information for error messages
     * @param {string} errorContext.identifier - String identifying the keys/actions (e.g., "Keys: [A, B]")
     * @param {string} errorContext.type - The type of action (press, hold, lift)
     */
    addCallbackToEntry(functionEntry: KeyboardFunction | GamepadFunction, callback: Function | string, errorContext: ErrorContext) {
        if (this.hasDuplicateCallback(functionEntry, callback)) {
            const callbackType = typeof callback === 'string' ? 'action' : 'function';
            const callbackName = typeof callback === 'string' ? callback : '(anonymous function)';

            return console.error(
                `Duplicate callback detected!\n` +
                `${errorContext.identifier}\n` +
                `Type: '${errorContext.type}'\n` +
                `Callback: ${callbackName}\n` +
                `This ${callbackType} is already registered for this combination and type. ` +
                `To update it, first remove with the .off() method.`
            );
        }

        return functionEntry.callbacks.push(callback);
    }

    /**
     * Removes a keyboard function entry from the registry
     */
    removeKeyboardFunction(functionEntry: KeyboardFunction) {
        const index = _IM.keyboardFunctions.indexOf(functionEntry);
        if (index !== -1) _IM.keyboardFunctions.splice(index, 1);
    }

    /**
     * Removes a gamepad function entry from the registry
     */
    removeGamepadFunction(functionEntry: GamepadFunction) {
        const index = _IM.gamepadFunctions.indexOf(functionEntry);
        if (index !== -1) _IM.gamepadFunctions.splice(index, 1);
    }
}

export default new IM();
