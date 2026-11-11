# element.scrollTo

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/scrollto/

## element.scrollTo(x: number, y: number): Promise<void>

Scrolls the DOM element to the specified coordinates.

- **`x`**: The X coordinate where the element will be scrolled to.
- **`y`**: The Y coordinate where the element will be scrolled to.
- Returns a promise that resolves when the action is complete.
- Will not perform the action on elements that are not scrollable - element is hidden or overflow is set to `visible` or `hidden`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.scroll-container');
        await element.scrollTo(0, 100);
    });
});
```
