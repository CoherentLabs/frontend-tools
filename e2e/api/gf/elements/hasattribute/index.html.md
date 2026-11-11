# gf.hasAttribute

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/hasattribute/

## gf.hasAttribute(selector: string, name: string): Promise<boolean>

Checks if the specified element has the specified attribute.

- **`selector`**: The CSS selector of the element to check.
- **`name`**: The name of the attribute to check for.
- Returns a promise that resolves to `true` if the element has the attribute, `false` otherwise.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const hasAttribute = await gf.hasAttribute('.my-element', 'data-id');
    });
});
```
