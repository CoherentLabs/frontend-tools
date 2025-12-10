const assert = require('assert');

const registeredGamepadButtons = [0, 1];

describe('Gamepad', () => {
    before(async () => {
        await gf.navigate('http://localhost:54321/tests/');
        await gf.executeScript(() => interactionManager.gamepad.enabled = true);
    });

    beforeEach(async () => {
        await gf.connectGamepad('test-gamepad');
    });

    afterEach(async () => {
        await gf.disconnectGamepad('test-gamepad');
    });

    it('Should register gamepad action', async () => {
        const gamepadAction = await gf.executeScript((registeredGamepadButtons) => {
            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: () => { },
            });

            return _IM.getGamepadAction({ actions: registeredGamepadButtons, type: 'hold' });
        }, registeredGamepadButtons);

        assert(gamepadAction);
    });

    it('Should remove gamepad action', async () => {
        const keyAction = await gf.executeScript((registeredGamepadButtons) => {
            interactionManager.gamepad.off(registeredGamepadButtons);

            return _IM.getGamepadAction(registeredGamepadButtons);
        }, registeredGamepadButtons);

        assert(!keyAction);
    });

    it('Should execute gamepad action on button down', async () => {
        await gf.executeScript((registeredGamepadButtons) => {
            window.hasExecuted = false;
            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: () => {
                    window.hasExecuted = true;
                },
            });
        }, registeredGamepadButtons);

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.press(registeredGamepadButtons);

        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert(hasExecuted);
        });

        await gf.executeScript((registeredGamepadButtons) => interactionManager.gamepad.off(registeredGamepadButtons), registeredGamepadButtons);
    });

    it('Should execute gamepad action on joystick move', async () => {
        await gf.executeScript(() => {
            window.hasExecuted = false;
            interactionManager.gamepad.on({
                actions: ['left.joystick'],
                callback: () => {
                    window.hasExecuted = true;
                },
            });
        });

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.moveLeftStick(1, 1);
        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert(hasExecuted);
        });

        await gf.executeScript(() => interactionManager.gamepad.off(['left.joystick']));
    });

    it('Should execute gamepad action on joystick move in direction', async () => {
        await gf.executeScript(() => {
            window.hasExecuted = false;
            interactionManager.gamepad.on({
                actions: ['left.joystick.right'],
                callback: () => {
                    window.hasExecuted = true;
                },
            });
        });

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.moveLeftStick(1, 1);
        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert(hasExecuted);
        });

        await gf.executeScript(() => interactionManager.gamepad.off(['left.joystick.right']));
    });

    it('Should register multiple callbacks for the same action combination', async () => {
        await gf.executeScript((registeredGamepadButtons) => {
            window.counter1 = 0;
            window.counter2 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback1,
            });

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback2,
            });
        }, registeredGamepadButtons);

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.press(registeredGamepadButtons);

        await gf.retryIfFails(async () => {
            const { counter1, counter2 } = await gf.executeScript(() => ({ counter1: window.counter1, counter2: window.counter2 }));
            assert(counter1 >= 1);
            assert(counter2 >= 1);
        });

        await gf.executeScript((registeredGamepadButtons) => interactionManager.gamepad.off(registeredGamepadButtons), registeredGamepadButtons);
    });

    it('Should remove only a specific callback when using off with callback parameter', async () => {
        await gf.executeScript((registeredGamepadButtons) => {
            window.counter1 = 0;
            window.counter2 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback1,
            });

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback2,
            });

            // Remove only callback1
            interactionManager.gamepad.off(registeredGamepadButtons, window.callback1);
        }, registeredGamepadButtons);

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.press(registeredGamepadButtons);

        await gf.retryIfFails(async () => {
            const { counter1, counter2 } = await gf.executeScript(() => ({ counter1: window.counter1, counter2: window.counter2 }));
            assert.equal(counter1, 0);
            assert(counter2 >= 1);
        });

        await gf.executeScript((registeredGamepadButtons) => interactionManager.gamepad.off(registeredGamepadButtons), registeredGamepadButtons);
    });

    it('Should execute all remaining callbacks after removing one', async () => {
        await gf.executeScript((registeredGamepadButtons) => {
            window.counter1 = 0;
            window.counter2 = 0;
            window.counter3 = 0;

            window.callback1 = () => { window.counter1 += 1; };
            window.callback2 = () => { window.counter2 += 1; };
            window.callback3 = () => { window.counter3 += 1; };

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback1,
            });

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback2,
            });

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback3,
            });

            // Remove callback2
            interactionManager.gamepad.off(registeredGamepadButtons, window.callback2);
        }, registeredGamepadButtons);

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.press(registeredGamepadButtons);

        await gf.retryIfFails(async () => {
            const { counter1, counter2, counter3 } = await gf.executeScript(() => ({ counter1: window.counter1, counter2: window.counter2, counter3: window.counter3 }));
            assert(counter1 >= 1);
            assert.equal(counter2, 0);
            assert(counter3 >= 1);
        });

        await gf.executeScript((registeredGamepadButtons) => interactionManager.gamepad.off(registeredGamepadButtons), registeredGamepadButtons);
    });

    it('Should remove entire action when last callback is removed', async () => {
        let gamepadAction = await gf.executeScript((registeredGamepadButtons) => {
            window.callback = () => { };

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback,
            });

            return _IM.getGamepadActions(registeredGamepadButtons);
        }, registeredGamepadButtons);

        assert(gamepadAction.length > 0);

        gamepadAction = await gf.executeScript((registeredGamepadButtons) => {
            // Remove the only callback
            interactionManager.gamepad.off(registeredGamepadButtons, window.callback);

            // Verify the entire entry is removed
            return _IM.getGamepadActions(registeredGamepadButtons);
        }, registeredGamepadButtons);

        assert.equal(gamepadAction.length, 0);
    });

    it('Should remove all registered callbacks if action combination is removed', async () => {
        await gf.executeScript((registeredGamepadButtons) => {
            window.hasExecuted = false;
            window.callback1 = () => window.hasExecuted = true;
            window.callback2 = () => window.hasExecuted = true;

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback1,
            });

            interactionManager.gamepad.on({
                actions: registeredGamepadButtons,
                callback: window.callback2,
            });

            interactionManager.gamepad.off(registeredGamepadButtons);
        }, registeredGamepadButtons);

        const gamepad = await gf.getGamepad('test-gamepad');
        await gamepad.press(registeredGamepadButtons);

        await gf.retryIfFails(async () => {
            const hasExecuted = await gf.executeScript(() => window.hasExecuted);
            assert.notEqual(hasExecuted, true);
        });
    });
});
