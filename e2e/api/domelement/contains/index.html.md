# element.contains

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/contains/

## element.contains(text: string): Promise<DOMElement>

Retrieves a DOM element containing the specified text starting from the current element.

- **`text`**: The text to search for in the DOM element.
- Returns a promise that resolves to `DOMElement` that contains the text.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElement = await element.contains('Hello, World!');
    });
});
```
