# element.hasAttribute

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/hasattribute/

## element.hasAttribute(name: string): Promise<boolean>

Checks if the element has the specified attribute.

- **`name`**: The name of the attribute to check for.
- Returns a promise that resolves to `true` if the element has the attribute, `false` otherwise.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const hasAttribute = await element.hasAttribute('data-id');
    });
});
```
