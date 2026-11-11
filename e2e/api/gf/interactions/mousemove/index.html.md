# gf.mouseMove

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/interactions/mousemove/

## gf.mouseMove(x: number, y: number): Promise<void>

Moves the mouse to the specified coordinates.

- **`x`**: The X coordinate where the mouse will be moved.
- **`y`**: The Y coordinate where the mouse will be moved.
- Returns a promise that resolves when the mouse move is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseMove(100, 100);
    });
});
```
