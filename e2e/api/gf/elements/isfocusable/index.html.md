# gf.isFocusable

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/isfocusable/

## gf.isFocusable(selector: string): Promise<boolean>

Checks if the specified element is focusable.

- **`selector`**: The CSS selector of the element to check.
- Returns a promise that resolves to `true` if the element is focusable, `false` otherwise.
- An element is considered focusable if:
  - It has a `tabindex` attribute.
  - Is not disabled - has not `disabled` attribute.
  - It is an input element (e.g., `<input>`, `<textarea>`).
  - It is a button element (e.g., `<button>`).
  - It is a link element (`<a>`).

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isFocusable = await gf.isFocusable('.my-element');
    });
});
```
