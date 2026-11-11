# gamepad.disconnect

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gamefacegamepad/disconnect/

## gamepad.disconnect(): Promise<void>

Disconnects the current gamepad instance.

This method removes the gamepad from the running UI environment. Useful when you need to simulate physically unplugging a controller.

- Returns a promise that resolves once the gamepad is successfully disconnected.

## Usage

```js
describe('Gamepad tests', function () {
    it('Disconnects a gamepad', async () => {
        const gamepad = await gf.connectGamepad('gamepad');

        // Perform some interactions...

        await gamepad.disconnect();
    });
});
```
