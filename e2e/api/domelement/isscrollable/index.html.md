# element.isScrollable

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/isscrollable/

## element.isScrollable(): Promise<boolean>

Checks if the element is scrollable.

- Returns a promise that resolves to `true` if the element is scrollable, `false` otherwise.
- An element is considered scrollable if it has an `overflow` property set to `auto`, `scroll`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isScrollable = await element.isScrollable();
    });
});
```
