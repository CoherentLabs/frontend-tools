# element.getParent

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getparent/

## element.getParent(): Promise<DOMElement>

Retrieves the parent element of the current DOM element.

- Returns a promise that resolves to a `DOMElement` instances representing the parent of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const parent = await element.getParent();
    });
});
```
