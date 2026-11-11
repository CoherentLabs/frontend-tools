# gf.contains

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/contains/

## gf.contains(text: string, selector: string): Promise<DOMElement>

Retrieves a DOM element containing the specified text.

- **`text`**: The text to search for in the DOM element.
- **`selector`**: The selector used to find the element that the search will be started from.
- Returns a promise that resolves to DOMElement that contains the text.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.contains('Hello, World!', '.my-element');
    });
});
```
