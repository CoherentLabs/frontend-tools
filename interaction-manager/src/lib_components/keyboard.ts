/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import IM, { KeyboardFunction } from '../utils/global-object';
import mappings, { KeyboardKey, KeyCode, KeyName, mappingsKeys } from '../utils/keyboard-mappings';
import Actions from './actions';

declare global {
    interface Window {
        KEYS: typeof mappings;
    }
    var KEYS: typeof mappings;
}

export type KeyboardEventType = 'press' | 'hold' | 'lift';
type KeyboardOptions = {
    keys: KeyboardKey[];
    callback: string | Function;
    type?: KeyboardEventType | KeyboardEventType[];
};

/**
 * Keyboard class that handles all keyboard interactions
 */
class Keyboard {
    private eventListenerAttached = false;
    private keysPressed = new Set<KeyboardKey>();

    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        if (!window.KEYS) window.KEYS = mappings;
    }

    /**
     * Registers keyboard event listeners
     * @param options - Configuration object
     * @param options.keys - Array of keys (e.g., ['A', 'SHIFT']) or key codes
     * @param options.callback - Function or action name to execute
     * @param options.type - Event type(s): 'press', 'hold', or 'lift' (can be single or array)
     */
    on(options: KeyboardOptions) {
        const keys = this.normalizeKeys(options.keys)

        const incorrectKeys = keys.filter(key => !mappings[key]);
        if (incorrectKeys.length > 0) return console.error(`The following keys [${incorrectKeys.join(', ')}] you have entered are incorrect! `);

        if (!this.eventListenerAttached) {
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
            this.eventListenerAttached = true;
        }

        const types = !options.type ? ['press' as KeyboardEventType] : Array.isArray(options.type) ? options.type : [options.type];

        types.forEach((type) => {
            const registeredKeys = IM.getKeys(keys);
            const existingEntry = registeredKeys.find(key => key.type === type);

            if (existingEntry) {
                return IM.addCallbackToEntry(existingEntry, options.callback, {
                    identifier: `Keys: [${keys.join(', ')}]`,
                    type: type
                });
            }

            if (type === 'lift' && keys.length > 1) return console.error('You can only have a single key trigger an action on lift');

            _IM.keyboardFunctions.push({
                keys,
                type,
                callbacks: [options.callback]
            });
        });
    }

    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param keys - Key combination you want to remove (e.g., ['A', 'SHIFT'])
     * @param callback - Optional specific callback or action to remove
     */
    off(keys: KeyboardKey[], callback?: string | Function) {
        keys = this.normalizeKeys(keys)

        const keyCombinations = IM.getKeys(keys);

        if (keyCombinations.length === 0) return console.error('You are trying to remove a non-existent key combination!');

        if (callback) {
            const combinationsWithCallback = keyCombinations.filter(combination => combination.callbacks.includes(callback));

            if (combinationsWithCallback.length === 0) {
                return console.error("You are trying to remove a non-existent callback from this key combination!");
            }

            combinationsWithCallback.forEach((combination) => {
                const cbIndex = combination.callbacks.indexOf(callback);
                combination.callbacks.splice(cbIndex, 1);

                if (combination.callbacks.length === 0) {
                    IM.removeKeyboardFunction(combination)
                }
            })
        } else {
            keyCombinations.forEach((combination) => {
                IM.removeKeyboardFunction(combination);
            })
        }

        if (_IM.keyboardFunctions.length === 0) {
            document.removeEventListener('keydown', this.onKeyDown);
            document.removeEventListener('keyup', this.onKeyUp);
            this.eventListenerAttached = false;
        }
    }

    /**
     * Handles when key is pressed
     */
    private onKeyDown(event: KeyboardEvent) {
        const keyPressed = this.keyCodeToString(event.keyCode as KeyCode);
        if (!keyPressed) return; // Ignore unknown key codes

        this.keysPressed.add(keyPressed);

        const registeredKeys = IM.getKeys([...this.keysPressed]);
        if (registeredKeys.length === 0) return;

        registeredKeys.forEach((key) => {
            if (key.type === 'press' && event.repeat) return;

            if (key.type !== 'press' && key.type !== 'hold') return;

            if (key.type === 'hold' && !event.repeat) return;

            this.executeCallbacks(event, key);
        });
    }

    /**
     * Handles when key is released
     */
    private onKeyUp(event: KeyboardEvent) {
        const keyPressed = this.keyCodeToString(event.keyCode as KeyCode);
        if (!keyPressed) return; // Ignore unknown key codes

        this.keysPressed.delete(keyPressed);

        const registeredKeys = IM.getKeys([keyPressed]);
        if (registeredKeys.length === 0) return;

        registeredKeys.forEach((key) => {
            if (key.type === 'lift' && key.keys.indexOf(keyPressed) !== -1) this.executeCallbacks(event, key);
        });
    }

    /**
     * Convert keyCode to string representing key
     */
    private keyCodeToString(code: KeyCode): KeyName | undefined {
        return (mappingsKeys.find(key => mappings[key as KeyName] === code) as KeyName);
    }

    /**
     * Removes duplicates and converts KeyCodes to valid KeyName strings
     */
    private normalizeKeys(keys: KeyboardKey[]) {
        const normalizedKeys = keys.map<KeyName>((key) => {
            // Handle Number Input (13 -> "ENTER")
            if (typeof key === 'number') {
                const name = this.keyCodeToString(key);
                if (!name) throw new Error(`Invalid KeyCode: ${key}`);
                return name;
            }
            
            // Handle String Input ("enter" -> "ENTER")
            return key.toUpperCase() as KeyName;
        });

        // Remove duplicate keys. For example if someone write keys: ['A', 'A'] we'll treat it like ['A']
        return [...new Set(normalizedKeys)];
    }

    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     */
    private executeCallbacks(event: KeyboardEvent, registeredKeys: KeyboardFunction) {
        registeredKeys.callbacks.forEach((callback) => {
            if (typeof callback === 'string') return Actions.execute(callback, event);

            callback(event);
        })
    }
}

export default new Keyboard();
