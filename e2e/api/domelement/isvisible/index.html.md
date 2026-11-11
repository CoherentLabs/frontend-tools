# element.isVisible

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/isvisible/

## element.isVisible(): Promise<boolean>

Checks if the element is visible. An element is considered visible if:

- Its `display` property is not set to `none`.
- Its `visibility` property is not set to `hidden`.
- Its `opacity` property is not set to `0`.
- It is not off-screen.
- It has a positive width and height.
- Returns a promise that resolves to `true` if the element is visible, `false` otherwise.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isVisible = await element.isVisible();
    });
});
```
