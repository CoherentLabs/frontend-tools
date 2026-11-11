# element.getParent

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getparent/

## element.getParent(): Promise<DOMElement>

Retrieves the parent element of the current DOM element.

- Returns a promise that resolves to a `DOMElement` instances representing the parent of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const parent = await element.getParent();
    });
});
```
