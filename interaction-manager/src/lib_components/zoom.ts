/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createHash } from '../utils/utility-functions';
import actions from './actions';
import touchGestures, { GestureHandler } from './touch-gestures';


interface ZoomOptions {
    element: string,
    minZoom: number,
    maxZoom: number,
    zoomFactor: number,
    onZoom: Function
}
/**
 * Pan and zoom
 */
class Zoom {
    private options: ZoomOptions;
    enabled: boolean = false;
    public readonly actionName = `pan-and-zoom-${createHash()}`;
    offset = { x: 0, y: 0 }
    transform = { x: 0, y: 0, scale: 1 };
    private touchEvents: GestureHandler | null = null;
    zoomableElement!: HTMLElement
    private _touchEnabled: boolean = false;

    constructor(options: ZoomOptions) {
        this.options = options;
        this.options.maxZoom = this.options.maxZoom || Infinity;
        this.options.minZoom = this.options.minZoom || 0.1;
        this.options.zoomFactor = this.options.zoomFactor || 0.1;

        this.onWheel = this.onWheel.bind(this);

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
     * Initialize the pan and zoom
     */
    private init() {
        if (this.enabled) return;

        this.zoomableElement = document.querySelector(this.options.element) as HTMLElement;
        if (!this.zoomableElement) return console.error(`${this.options.element} is not a correct element selector`);

        this.zoomableElement.addEventListener('wheel', this.onWheel);

        this.registerActions();

        this.zoomableElement.style.transformOrigin = 'top left';

        this.enabled = true;
    }

    /**
     * Deinitilize the pan and zoom
     */
    deinit() {
        if (!this.enabled) return;

        this.zoomableElement.removeEventListener('wheel', this.onWheel);
        this.removeActions();

        this.enabled = false;
    }

    /**
     * Handles the wheel event
     */
    private onWheel(event: WheelEvent) {
        event.preventDefault();

        actions.execute(this.actionName, {
            x: event.clientX,
            y: event.clientY,
            zoomDirection: Math.sign(event.deltaY),
        });
    }

    /**
     * Registers the actions for the pan and zoom
     */
    private registerActions() {
        actions.register(this.actionName, ({ x, y, zoomDirection }: {x: number, y: number, zoomDirection: number}) => {
            const offset = this.calculateOffsets(x, y);

            this.options.onZoom && this.options.onZoom();

            const scale = Number((this.transform.scale - zoomDirection * this.options.zoomFactor).toFixed(5));
            if (scale < this.options.minZoom || scale > this.options.maxZoom) return;

            const zoomPoint = {
                x: offset.x / this.transform.scale,
                y: offset.y / this.transform.scale,
            };

            const transform = this.transform;

            transform.x += zoomPoint.x * (this.transform.scale - scale);
            transform.y += zoomPoint.y * (this.transform.scale - scale);
            transform.scale = scale;

            this.zoomableElement.style.transform = `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y})`;

            this.transform = transform;
        });
    }

    /**
     * Removes the registered actions
     */
    private removeActions() {
        actions.remove(this.actionName);
    }

    /**
     * Add pinch and stretch touch events
     */
    private addTouchEvents() {
        this.touchEvents = touchGestures.pinch({
            element: this.zoomableElement,
            callback: ({ pinchDelta, midpoint }) => {
                actions.execute(this.actionName, {
                    x: midpoint.x,
                    y: midpoint.y,
                    zoomDirection: Math.sign(pinchDelta) * -1,
                });
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
     * Calculates the mouse coordinates inside the element
     */
    private calculateOffsets(x: number, y: number) {
        const elementRect = this.zoomableElement.getBoundingClientRect();

        return {
            x: x - elementRect.x,
            y: y - elementRect.y,
        };
    }
}

export default Zoom;
