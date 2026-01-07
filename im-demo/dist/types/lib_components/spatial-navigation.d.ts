import { KeyName } from '../utils/keyboard-mappings';
declare const directions: readonly ["down", "up", "left", "right"];
type Direction = typeof directions[number];
type CustomKeysInput = Partial<Record<Direction, KeyName | KeyName[]>>;
interface AreaState {
    elements: HTMLElement[];
    distance: number;
    overflow: {
        x: number;
        y: number;
    };
}
interface NavigableArea {
    area: string;
    elements: (string | HTMLElement)[];
}
type NavigationInput = (string | HTMLElement)[] | NavigableArea[];
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
declare const _default: SpatialNavigation;
export default _default;
