# gf.getParent

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/getparent/

## gf.getParent(): Promise<DOMElement>

Retrieves the parent element of the specified element.

- **`selector`**: The CSS selector of the element to get the parent of.
- Returns a promise that resolves to a `DOMElement` instances representing the parent of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const parent = await gf.getParent('.my-element');
    });
});
```
