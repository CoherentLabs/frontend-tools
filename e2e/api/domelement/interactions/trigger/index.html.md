# element.trigger

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/domelement/interactions/trigger/

## element.trigger(eventName: string, data?: Object): Promise<void>

Triggers a custom event on the element.

- **`eventName`**: The name of the custom event.
- **`data`**: Optional data to include in the event’s `detail` property.
- Returns a promise that resolves when the action is complete.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.trigger('test-event', { value: 1 });
    });
});
```

**Note:** Triggering custom event on text elements is not supported.
