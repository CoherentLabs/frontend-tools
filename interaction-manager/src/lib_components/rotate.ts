/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createHash, toDeg } from '../utils/utility-functions';
import actions from './actions';
import touchGestures, { GestureHandler } from './touch-gestures';

const fullRotation = 360;
const rotationOffset = 90;

interface RotateOptions {
    element: string;
    /**  Snaps the rotating element to increments of that angle */
    snapAngle?: number;
    onRotation?: (angle: number) => void;
}

/**
 * Allows for an element to be rotated
 */
class Rotate {
    private options: RotateOptions;
    rotatingElement: HTMLElement | null = null;
    elementPosition = { x: 0, y: 0 };
    angle = 0;
    enabled = false;
    initalAngle = 0;
    public readonly actionName = `rotate-${createHash()}`;
    private touchEvents: GestureHandler | null = null;
    private _touchEnabled: boolean = false;

    constructor(options: RotateOptions) {
        this.options = options;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.init();
    }

    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean) {
        if (this._touchEnabled === enabled) return;
        this._touchEnabled = enabled;
        this._touchEnabled ? this.addTouchEvents() : this.removeTouchEvents();
    }

    /**
     * Initializes the rotation
     */
    private init() {
        if (this.enabled) return;

        this.rotatingElement = this.rotatingElement || document.querySelector(this.options.element);

        if (!this.rotatingElement) return console.error(`${this.options.element} is not a valid element selector`);
        this.rotatingElement.addEventListener('mousedown', this.onMouseDown);

        this.registerAction();

        this.enabled = true;
    }

    /**
     * Deinitilizes the rotation
     */
    deinit() {
        if (!this.enabled) return;

        this.rotatingElement!.removeEventListener('mousedown', this.onMouseDown);
        this.removeActions();

        this.enabled = false;
    }

    /**
     * Handles the mousedown event
     */
    private onMouseDown(event: MouseEvent) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        const { x, y, height, width } = this.rotatingElement!.getBoundingClientRect();
        this.elementPosition = { x: x + width / 2, y: y + height / 2 };

        const angle = this.getAngle(event.clientX, event.clientY);
        this.initalAngle = angle - this.angle;
    }

    /**
     * Handles the mousemove event
     */
    private onMouseMove(event: MouseEvent) {
        this.angle = this.getAngle(event.clientX, event.clientY) - this.initalAngle;

        if (this.options.snapAngle) {
            this.angle = Math.floor(this.angle / this.options.snapAngle) * this.options.snapAngle;
        }

        actions.execute(this.actionName, this.angle);
    }

    /**
     * Handles the mouseup event
     */
    private onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    /**
     * Registers the actions
     */
    private registerAction() {
        actions.register(this.actionName, (angle: number) => {
            this.rotatingElement!.style.transform = `rotate(${angle}deg)`;
            this.options.onRotation && this.options.onRotation(angle < 0 ? fullRotation + angle : angle);
        });
    }

    /**
     * Removes the action
     */
    private removeActions() {
        actions.remove(this.actionName);
    }

    /**
     * Add rotate touch events
     */
    private addTouchEvents() {
        this.touchEvents = touchGestures.drag({
            element: this.rotatingElement!,
            onDragStart: ({ x, y }) => {
                this.onMouseDown({ clientX: x, clientY: y } as MouseEvent);
            },
            onDrag: ({ x, y }) => {
                this.onMouseMove({ clientX: x, clientY: y } as MouseEvent);
            },
            onDragEnd: () => {
                this.onMouseUp();
            },
        });
    }

    /**
     * Removes the touch events
     */
    private removeTouchEvents() {
        this.touchEvents?.remove();
        this.touchEvents = null;
    }

    /**
     * Finds the angle from the mouse coordinates based on the center of the element that is rotating
     */
    private getAngle(x: number, y: number) {
        const offsetX = x - this.elementPosition.x;
        const offsetY = y - this.elementPosition.y;
        return (toDeg(Math.atan2(offsetY, offsetX)) + fullRotation + rotationOffset) % fullRotation;
    }
}

export default Rotate;
