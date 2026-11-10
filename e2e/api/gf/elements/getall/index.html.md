# gf.getAll

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/getall/

## gf.getAll(selector: string): Promise<DOMElements>

Retrieves all elements matching the specified selector.

- **`selector`**: The CSS selector to match elements against.
- Returns a promise that resolves to an array of **`DOMElement`** instances.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
    });
});
```
