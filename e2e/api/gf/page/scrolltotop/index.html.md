# gf.scrollToTop

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/page/scrolltotop/

## gf.scrollToTop(): Promise<void>

Scrolls the page to the top.

- Returns a promise that resolves when the scroll action is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        // Scroll to the top of the page
        await gf.scrollToTop();
        // Proceed with further actions or assertions
    });
});
```
