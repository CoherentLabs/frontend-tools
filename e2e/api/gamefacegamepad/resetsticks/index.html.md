# gamepad.resetSticks

Source: https://frontend-tools.coherent-labs.com/e2e/api/gamefacegamepad/resetsticks/

## gamepad.resetSticks(): Promise<void>

Resets all analog sticks to their **neutral (0,0)** position.

Useful after a sequence of stick movements when you want to ensure a clean starting state.

## Usage

```js
describe('Gamepad tests', function () {
    it('Resets all gamepad sticks', async () => {
        const gamepad = await gf.connectGamepad('gamepad');

        await gamepad.moveLeftStick(1, 1);
        await gamepad.moveRightStick(-1, 0.5);

        await gamepad.resetSticks();
    });
});
```
