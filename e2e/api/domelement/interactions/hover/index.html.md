# element.hover

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/hover/

## element.hover(): Promise<void>

Simulates hovering over the element.

- Returns a promise that resolves when the action is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.hover();
    });
});
```

**Note:** Hovering on text elements is not supported.
