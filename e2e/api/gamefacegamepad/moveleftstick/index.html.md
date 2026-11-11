# gamepad.moveLeftStick

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gamefacegamepad/moveleftstick/

## gamepad.moveLeftStick(x: number, y: number): Promise<void>

Moves the **left analog stick** to a specific position.

The stick coordinates must be values between `-1` and `1`.

- `x` — horizontal axis (left `-1` to right `1`)
- `y` — vertical axis (up `-1` to down `1`)

## Usage

```js
describe('Gamepad tests', function () {
    it('Moves the left analog stick', async () => {
        const gamepad = await gf.connectGamepad('gamepad');

        await gamepad.moveLeftStick(0.5, -1);
    });
});
```
