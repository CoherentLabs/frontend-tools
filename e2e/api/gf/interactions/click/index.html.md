# gf.click

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/interactions/click/

## gf.click(selector: string): Promise<void>

Simulates a click on the specified element.

- **`selector`**: The CSS selector of the element to click.
- Returns a promise that resolves when the click is complete.

**Note:** Clicking on text elements is not supported.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.click('.my-button');
    });
});
```
