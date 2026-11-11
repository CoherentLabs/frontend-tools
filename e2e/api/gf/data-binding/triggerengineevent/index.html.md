# gf.triggerEngineEvent

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/data-binding/triggerengineevent/

## gf.triggerEngineEvent(eventName: string, data: Object): Promise<void>

Simulates the dispatch of a custom event from the engine with a specified name and associated data.

- **`eventName`**: The name of the custom event to trigger.
- **`data`**: The payload to include in the event.
- Returns a promise that resolves once the event has been successfully triggered.

**Tip:** This method is particularly useful for simulating engine events that the UI listens to.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        // For demonstration purposes, we subscribe to the 'custom-event' from the engine here. In practice, this should be handled within the UI.
        await gf.executeBindingScript(() => {
            engine.on('custom-event', (data) => {
                document.querySelector('#custom-engine-event').textContent = data.value;
            });
        });
        await gf.triggerEngineEvent('custom-event', { value: 1 });
    });
});
```
