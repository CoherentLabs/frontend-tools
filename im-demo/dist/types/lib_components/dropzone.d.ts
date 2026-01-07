import DragBase, { DragBaseOptions } from '../utils/drag-base';
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
declare class Dropzone extends DragBase {
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
export default Dropzone;
