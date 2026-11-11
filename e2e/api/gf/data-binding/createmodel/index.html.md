# gf.createModel

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/data-binding/createmodel/

## gf.createModel(name: string, model: Object): Promise<void>

Creates a new data bind model with the given name and data.

- **`name`**: The name of the model to be created.
- **`model`**: The data structure representing the model.
- Returns a promise that resolves once the model is successfully created.

**Note:** It is recommended to use this method within the `beforeAll` hook of a `describe` block. This ensures the model is initialized once and can be reused across all tests within the block. The model variable must be declared within the `describe` block to make it accessible to all tests.

## Usage

```js
describe('Test script', function () {
    const Model = { value: 'test', arr: [{ value: 1, class: 'one' }, { value: 2, class: 'two' }, { value: 3, class: 'three' }] };

    this.beforeAll('Should navigate to the test page', async () => {
        await gf.navigate('../../../frontend-tools/e2e/examples/data-binding.html');
        await gf.createModel('Model', Model);
    });

    it('Test 1', async () => {
        ...
    });
});
```
