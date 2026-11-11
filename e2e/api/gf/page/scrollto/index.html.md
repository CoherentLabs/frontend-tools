# gf.scrollTo

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/page/scrollto/

## gf.scrollTo(x: number, y: number): Promise<void>

Scrolls the page to the specified coordinates.

- **`x`**: The horizontal coordinate to scroll to.
- **`y`**: The vertical coordinate to scroll to.
- Returns a promise that resolves when the scroll action is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        // Scroll to the coordinates (100, 200)
        await gf.scrollTo(100, 200);
        // Proceed with further actions or assertions
    });
});
```
