/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import IM from '../utils/global-object';
import mappings from '../utils/keyboard-mappings';
import Actions from './actions';
/**
 * Keyboard class that handles all keyboard interactions
 */
class Keyboard {
    /* eslint-disable-next-line require-jsdoc */
    constructor() {
        this.mappings = mappings;
        this.eventListenerAttached = false;

        this.keysPressed = new Set();

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        if (!window.KEYS) window.KEYS = mappings;
    }

    /**
     * @param {Object} options
     * @param {string[]} options.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {string | Function} options.callback - Function(s) or action(s) to be executed on the key combination
     * @param {string[]} options.type - Type of key action you want to use.
     * @returns {void}
     */
    on(options) {
        // Remove duplicate keys. For example if someone write keys: ['A', 'A'] we'll treat it like ['A']
        options.keys = [
            ...new Set(
                options.keys.map((key) => {
                    key = typeof key === 'number' ? this.keyCodeToString(key) : key;
                    return key.toUpperCase();
                })
            ),
        ];

        const incorrectKeys = options.keys.filter(key => !this.mappings[key]);

        if (incorrectKeys.length > 0) return console.error(`The following keys [${incorrectKeys.join(', ')}] you have entered are incorrect! `);

        if (!this.eventListenerAttached) {
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
            this.eventListenerAttached = true;
        }

        if (!Array.isArray(options.type)) options.type = [options.type];

        options.type.forEach((type) => {
            const registeredKeys = IM.getKeys(options.keys);
            const existingEntry = registeredKeys.find(key => key.type === type);

            if (existingEntry) {
                return IM.addCallbackToEntry(existingEntry, options.callback, {
                    identifier: `Keys: [${options.keys.join(', ')}]`,
                    type: type
                });
            }

            if (type === 'lift' && options.keys.length > 1) return console.error('You can only have a single key trigger an action on lift');

            _IM.keyboardFunctions.push({
                keys: options.keys,
                type,
                callbacks: [options.callback]
            });
        });
    }

    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param {string[]} keys - Key combination you want to remove from the listener
     * @param {string | Function} callback - Callback or action you want to remove 
     * @returns {void}
     */
    off(keys, callback) {
        keys = [
            ...new Set(
                keys.map((key) => {
                    key = typeof key === 'number' ? this.keyCodeToString(key) : key;
                    return key.toUpperCase();
                })
            ),
        ];

        const keyCombinations = IM.getKeys(keys);

        let keyCombinationCount = keyCombinations.length;
        if (keyCombinationCount === 0) return console.error('You are trying to remove a non-existent key combination!');

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
     * @param {KeyboardEvent} event
     * @returns {void}
     * @private
     */
    onKeyDown(event) {
        const keyPressed = this.keyCodeToString(event.keyCode);
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
     * @param {KeyboardEvent} event
     * @returns {void}
     * @private
     */
    onKeyUp(event) {
        const keyPressed = this.keyCodeToString(event.keyCode);
        this.keysPressed.delete(keyPressed);

        const registeredKeys = IM.getKeys(keyPressed);
        if (registeredKeys.length === 0) return;

        registeredKeys.forEach((key) => {
            if (key.type === 'lift' && key.keys.indexOf(keyPressed) !== -1) this.executeCallbacks(event, key);
        });
    }

    /**
     * Convert keyCode to string representing key
     * @param {number} code
     * @returns {string}
     * @private
     */
    keyCodeToString(code) {
        return Object.keys(this.mappings).find(key => this.mappings[key] === code);
    }

    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     * @return {void}
     * @private
     */
    executeCallbacks(event, registeredKeys) {
        registeredKeys.callbacks.forEach((callback) => {
            if (typeof callback === 'string') return Actions.execute(callback, event);

            callback(event);
        })
    }
}

export default new Keyboard();
