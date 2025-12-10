const assert = require('assert');

const singleKey = ['A'];
const keyCombination = ['B', 'C'];

describe('Keyboard', () => {
    before(async () => {
        await gf.navigate('http://localhost:54321/tests/');
    });

    after(async () => {
        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should register key action', async () => {
        const keyAction = await gf.executeScript((singleKey) => {
            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => { },
                type: ['press'],
            });

            return _IM.getKeys(singleKey);
        }, singleKey);

        assert(keyAction.length > 0);
    });

    it('Should remove key action', async () => {
        const keyAction = await gf.executeScript((singleKey) => {
            interactionManager.keyboard.off(singleKey);

            return _IM.getKeys(singleKey);
        }, singleKey);

        assert.equal(keyAction.length, 0);
    });

    it('Should execute key action on key down', async () => {
        await gf.executeScript((singleKey) => {
            window.hasExecuted = false;
            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.hasExecuted = true;
                },
                type: ['press'],
            });
        }, singleKey);

        await gf.keyPress(singleKey[0]);
        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert(hasExecuted);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should execute key action on key combination', async () => {
        await gf.executeScript((keyCombination) => {
            window.hasExecuted = false;
            interactionManager.keyboard.on({
                keys: keyCombination,
                callback: () => {
                    window.hasExecuted = true;
                },
                type: ['press'],
            });
        }, keyCombination);

        // To simulate multiple keys pressed
        keyCombination.map(async (key) => await gf.keyDown(key));
        keyCombination.map(async (key) => await gf.keyUp(key));

        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert(hasExecuted);
        });

        await gf.executeScript((keyCombination) => interactionManager.keyboard.off(keyCombination), keyCombination);
    });

    it('Should execute one time on key down with type press', async () => {
        await gf.executeScript((singleKey) => {
            window.counter = 0;

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.counter += 1;
                },
                type: ['press'],
            });
        }, singleKey);

        await gf.keyPress(singleKey[0]);

        await gf.retryIfFails(async () => {
            const counter = await gf.executeScript(() => window.counter);
            assert.equal(counter, 1);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should execute multiple times on key down with type hold', async () => {
        const count = 10;

        await gf.executeScript((singleKey) => {
            window.counter = 0;

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.counter += 1;
                },
                type: ['hold'],
            });
        }, singleKey);

        await gf.keyDown(singleKey[0], void 0, count);

        await gf.retryIfFails(async () => {
            const counter = await gf.executeScript(() => window.counter);
            assert.equal(counter, count);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should execute on key up with type lift', async () => {
        await gf.executeScript((singleKey) => {
            window.counter = 0;

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.counter += 1;
                },
                type: ['lift'],
            });
        }, singleKey);

        await gf.keyUp(singleKey[0]);

        await gf.retryIfFails(async () => {
            const counter = await gf.executeScript(() => window.counter);
            assert.equal(counter, 1);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should execute on key up with type lift for two lift events', async () => {
        const secondActionKeys = ['B'];

        await gf.executeScript((singleKey, secondActionKeys) => {
            window.liftedKeys = [];

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.liftedKeys.push(singleKey[0]);
                },
                type: ['lift'],
            });

            interactionManager.keyboard.on({
                keys: secondActionKeys,
                callback: () => {
                    window.liftedKeys.push(secondActionKeys[0]);
                },
                type: ['lift'],
            });
        }, singleKey, secondActionKeys);

        await gf.keyUp(singleKey[0]);
        await gf.keyUp(secondActionKeys[0]);

        await gf.retryIfFails(async () => {
            const liftedKeys = await gf.executeScript(() => window.liftedKeys);
            assert.deepEqual(liftedKeys, ['A', 'B']);
        });

        await gf.executeScript((singleKey, secondActionKeys) => {
            interactionManager.keyboard.off(singleKey);
            interactionManager.keyboard.off(secondActionKeys);
        }, singleKey, secondActionKeys);
    });

    it('Should execute the same action on two or more types', async () => {
        let counter = 0;

        await gf.executeScript((singleKey) => {
            window.counter = 0;

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: () => {
                    window.counter += 1;
                },
                type: ['press', 'lift'],
            });
        }, singleKey);

        await gf.keyDown(singleKey[0]);
        await gf.keyUp(singleKey[0]);


        await gf.retryIfFails(async () => {
            const counter = await gf.executeScript(() => window.counter);
            assert.equal(counter, 2);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should register multiple callbacks for the same key combination', async () => {
        await gf.executeScript((singleKey) => {
            window.counter1 = 0;
            window.counter2 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback1,
                type: ['press'],
            });

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback2,
                type: ['press'],
            });

        }, singleKey);

        await gf.keyDown(singleKey[0]);

        await gf.retryIfFails(async () => {
            const [counter1, counter2] = await gf.executeScript(() => [window.counter1, window.counter2]);
            assert.equal(counter1, 1);
            assert.equal(counter2, 1);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should remove only a specific callback when using off with callback parameter', async () => {
        await gf.executeScript((singleKey) => {
            window.counter1 = 0;
            window.counter2 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback1,
                type: ['press'],
            });

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback2,
                type: ['press'],
            });
            // Remove only callback1
            interactionManager.keyboard.off(singleKey, window.callback1);
        }, singleKey);

        await gf.keyDown(singleKey[0]);

        await gf.retryIfFails(async () => {
            const [counter1, counter2] = await gf.executeScript(() => [window.counter1, window.counter2]);
            assert.equal(counter1, 0);
            assert.equal(counter2, 1);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should execute all remaining callbacks after removing one', async () => {
        await gf.executeScript((singleKey) => {
            window.counter1 = 0;
            window.counter2 = 0;
            window.counter3 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };
            window.callback3 = () => { window.counter3 += 1; };

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback1,
                type: ['press'],
            });

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback2,
                type: ['press'],
            });

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: window.callback3,
                type: ['press'],
            });

            // Remove only callback1
            interactionManager.keyboard.off(singleKey, window.callback2);
        }, singleKey);

        await gf.keyDown(singleKey[0]);

        await gf.retryIfFails(async () => {
            const [counter1, counter2, counter3] = await gf.executeScript(() => [window.counter1, window.counter2, window.counter3]);
            assert.equal(counter1, 1);
            assert.equal(counter2, 0);
            assert.equal(counter3, 1);
        });

        await gf.executeScript((singleKey) => interactionManager.keyboard.off(singleKey), singleKey);
    });

    it('Should remove entire key combination when last callback is removed', async () => {
        let keyAction = await gf.executeScript((singleKey) => {
            const callback = () => { };

            interactionManager.keyboard.on({
                keys: singleKey,
                callback: callback,
                type: ['press'],
            });

            return _IM.getKeys(singleKey);
        }, singleKey);

        assert(keyAction.length > 0);

        keyAction = await gf.executeScript((singleKey) => {
            interactionManager.keyboard.off(singleKey)
            return _IM.getKeys(singleKey);
        }, singleKey);

        assert.equal(keyAction.length, 0);
    });

    it('Should remove all registered callbacks if combination is removed', async () => {
        await gf.executeScript((singleKey) => {
            window.hasExecuted = false;
            const callback1 = () => window.hasExecuted = true;
            const callback2 = () => window.hasExecuted = true;

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
        }, singleKey);

        await gf.keyDown(singleKey[0]);

        const hasExecuted = await gf.executeScript(() => window.hasExecuted);
        assert.equal(hasExecuted, false);
    });
});
