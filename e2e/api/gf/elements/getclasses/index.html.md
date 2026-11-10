# gf.getClasses

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/getclasses/

## gf.getClasses(selector: string): Promise<string[]>

Retrieves the classes of the specified element.

- **`selector`**: The CSS selector of the element to retrieve.
- Returns a promise that resolves to an array of strings representing the classes of the element.

**Note:** The classes are returned as an array of strings.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const classes = await gf.getClasses('.my-element');
    });
});
```
