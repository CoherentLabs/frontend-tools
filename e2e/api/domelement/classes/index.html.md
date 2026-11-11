# element.classes

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/classes/

## element.classes(): Promise<string[]>

Retrieves the classes of the element.

- Returns a promise that resolves to an array of strings representing the classes of the element.

**Note:** The classes are returned as an array of strings.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const classes = await element.classes();
    });
});
```
