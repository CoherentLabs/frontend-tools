/**
 * Register and trigger actions to be used in project
 */
declare class Actions {
    /**
     * Register an action
     */
    register(action: string, callback: Function): void;
    /**
     * Remove a registered action
     */
    remove(action: string): void;
    /**
     * Trigger an action
     */
    execute(action: string, value?: any): void;
}

declare const actions_2: Actions;
export { actions_2 as actions }

declare interface AreaState {
    elements: HTMLElement[];
    distance: number;
    overflow: {
        x: number;
        y: number;
    };
}

declare type AxisGamepadOptions = {
    actions: AxisInput[];
    type?: 'hold';
    callback: ((axes: [number, number]) => void) | string;
};

export declare type AxisInput = typeof mappings_2.axisAliases[number];

declare type ButtonGamepadOptions = {
    actions: ButtonInput[];
    type?: 'hold' | 'press';
    callback: ((buttons: GamepadButton[]) => void) | string;
};

export declare type ButtonInput = keyof typeof mappings_2.aliases | NumericValues<typeof mappings_2>;

declare type CustomKeysInput = Partial<Record<Direction, KeyName | KeyName[]>>;

declare type Direction = typeof directions[number];

declare const directions: readonly ["down", "up", "left", "right"];

/**
 * Makes an element draggable
 */
declare abstract class DragBase {
    protected options: DragBaseOptions;
    protected draggableElements: NodeListOf<HTMLElement> | HTMLElement[];
    protected draggedElement: HTMLElement | null;
    protected enabled: boolean;
    protected offset: Offset;
    protected abstract onMouseDown(e: MouseEvent): void;
    protected abstract onMouseMove(e: MouseEvent): void;
    protected abstract onMouseUp(): void;
    constructor(options: DragBaseOptions);
    /**
     * Get the index of the dragged item in the draggableElements
     */
    protected get draggedItemIndex(): number;
    /**
     * Gets the body scroll offset to calculate in the dragging
     */
    protected get bodyScrollOffset(): {
        x: number;
        y: number;
    };
    protected setPointerOffset(clientX: number, clientY: number, target: HTMLElement): void;
}

declare interface DragBaseOptions {
    element: string;
    restrictTo?: string;
    dragClass?: string;
    lockAxis?: 'x' | 'y';
    onDragStart?: (element: HTMLElement) => void;
    onDragMove?: (position: {
        x: number;
        y: number;
    }) => void;
    onDragEnd?: (element: HTMLElement) => void;
}

/**
 * Makes an element draggable
 */
declare class draggable_2 extends DragBase {
    readonly actionName: string;
    private elementRect;
    private restrict;
    private touchEvents;
    private _touchEnabled;
    constructor(options: DragBaseOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    private init;
    /**
     * Removes the eventlisteners
     */
    deinit(): void;
    /**
     * mousedown event handler
     */
    protected onMouseDown(event: MouseEvent): void;
    /**
     * mousemove event handler
     */
    protected onMouseMove(event: MouseEvent): void;
    /**
     * mouseup event handler
     */
    protected onMouseUp(): void;
    /**
     * Register dragging as an action to be able to use it externally
     */
    private registerDragActions;
    /**
     * Removes the registered action
     */
    private removeDragActions;
    /**
     * Add touch gestures to drag the element
     */
    private addTouchEvents;
    /**
     * Removes the touch gestures
     */
    private removeTouchEvents;
    /**
     * Sets the bounds if a dragged element has to be restricted
     */
    private setRestriction;
}
export { draggable_2 as draggable }

declare interface DropEvent {
    preventDefault: () => void;
    target: HTMLElement;
    dropzone: HTMLElement;
}

/**
 * Makes an element draggable with dropzones
 */
declare class dropzone_2 extends DragBase {
    protected options: DropzoneOptions;
    readonly actionName: string;
    readonly automaticAction: string;
    dropzones: HTMLElement[];
    draggedOver: HTMLElement | null;
    private touchEvents;
    private _touchEnabled;
    constructor(options: DropzoneOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    private init;
    /**
     * Deinitializes the dragging
     */
    deinit(): void;
    /**
     * mousedown event handler
     */
    protected onMouseDown(event: MouseEvent): void;
    /**
     * mousemove event handler
     */
    protected onMouseMove(event: MouseEvent): void;
    /**
     * mouseup event handler
     */
    protected onMouseUp(): void;
    /**
     * Handler for the mouseenter event
     */
    protected onMouseEnter(event: MouseEvent): void;
    /**
     * Handler for the mouseleave event
     */
    protected onMouseLeave(): void;
    /**
     * Register dragging as an action to be able to use it externally
     */
    private registerDragActions;
    /**
     * Removes the registered actions
     */
    private removeActions;
    /**
     * Adds touch events to the draggable elements
     */
    private addTouchEvents;
    /**
     * Removes the touch gestures
     */
    private removeTouchEvents;
    /**
     * Automatically drags an element to a dropzone
     * @param {Object} options
     * @param {number} options.elementIndex The index of the element you want to move
     * @param {number} options.dropzoneIndex The index of the dropzone you want to move the element to
     */
    private automaticMove;
    /**
     * Saves the dropzones
     */
    private createDropzones;
    /**
     * Handler when you drop the dragged item
     */
    private handleDrop;
    /**
     * Shifts the element to the nearest empty space
     */
    private shiftElements;
}
export { dropzone_2 as dropzone }

declare interface DropzoneOptions extends DragBaseOptions {
    dropzones: string[];
    dragStyle?: string;
    dropzoneActiveClass?: string;
    dropType?: 'switch' | 'add' | 'shift' | 'none' | 'ignore';
    onDropZoneEnter?: (element: HTMLElement) => void;
    onDropZoneLeave?: (element: HTMLElement) => void;
    onDrop?: (event: DropEvent) => void;
}

declare type Edge = 'bottom' | 'right' | 'bottomRight';

/**
 * Gamepad class that handles all gamepad interactions
 */
declare class Gamepad_2 {
    private _gamepadEnabled;
    private _pollingInterval;
    private pollingIntervalRef?;
    private _pressedAction;
    private _pressedButtons;
    constructor();
    /**
     * Allow gamepads to be connected
     */
    set enabled(isEnabled: boolean);
    set pollingInterval(interval: number);
    /**
     *
     * @param {Object} options
     * @param {string[] | number[]} options.actions - Action to trigger the callback. Can be name of button or joystick
     * @param {'press' | 'hold'} options.type - The type of action to trigger the callback. The available options are hold and press.
     * @param {function | string} options.callback - Function(s) or action(s) to be triggered on the set action
     */
    on(options: ButtonGamepadOptions): void;
    on(options: AxisGamepadOptions): void;
    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove
     */
    off(actions: GamepadInput[], callback?: Function | string): void;
    /**
     * Loop that handles button presses and axis movement
     */
    private startPolling;
    private stopPolling;
    private handleButtons;
    private handleJoysticks;
    /**
     * Convert button aliases to indexes or keep joystick aliases
     * @param {string | number} action - Actions to convert
     */
    private sanitizeAction;
    /**
     * Gets all registered Joystick actions
     */
    private getJoystickActions;
    /**
     * Executes the callbacks from the registered action
     */
    private executeCallbacks;
}

declare const gamepad_2: Gamepad_2;
export { gamepad_2 as gamepad }

export declare type GamepadInput = ButtonInput | AxisInput;

declare type GestureDirection = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

declare interface GestureEventData {
    x: number;
    y: number;
    target: EventTarget | null;
    currentTarget: EventTarget | null;
}

/**
 * Keyboard class that handles all keyboard interactions
 */
declare class Keyboard {
    private eventListenerAttached;
    private keysPressed;
    constructor();
    /**
     * Registers keyboard event listeners
     * @param options - Configuration object
     * @param options.keys - Array of keys (e.g., ['A', 'SHIFT']) or key codes
     * @param options.callback - Function or action name to execute
     * @param options.type - Event type(s): 'press', 'hold', or 'lift' (can be single or array)
     */
    on(options: KeyboardOptions): void;
    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param keys - Key combination you want to remove (e.g., ['A', 'SHIFT'])
     * @param callback - Optional specific callback or action to remove
     */
    off(keys: KeyboardKey[], callback?: string | Function): void;
    /**
     * Handles when key is pressed
     */
    private onKeyDown;
    /**
     * Handles when key is released
     */
    private onKeyUp;
    /**
     * Convert keyCode to string representing key
     */
    private keyCodeToString;
    /**
     * Removes duplicates and converts KeyCodes to valid KeyName strings
     */
    private normalizeKeys;
    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     */
    private executeCallbacks;
}

declare const keyboard_2: Keyboard;
export { keyboard_2 as keyboard }

declare type KeyboardEventType = 'press' | 'hold' | 'lift';

export declare type KeyboardKey = KeyName | KeyCode;

declare type KeyboardOptions = {
    keys: KeyboardKey[];
    callback: string | Function;
    type?: KeyboardEventType | KeyboardEventType[];
};

export declare type KeyCode = (typeof mappings)[KeyName];

export declare type KeyName = `${keyof typeof mappings}`;

declare const mappings: {
    readonly ALT: 18;
    readonly ARROW_DOWN: 40;
    readonly ARROW_LEFT: 37;
    readonly ARROW_RIGHT: 39;
    readonly ARROW_UP: 38;
    readonly BACKSPACE: 8;
    readonly CAPS_LOCK: 20;
    readonly CTRL: 17;
    readonly DELETE: 46;
    readonly END: 35;
    readonly ENTER: 13;
    readonly ESC: 27;
    readonly F1: 112;
    readonly F2: 113;
    readonly F3: 114;
    readonly F4: 115;
    readonly F5: 116;
    readonly F6: 117;
    readonly F7: 118;
    readonly F8: 119;
    readonly F9: 120;
    readonly F10: 121;
    readonly F11: 122;
    readonly F12: 123;
    readonly HOME: 36;
    readonly INSERT: 45;
    readonly NUM_LOCK: 144;
    readonly NUMPAD_ENTER: 13;
    readonly NUMPAD_DASH: 109;
    readonly NUMPAD_STAR: 106;
    readonly NUMPAD_DOT: 110;
    readonly NUMPAD_FORWARD_SLASH: 111;
    readonly NUMPAD_PLUS: 107;
    readonly NUMPAD_0: 96;
    readonly NUMPAD_1: 97;
    readonly NUMPAD_2: 98;
    readonly NUMPAD_3: 99;
    readonly NUMPAD_4: 100;
    readonly NUMPAD_5: 101;
    readonly NUMPAD_6: 102;
    readonly NUMPAD_7: 103;
    readonly NUMPAD_8: 104;
    readonly NUMPAD_9: 105;
    readonly PAGE_DOWN: 34;
    readonly PAGE_UP: 33;
    readonly PAUSE: 19;
    readonly PRINT_SCRN: 44;
    readonly SCROLL_LOCK: 145;
    readonly SHIFT: 16;
    readonly SPACEBAR: 32;
    readonly TAB: 9;
    readonly A: 65;
    readonly B: 66;
    readonly C: 67;
    readonly D: 68;
    readonly E: 69;
    readonly F: 70;
    readonly G: 71;
    readonly H: 72;
    readonly I: 73;
    readonly J: 74;
    readonly K: 75;
    readonly L: 76;
    readonly M: 77;
    readonly N: 78;
    readonly O: 79;
    readonly P: 80;
    readonly Q: 81;
    readonly R: 82;
    readonly S: 83;
    readonly T: 84;
    readonly U: 85;
    readonly V: 86;
    readonly W: 87;
    readonly X: 88;
    readonly Y: 89;
    readonly Z: 90;
    readonly 1: 49;
    readonly 2: 50;
    readonly 3: 51;
    readonly 4: 52;
    readonly 5: 53;
    readonly 6: 54;
    readonly 7: 55;
    readonly 8: 56;
    readonly 9: 57;
    readonly 0: 48;
    readonly QUOTE: 222;
    readonly DASH: 189;
    readonly COMMA: 188;
    readonly DOT: 190;
    readonly FORWARD_SLASH: 191;
    readonly SEMI_COLON: 186;
    readonly SQUARE_BRACKET_LEFT: 219;
    readonly SQUARE_BRACKET_RIGHT: 221;
    readonly BACKWARD_SLASH: 220;
    readonly BACKTICK: 192;
    readonly EQUAL: 187;
    readonly SYSTEM: 91;
};

declare const mappings_2: {
    readonly FACE_BUTTON_DOWN: 0;
    readonly FACE_BUTTON_RIGHT: 1;
    readonly FACE_BUTTON_LEFT: 2;
    readonly FACE_BUTTON_TOP: 3;
    readonly LEFT_SHOULDER: 4;
    readonly RIGHT_SHOULDER: 5;
    readonly LEFT_SHOULDER_BOTTOM: 6;
    readonly RIGHT_SHOULDER_BOTTOM: 7;
    readonly SELECT: 8;
    readonly START: 9;
    readonly LEFT_ANALOGUE_STICK: 10;
    readonly RIGHT_ANALOGUE_STICK: 11;
    readonly PAD_UP: 12;
    readonly PAD_DOWN: 13;
    readonly PAD_LEFT: 14;
    readonly PAD_RIGHT: 15;
    readonly CENTER_BUTTON: 16;
    readonly aliases: {
        readonly 'face-button-down': "FACE_BUTTON_DOWN";
        readonly 'face-button-left': "FACE_BUTTON_LEFT";
        readonly 'face-button-right': "FACE_BUTTON_RIGHT";
        readonly 'face-button-top': "FACE_BUTTON_TOP";
        readonly 'left-shoulder': "LEFT_SHOULDER";
        readonly 'right-shoulder': "RIGHT_SHOULDER";
        readonly 'left-shoulder-bottom': "LEFT_SHOULDER_BOTTOM";
        readonly 'right-shoulder-bottom': "RIGHT_SHOULDER_BOTTOM";
        readonly select: "SELECT";
        readonly start: "START";
        readonly 'left-analogue-stick': "LEFT_ANALOGUE_STICK";
        readonly 'right-analogue-stick': "RIGHT_ANALOGUE_STICK";
        readonly 'pad-up': "PAD_UP";
        readonly 'pad-down': "PAD_DOWN";
        readonly 'pad-left': "PAD_LEFT";
        readonly 'pad-right': "PAD_RIGHT";
        readonly 'center-button': "CENTER_BUTTON";
        readonly 'playstation.x': "FACE_BUTTON_DOWN";
        readonly 'playstation.square': "FACE_BUTTON_LEFT";
        readonly 'playstation.circle': "FACE_BUTTON_RIGHT";
        readonly 'playstation.triangle': "FACE_BUTTON_TOP";
        readonly 'playstation.l1': "LEFT_SHOULDER";
        readonly 'playstation.r1': "RIGHT_SHOULDER";
        readonly 'playstation.l2': "LEFT_SHOULDER_BOTTOM";
        readonly 'playstation.r2': "RIGHT_SHOULDER_BOTTOM";
        readonly 'playstation.share': "SELECT";
        readonly 'playstation.options': "START";
        readonly 'playstation.l3': "LEFT_ANALOGUE_STICK";
        readonly 'playstation.r3': "RIGHT_ANALOGUE_STICK";
        readonly 'playstation.d-pad-up': "PAD_UP";
        readonly 'playstation.d-pad-down': "PAD_DOWN";
        readonly 'playstation.d-pad-left': "PAD_LEFT";
        readonly 'playstation.d-pad-right': "PAD_RIGHT";
        readonly 'playstation.center': "CENTER_BUTTON";
        readonly 'xbox.a': "FACE_BUTTON_DOWN";
        readonly 'xbox.x': "FACE_BUTTON_LEFT";
        readonly 'xbox.b': "FACE_BUTTON_RIGHT";
        readonly 'xbox.y': "FACE_BUTTON_TOP";
        readonly 'xbox.lb': "LEFT_SHOULDER";
        readonly 'xbox.rb': "RIGHT_SHOULDER";
        readonly 'xbox.lt': "LEFT_SHOULDER_BOTTOM";
        readonly 'xbox.rt': "RIGHT_SHOULDER_BOTTOM";
        readonly 'xbox.view': "SELECT";
        readonly 'xbox.menu': "START";
        readonly 'xbox.left-thumbstick': "LEFT_ANALOGUE_STICK";
        readonly 'xbox.right-thumbstick': "RIGHT_ANALOGUE_STICK";
        readonly 'xbox.d-pad-up': "PAD_UP";
        readonly 'xbox.d-pad-down': "PAD_DOWN";
        readonly 'xbox.d-pad-left': "PAD_LEFT";
        readonly 'xbox.d-pad-right': "PAD_RIGHT";
        readonly 'xbox.center': "CENTER_BUTTON";
    };
    readonly axisAliases: readonly ["right.joystick", "left.joystick", "left.joystick.down", "left.joystick.up", "left.joystick.left", "left.joystick.right", "right.joystick.down", "right.joystick.up", "right.joystick.left", "right.joystick.right"];
};

declare interface NavigableArea {
    area: string;
    elements: (string | HTMLElement)[];
}

declare type NavigationInput = (string | HTMLElement)[] | NavigableArea[];

declare type NumericValues<T> = {
    [K in keyof T]: T[K] extends number ? T[K] : never;
}[keyof T];

declare interface Offset {
    x: number;
    y: number;
}

/**
 * 2D coordinate point
 */
declare interface Point {
    /** Horizontal position */
    x: number;
    /** Vertical position */
    y: number;
}

/**
 * Allows you to resize elements on the screen
 */
declare class resize_2 {
    private options;
    resizableElement: HTMLElement;
    enabled: boolean;
    activeEdge: Edge | null;
    edges: {
        bottom: HTMLElement | null;
        right: HTMLElement | null;
        bottomRight: HTMLElement | null;
    };
    private elementRect;
    readonly heightAction: string;
    readonly widthAction: string;
    private touchEvents;
    private _touchEnabled;
    constructor(options: ResizeOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initializes the resizing
     */
    private init;
    /**
     * Deinitilazes the resizing
     */
    deinit(): void;
    /**
     * Handles the mousedown event
     */
    private onMouseDown;
    /**
     * Handles the mousemove event
     */
    private onMouseMove;
    /**
     * Handles the mouseup event
     */
    private onMouseUp;
    /**
     * Adds the touch events to fire the actions
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Sets the active edge when resizing. If there is no edge it returns null
     */
    private setEdge;
    /**
     * Checks if the element you are trying to resize has already position relative or absolute set, so it doesn't overwrite them
     */
    private checkPosition;
    /**
     * Creates the edge elements and appends them to the resizable element
     */
    private addEdges;
    /**
     * Removes the edge elements
     */
    private removeEdges;
    /**
     * Registers actions
     */
    private registerActions;
    /**
     * Removes the registered actions
     */
    private removeActions;
}
export { resize_2 as resize }

declare interface ResizeOptions {
    element: string;
    edgeWidth?: number;
    onWidthChange?: (width: number) => void;
    onHeightChange?: (height: number) => void;
    widthMin?: number;
    widthMax?: number;
    heightMin?: number;
    heightMax?: number;
}

/**
 * Allows for an element to be rotated
 */
declare class rotate_2 {
    private options;
    rotatingElement: HTMLElement | null;
    elementPosition: {
        x: number;
        y: number;
    };
    angle: number;
    enabled: boolean;
    initalAngle: number;
    readonly actionName: string;
    private touchEvents;
    private _touchEnabled;
    constructor(options: RotateOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initializes the rotation
     */
    private init;
    /**
     * Deinitilizes the rotation
     */
    deinit(): void;
    /**
     * Handles the mousedown event
     */
    private onMouseDown;
    /**
     * Handles the mousemove event
     */
    private onMouseMove;
    /**
     * Handles the mouseup event
     */
    private onMouseUp;
    /**
     * Registers the actions
     */
    private registerAction;
    /**
     * Removes the action
     */
    private removeActions;
    /**
     * Add rotate touch events
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Finds the angle from the mouse coordinates based on the center of the element that is rotating
     */
    private getAngle;
}
export { rotate_2 as rotate }

declare interface RotateOptions {
    element: string;
    /**  Snaps the rotating element to increments of that angle */
    snapAngle?: number;
    onRotation?: (angle: number) => void;
}

/**
 * Spatial Navigation for keyboard and controller
 */
declare class SpatialNavigation {
    enabled: boolean;
    areas: Record<string, AreaState>;
    registeredKeys: Set<"ALT" | "ARROW_DOWN" | "ARROW_LEFT" | "ARROW_RIGHT" | "ARROW_UP" | "BACKSPACE" | "CAPS_LOCK" | "CTRL" | "DELETE" | "END" | "ENTER" | "ESC" | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12" | "HOME" | "INSERT" | "NUM_LOCK" | "NUMPAD_ENTER" | "NUMPAD_DASH" | "NUMPAD_STAR" | "NUMPAD_DOT" | "NUMPAD_FORWARD_SLASH" | "NUMPAD_PLUS" | "NUMPAD_0" | "NUMPAD_1" | "NUMPAD_2" | "NUMPAD_3" | "NUMPAD_4" | "NUMPAD_5" | "NUMPAD_6" | "NUMPAD_7" | "NUMPAD_8" | "NUMPAD_9" | "PAGE_DOWN" | "PAGE_UP" | "PAUSE" | "PRINT_SCRN" | "SCROLL_LOCK" | "SHIFT" | "SPACEBAR" | "TAB" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "QUOTE" | "DASH" | "COMMA" | "DOT" | "FORWARD_SLASH" | "SEMI_COLON" | "SQUARE_BRACKET_LEFT" | "SQUARE_BRACKET_RIGHT" | "BACKWARD_SLASH" | "BACKTICK" | "EQUAL" | "SYSTEM" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9">;
    private clearCurrentActiveKeys;
    private overlapPercentage;
    lastFocusedElement: HTMLElement | undefined | null;
    paused: boolean;
    activeKeys: {
        [K in Direction]: KeyName[];
    };
    /**
     * Initializes the spatial navigation
     * @param {string[]|Object[]|HTMLElement[]} navigableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigableElements[].elements - Array of selector strings or HTMLElement references
     * @param {number} overlap - Overlap percentage (0-1) for determining if elements are on the same axis
     * @example
     * // Using selector strings
     * spatialNavigation.init(['.menu-item', '#header']);
     *
     * // Using HTMLElement references
     * spatialNavigation.init([element1, element2]);
     *
     * // Using object syntax with mixed selectors and HTMLElements
     * spatialNavigation.init([
     *   { area: 'menu', elements: ['.item', element1, '#button'] }
     * ]);
     */
    init(navigableElements?: NavigationInput, overlap?: number): void;
    /**
     * Deinitialize the spatial navigation
     */
    deinit(): void;
    /**
     * Add new elements to area or new area
     * @param {string[]|Object[]|HTMLElement[]} navigableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigableElements[].elements - Array of selector strings or HTMLElement references
     * @example
     * // Add selector strings to default area
     * spatialNavigation.add(['.new-item']);
     *
     * // Add HTMLElement references to default area
     * spatialNavigation.add([element1, element2]);
     *
     * // Add to named area with mixed types
     * spatialNavigation.add([
     *   { area: 'sidebar', elements: ['.link', element1] }
     * ]);
     */
    add(navigableElements: NavigationInput): void;
    /**
     * Remove an area from the focusable groups
     * @param area area to be removed
     */
    remove(area?: string): void;
    /**
     * Get elements from selector and save them to the default group
     * @param navArea
     */
    private handleString;
    /**
     * Gets elements from object and saves them to a focusable group
     * @param {Object} navArea - Navigation area configuration
     * @param {string} navArea.area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navArea.elements - Array of selector strings or HTMLElement references
     */
    private handleObject;
    /**
     * @param area - The area to set the properties for
     * @param domElements - The elements to be added to the area
     */
    private setNavigationAreaProperties;
    /**
     * Calculates the distance between the provided elements and return the max distance
     * @param elements
     * @returns The max distance between the elements
     */
    private getElementsDistance;
    /**
     * Recursively checks for overflow in the parent elements and sets the area overflow values
     * @param {HTMLElement} element - The element to check for overflow
     * @returns {{x: number, y: number}|HTMLElement} - Next element to check for overflow or object with the overflow values
     */
    private setOverflowValues;
    /**
     * Sets the tabindex of the element that needs to be focused
     * @param element
     */
    private makeFocusable;
    /**
     * Returns the valid focusable elements in the navigable area
     * @param {HTMLElement} targetElement
     * @param {HTMLElement[]} elements
     * @param {number} distance
     */
    private getFocusableGroup;
    /**
     * Checks if the passed element is within a group and returns the rest of the elements in the group
     * @param {HTMLElement} targetElement
     * @returns {NavigationObject[]}
     */
    private getCurrentArea;
    /**
     * Gets the element closest to the opposite edge of the navigation direction
     * @param {string} direction
     * @param {NavigationObject[]} elements
     * @param {Object} focusedElement
     * @param {number} focusedElement.x
     * @param {number} focusedElement.y
     * @param {number} distance
     * @param {{x: number, y: number}} overflow
     */
    private getClosestToEdge;
    /**
     * Moves the focus in the desired direction
     * @param {string} direction
     */
    private moveFocus;
    /** Filters the focusable group by the relevant axis by chacking for same axis overlap */
    private filterGroupByCurrentAxis;
    /** Compares the Y coordinates of two elements and checks for overlap by the specified overlap value */
    private isOverlappingX;
    /** Compares the X coordinates of two elements and checks for overlap by the specified overlap value */
    private isOverlappingY;
    /** Returns the next element to focus within the group */
    private findNextElement;
    /**
     * Get the angle range for the direction
     */
    private getDirectionAngle;
    /**
     * Registers actions and adds them to the keyboard and gamepad objects
     */
    private registerKeyActions;
    /**
     * Resets to the original keys state
     */
    resetKeys(): void;
    /**
     * Adds or override default direction keys with the specified ones
     * @param {Object} customDirections - { up: 'W', left: 'A', right: 'D', down: 'S' }
     * @param options.clearCurrentActiveKeys - If true, overrides all keys. Defaults to false.
     */
    changeKeys(customDirections: CustomKeysInput, options?: {
        clearCurrentActiveKeys: boolean;
    }): void;
    /**
     * Removes the added actions
     */
    private removeKeyActions;
    /**
     * Focuses on the first element in a focusable area
     */
    focusFirst(area?: string): void;
    /**
     * Focuses on the last element in a focusable area
     */
    focusLast(area?: string): void;
    /**
     * Changes focus to another area
     */
    switchArea(area: string): void;
    /**
     * Checks if a given element is in a focusable area
     */
    private isElementInGroup;
    /**
     * Checks if the currently active element is in a focusable area
     */
    private isActiveElementInGroup;
    /**
     * Removes the focus from a focused element in a group
     */
    clearFocus(): void;
    /**
     * Pauses the spatial navigation functionality
     */
    pause(): void;
    /**
     * Resumes the spatial navigation functionality
     */
    resume(): void;
}

declare const spatialNavigation_2: SpatialNavigation;
export { spatialNavigation_2 as spatialNavigation }

/**
 * TouchGestures class that handles all of the touch interactions and gestures
 */
declare class TouchGestures {
    activeTouches: Map<number, Touch>;
    /**
     * Hold gesture - triggers after holding for specified time
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.time=1000] - Time in milliseconds for the press
     */
    hold(options: {
        element: HTMLElement | string;
        callback: Function;
        time: number;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
    /**
     * Tap gesture - single or multi-tap detection
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.tapsNumber=1] - Number of taps necessary for the callback to be executed
     * @param {number} [options.tapTime=200] - Time in milliseconds between putting down the finger and lifting it up
     * @param {number} [options.betweenTapsTime=500] - Time in milliseconds between two sequential taps
     */
    tap(options: {
        element: HTMLElement | string;
        callback: Function;
        tapsNumber: number;
        tapTime: number;
        betweenTapsTime: number;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
    /**
     * Drag gesture - tracks touch movement
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.onDragStart - Function to be executed on drag start
     * @param {function} options.onDrag - Function to be executed on drag
     * @param {function} options.onDragEnd - Function to be executed on drag end
     */
    drag(options: {
        element: HTMLElement | string;
        onDragStart: (event: GestureEventData) => void;
        onDrag: (position: {
            x: number;
            y: number;
        }) => void;
        onDragEnd: (position: {
            x: number;
            y: number;
        }) => void;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
    /**
     * Swipe gesture - detects directional swipes
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch- Directions of the swipe
     * @param {number} options.touchNumber - Number of fingers necessary for the swipe
     */
    swipe(options: {
        element: HTMLElement | string;
        callback: (direction?: GestureDirection) => void;
        touchNumber: number;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
    /**
     * Pinch gesture - two-finger pinch zoom
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    pinch(options: {
        element: HTMLElement | string;
        callback: ({ pinchDelta, midpoint }: {
            pinchDelta: number;
            midpoint: Point;
        }) => void;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
    /**
     *
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    rotate(options: {
        element: HTMLElement | string;
        callback: (angle: number) => void;
    }): void | {
        /**
         * Removes the event listeners
         */
        remove(): void;
    };
}

declare const touchGestures_2: TouchGestures;
export { touchGestures_2 as touchGestures }

/**
 * Pan and zoom
 */
declare class zoom_2 {
    private options;
    enabled: boolean;
    readonly actionName: string;
    offset: {
        x: number;
        y: number;
    };
    transform: {
        x: number;
        y: number;
        scale: number;
    };
    private touchEvents;
    zoomableElement: HTMLElement;
    private _touchEnabled;
    constructor(options: ZoomOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initialize the pan and zoom
     */
    private init;
    /**
     * Deinitilize the pan and zoom
     */
    deinit(): void;
    /**
     * Handles the wheel event
     */
    private onWheel;
    /**
     * Registers the actions for the pan and zoom
     */
    private registerActions;
    /**
     * Removes the registered actions
     */
    private removeActions;
    /**
     * Add pinch and stretch touch events
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Calculates the mouse coordinates inside the element
     */
    private calculateOffsets;
}
export { zoom_2 as zoom }

declare interface ZoomOptions {
    element: string;
    minZoom: number;
    maxZoom: number;
    zoomFactor: number;
    onZoom: Function;
}

export { }
