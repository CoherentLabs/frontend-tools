# elements.nth

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelements/nth/

## elements.nth(index: number): Promise<DOMElement>

Retrieves the element at the specified index.

- **`index`**: The index of the element to retrieve.
- Returns a promise that resolves to the `DOMElement` instance at the specified index.
- If the index is out of bounds, the method throws an error.
- The index is zero-based.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
        const element = await elements.nth(0);
    });
});
```
