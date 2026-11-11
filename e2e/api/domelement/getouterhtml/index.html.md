# element.getOuterHTML

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getouterhtml/

## element.getOuterHTML(): Promise<string>

Retrieves the outer HTML of the element.

- Returns a promise that resolves to the outer HTML of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const outerHTML = await element.getOuterHTML();
    });
});
```
