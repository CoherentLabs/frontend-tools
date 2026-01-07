import { GestureDirection } from '../utils/gesture-utils';
import { Point } from '../utils/utility-functions';
/** Return type for all gesture methods */
export type GestureHandler = {
    /** Removes the gesture and detaches the event listeners */
    remove: () => void;
} | void;
interface GestureEventData {
    x: number;
    y: number;
    target: EventTarget | null;
    currentTarget: EventTarget | null;
}
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
declare const _default: TouchGestures;
export default _default;
