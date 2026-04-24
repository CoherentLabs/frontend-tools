/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { clamp, createHash } from '../utils/utility-functions';
import actions from './actions';
import touchGestures, { GestureHandler } from './touch-gestures';

interface ResizeOptions {
    element: string;
    edgeWidth?: number;
    onWidthChange?: (width: number) => void;
    onHeightChange?: (height: number) => void;
    widthMin?: number;
    widthMax?: number;
    heightMin?: number;
    heightMax?: number;
}

type Edge = 'bottom' | 'right' | 'bottomRight';

/**
 * Allows you to resize elements on the screen
 */
class Resize {
    private options: ResizeOptions;
    resizableElement!: HTMLElement;
    enabled: boolean = false;
    activeEdge: Edge | null = null;
    edges: {bottom: HTMLElement | null, right: HTMLElement | null, bottomRight: HTMLElement | null} = {
        bottom: null,
        right: null,
        bottomRight: null,
    };
    private elementRect = {x: 0, y: 0};
    public readonly heightAction: string;
    public readonly widthAction: string;

    private touchEvents: GestureHandler | null = null;
    private _touchEnabled: boolean = false;

    constructor(options: ResizeOptions) {
        const hash = createHash();
        this.heightAction = `resize-height-${hash}`;
        this.widthAction = `resize-width-${hash}`;

        this.options = options;
        this.options.edgeWidth = options.edgeWidth ?? 5;
        this.options.heightMin = this.options.heightMin ?? 50;
        this.options.heightMax = this.options.heightMax ?? window.innerHeight;
        this.options.widthMin = this.options.widthMin ?? 50;
        this.options.widthMax = this.options.widthMax ?? window.innerWidth;

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
     * Initializes the resizing
     */
    private init() {
        if (this.enabled) return;

        this.resizableElement = document.querySelector(this.options.element) as HTMLElement;

        if (!this.resizableElement) return console.error(`${this.options.element} is not a correct selector`);
        this.resizableElement.addEventListener('mousedown', this.onMouseDown);

        this.addEdges();
        this.registerActions();

        this.enabled = true;
    }

    /**
     * Deinitilazes the resizing
     */
    deinit() {
        if (!this.enabled) return;

        this.resizableElement.removeEventListener('mousedown', this.onMouseDown);

        this.removeEdges();
        this.removeActions();

        this.enabled = false;
    }

    /**
     * Handles the mousedown event
     */
    private onMouseDown(event: MouseEvent) {
        this.activeEdge = this.setEdge(event.target as HTMLElement) as Edge;

        if (!this.activeEdge) return;

        const { x, y } = this.resizableElement.getBoundingClientRect();
        this.elementRect = { x, y };

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    /**
     * Handles the mousemove event
     */
    private onMouseMove(event: MouseEvent) {
        const offsetX = event.clientX - this.elementRect.x;
        const offsetY = event.clientY - this.elementRect.y;

        switch (this.activeEdge) {
            case 'bottom':
                actions.execute(this.heightAction, offsetY);
                this.options.onHeightChange && this.options.onHeightChange(offsetY);
                break;
            case 'right':
                actions.execute(this.widthAction, offsetX);
                this.options.onWidthChange && this.options.onWidthChange(offsetX);
                break;
            case 'bottomRight':
                actions.execute(this.heightAction, offsetY);
                actions.execute(this.widthAction, offsetX);
                this.options.onWidthChange && this.options.onWidthChange(offsetX);
                this.options.onHeightChange && this.options.onHeightChange(offsetY);
                break;
        }
    }

    /**
     * Handles the mouseup event
     */
    private onMouseUp() {
        this.activeEdge = null;

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    /**
     * Adds the touch events to fire the actions
     */
    private addTouchEvents() {
        this.touchEvents = touchGestures.drag({
            element: this.resizableElement,
            onDragStart: (event) => {
                this.onMouseDown(event as MouseEvent);
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
     * Sets the active edge when resizing. If there is no edge it returns null
     */
    private setEdge(element: HTMLElement) {
        if (element.dataset.edge) return element.dataset.edge;
        return null;
    }

    /**
     * Checks if the element you are trying to resize has already position relative or absolute set, so it doesn't overwrite them
     */
    private checkPosition() {
        const { position } = getComputedStyle(this.resizableElement);

        if (position === 'absolute' || position === 'relative') return;
        this.resizableElement.style.position = 'relative';
    }

    /**
     * Creates the edge elements and appends them to the resizable element
     */
    private addEdges() {
        this.checkPosition();

        const { width, height } = this.resizableElement.getBoundingClientRect();

        Object.entries(this.edges).forEach(([edge, element]) => {
            element = document.createElement('DIV') as HTMLElement;
            element.dataset.edge = edge;
            element.style.position = 'absolute';

            switch (edge) {
                case 'bottom':
                    element.style.width = `${width - this.options.edgeWidth!}px`;
                    element.style.height = `${this.options.edgeWidth}px`;
                    element.style.bottom = `-${this.options.edgeWidth}px`;
                    break;
                case 'bottomRight':
                    element.style.width = `${this.options.edgeWidth}px`;
                    element.style.height = `${this.options.edgeWidth}px`;
                    element.style.bottom = `-${this.options.edgeWidth}px`;
                    element.style.right = `-${this.options.edgeWidth}px`;
                    break;
                case 'right':
                    element.style.width = `${this.options.edgeWidth}px`;
                    element.style.height = `${height - this.options.edgeWidth!}px`;
                    element.style.right = `-${this.options.edgeWidth}px`;
                    break;
            }

            this.edges[edge as Edge] = element;
            this.resizableElement.appendChild(element);
        });
    }

    /**
     * Removes the edge elements
     */
    private removeEdges() {
        Object.values(this.edges).forEach((edge) => {
            this.resizableElement.removeChild(edge as HTMLElement);
        });
    }

    /**
     * Registers actions
     */
    private registerActions() {
        actions.register(this.heightAction, (height: number) => {
            this.resizableElement.style.height = `${clamp(height, this.options.heightMin!, this.options.heightMax!)}px`;
            this.edges.right!.style.height = `${
                clamp(height, this.options.heightMin!, this.options.heightMax!) - this.options.edgeWidth!
            }px`;
        });

        actions.register(this.widthAction, (width: number) => {
            this.resizableElement.style.width = `${clamp(width, this.options.widthMin!, this.options.widthMax!)}px`;
            this.edges.bottom!.style.width = `${
                clamp(width, this.options.widthMin!, this.options.widthMax!) - this.options.edgeWidth!
            }px`;
        });
    }

    /**
     * Removes the registered actions
     */
    private removeActions() {
        actions.remove(this.heightAction);
        actions.remove(this.widthAction);
    }
}

export default Resize;
