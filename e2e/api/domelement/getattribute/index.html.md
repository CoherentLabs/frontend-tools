# element.getAttribute

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getattribute/

## element.getAttributes(): Promise<Object>

Retrieves the value of the specified attribute of the element.

- **`name`**: The name of the attribute to retrieve.
- Returns a promise that resolves to the value of the attribute or `null` if the attribute does not exist.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const attribute = await element.getAttribute('data-id');
    });
});
```
