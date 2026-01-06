/* eslint-disable max-lines-per-function */

import { GestureDirection, getDirection, getElement } from '../utils/gesture-utils';
import { distanceBetweenTwoPoints, getMidPoint, Point, toDeg } from '../utils/utility-functions';

const MULTIPLE_TOUCHES_MIN_NUMBER = 2;

/** Return type for all gesture methods */
export type GestureHandler = {
    /** Removes the gesture and detaches the event listeners */
    remove: () => void;
} | void

interface GestureEventData {
    x: number;
    y: number;
    target: EventTarget | null;
    currentTarget: EventTarget | null;
}

/**
 * TouchGestures class that handles all of the touch interactions and gestures
 */
class TouchGestures {
    activeTouches = new Map<number, Touch>();

    /**
     * Hold gesture - triggers after holding for specified time
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.time=1000] - Time in milliseconds for the press
     */
    hold(options: {element: HTMLElement | string, callback: Function, time: number}) {
        if (!options) return console.error('Options not provided for hold!');

        let holdTimer: NodeJS.Timeout;

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onHold = ({ touches }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            holdTimer = setTimeout(() => {
                if (!options.callback) return;
                options.callback();
            }, options.time || 1000);
        };

        const onHoldEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);
            clearTimeout(holdTimer);
        };

        element.addEventListener('touchstart', onHold);

        element.addEventListener('touchend', onHoldEnd);

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onHold);
                element.removeEventListener('touchend', onHoldEnd);
            },
        };
    }

    /**
     * Tap gesture - single or multi-tap detection
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.tapsNumber=1] - Number of taps necessary for the callback to be executed
     * @param {number} [options.tapTime=200] - Time in milliseconds between putting down the finger and lifting it up
     * @param {number} [options.betweenTapsTime=500] - Time in milliseconds between two sequential taps
     */
    tap(options: {element: HTMLElement | string, callback: Function, tapsNumber: number, tapTime: number, betweenTapsTime: number}) {
        if (!options) return console.error('Options not provided for tap!');

        let tapTimer: NodeJS.Timeout, betweenTapsTimer: NodeJS.Timeout;
        let isTap = true;
        let tapCount = options.tapsNumber || 1;

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onTap = ({ touches }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            clearTimeout(betweenTapsTimer);

            isTap = true;

            tapTimer = setTimeout(() => {
                isTap = false;
            }, options.tapTime || 200);
        };

        const onTapEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);
            clearTimeout(tapTimer);

            if (!isTap) return;

            tapCount--;
            betweenTapsTimer = setTimeout(() => {
                tapCount = options.tapsNumber || 1;
                clearTimeout(betweenTapsTimer);
            }, options.betweenTapsTime || 500);

            if (tapCount !== 0 || !options.callback) return;
            options.callback();

            isTap = true;
            clearTimeout(tapTimer);
            tapCount = options.tapsNumber || 1;
        };

        element.addEventListener('touchstart', onTap);

        element.addEventListener('touchend', onTapEnd);

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onTap);
                element.removeEventListener('touchend', onTapEnd);
            },
        };
    }

    /**
     * Drag gesture - tracks touch movement
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.onDragStart - Function to be executed on drag start
     * @param {function} options.onDrag - Function to be executed on drag
     * @param {function} options.onDragEnd - Function to be executed on drag end
     */
    drag(options: {
        element: HTMLElement | string, 
        onDragStart: (event: GestureEventData) => void, 
        onDrag: (position: {x: number, y: number}) => void, 
        onDragEnd: (position: {x: number, y: number}) => void
    }) {
        if (!options) return console.error('Options not provided for drag!');

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onDragStart = ({ touches, target, currentTarget }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            document.addEventListener('touchmove', onDrag);
            document.addEventListener('touchend', onDragEnd);

            if (!options.onDragStart) return;
            options.onDragStart({ x: touches[0].clientX, y: touches[0].clientY, target, currentTarget });
        };

        const onDrag = ({ touches }: TouchEvent) => {
            if (!this.activeTouches.has(touches[0].identifier)) return;

            if (!options.onDrag) return;
            options.onDrag({ x: touches[0].clientX, y: touches[0].clientY });
        };

        const onDragEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('touchend', onDragEnd);

            if (!options.onDragEnd) return;
            options.onDragEnd({ x: touches[0].clientX, y: touches[0].clientY });
        };

        element.addEventListener('touchstart', onDragStart);

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onDragStart);
            },
        };
    }

    /**
     * Swipe gesture - detects directional swipes
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch- Directions of the swipe
     * @param {number} options.touchNumber - Number of fingers necessary for the swipe
     */
    swipe(options: {element: HTMLElement | string, callback: (direction?: GestureDirection) => void, touchNumber: number}) {
        if (!options) return console.error('Options not provided for swipe!');
        let swipeTimer: NodeJS.Timeout | null;
        let direction: GestureDirection | undefined;
        let distance: number | undefined;
        let isSwipe = true;
        const SWIPE_MIN_DISTANCE = 100;

        options.touchNumber ||= 1;

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onSwipeStart = ({ touches }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            if (this.activeTouches.size > options.touchNumber) {
                // If the user has added two swipes with different fingers this way we can differentiate them
                document.removeEventListener('touchmove', onSwipe);
                document.removeEventListener('touchend', onSwipeEnd);
            }

            if (this.activeTouches.size !== options.touchNumber) return;

            swipeTimer = setTimeout(() => {
                isSwipe = false;
                clearTimeout(swipeTimer!);
                swipeTimer = null;
            }, 1000);

            document.addEventListener('touchmove', onSwipe);
            document.addEventListener('touchend', onSwipeEnd);
        };

        const onSwipe = ({ touches }: TouchEvent) => {
            if (!this.activeTouches.has(touches[0].identifier)) return;

            const startTouch = this.activeTouches.get(touches[0].identifier);
            if (!startTouch) return;
            
            const { clientX: startX, clientY: startY } = startTouch;

            const diffX = touches[0].clientX - startX;
            const diffY = touches[0].clientY - startY;

            direction = getDirection(diffX, diffY);
            distance = distanceBetweenTwoPoints(startX, startY, touches[0].clientX, touches[0].clientY); // To prevent slight taps to be considered as swipes
        };

        const onSwipeEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);

            if (this.activeTouches.size !== 0) return;

            document.removeEventListener('touchmove', onSwipe);
            document.removeEventListener('touchend', onSwipeEnd);

            if (isSwipeComplete()) {
                options.callback(direction);
            }

            clearTimeout(swipeTimer!);
            isSwipe = true;
            swipeTimer = null;
        };

        const isSwipeComplete = () => {
            return isSwipe && direction && distance && distance > SWIPE_MIN_DISTANCE;
        };

        element.addEventListener('touchstart', onSwipeStart);

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onSwipeStart);
            },
        };
    }

    /**
     * Pinch gesture - two-finger pinch zoom
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    pinch(options: {
        element: HTMLElement | string, 
        callback: ({pinchDelta, midpoint}: {pinchDelta: number, midpoint: Point}) => void
    }) {
        if (!options) return console.error('Options not provided for pinch!');
        let distance: number;
        const PINCH_DELTA_NUMBER = 40;

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onPinchStart = ({ touches }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            if (this.activeTouches.size < MULTIPLE_TOUCHES_MIN_NUMBER) return;

            const touch0 = this.activeTouches.get(0);
            const touch1 = this.activeTouches.get(1);
            if (!touch0 || !touch1) return

            document.addEventListener('touchmove', onPinch);
            document.addEventListener('touchend', onPinchEnd);

            distance = distanceBetweenTwoPoints(
                touch0.clientX,
                touch0.clientY,
                touch1.clientX,
                touch1.clientY
            );
        };

        const onPinch = ({ touches }: TouchEvent) => {
            if (this.activeTouches.size !== MULTIPLE_TOUCHES_MIN_NUMBER) return;

            this.activeTouches.set(touches[0].identifier, touches[0]);

            const touch1 = this.activeTouches.get(0);
            const touch2 = this.activeTouches.get(1);
            if (!touch1 || !touch2) return;

            const newDistance = distanceBetweenTwoPoints(
                touch1.clientX,
                touch1.clientY,
                touch2.clientX,
                touch2.clientY
            );

            const pinchDelta = Math.sign(newDistance - distance) * PINCH_DELTA_NUMBER;
            distance = newDistance;

            const midpoint = getMidPoint(
                touch1.clientX,
                touch1.clientY,
                touch2.clientX,
                touch2.clientY
            );

            if (options.callback) options.callback({ pinchDelta, midpoint });
        };
        const onPinchEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);

            if (this.activeTouches.size !== 0) return;

            document.removeEventListener('touchmove', onPinch);
            document.removeEventListener('touchend', onPinchEnd);
        };

        element.addEventListener('touchstart', onPinchStart);

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onPinchStart);
            },
        };
    }

    /**
     *
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    rotate(options: {element: HTMLElement | string, callback: (angle: number) => void, }) {
        if (!options) return console.error('Options not provided for rotate!');
        let angle = 0;
        let initialAngle = 0;

        const element = getElement(options.element);

        if (!element) return console.error('Element not found!');

        const onRotate = ({ touches }: TouchEvent) => {
            if (this.activeTouches.size < MULTIPLE_TOUCHES_MIN_NUMBER) return;

            this.activeTouches.set(touches[0].identifier, touches[0]);

            angle = getAngle() - initialAngle;

            if (options.callback) options.callback(angle);
        };

        const onRotateStart = ({ touches }: TouchEvent) => {
            this.activeTouches.set(touches[0].identifier, touches[0]);

            if (this.activeTouches.size !== MULTIPLE_TOUCHES_MIN_NUMBER) return;

            initialAngle = getAngle() - angle;

            document.addEventListener('touchmove', onRotate);
            document.addEventListener('touchend', onRotateEnd);
        };

        const onRotateEnd = ({ touches }: TouchEvent) => {
            this.activeTouches.delete(touches[0].identifier);

            document.removeEventListener('touchmove', onRotate);
            document.removeEventListener('touchend', onRotateEnd);
        };

        element.addEventListener('touchstart', onRotateStart);

        const getAngle = () => {
            const fullRotation = 360;
            const rotationOffset = 90;

            const offsetY = this.activeTouches.get(0)!.clientY - this.activeTouches.get(1)!.clientY;
            const offsetX = this.activeTouches.get(0)!.clientX - this.activeTouches.get(1)!.clientX;

            return (toDeg(Math.atan2(offsetY, offsetX)) + fullRotation + rotationOffset) % fullRotation;
        };

        return {
            /**
             * Removes the event listeners
             */
            remove() {
                element.removeEventListener('touchstart', onRotateStart);
            },
        };
    }
}

export default new TouchGestures();
