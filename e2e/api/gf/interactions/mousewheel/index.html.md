# gf.mouseWheel

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/interactions/mousewheel/

## gf.mouseWheel(x: number, y: number, deltaX: number, deltaY: number): Promise<void>

Simulates a mouse wheel event at the specified coordinates with the given deltas.

- **`x`**: The X coordinate where the mouse wheel will be scrolled.
- **`y`**: The Y coordinate where the mouse wheel will be scrolled.
- **`deltaX`**: The horizontal scroll amount. Positive values scroll right, negative values scroll left.
- **`deltaY`**: The vertical scroll amount. Positive values scroll down, negative values scroll up.
- Returns a promise that resolves when the mouse wheel is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseWheel(100, 100, 50, 50);
    });
});
```
