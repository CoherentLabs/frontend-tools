# element.scroll

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/scroll/

## element.scroll(deltaX: number, deltaY: number): Promise<void>

Scrolls the element by the specified delta values.

- **`deltaX`**: **`(Default = 0)`** The horizontal scroll amount. Positive values scroll right, negative values scroll left.
- **`deltaY`**: **`(Default = 0)`** The vertical scroll amount. Positive values scroll down, negative values scroll up.
- Returns a promise that resolves when the action is complete.
- Will not perform the action on elements that are not scrollable - element is hidden or overflow is set to `visible` or `hidden`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.scroll-container');
        await element.scroll(0, 100);
    });
});
```
