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
declare class IM {
    actions: ActionFunction[];
    keyboardFunctions: KeyboardFunction[];
    gamepadFunctions: GamepadFunction[];
    /**
     * Initialize global object
     */
    init(): void;
    /**
     * Get keyboard functions matching the given keys
     */
    getKeys(keys: KeyboardKey[]): KeyboardFunction[];
    /**
     * Get the index of a keyboard function matching the given keys
     */
    getKeysIndex(keys: KeyboardKey[]): number;
    /**
     * Get a gamepad function matching the given button actions and type
     */
    getGamepadAction({ actions, type }: {
        actions: InternalAction[];
        type: GamepadEventType;
    }): GamepadFunction | undefined;
    /**
     * Get all gamepad functions matching the given button actions
     */
    getGamepadActions(actions: InternalAction[], exactMatch?: boolean): GamepadFunction[];
    /**
     * Get the index of a gamepad function matching the given button actions
     */
    getGamepadActionIndex(actions: InternalAction[]): number;
    /**
     * Get an action by name
     * @param {string} action - Action to search for
     */
    getAction(action: string): ActionFunction | undefined;
    /**
     * Get the index of an action by name
     */
    getActionIndex(action: string): number;
    /**
     * Checks if a callback already exists in a registered function entry
     */
    hasDuplicateCallback(functionEntry: KeyboardFunction | GamepadFunction, callback: Function | string): boolean;
    /**
     * Adds a callback to an existing function entry if it's not a duplicate
     * @param {KeyboardFunction | GamepadFunction} functionEntry - The function entry to add the callback to
     * @param {Function | string} callback - The callback to add
     * @param {Object} errorContext - Context information for error messages
     * @param {string} errorContext.identifier - String identifying the keys/actions (e.g., "Keys: [A, B]")
     * @param {string} errorContext.type - The type of action (press, hold, lift)
     */
    addCallbackToEntry(functionEntry: KeyboardFunction | GamepadFunction, callback: Function | string, errorContext: ErrorContext): number | void;
    /**
     * Removes a keyboard function entry from the registry
     */
    removeKeyboardFunction(functionEntry: KeyboardFunction): void;
    /**
     * Removes a gamepad function entry from the registry
     */
    removeGamepadFunction(functionEntry: GamepadFunction): void;
}
declare const _default: IM;
export default _default;
