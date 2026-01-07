import { AxisInput, ButtonInput, GamepadInput } from '../utils/gamepad-mappings';
declare const ACTION_TYPES: readonly ["press", "hold"];
export type GamepadEventType = typeof ACTION_TYPES[number];
type ButtonGamepadOptions = {
    actions: ButtonInput[];
    type?: 'hold' | 'press';
    callback: ((buttons: GamepadButton[]) => void) | string;
};
type AxisGamepadOptions = {
    actions: AxisInput[];
    type?: 'hold';
    callback: ((axes: [number, number]) => void) | string;
};
/**
 * Gamepad class that handles all gamepad interactions
 */
declare class Gamepad {
    gamepadEnabled: boolean;
    pollingInterval: number;
    private pollingIntervalRef?;
    private _pressedAction;
    private _pressedButtons;
    constructor();
    /**
     * Allow gamepads to be connected
     */
    set enabled(isEnabled: boolean);
    /**
     *
     * @param {Object} options
     * @param {string[] | number[]} options.actions - Action to trigger the callback. Can be name of button or joystick
     * @param {'press' | 'hold'} options.type - The type of action to trigger the callback. The available options are hold and press.
     * @param {function | string} options.callback - Function(s) or action(s) to be triggered on the set action
     */
    on(options: ButtonGamepadOptions): void;
    on(options: AxisGamepadOptions): void;
    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove
     */
    off(actions: GamepadInput[], callback?: Function | string): void;
    /**
     * Loop that handles button presses and axis movement
     */
    private startPolling;
    private stopPolling;
    private handleButtons;
    private handleJoysticks;
    /**
     * Convert button aliases to indexes or keep joystick aliases
     * @param {string | number} action - Actions to convert
     */
    private sanitizeAction;
    /**
     * Gets all registered Joystick actions
     */
    private getJoystickActions;
    /**
     * Executes the callbacks from the registered action
     */
    private executeCallbacks;
}
declare const _default: Gamepad;
export default _default;
