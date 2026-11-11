# element.find

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/find/

## element.find(selector: string): Promise<DOMElement>

Finds a DOM element using the specified selector starting from the current element.

- **`selector`**: The CSS selector to query the DOM element.
- Returns a promise that resolves to the `DOMElement` instance.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElement = await element.find('.child-element');
    });
});
```
