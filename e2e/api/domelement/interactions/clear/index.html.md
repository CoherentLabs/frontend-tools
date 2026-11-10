# element.clear

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/clear/

## element.clear(): Promise<void>

Clears the value of the element if it is an input or textarea.

- Returns a promise that resolves when the action is complete.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const input = await gf.get('input');
        await input.clear();
    });
});
```
