# element.isHidden

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/ishidden/

## element.isHidden(): Promise<boolean>

Checks if the element is hidden. An element is considered hidden if:

- Its `display` property is set to `none`.
- Its `visibility` property is set to `hidden`.
- Its `opacity` property is set to `0`.
- Returns a promise that resolves to `true` if the element is hidden, `false` otherwise.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isHidden = await element.isHidden();
    });
});
```
