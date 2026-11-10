# elements.last

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
