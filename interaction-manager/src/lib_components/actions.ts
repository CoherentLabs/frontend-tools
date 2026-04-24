/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import IM from '../utils/global-object';

/**
 * Register and trigger actions to be used in project
 */
class Actions {
    /**
     * Register an action
     */
    register(action: string, callback: Function) {
        if (IM.getAction(action)) return console.error(`The following action "${action}" is already registered!`);

        _IM.actions.push({ name: action, callback });
    }

    /**
     * Remove a registered action
     */
    remove(action: string) {
        const actionIndex = IM.getActionIndex(action);
        if (actionIndex === -1) return console.error(`${action} is not a registered action!`);

        _IM.actions.splice(actionIndex, 1);
    }

    /**
     * Trigger an action
     */
    execute(action: string, value?: any) {
        const actionObject = IM.getAction(action);
        if (!actionObject) return console.error(`${action} is not a registered action!`);

        actionObject.callback(value);
    }
}

export default new Actions();
