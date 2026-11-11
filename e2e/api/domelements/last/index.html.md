# elements.last

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelements/last/

## elements.last(): Promise<DOMElement>

Retrieves the last element in the array.

- Returns a promise that resolves to the last `DOMElement` instance in the array.
- If the array is empty, the method throws an error.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
        const element = await elements.last();
    });
});
```
