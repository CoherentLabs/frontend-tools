import DragBase, { DragBaseOptions } from '../utils/drag-base';
/**
 * Makes an element draggable
 */
declare class Draggable extends DragBase {
    readonly actionName: string;
    private elementRect;
    private restrict;
    private touchEvents;
    private _touchEnabled;
    constructor(options: DragBaseOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    private init;
    /**
     * Removes the eventlisteners
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
     * Register dragging as an action to be able to use it externally
     */
    private registerDragActions;
    /**
     * Removes the registered action
     */
    private removeDragActions;
    /**
     * Add touch gestures to drag the element
     */
    private addTouchEvents;
    /**
     * Removes the touch gestures
     */
    private removeTouchEvents;
    /**
     * Sets the bounds if a dragged element has to be restricted
     */
    private setRestriction;
}
export default Draggable;
