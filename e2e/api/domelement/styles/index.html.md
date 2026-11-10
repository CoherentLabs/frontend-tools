# element.styles

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/styles/

## element.styles(): Promise<Object>

Retrieves the computed styles of the element.

- Returns a promise that resolves to an object containing the computed styles of the element.
- The object has the following structure: `{ property: value }`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const styles = await element.styles();
    });
});
```
