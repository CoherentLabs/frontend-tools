/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toDeg } from '../utils/utility-functions';

import actions from './actions';
import keyboard from './keyboard';
import gamepad from './gamepad';
import { KeyName } from '../utils/keyboard-mappings';

const directions = ['down', 'up', 'left', 'right'] as const;
const defaultKeysState = { up: ['arrow_up'], down: ['arrow_down'], right: ['arrow_right'], left: ['arrow_left'] };

type Direction = typeof directions[number];
type CustomKeysInput = Partial<Record<Direction, KeyName | KeyName[]>>;

interface AreaState {
    elements: HTMLElement[];
    distance: number;
    lastFocusedElement: HTMLElement | undefined;
    overflow: { x: number, y: number };
}

interface NavigableArea {
    area: string,
    elements: (string | HTMLElement)[]
}

interface NavigationObject {
    element: HTMLElement,
    x: number,
    y: number,
    width: number,
    height: number
}

type NavigationInput = (string | HTMLElement)[] | NavigableArea[];
/**
 * Spatial Navigation for keyboard and controller
 */
class SpatialNavigation {
    enabled = false;
    areas: Record<string, AreaState> = { default: this.createDefaultAreaState() };
    registeredKeys = new Set<KeyName>();
    private clearCurrentActiveKeys = false;
    private overlapPercentage = 0.5;
    lastFocusedElement: HTMLElement | undefined | null = null;
    paused = false;
    activeKeys!: {[K in Direction]: KeyName[]};

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
    init(navigableElements: NavigationInput = [], overlap?: number) {
        if (this.enabled) return;
        this.enabled = true;

        this.add(navigableElements);
        this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
        this.registerKeyActions();
        window.addEventListener('focusin', this.syncLastFocused);

        if (overlap && 0 <= overlap && overlap <= 1) {
            this.overlapPercentage = overlap;
        }
    }

    /**
     * Deinitialize the spatial navigation
     */
    deinit() {
        if (!this.enabled) return;
        this.enabled = false;

        this.areas = { default: this.createDefaultAreaState() };
        this.removeKeyActions();
        this.overlapPercentage = 0.5;
        this.lastFocusedElement = null;
        window.removeEventListener('focusin', this.syncLastFocused);
    }
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
    add(navigableElements: NavigationInput) {
        if (!this.enabled) return;

        // if all elements are HTMLElements 
        if (navigableElements.every(el => el instanceof HTMLElement)) {
            navigableElements.forEach(element => this.makeFocusable(element));
            this.setNavigationAreaProperties('default', navigableElements);
            return;
        }

        navigableElements.forEach((navArea) => {
            typeof navArea === 'string' ? this.handleString(navArea) : this.handleObject(navArea as NavigableArea);
        });
    }

    /**
     * Remove an area from the focusable groups
     * @param area area to be removed
     */
    remove(area = 'default') {
        if (!this.enabled) return;

        if (!this.areas[area]) return console.error(`The area '${area}' you are trying to remove doesn't exist`);

        this.areas[area].elements.forEach(element => element.removeAttribute('tabindex'));

        delete this.areas[area];
    }

    /**
     * Gets the last focused element from the specified area
     * @param area
     */
    getLastFocused(area: string = 'default') {
        const el = this.areas[area]?.lastFocusedElement;

        if (el && !document.contains(el)) {
            this.areas[area].lastFocusedElement = undefined;
            return undefined;
        }

        return el;
    }

    /**
     * Returns the structure of the default area
     */
    private createDefaultAreaState(): AreaState {
        return {
            elements: [],
            distance: 0,
            lastFocusedElement: undefined,
            overflow: { x: 0, y: 0 }
        };
    }

    private syncLastFocused = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        if (!this.enabled || !target) return;

        // Check if the focused element belongs to one of our areas
        for (const areaName in this.areas) {
            const area = this.areas[areaName];
            if (area.elements.includes(target)) {
                area.lastFocusedElement = target;
                this.lastFocusedElement = target;
                break; 
            }
        }
    };

    /**
     * Get elements from selector and save them to the default group
     * @param navArea
     */
    private handleString(navArea: string) {
        const domElements = [...document.querySelectorAll(navArea)] as HTMLElement[];

        if (domElements.length === 0) return console.error(`${navArea} is either not a correct selector or the element is not present in the DOM.`);

        domElements.forEach(this.makeFocusable);

        this.setNavigationAreaProperties('default', domElements);
    }

    /**
     * Gets elements from object and saves them to a focusable group
     * @param {Object} navArea - Navigation area configuration
     * @param {string} navArea.area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navArea.elements - Array of selector strings or HTMLElement references
     */
    private handleObject(navArea: NavigableArea) {
        const domElements = navArea.elements.reduce<HTMLElement[]>((acc, el) => {
            if (el instanceof HTMLElement) {
                acc.push(el);
                this.makeFocusable(el);
                return acc;
            }

            const elements = [...document.querySelectorAll(el)] as HTMLElement[];
            elements.forEach(this.makeFocusable);
            acc.push(...elements);
            return acc;
        }, []);

        if (domElements.length === 0) return console.error(`${navArea.elements.join(', ')} are either not a correct selectors or the elements are not present in the DOM.`);

        if (!this.areas[navArea.area]) {
            this.areas[navArea.area] = this.createDefaultAreaState();
        }

        this.setNavigationAreaProperties(navArea.area, domElements);
    }

    /**
     * @param area - The area to set the properties for
     * @param domElements - The elements to be added to the area
     */
    private setNavigationAreaProperties(area: string, domElements: HTMLElement[]) {
        this.areas[area].elements.push(...domElements);
        this.areas[area].distance = this.getElementsDistance(this.areas[area].elements);
        this.areas[area].overflow = this.setOverflowValues(domElements[0].parentElement!);
    }

    /**
     * Calculates the distance between the provided elements and return the max distance
     * @param elements
     * @returns The max distance between the elements
     */
    private getElementsDistance(elements: HTMLElement[]) {
        return elements.reduce((acc, el) => {
            const { x, y } = el.getBoundingClientRect();
            const distance = Math.hypot(x, y);
            return acc < distance ? distance : acc;
        }, 0);
    }

    /**
     * Recursively checks for overflow in the parent elements and sets the area overflow values
     * @param {HTMLElement} element - The element to check for overflow
     * @returns {{x: number, y: number}|HTMLElement} - Next element to check for overflow or object with the overflow values
     */
    private setOverflowValues(element: HTMLElement): {x: number, y: number} {
        if (!element) return { x: 0, y: 0 };

        const { scrollWidth, scrollHeight } = element;
        const overflowX = Math.max(0, scrollWidth - window.innerWidth);
        const overflowY = Math.max(0, scrollHeight - window.innerHeight);

        if (overflowX > 0 || overflowY > 0) {
            return { x: overflowX, y: overflowY };
        }

        return this.setOverflowValues(element.parentElement!);
    }

    /**
     * Sets the tabindex of the element that needs to be focused
     * @param element
     */
    private makeFocusable(element: HTMLElement) {
        element.setAttribute('tabindex', '1');
    }

    /**
     * Returns the valid focusable elements in the navigable area
     * @param {HTMLElement} targetElement
     * @param {HTMLElement[]} elements
     * @param {number} distance
     */
    private getFocusableGroup(targetElement: HTMLElement, elements: HTMLElement[], distance: number): NavigationObject[] {
        return elements.reduce<NavigationObject[]>((accumulator, element) => {
            if (element !== targetElement && !element.hasAttribute('disabled')) {
                const { x, y, height, width } = element.getBoundingClientRect();
                accumulator.push({
                    element,
                    x: x + distance,
                    y: y + distance,
                    height,
                    width,
                });
            }
            return accumulator;
        }, []);
    }

    /**
     * Checks if the passed element is within a group and returns the rest of the elements in the group
     * @param {HTMLElement} targetElement
     * @returns {NavigationObject[]}
     */
    private getCurrentArea(targetElement: HTMLElement) {
        return Object.values(this.areas).find((area) => {
            if (area.elements.includes(targetElement)) return true;
        });
    }

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
    private getClosestToEdge(direction: Direction, elements: NavigationObject[], focusedElement: {x: number, y: number}, distance: number, overflow: {x: number, y: number}): NavigationObject {
        let newDistance: number, oldDistance: number;
        const bottomEdge = window.innerHeight + distance + overflow.y;
        const rightEdge = window.innerWidth + distance + overflow.x;

        return elements.reduce((acc, el) => {
            switch (direction) {
                case 'down':
                    newDistance = Math.hypot(el.x - focusedElement.x, el.y);
                    oldDistance = Math.hypot(acc.x - focusedElement.x, acc.y);
                    break;
                case 'up':
                    newDistance = Math.hypot(el.x - focusedElement.x, bottomEdge - el.y);
                    oldDistance = Math.hypot(acc.x - focusedElement.x, bottomEdge - acc.y);
                    break;
                case 'right':
                    newDistance = Math.hypot(el.x, el.y - focusedElement.y);
                    oldDistance = Math.hypot(acc.x, acc.y - focusedElement.y);
                    break;
                case 'left':
                    newDistance = Math.hypot(rightEdge - el.x, el.y - focusedElement.y);
                    oldDistance = Math.hypot(rightEdge - acc.x, acc.y - focusedElement.y);
                    break;
            }
            acc = newDistance < oldDistance ? el : acc;

            return acc;
        });
    }

    /**
     * Moves the focus in the desired direction
     * @param {string} direction
     */
    private moveFocus(direction: Direction) {
        if (!this.enabled) return;

        const activeElement = (this.isActiveElementInGroup() && document.activeElement) || this.lastFocusedElement;

        const currentArea = this.getCurrentArea(activeElement as HTMLElement);
        if (!currentArea) return console.error('The active element is not in a focusable area!');

        const { elements, distance, overflow } = currentArea;
        const focusableGroup = this.getFocusableGroup(activeElement as HTMLElement, elements, distance);

        const { x, y, width, height } = activeElement!.getBoundingClientRect();

        const adjustedDimensions = {
            x: x + distance,
            y: y + distance,
            width,
            height,
        };

        if (focusableGroup.length === 0) return;

        const currentAxisGroup = this.filterGroupByCurrentAxis(direction, focusableGroup, adjustedDimensions);

        if (!currentAxisGroup.length) return;

        let nextFocusableElement = this.findNextElement(
            direction, currentAxisGroup, adjustedDimensions.x, adjustedDimensions.y);

        if (!nextFocusableElement) {
            nextFocusableElement = this.getClosestToEdge(
                direction, currentAxisGroup, adjustedDimensions, distance, overflow
            );
        }

        if (nextFocusableElement) {
            nextFocusableElement.element.focus();
            this.lastFocusedElement = nextFocusableElement.element;
            currentArea.lastFocusedElement = this.lastFocusedElement;
        }
    }

    /** Filters the focusable group by the relevant axis by chacking for same axis overlap */
    private filterGroupByCurrentAxis(direction: Direction, focusableGroup: NavigationObject[], currentElement: Omit<NavigationObject, 'element'>): NavigationObject[] {
        return focusableGroup.filter((element) => {
            if (direction === 'left' || direction === 'right') return this.isOverlappingX(currentElement, element);

            return this.isOverlappingY(currentElement, element);
        });
    }

    /** Compares the Y coordinates of two elements and checks for overlap by the specified overlap value */
    private isOverlappingX(currentElement: Omit<NavigationObject, 'element'>, nextElement: NavigationObject) {
        const lowerBoundary = Math.min(currentElement.y + currentElement.height, nextElement.y + nextElement.height);
        const topBoundary = Math.max(currentElement.y, nextElement.y);

        const verticalOverlap = Math.max(0, (lowerBoundary - topBoundary));
        const minHeight = Math.min(currentElement.height, nextElement.height);
        const overlapPercentage = verticalOverlap / minHeight;

        return overlapPercentage >= this.overlapPercentage;
    }

    /** Compares the X coordinates of two elements and checks for overlap by the specified overlap value */
    private isOverlappingY(currentElement: Omit<NavigationObject, 'element'>, nextElement: NavigationObject) {
        const rightBoundary = Math.min(currentElement.x + currentElement.width, nextElement.x + nextElement.width);
        const leftBoundary = Math.max(currentElement.x, nextElement.x);

        const horizontalOverlap = Math.max(0, rightBoundary - leftBoundary);
        const minWidth = Math.min(currentElement.width, nextElement.width);
        const overlapPercentage = horizontalOverlap / minWidth;

        return overlapPercentage >= this.overlapPercentage;
    }

    /** Returns the next element to focus within the group */
    private findNextElement(direction: Direction, focusableGroup: NavigationObject[], x: number, y: number) {
        return focusableGroup.reduce<NavigationObject | null>((acc, el) => {
            const deltaX = el.x - x;
            const deltaY = el.y - y;
            const angle = toDeg(Math.atan2(deltaY, deltaX));

            if (this.getDirectionAngle(direction, angle)) {
                if (!acc) acc = el;

                const newDistance = Math.hypot(deltaX, deltaY);
                const oldDistance = Math.hypot(acc.x - x, acc.y - y);
                acc = newDistance < oldDistance ? el : acc;
            }

            return acc;
        }, null);
    }

    /**
     * Get the angle range for the direction
     */
    private getDirectionAngle(direction: Direction, angle: number) {
        switch (direction) {
            case 'down':
                return angle > 0 && angle < 180;
            case 'up':
                return angle > -180 && angle < 0;
            case 'left':
                return angle < -90 || angle > 90;
            case 'right':
                return angle > -90 && angle < 90;
        }
    }

    /**
     * Registers actions and adds them to the keyboard and gamepad objects
    */
    private registerKeyActions() {
        directions.forEach((direction) => {
            const callback = () => {
                if (this.paused) return
                this.moveFocus(direction);
            };
            actions.register(`move-focus-${direction}`, callback);

            const keys = this.activeKeys[direction];

            for (const key of keys) {
                keyboard.on({
                    keys: [key],
                    callback: `move-focus-${direction}`,
                    type: ['press', 'hold'],
                });
                this.registeredKeys.add(key);
            }

            gamepad.on({
                actions: [`playstation.d-pad-${direction}`],
                callback: `move-focus-${direction}`,
            });
        });
    }

    /**
     * Resets to the original keys state
     */
    resetKeys() {
        if (!this.enabled) return;

        this.removeKeyActions();
        this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
        this.registerKeyActions();
    }

    /**
     * Adds or override default direction keys with the specified ones
     * @param {Object} customDirections - { up: 'W', left: 'A', right: 'D', down: 'S' }
     * @param options.clearCurrentActiveKeys - If true, overrides all keys. Defaults to false.
     */
    changeKeys(customDirections: CustomKeysInput, options = { clearCurrentActiveKeys: false }) {
        if (!this.enabled) return;
        
        const customKeysDirections = Object.keys(customDirections) as Direction[];
        if (customKeysDirections.length === 0) return;

        const incorrectDirections = customKeysDirections.filter(direction => !directions.includes(direction as Direction));
        if (incorrectDirections.length > 0) return console.error(`The following directions: [${incorrectDirections.join(', ')}] you have entered are incorrect! `);

        this.clearCurrentActiveKeys = options.clearCurrentActiveKeys;
        this.removeKeyActions();

        for (const direction in this.activeKeys) {
            const newKey = customDirections[direction as Direction] as KeyName;

            if (typeof newKey === 'string' && !this.activeKeys[direction as Direction].includes(newKey)) {
                this.activeKeys[direction as Direction].push(newKey.toUpperCase() as KeyName);
            }
        }

        this.registerKeyActions();
    }

    /**
     * Removes the added actions
     */
    private removeKeyActions() {
        if (this.registeredKeys.size !== 0) {
            directions.forEach((direction) => {
                const actionName = `move-focus-${direction}`;

                for (const key of this.activeKeys[direction]) {
                    keyboard.off([key], actionName);
                }

                actions.remove(actionName);
                gamepad.off([`playstation.d-pad-${direction}`], actionName);
                if (this.clearCurrentActiveKeys) this.activeKeys[direction] = [];
            });
            this.registeredKeys.clear();
            this.clearCurrentActiveKeys = false;
        }
    }

    /**
     * Focuses on the first element in a focusable area
     */
    focusFirst(area = 'default') {
        if (!this.enabled) return;
        
        const navigableElements = this.areas[area].elements;
        if (!navigableElements || navigableElements.length === 0) {
            return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
        }

        this.lastFocusedElement = navigableElements.find(el => !el.hasAttribute('disabled'));
        if (!this.lastFocusedElement) {
            return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
        }
        this.lastFocusedElement.focus();
        this.areas[area].lastFocusedElement = this.lastFocusedElement;
    }

    /**
     * Focuses on the last element in a focusable area
     */
    focusLast(area = 'default') {
        if (!this.enabled) return;

        const navigableElements = this.areas[area].elements;
        if (!navigableElements || navigableElements.length === 0) {
            return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
        }

        let element;
        for (let i = navigableElements.length - 1; i >= 0; i--) {
            if (!navigableElements[i].hasAttribute('disabled')) {
                element = navigableElements[i];
                break;
            }
        }

        this.lastFocusedElement = element;
        if (!this.lastFocusedElement) {
            return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
        }
        this.lastFocusedElement.focus();
        this.areas[area].lastFocusedElement = this.lastFocusedElement;
    }

    /**
     * Changes focus to another area by focusing on the last focused element in that area. If no element has previously been focused, it will focus the first available element.
     */
    switchArea(area: string) {
        if (!this.enabled) return;
        
        const lastFocusedInArea = this.getLastFocused(area);
        if (!lastFocusedInArea || lastFocusedInArea.hasAttribute('disabled')) {
            return this.focusFirst(area);
        }

        lastFocusedInArea.focus();
        this.lastFocusedElement = lastFocusedInArea;
    }

    /**
    * Checks if a given element is in a focusable area
    */
    private isElementInGroup(element: HTMLElement) {
        return Object.values(this.areas).some(group => group.elements.includes(element));
    }

    /**
     * Checks if the currently active element is in a focusable area
     */
    private isActiveElementInGroup() {
        if (!document.activeElement) return false;
        
        return this.isElementInGroup(document.activeElement as HTMLElement);
    }

    /**
     * Removes the focus from a focused element in a group
     */
    clearFocus() {
        if (!this.enabled) return;
        if (this.isActiveElementInGroup()) (document.activeElement as HTMLElement).blur();
    }

    /**
     * Pauses the spatial navigation functionality
     */
    pause() {
        if (!this.enabled) return;
        this.paused = true;
    }

    /**
     * Resumes the spatial navigation functionality
     */
    resume() {
        if (!this.enabled) return;
        this.paused = false;
    }
}

export default new SpatialNavigation();
