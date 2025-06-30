const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

function waitDevtoolsEvent(event, triggerEventCommand, timeout = 5000) {
    return new Promise(async (resolve, reject) => {
        eventEmitter.once(event, resolve);

        triggerEventCommand();

        setTimeout(() => {
            reject(new Error(`Timeout waiting for event: ${event}`));
        }, timeout);
    })
}

module.exports = {
    eventEmitter,
    waitDevtoolsEvent
};