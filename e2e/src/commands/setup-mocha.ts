import { gamefaceCommands } from './commands';
import { retryIfFails, sleep, KEYS, GAMEPAD_BUTTONS } from '../utils';

export function setupGlobals() {
    (global as any).gf = {
        sleep,
        retryIfFails,
        KEYS,
        GAMEPAD_BUTTONS,
        ...gamefaceCommands
    };
}