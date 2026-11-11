# element.scrollIntoView

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/scrollintoview/

## element.scrollIntoView(scrollableArea?: DOMElement): Promise<void>

Scrolls the current DOM element into view within a scrollable area. If the scrollable area is not provided, the method attempts to locate the first scrollable parent element in the DOM hierarchy.

- **`scrollableArea`**: **`(Default = null)`** The scrollable area in which the element should be scrolled into view.
- Returns a promise that resolves when the action is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.scrollIntoView();
    });
});
```
