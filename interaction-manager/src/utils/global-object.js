/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

 /**
   * @typedef {Object} KeyboardFunction
   * @property {string[]} keys - Array of key combinations
   * @property {(Function|string)[]} callbacks - Array of callbacks or action names
   * @property {('press'|'hold'|'lift')} type - Type of key action
   */

 /**
   * @typedef {Object} GamepadFunction
   * @property {(string|number)[]} actions - Array of gamepad actions (button indexes or joystick aliases)
   * @property {(Function|string)[]} callbacks - Array of callback functions or action names
   * @property {('press'|'hold')} type - Type of gamepad action
   */

 /**
   * @typedef {Object} ActionFunction
   * @property {string} name - Name of the action
   * @property {Function} callback - Callback function to execute
   */

/**
 * Global object class
 */
class IM {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        this.actions = [];
        this.keyboardFunctions = [];
        this.gamepadFunctions = [];
    }

    /**
     * Initialize global object
     */
    init() {
        if (!window._IM) window._IM = new IM();
    }

    /**
     *
     * @param {string[]} keys Array of key combinations
     * @returns {KeyboardFunction[]} Array of keyboard function objects
     */
    getKeys(keys) {
        return _IM.keyboardFunctions.filter(keyFunction => keyFunction.keys.every(key => keys.includes(key)));
    }

    /**
     *
     * @param {string[]} keys Array of key combinations
     * @returns {number} Index of key combination in _IM
     */
    getKeysIndex(keys) {
        return _IM.keyboardFunctions.findIndex(keyFunction => keyFunction.keys.every(key => keys.includes(key)));
    }

    /**
     *
     * @param {Object} options
     * @param {Array} options.actions - Array of actions
     * @param {string} options.type - Type of action
     * @returns {GamepadFunction} Gamepad function object from the _IM global object
     */
    getGamepadAction({ actions, type }) {
        return _IM.gamepadFunctions.find((gpFunc) => {
            return (
                gpFunc.actions.every(action => actions.includes(action)) &&
                gpFunc.type === type && gpFunc.actions.length === actions.length
            );
        });
    }

    /**
     *
     * @param {Array} actions - Array of actions
     * @returns {GamepadFunction[]} Array of gamepad function objects from the _IM global object
     */
    getGamepadActions(actions) {
        return _IM.gamepadFunctions.filter(
            gpFunc => gpFunc.actions.every(action => actions.includes(action)) &&
            gpFunc.actions.length === actions.length
        );
    }

    /**
     *
     * @param {Array} actions Array of actions
     * @returns {number} Index of an action from the _IM global object
     */
    getGamepadActionIndex(actions) {
        return _IM.gamepadFunctions.findIndex(gpFunc => gpFunc.actions.every(action => actions.includes(action)));
    }

    /**
     *
     * @param {string} action - Action to search for
     * @returns {ActionFunction} Action function object
     */
    getAction(action) {
        return _IM.actions.find(actionObj => actionObj.name === action);
    }

    /**
     *
     * @param {string} action Action to search for
     * @returns {number}
     */
    getActionIndex(action) {
        return _IM.actions.findIndex(actionObj => actionObj.name === action);
    }

    /**
     * Checks if a callback already exists in a registered function entry
     * @param {KeyboardFunction | GamepadFunction} functionEntry - The function entry to check
     * @param {Function | string} callback - The callback to search for
     * @returns {boolean} True if callback exists, false otherwise
     */
    hasDuplicateCallback(functionEntry, callback) {
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
    addCallbackToEntry(functionEntry, callback, errorContext) {
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
     * @param {KeyboardFunction} functionEntry - The entry to remove
     * @returns {void}
     */
    removeKeyboardFunction(functionEntry) {
        const index = _IM.keyboardFunctions.indexOf(functionEntry);
        if (index !== -1) _IM.keyboardFunctions.splice(index, 1);
    }

    /**
   * Removes a gamepad function entry from the registry
   * @param {GamepadFunction} functionEntry - The entry to remove
   * @returns {void}
   */
    removeGamepadFunction(functionEntry) {
        const index = _IM.gamepadFunctions.indexOf(functionEntry);
        if (index !== -1) _IM.gamepadFunctions.splice(index, 1);
    }
}

export default new IM();
