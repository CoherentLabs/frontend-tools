# element.getInnerHTML

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getinnerhtml/

## element.getInnerHTML(): Promise<string>

Retrieves the inner HTML of the element.

- Returns a promise that resolves to the inner HTML of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const innerHTML = await element.getInnerHTML();
    });
});
```
