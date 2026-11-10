/**
 * Register and trigger actions to be used in project
 */
declare class Actions {
    /**
     * Register an action
     */
    register(action: string, callback: Function): void;
    /**
     * Remove a registered action
     */
    remove(action: string): void;
    /**
     * Trigger an action
     */
    execute(action: string, value?: any): void;
}
declare const _default: Actions;
export default _default;
