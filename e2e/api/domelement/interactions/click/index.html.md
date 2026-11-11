# element.click

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/click/

## element.click(options?: Object): Promise<void>

Simulates a click on the element.

- **`options.altKey`**: Indicates if the Alt key is pressed.
- **`options.ctrlKey`**: Indicates if the Ctrl key is pressed.
- **`options.metaKey`**: Indicates if the Meta key is pressed.
- **`options.shiftKey`**: Indicates if the Shift key is pressed.
- Returns a promise that resolves when the click is complete.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.click();
    });
});
```

**Note:** Clicking on text elements is not supported.
