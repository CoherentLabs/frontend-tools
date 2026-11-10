# element.hover

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
