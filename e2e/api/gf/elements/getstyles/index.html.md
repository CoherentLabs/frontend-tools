# gf.getStyles

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/getstyles/

## gf.getStyles(selector: string): Promise<Object>

Retrieves the computed styles of the specified element.

- **`selector`**: The CSS selector of the element to retrieve.
- Returns a promise that resolves to an object containing the computed styles of the element.
- The object has the following structure: `{ property: value }`.

**Note:**

- The values are returned as strings.
- The styles are computed styles, not inline styles.
- The styles are not returned in the same format as the CSS file.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const styles = await gf.getStyles('.my-element');
    });
});
```
