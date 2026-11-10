import mappings, { KeyboardKey } from '../utils/keyboard-mappings';
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
declare class Keyboard {
    private eventListenerAttached;
    private keysPressed;
    constructor();
    /**
     * Registers keyboard event listeners
     * @param options - Configuration object
     * @param options.keys - Array of keys (e.g., ['A', 'SHIFT']) or key codes
     * @param options.callback - Function or action name to execute
     * @param options.type - Event type(s): 'press', 'hold', or 'lift' (can be single or array)
     */
    on(options: KeyboardOptions): void;
    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param keys - Key combination you want to remove (e.g., ['A', 'SHIFT'])
     * @param callback - Optional specific callback or action to remove
     */
    off(keys: KeyboardKey[], callback?: string | Function): void;
    /**
     * Handles when key is pressed
     */
    private onKeyDown;
    /**
     * Handles when key is released
     */
    private onKeyUp;
    /**
     * Convert keyCode to string representing key
     */
    private keyCodeToString;
    /**
     * Removes duplicates and converts KeyCodes to valid KeyName strings
     */
    private normalizeKeys;
    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     */
    private executeCallbacks;
}
declare const _default: Keyboard;
export default _default;
