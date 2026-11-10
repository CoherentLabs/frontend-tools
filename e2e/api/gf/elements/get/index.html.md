# gf.get

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/get/

## gf.get(selector: string): Promise<DOMElement>

Retrieves a DOM element based on the provided selector.

- **`selector`**: The CSS selector to query the DOM element.
- Returns a promise that resolves to the **`DOMElement`** instance.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
    });
});
```
