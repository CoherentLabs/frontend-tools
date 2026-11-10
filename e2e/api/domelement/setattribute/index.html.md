# element.setAttribute

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/setattribute/

## element.setAttribute(name: string, value: string): Promise<void>

Sets the value of the specified attribute of the element.

- **`name`**: The name of the attribute to set.
- **`value`**: The value to set for the attribute.
- Returns a promise that resolves when the attribute is set.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.setAttribute('data-id', '123');
    });
});
```
