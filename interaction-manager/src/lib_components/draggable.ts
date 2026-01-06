/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import DragBase, { DragActionParams, DragBaseOptions } from '../utils/drag-base';
import { clamp, createHash } from '../utils/utility-functions';
import actions from './actions';
import touchGestures, { GestureHandler } from './touch-gestures';

const AXIS = ['x', 'y'] as const;

/**
 * Makes an element draggable
 */
class Draggable extends DragBase {
    public readonly actionName = `drag-around-${createHash()}`;
    private elementRect!: DOMRect; 
    private restrict = { top: 0, left: 0, right: Infinity, bottom: Infinity }
    private touchEvents: GestureHandler[] = []
    private _touchEnabled = false;

    constructor(options: DragBaseOptions) {
        super(options);
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

    private init() {
        if (this.enabled) return;

        this.draggableElements = document.querySelectorAll(this.options.element);
        if (this.draggableElements.length === 0) {
            return console.error(`${this.options.element} is not a valid element selector.`);
        }

        this.draggableElements.forEach(element => element.addEventListener('mousedown', this.onMouseDown));

        this.registerDragActions();
        this.enabled = true;
    }

    /**
     * Removes the eventlisteners
     */
    deinit() {
        if (!this.enabled) return;
        this.enabled = false;

        this.draggableElements.forEach(element => element.removeEventListener('mousedown', this.onMouseDown));
        this.removeDragActions();
    }

    /**
     * mousedown event handler
     */
    protected onMouseDown(event: MouseEvent) {
        this.draggedElement = event.currentTarget as HTMLElement;

        this.draggedElement.style.position = 'absolute';
        this.elementRect = this.draggedElement.getBoundingClientRect();

        this.setRestriction();
        this.setPointerOffset(event.clientX, event.clientY, this.draggedElement);

        actions.execute(this.actionName, {
            x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
            y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
            index: this.draggedItemIndex,
        });

        this.options.dragClass && this.draggedElement.classList.add(this.options.dragClass);
        this.options.onDragStart && this.options.onDragStart(this.draggedElement);

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    /**
     * mousemove event handler
     */
    protected onMouseMove(event: MouseEvent) {
        actions.execute(this.actionName, {
            x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
            y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
            index: this.draggedItemIndex,
        });
    }

    /**
     * mouseup event handler
     */
    protected onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        this.options.onDragEnd && this.options.onDragEnd(this.draggedElement!);
        this.options.dragClass && this.draggedElement!.classList.remove(this.options.dragClass);

        this.draggedElement = null;
    }

    /**
     * Register dragging as an action to be able to use it externally
     */
    private registerDragActions() {
        actions.register(this.actionName, ({ x, y, index }: DragActionParams) => {
            if (!this.draggableElements[index]) return console.error(`There is no draggable element at index ${index}`);

            if (this.options.lockAxis && AXIS.includes(this.options.lockAxis)) {
                x = this.options.lockAxis === 'y' ? this.elementRect.x : x;
                y = this.options.lockAxis === 'x' ? this.elementRect.y : y;
            }

            this.draggableElements[index].style.left = `${clamp(x, this.restrict.left, this.restrict.right)}px`;
            this.draggableElements[index].style.top = `${clamp(y, this.restrict.top, this.restrict.bottom)}px`;

            this.options.onDragMove && this.options.onDragMove({ x, y });
        });
    }

    /**
     * Removes the registered action
     */
    private removeDragActions() {
        actions.remove(this.actionName);
    }

    /**
     * Add touch gestures to drag the element
     */
    private addTouchEvents() {
        this.draggableElements.forEach((element) => {
            this.touchEvents.push(
                touchGestures.drag({
                    element,
                    onDragStart: (event) => {
                        this.onMouseDown({ currentTarget: event.currentTarget, clientX: event.x, clientY: event.y } as MouseEvent);
                    },
                    onDrag: ({x, y}) => {
                        this.onMouseMove({ clientX: x, clientY: y } as MouseEvent);
                    },
                    onDragEnd: () => {
                        this.onMouseUp();
                    },
                })
            );
        });
    }

    /**
     * Removes the touch gestures
     */
    private removeTouchEvents() {
        this.touchEvents.forEach(event => event?.remove());
        this.touchEvents = [];
    }

    /**
     * Sets the bounds if a dragged element has to be restricted
     */
    private setRestriction() {
        if (!this.options.restrictTo) return;

        const restrictTo = document.querySelector(this.options.restrictTo);
        if (!restrictTo) {
            return console.error(
                `The element ${this.options.restrictTo} you trying to restrict dragging to is not a valid element`
            );
        }

        const { x, y, height, width } = restrictTo.getBoundingClientRect();
        this.restrict = {
            top: y,
            left: x,
            right: width + x - this.elementRect.width,
            bottom: height + y - this.elementRect.height,
        };
    }
}

export default Draggable;
