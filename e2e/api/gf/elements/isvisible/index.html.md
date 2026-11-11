# gf.isVisible

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/isvisible/

## gf.isVisible(selector: string): Promise<boolean>

Checks if the specified element is visible.

- **`selector`**: The CSS selector of the element to check.
- Returns a promise that resolves to `true` if the element is visible, `false` otherwise.
- An element is considered visible if:
  - Its `display` property is not set to `none`.
  - Its `visibility` property is not set to `hidden`.
  - Its `opacity` property is not set to `0`.
  - It is not off-screen.
  - It has a positive width and height.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isVisible = await gf.isVisible('.my-element');
    });
});
```
