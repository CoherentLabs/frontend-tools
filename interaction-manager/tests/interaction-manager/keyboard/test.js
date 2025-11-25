/* globals _IM, simulateKeyDown, simulateKeyUp */
/* eslint-disable max-lines-per-function */

const singleKey = ['A'];
const keyCombination = ['B', 'C'];

describe('Keyboard', () => {
    afterAll(() => {
        interactionManager.keyboard.off(singleKey);
    });

    it('Should register key action', () => {
        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => { },
            type: ['press'],
        });

        const keyAction = _IM.getKeys(singleKey);

        assert.isAbove(keyAction.length, 0);
    });

    it('Should remove key action', () => {
        interactionManager.keyboard.off(singleKey);

        const keyAction = _IM.getKeys(singleKey);

        assert.equal(keyAction.length, 0);
    });

    it('Should execute key action on key down', () => {
        let hasExecuted = false;
        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                hasExecuted = true;
            },
            type: ['press'],
        });

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.isTrue(hasExecuted);
    });

    it('Should execute key action on key combination', () => {
        let hasExecuted = false;
        interactionManager.keyboard.on({
            keys: keyCombination,
            callback: () => {
                hasExecuted = true;
            },
            type: ['press'],
        });

        keyCombination.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(keyCombination);

        assert.isTrue(hasExecuted);
    });

    it('Should execute one time on key down with type press', () => {
        let counter = 0;

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                counter += 1;
            },
            type: ['press'],
        });

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter, 1);
    });

    it('Should execute multiple times on key down with type hold', () => {
        let counter = 0;
        const count = 10;

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                counter += 1;
            },
            type: ['hold'],
        });

        singleKey.forEach((key) => {
            for (let i = 0; i < count; i++) {
                simulateKeyDown(key, true);
            }
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter, count);
    });

    it('Should execute on key up with type lift', () => {
        let counter = 0;

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                counter += 1;
            },
            type: ['lift'],
        });

        singleKey.forEach((key) => {
            simulateKeyUp(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter, 1);
    });

    it('Should execute on key up with type lift for two lift events', () => {
        const liftedKeys = [];
        const secondActionKeys = ['B'];

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                liftedKeys.push(singleKey[0]);
            },
            type: ['lift'],
        });

        interactionManager.keyboard.on({
            keys: secondActionKeys,
            callback: () => {
                liftedKeys.push(secondActionKeys[0]);
            },
            type: ['lift'],
        });

        singleKey.forEach((key) => {
            simulateKeyUp(key);
        });

        secondActionKeys.forEach((key) => {
            simulateKeyUp(key);
        });

        interactionManager.keyboard.off(singleKey);
        interactionManager.keyboard.off(secondActionKeys);

        assert.equal(JSON.stringify(liftedKeys), '["A","B"]');
    });

    it('Should execute the same action on two or more types', () => {
        let counter = 0;

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: () => {
                counter += 1;
            },
            type: ['press', 'lift'],
        });

        singleKey.forEach((key) => {
            simulateKeyDown(key);
            simulateKeyUp(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter, 2);
    });

    it('Should register multiple callbacks for the same key combination', () => {
        let counter1 = 0;
        let counter2 = 0;

        const callback1 = () => { counter1 += 1; };
        const callback2 = () => { counter2 += 1; };

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback1,
            type: ['press'],
        });

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback2,
            type: ['press'],
        });

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter1, 1);
        assert.equal(counter2, 1);
    });

    it('Should remove only a specific callback when using off with callback parameter', () => {
        let counter1 = 0;
        let counter2 = 0;

        const callback1 = () => { counter1 += 1; };
        const callback2 = () => { counter2 += 1; };

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback1,
            type: ['press'],
        });

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback2,
            type: ['press'],
        });

        // Remove only callback1
        interactionManager.keyboard.off(singleKey, callback1);

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter1, 0);
        assert.equal(counter2, 1);
    });

    it('Should execute all remaining callbacks after removing one', () => {
        let counter1 = 0;
        let counter2 = 0;
        let counter3 = 0;

        const callback1 = () => { counter1 += 1; };
        const callback2 = () => { counter2 += 1; };
        const callback3 = () => { counter3 += 1; };

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback1,
            type: ['press'],
        });

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback2,
            type: ['press'],
        });

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback3,
            type: ['press'],
        });

        // Remove callback2
        interactionManager.keyboard.off(singleKey, callback2);

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        interactionManager.keyboard.off(singleKey);

        assert.equal(counter1, 1);
        assert.equal(counter2, 0);
        assert.equal(counter3, 1);
    });

    it('Should remove entire key combination when last callback is removed', () => {
        const callback = () => {};

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback,
            type: ['press'],
        });

        // Verify it exists
        let keyAction = _IM.getKeys(singleKey);
        assert.isAbove(keyAction.length, 0);

        // Remove the only callback
        interactionManager.keyboard.off(singleKey, callback);

        // Verify the entire entry is removed
        keyAction = _IM.getKeys(singleKey);
        assert.equal(keyAction.length, 0);
    });

    it('Should remove all registered callbacks if combination is removed', () => {
        let hasExecuted = false;
        const callback1 = () => hasExecuted = true;
        const callback2 = () => hasExecuted = true;

        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback1,
            type: ['press'],
        });
        
        interactionManager.keyboard.on({
            keys: singleKey,
            callback: callback2,
            type: ['press'],
        });
        
        interactionManager.keyboard.off(singleKey);

        singleKey.forEach((key) => {
            simulateKeyDown(key);
        });

        assert.isFalse(hasExecuted);
    });
});
