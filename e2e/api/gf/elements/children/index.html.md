# gf.children

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/children/

## gf.children(selector: string): Promise<DOMElements>

Retrieves the children of the specified element.

- **`selector`**: The CSS selector of the element to get the children from.
- Returns a promise that resolves to an array of **`DOMElement`** instances.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const children = await gf.children('.my-element');
    });
});
```
