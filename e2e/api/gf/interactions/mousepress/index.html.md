# gf.mousePress

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/interactions/mousepress/

## gf.mousePress(x?: number, y?: number, button?: 'left'|'middle'|'right', modifiers?: number): Promise<void>

Simulates a mouse down event at the specified coordinates on the document.

- **`x`**: **`(Default = 0)`** The X coordinate where the mouse will be pressed.
- **`y`**: **`(Default = 0)`** The Y coordinate where the mouse will be pressed.
- **`buttton`**: **`(Default = 'left')`** Specifies the mouse button that will be used for the event.
- **`modifiers`**: **`(Default = 0)`** Bitfield representing modifier keys (e.g., Alt, Ctrl, Meta, Shift).
- Returns a promise that resolves when the mouse press is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mousePress();
        await gf.mousePress(100, 100, 'right');
    });
});
```
