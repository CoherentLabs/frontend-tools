# element.isFocused

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/isfocused/

## element.isFocused(): Promise<boolean>

Checks if the element is focused.

- Returns a promise that resolves to `true` if the element is focused, otherwise `false`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        assert.equal(await element.isFocused(), true);
    });
});
```
