# element.getAttributes

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getattributes/

## element.getAttributes(): Promise<Object>

Retrieves the attributes of the element.

- Returns a promise that resolves to an object containing the attributes of the element.
- The object has the following structure: `{ attribute: value }`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const attributes = await element.getAttributes();
    });
});
```
