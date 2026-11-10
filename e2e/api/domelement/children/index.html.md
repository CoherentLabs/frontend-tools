# element.children

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/children/

## element.children(): Promise<DOMElements>

Retrieves the children of the element.

- Returns a promise that resolves to an array of `DOMElement` instances representing the children of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const children = await element.children();
    });
});
```
