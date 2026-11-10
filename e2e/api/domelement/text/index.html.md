# element.text

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/text/

## element.text(): Promise<string>

Retrieves the text content of the element.

- Returns a promise that resolves to the text content of the element.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const text = await element.text();
    });
});
```
