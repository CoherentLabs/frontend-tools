# element.getPositionOnScreen

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/getpositiononscreen/

## element.getPositionOnScreen(): Promise<{ x: number, y: number } | null>

Retrieves the position of the element on the screen.

- Returns a promise that resolves to an object containing the `x` and `y` coordinates of the element on the screen.
- If the element is not visible, the method returns `null`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const position = await element.getPositionOnScreen();
    });
});
```

**Note:** Getting the position of a text element is not supported.

**Caution:** If you need to verify changes in an element’s position after an interaction (e.g., a click), ensure you wait for additional time before checking the position. For simplicity you can use the `gf.retryIfFails` method to retry the operation until it succeeds or times out. For example:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.click(); // Trigger a position change
        await gf.retryIfFails(async () => {
            const position = await element.getPositionOnScreen();
            assert(position.x === 200, 'Element position X should be 200');
        });
    });
});
```
