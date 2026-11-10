# gf.isHidden

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/elements/ishidden/

## gf.isHidden(selector: string): Promise<boolean>

Checks if the specified element is hidden.

- **`selector`**: The CSS selector of the element to check.
- Returns a promise that resolves to `true` if the element is hidden, `false` otherwise.
- An element is considered hidden if:
  - Its `display` property is set to `none`.
  - Its `visibility` property is set to `hidden`.
  - Its `opacity` property is set to `0`.

**Note:** This method does not check if the element is off-screen.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isHidden = await gf.isHidden('.my-element');
    });
});
```
