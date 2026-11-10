# element.mouseWheel

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/mousewheel/

## element.mouseWheel(deltaX: number, deltaY: number): Promise<void>

Simulates a `mousewheel` event on the element.

- **`deltaX`**: The horizontal scroll amount. Positive values scroll right, negative values scroll left.
- **`deltaY`**: The vertical scroll amount. Positive values scroll down, negative values scroll up.
- Returns a promise that resolves when the mouse event is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.mouseWheel();
    });
});
```

**Note:** Wheeling on text elements is not supported.
