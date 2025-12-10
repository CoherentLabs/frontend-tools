const assert = require('assert');

const actionName = 'registered-action';

describe('Actions', () => {
    before(async () => {
        await gf.navigate('http://localhost:54321/tests/');
    });

    it('Should register an action', async () => {
        const registeredAction = await gf.executeScript((actionName) => {
            window.actionWorking = false;

            interactionManager.actions.register(actionName, () => window.actionWorking = true);
            return _IM.actions.find(action => action.name === actionName);
        }, actionName)


        assert(registeredAction);
    });

    it('Should execute registered action', async () => {
        const actionWorking = await gf.executeScript((actionName) => {
            interactionManager.actions.execute(actionName);
            return window.actionWorking;
        }, actionName)

        assert.equal(actionWorking, true);
    });

    it('Should remove action', async () => {
        const actionExists = await gf.executeScript((actionName) => {
            interactionManager.actions.remove(actionName);
            return _IM.actions.find(action => action.name === actionName) ? true : false;
        }, actionName);

        assert.equal(actionExists, false);
    });
});
