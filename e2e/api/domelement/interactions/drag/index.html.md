# element.drag

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/drag/

## element.drag(x: number, y: number): Promise<void>

Moves the element to the specified coordinates by simulating a drag action.

- **`x`**: The target x-coordinate to drag the element to.
- **`y`**: The target y-coordinate to drag the element to.
- Returns a promise that resolves once the drag action is completed.

**Note:** Dragging is supported only for elements with drag functionality implemented via `mousedown`, `mousemove`, and `mouseup` events.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.drag(100, 100);
    });
});
```

**Note:** Dragging text elements is not supported.
