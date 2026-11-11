# element.focus

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/focus/

## element.focus(): Promise<boolean>

Focuses the DOM element.

- Returns a promise that resolves when the element is focused.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.focus();
        assert.equal(await element.isFocused(), true);
    });
});
```

**Note:** Focusing text elements is not supported.
