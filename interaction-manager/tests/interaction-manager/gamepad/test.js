/* eslint-disable max-lines-per-function */
/* global _IM */
const registeredGamepadButtons = [0, 1];

const simulateGamepadButton = () => {
    const gamepadButtons = [{ pressed: true }, { pressed: true }, { pressed: false }, { pressed: false }];

    interactionManager.gamepad.handleButtons(gamepadButtons);
};

const simulateLeftJoystick = () => {
    const axes = [1, 1];

    interactionManager.gamepad.handleJoysticks(axes);
};

describe('Gamepad', () => {
    it('Should register gamepad action', () => {
        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: () => {},
        });

        const gamepadAction = _IM.getGamepadAction({ actions: registeredGamepadButtons, type: 'hold' });

        assert.exists(gamepadAction);
    });

    it('Should remove gamepad action', () => {
        interactionManager.gamepad.off(registeredGamepadButtons);

        const keyAction = _IM.getGamepadAction(registeredGamepadButtons);

        assert.notExists(keyAction);
    });

    it('Should execute gamepad action on button down', () => {
        let hasExecuted = false;
        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: () => {
                hasExecuted = true;
            },
        });

        simulateGamepadButton();

        interactionManager.gamepad.off(registeredGamepadButtons);

        assert.isTrue(hasExecuted);
    });

    it('Should execute gamepad action on joystick move', () => {
        let hasExecuted = false;
        interactionManager.gamepad.on({
            actions: ['left.joystick'],
            callback: () => {
                hasExecuted = true;
            },
        });

        simulateLeftJoystick();

        interactionManager.gamepad.off(['left.joystick']);

        assert.isTrue(hasExecuted);
    });

    it('Should execute gamepad action on joystick move in direction', () => {
        let hasExecuted = false;
        interactionManager.gamepad.on({
            actions: ['left.joystick.right'],
            callback: () => {
                hasExecuted = true;
            },
        });

        simulateLeftJoystick();

        interactionManager.gamepad.off(['left.joystick.right']);

        assert.isTrue(hasExecuted);
    });

    it('Should register multiple callbacks for the same action combination', () => {
        let counter1 = 0;
        let counter2 = 0;

        const callback1 = () => { counter1 += 1; };
        const callback2 = () => { counter2 += 1; };

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback1,
        });

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback2,
        });

        simulateGamepadButton();

        interactionManager.gamepad.off(registeredGamepadButtons);

        assert.equal(counter1, 1);
        assert.equal(counter2, 1);
    });

    it('Should remove only a specific callback when using off with callback parameter', () => {
        let counter1 = 0;
        let counter2 = 0;

        const callback1 = () => { counter1 += 1; };
        const callback2 = () => { counter2 += 1; };

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback1,
        });

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback2,
        });

        // Remove only callback1
        interactionManager.gamepad.off(registeredGamepadButtons, callback1);

        simulateGamepadButton();

        interactionManager.gamepad.off(registeredGamepadButtons);

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

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback1,
        });

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback2,
        });

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback3,
        });

        // Remove callback2
        interactionManager.gamepad.off(registeredGamepadButtons, callback2);

        simulateGamepadButton();

        interactionManager.gamepad.off(registeredGamepadButtons);

        assert.equal(counter1, 1);
        assert.equal(counter2, 0);
        assert.equal(counter3, 1);
    });

    it('Should remove entire action when last callback is removed', () => {
        const callback = () => {};

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: callback,
        });

        // Verify it exists
        let gamepadAction = _IM.getGamepadActions(registeredGamepadButtons);
        assert.isAbove(gamepadAction.length, 0);

        // Remove the only callback
        interactionManager.gamepad.off(registeredGamepadButtons, callback);

        // Verify the entire entry is removed
        gamepadAction = _IM.getGamepadActions(registeredGamepadButtons);
        assert.equal(gamepadAction.length, 0);
    });

    it('Should remove all registered callbacks if action combination is removed', () => {
        let hasExecuted = false;
        const callback1 = () => hasExecuted = true;
        const callback2 = () => hasExecuted = true;

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: () => callback1,
        });

        interactionManager.gamepad.on({
            actions: registeredGamepadButtons,
            callback: () => callback2,
        });

        interactionManager.gamepad.off(registeredGamepadButtons);
        
        simulateGamepadButton();

        assert.isFalse(hasExecuted);
    });
});
