export const RETRY_INTERVAL = 100;

export interface KeyOptions {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}

export class Utils {
    constructor() {
        this.retryIfFails = this.retryIfFails.bind(this);
    }

    private _retryInner(action: () => Promise<any>, resolve: (value: any) => void, reject: (reason?: any) => void, remainingCount: number): void {
        action().then(resolve).catch((error) => {
            if (remainingCount) {
                remainingCount--;
                setTimeout(() => {
                    this._retryInner(action, resolve, reject, remainingCount);
                }, RETRY_INTERVAL);
            } else {
                reject(error);
            }
        });
    }

    /**
     * Retries the given action if it fails, up to a specified number of attempts.
     */
    public retryIfFails<T>(action: () => Promise<T>, retryCount: number = 10): Promise<T> {
        return new Promise((resolve, reject) => {
            this._retryInner(action, resolve, reject, retryCount);
        });
    }

    /**
     * Pauses the execution for a specified amount of time.
     */
    public async sleep(time: number): Promise<void> {
        return new Promise((r) => setTimeout(r, time));
    }

    /**
     * Determines which modifier key is pressed based on the provided options object.
     */
    public getPressedKey(options?: KeyOptions): number {
        if (options?.altKey) return 1;
        if (options?.ctrlKey) return 2;
        if (options?.metaKey) return 4;
        if (options?.shiftKey) return 8;
        return 0;
    }

    public KEYS = {
        ALT: 18,
        ARROW_DOWN: 40,
        ARROW_LEFT: 37,
        ARROW_RIGHT: 39,
        ARROW_UP: 38,
        BACKSPACE: 8,
        CAPS_LOCK: 20,
        CTRL: 17,
        DELETE: 46,
        END: 35,
        ENTER: 13,
        ESC: 27,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        HOME: 36,
        INSERT: 45,
        NUM_LOCK: 144,
        NUMPAD_ENTER: 13,
        NUMPAD_DASH: 109,
        NUMPAD_STAR: 106,
        NUMPAD_DOT: 110,
        NUMPAD_FORWARD_SLASH: 111,
        NUMPAD_PLUS: 107,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PAUSE: 19,
        PRINT_SCRN: 44,
        SCROLL_LOCK: 145,
        SHIFT: 16,
        SPACEBAR: 32,
        TAB: 9,
        QUOTE: 222,
        DASH: 189,
        COMMA: 188,
        DOT: 190,
        FORWARD_SLASH: 191,
        SEMI_COLON: 186,
        SQUARE_BRACKET_LEFT: 219,
        SQUARE_BRACKET_RIGHT: 221,
        BACKWARD_SLASH: 220,
        BACKTICK: 192,
        EQUAL: 187,
        SYSTEM: 91,
    };

    public GAMEPAD_BUTTONS = {
        FACE_BUTTON_DOWN: 0,
        FACE_BUTTON_RIGHT: 1,
        FACE_BUTTON_LEFT: 2,
        FACE_BUTTON_TOP: 3,
        LEFT_SHOULDER: 4,
        RIGHT_SHOULDER: 5,
        LEFT_SHOULDER_BOTTOM: 6,
        RIGHT_SHOULDER_BOTTOM: 7,
        SELECT: 8,
        START: 9,
        LEFT_ANALOGUE_STICK: 10,
        RIGHT_ANALOGUE_STICK: 11,
        PAD_UP: 12,
        PAD_DOWN: 13,
        PAD_LEFT: 14,
        PAD_RIGHT: 15,
        CENTER_BUTTON: 16,
    };
}

export const utils = new Utils();
export const { retryIfFails, sleep, getPressedKey, KEYS, GAMEPAD_BUTTONS } = utils;