# gf.mouseRelease

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/interactions/mouserelease/

## gf.mouseRelease(x?: number, y?: number, button?: 'left'|'middle'|'right', modifiers?: number): Promise<void>

Simulates a mouse release event at the specified coordinates on the document.

- **`x`**: **`(Default = 0)`** The X coordinate where the mouse will be released.
- **`y`**: **`(Default = 0)`** The Y coordinate where the mouse will be released.
- **`buttton`**: **`(Default = 'left')`** Specifies the mouse button that will be used for the event.
- **`modifiers`**: **`(Default = 0)`** Bitfield representing modifier keys (e.g., Alt, Ctrl, Meta, Shift).
- Returns a promise that resolves when the mouse release is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseRelease();
        await gf.mouseRelease(100, 100, 'right');
    });
});
```
