# gamepad.release

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gamefacegamepad/release/

## gamepad.release(keys: number | number[]): Promise<void>

Immediately releases one or more pressed gamepad keys.

This method is useful when a key is being held indefinitely - such as during a `hold` action - and you want to manually release it.

If a key is not currently pressed, an error will be thrown.

## Usage

```js
describe('Gamepad tests', function () {
    it('Releases a gamepad key', async () => {
        const gamepad = await gf.connectGamepad('gamepad');

        await gamepad.hold(gf.GAMEPAD_BUTTONS.PAD_LEFT);
        await gamepad.release(gf.GAMEPAD_BUTTONS.PAD_LEFT);
    });
});
```

## Guide

Use this method in combination with gameface.hold
