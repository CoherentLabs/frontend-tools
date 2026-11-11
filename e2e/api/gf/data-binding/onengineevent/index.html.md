# gf.onEngineEvent

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/data-binding/onengineevent/

## gf.onEngineEvent(eventName: string, triggerEventAction: Function): Promise<void>

Subscribes to a custom event triggered from the UI to the engine with a specified name.

- **`eventName`**: The name of the custom event to listen for.
- **`triggerEventAction`**: A function that performs an action on a UI element to trigger the custom event. For example, clicking a button.
- Returns a promise that resolves with the event data once the event is successfully handled.

## Usage

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const eventData = await gf.onEngineEvent('test-engine-event', async () => {
            await gf.click('#trigger-engine-event-btn');
        });

        assert.deepEqual(eventData, { value: 'test-engine-value' });
    });
});
```

In this example, the UI contains a button with the ID `trigger-engine-event-btn`. Clicking this button triggers the custom event `test-engine-event` with the data `{ value: 'test-engine-value' }`. The test script subscribes to this event and waits for it to be triggered before asserting the received data.

```html
<button id="trigger-engine-event-btn">Trigger Engine Event</button>
<script>
    document.getElementById('trigger-engine-event-btn').addEventListener('click', () => {
        engine.trigger('test-engine-event', { value: 'test-engine-value' });
    });
</script>
```
