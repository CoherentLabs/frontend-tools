# element.getValue

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getvalue/

## element.getValue(): Promise<void>

Retrieves the value of the element if it is an input or textarea.

- Returns a promise that resolves when the action is complete with the element value.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const input = await gf.get('input');
        assert.equal(await input.getValue(), 'text');
    });
});
```
