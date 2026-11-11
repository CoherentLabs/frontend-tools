# gf.text

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/text/

## gf.text(selector: string): Promise<string>

Retrieves the text content of the specified element.

- **`selector`**: The CSS selector of the element to retrieve.
- Returns a promise that resolves to the text content of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const text = await gf.text('.my-element');
    });
});
```
