# gf.connectGamepad

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/gamepad/connectgamepad/

## gf.connectGamepad(id: string): Promise<GamefaceGamepad>

Creates and connects a new virtual gamepad.

This method instantiates a new `GamefaceGamepad`, initializes it, registers it in the internal gamepad list, and returns the ready-to-use instance.

## Usage

```js
describe('Gamepad tests', function () {
    it('Connects a new gamepad', async () => {
        const gamepad = await gf.connectGamepad('my-gamepad');
    });
});
```
