# gf.getGamepad

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/gamepad/getgamepad/

## gf.getGamepad(id): GamefaceGamepad

Retrieves a connected gamepad instance by its identifier.

If the gamepad does not exist, an error is thrown.

## Usage

```js
describe('Gamepad tests', function () {
    it('Retrieves a connected gamepad by id', async () => {
        await gf.connectGamepad('pad-1');

        const gamepad = gf.getGamepad('pad-1');
        expect(gamepad.id).toBe('pad-1');
    });
});
```
