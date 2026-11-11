# gf.scrollToBottom

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/page/scrolltobottom/

## gf.scrollToBottom(): Promise<void>

Scrolls the page to the scrollToBottom.

- Returns a promise that resolves when the scroll action is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        // Scroll to the bottom of the page
        await gf.scrollToBottom();
        // Proceed with further actions or assertions
    });
});
```
