import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export function waitDevtoolsEvent(event: string, triggerEventCommand: () => void, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
        eventEmitter.once(event, resolve);

        triggerEventCommand();

        setTimeout(() => {
            reject(new Error(`Timeout waiting for event: ${event}`));
        }, timeout);
    });
}