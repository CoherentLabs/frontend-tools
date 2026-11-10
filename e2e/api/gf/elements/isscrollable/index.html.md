# gf.isScrollable

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/isscrollable/

## gf.isScrollable(selector: string): Promise<boolean>

Checks if the specified element is scrollable.

- **`selector`**: The CSS selector of the element to check.
- Returns a promise that resolves to `true` if the element is scrollable, `false` otherwise.
- An element is considered scrollable if it has an `overflow` property set to `auto` or `scroll`.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isScrollable = await gf.isScrollable('.my-element');
    });
});
```
