# gamepad.disconnect

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
