/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import DragBase, { DragActionParams, DragBaseOptions } from '../utils/drag-base';
import { createHash } from '../utils/utility-functions';
import actions from './actions';
import touchGestures, { GestureHandler } from './touch-gestures';

export interface DropzoneOptions extends DragBaseOptions {
    dropzones: string[];
    dragStyle?: string;
    dropzoneActiveClass?: string;
    dropType?: 'switch' | 'add' | 'shift' | 'none' | 'ignore';
    onDropZoneEnter?: (element: HTMLElement) => void;
    onDropZoneLeave?: (element: HTMLElement) => void;
    onDrop?: (event: DropEvent) => void;
}

export interface DropEvent {
    preventDefault: () => void;
    target: HTMLElement;
    dropzone: HTMLElement;
}
/**
 * Makes an element draggable with dropzones
 */
class Dropzone extends DragBase {
    protected override options: DropzoneOptions;
    public readonly actionName: string;
    public readonly automaticAction: string;
    dropzones: HTMLElement[] = [];
    draggedOver: HTMLElement | null = null;
    private touchEvents: GestureHandler[] = [];
    private _touchEnabled: boolean = false;

    constructor(options: DropzoneOptions) {
        super(options);
        this.options = options;

        const hash = createHash();
        this.actionName = `drag-and-drop-${hash}`;
        this.automaticAction = `move-to-${hash}`;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);

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

        this.createDropzones();
        if (this.dropzones.length === 0) return;

        this.dropzones.forEach((dropzone) => {
            dropzone.addEventListener('mouseenter', this.onMouseEnter);
            dropzone.addEventListener('mouseleave', this.onMouseLeave);
        });

        this.registerDragActions();

        this.enabled = true;
    }

    /**
     * Deinitializes the dragging
     */
    deinit() {
        if (!this.enabled) return;

        this.draggableElements.forEach(element => element.removeEventListener('mousedown', this.onMouseDown));
        this.dropzones.forEach((dropzone) => {
            dropzone.removeEventListener('mouseenter', this.onMouseEnter);
            dropzone.removeEventListener('mouseleave', this.onMouseLeave);
        });

        this.removeActions();

        this.enabled = false;
    }

    /**
     * mousedown event handler
     */
    protected onMouseDown(event: MouseEvent) {
        this.draggedElement = event.currentTarget as HTMLElement;

        this.draggedElement.style.position = 'absolute';
        this.draggedElement.style.pointerEvents = 'none';

        this.setPointerOffset(event.clientX, event.clientY, this.draggedElement);
        actions.execute(this.actionName, {
            x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
            y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
            index: this.draggedItemIndex,
        });

        this.options.dragStyle && this.draggedElement.classList.add(this.options.dragStyle);
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

        if (this.draggedElement) {
            this.draggedElement.style.position = '';
            this.draggedElement.style.pointerEvents = '';
            this.draggedElement.style.left = '';
            this.draggedElement.style.top = '';
    
            this.options.onDragEnd && this.options.onDragEnd(this.draggedElement);
            this.options.dragStyle && this.draggedElement.classList.remove(this.options.dragStyle);
        }

        this.draggedOver && this.handleDrop();
        this.draggedElement = null;
    }

    /**
     * Handler for the mouseenter event
     */
    protected onMouseEnter(event: MouseEvent) {
        if (!this.draggedElement) return;
        this.draggedOver = event.currentTarget as HTMLElement;

        if (this.options.dropzoneActiveClass) {
            this.draggedOver.classList.add(this.options.dropzoneActiveClass);
        }
    }

    /**
     * Handler for the mouseleave event
     */
    protected onMouseLeave() {
        if (!this.draggedElement) return;

        if (this.options.dropzoneActiveClass && this.draggedOver) {
            this.draggedOver.classList.remove(this.options.dropzoneActiveClass);
        }

        this.draggedOver = null;
    }

    /**
     * Register dragging as an action to be able to use it externally
     */
    private registerDragActions() {
        actions.register(this.actionName, ({ x, y, index }: DragActionParams) => {
            if (!this.draggableElements[index]) return console.error(`There is no draggable element at index ${index}`);

            this.draggableElements[index].style.left = `${x}px`;
            this.draggableElements[index].style.top = `${y}px`;

            this.options.onDragMove && this.options.onDragMove({ x, y });
        });

        actions.register(this.automaticAction, this.automaticMove.bind(this));
    }

    /**
     * Removes the registered actions
     */
    private removeActions() {
        actions.remove(this.actionName);
        actions.remove(this.automaticAction);
    }

    /* eslint-disable max-lines-per-function*/

    /**
     * Adds touch events to the draggable elements
     */
    private addTouchEvents() {
        this.draggableElements.forEach((element) => {
            this.touchEvents.push(
                touchGestures.drag({
                    element,
                    onDragStart: (event) => {
                        this.onMouseDown({ currentTarget: event.currentTarget, clientX: event.x, clientY: event.y } as MouseEvent);
                    },
                    onDrag: ({ x, y }) => {
                        this.onMouseMove({ clientX: x, clientY: y } as MouseEvent);
                        const elementOver = document.elementFromPoint(x, y) as HTMLElement;
                        let dropzone = this.options.dropzones.reduce<HTMLElement | null>((acc, dropzone) => {
                            if (acc || !elementOver) return acc;
                            return (acc = elementOver.closest(dropzone));
                        }, null);

                        if (!dropzone) {
                            dropzone = this.dropzones.includes(elementOver) ? elementOver : null;
                        }

                        if (dropzone) {
                            this.onMouseEnter({ currentTarget: dropzone as EventTarget } as MouseEvent);
                            return;
                        }

                        this.onMouseLeave();
                    },
                    onDragEnd: () => {
                        this.onMouseUp();
                    },
                })
            );
        });
    }

    /* eslint-enable max-lines-per-function */

    /**
     * Removes the touch gestures
     */
    private removeTouchEvents() {
        this.touchEvents.forEach(event => event?.remove());
        this.touchEvents = [];
    }

    /**
     * Automatically drags an element to a dropzone
     * @param {Object} options
     * @param {number} options.elementIndex The index of the element you want to move
     * @param {number} options.dropzoneIndex The index of the dropzone you want to move the element to
     */
    private automaticMove({ elementIndex, dropzoneIndex}: { elementIndex: number, dropzoneIndex: number }) {
        const { x, y } = this.dropzones[dropzoneIndex].getBoundingClientRect();
        const { x: elementX, y: elementY } = this.draggableElements[elementIndex].getBoundingClientRect();

        const direction = {
            x: Math.sign(x - elementX),
            y: Math.sign(y - elementY),
        };

        this.draggableElements[elementIndex].style.position = 'absolute';

        const loop = (newX: number, newY: number) => {
            if (newX === x && newY === y) {
                this.dropzones[dropzoneIndex].appendChild(this.draggableElements[elementIndex]);
                this.draggableElements[elementIndex].style.position = '';
                return;
            }

            newX = newX !== x ? direction.x + newX : newX;
            newY = newY !== y ? direction.y + newY : newY;

            this.draggableElements[elementIndex].style.left = `${newX}px`;
            this.draggableElements[elementIndex].style.top = `${newY}px`;

            if (newX !== x || newY !== y) requestAnimationFrame(() => loop(newX, newY));
        };

        loop(elementX, elementY);
    }

    /**
     * Saves the dropzones
     */
    private createDropzones() {
        this.dropzones = this.options.dropzones.reduce<HTMLElement[]>((acc, dropzone) => {
            const dropzoneElements = [...document.querySelectorAll(dropzone)] as HTMLElement[];
            if (dropzoneElements.length === 0) {
                console.error(`${dropzone} is not a valid html element to be used as a dropzone`);
            }

            return acc.concat(dropzoneElements);
        }, []);
    }

    /**
     * Handler when you drop the dragged item
     */
    private handleDrop() {
        let dropType = this.options.dropType;

        const eventData: DropEvent = {
            preventDefault: () => {
                dropType = "ignore";
            },
            target: this.draggedElement!,
            dropzone: this.draggedOver!,
        };

        if (this.options.onDrop) this.options.onDrop(eventData);

        if (dropType === 'ignore' || !this.draggedOver) return;

        if (this.draggedOver.children.length === 0) dropType = 'add';

        switch (dropType) {
            case 'add':
                this.draggedOver.appendChild(this.draggedElement!);
                break;
            case 'shift':
                this.shiftElements();
                break;
            case 'switch':
                this.draggedElement?.parentNode!.appendChild(this.draggedOver.children[0]);
                this.draggedOver.appendChild(this.draggedElement!);
                break;
            case 'none':
                break;
            default:
                break;
        }

        this.onMouseLeave();
    }

    /**
     * Shifts the element to the nearest empty space
     */
    private shiftElements() {
        const dropzoneIndex = this.dropzones.findIndex(dropzone => dropzone === this.draggedOver);
        const dropzoneChildren = this.dropzones.map((dropzone) => {
            if (dropzone.children[0] === this.draggedElement) return [];
            return [...dropzone.children];
        });

        const closestEmptyIndex = dropzoneChildren.reduce((acc, el, index) => {
            if (el.length === 0) acc = Math.abs(dropzoneIndex - index) < Math.abs(dropzoneIndex - acc) ? index : acc;
            return acc;
        }, 100000);

        const directionEmpty = Math.sign(dropzoneIndex - closestEmptyIndex) > 0 ? 0 : 1;
        const directionDropzone = Math.sign(dropzoneIndex - closestEmptyIndex) < 0 ? 0 : 1;

        dropzoneChildren.splice(dropzoneIndex + directionDropzone, 0, [this.draggedElement!]);
        dropzoneChildren.splice(closestEmptyIndex + directionEmpty, 1);

        dropzoneChildren.forEach((children, index) => {
            children.forEach(child => this.dropzones[index].appendChild(child));
        });
    }
}

export default Dropzone;
