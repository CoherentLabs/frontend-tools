# element.findAll

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/findall/

## element.findAll(selector: string): Promise<DOMElements>

Finds all elements matching the specified selector starting from the current element.

- **`selector`**: The CSS selector to match elements against.
- Returns a promise that resolves to an array of `DOMElement` instances.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElements = await element.findAll('.child-elements');
    });
});
```
