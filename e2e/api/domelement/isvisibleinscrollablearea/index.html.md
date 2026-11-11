# element.isVisibleInScrollableArea

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/isvisibleinscrollablearea/

## element.isVisibleInScrollableArea(scrollableArea: DOMElement):Promise<boolean>

Determines if the current DOM element is visible within a specified scrollable area.

- **`scrollableArea`**: The scrollable area to check visibility against. Must be an instance of DOMElement.
- Returns a promise that resolves to `true` if the element is visible within the scrollable area, otherwise `false`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const text = await element.isVisibleInScrollableArea(await gf.get('.element-wrapper'));
    });
});
```
