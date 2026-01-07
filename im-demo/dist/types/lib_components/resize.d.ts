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
declare class Resize {
    private options;
    resizableElement: HTMLElement;
    enabled: boolean;
    activeEdge: Edge | null;
    edges: {
        bottom: HTMLElement | null;
        right: HTMLElement | null;
        bottomRight: HTMLElement | null;
    };
    private elementRect;
    readonly heightAction: string;
    readonly widthAction: string;
    private touchEvents;
    private _touchEnabled;
    constructor(options: ResizeOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initializes the resizing
     */
    private init;
    /**
     * Deinitilazes the resizing
     */
    deinit(): void;
    /**
     * Handles the mousedown event
     */
    private onMouseDown;
    /**
     * Handles the mousemove event
     */
    private onMouseMove;
    /**
     * Handles the mouseup event
     */
    private onMouseUp;
    /**
     * Adds the touch events to fire the actions
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Sets the active edge when resizing. If there is no edge it returns null
     */
    private setEdge;
    /**
     * Checks if the element you are trying to resize has already position relative or absolute set, so it doesn't overwrite them
     */
    private checkPosition;
    /**
     * Creates the edge elements and appends them to the resizable element
     */
    private addEdges;
    /**
     * Removes the edge elements
     */
    private removeEdges;
    /**
     * Registers actions
     */
    private registerActions;
    /**
     * Removes the registered actions
     */
    private removeActions;
}
export default Resize;
