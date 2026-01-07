interface ZoomOptions {
    element: string;
    minZoom: number;
    maxZoom: number;
    zoomFactor: number;
    onZoom: Function;
}
/**
 * Pan and zoom
 */
declare class Zoom {
    private options;
    enabled: boolean;
    readonly actionName: string;
    offset: {
        x: number;
        y: number;
    };
    transform: {
        x: number;
        y: number;
        scale: number;
    };
    private touchEvents;
    zoomableElement: HTMLElement;
    private _touchEnabled;
    constructor(options: ZoomOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initialize the pan and zoom
     */
    private init;
    /**
     * Deinitilize the pan and zoom
     */
    deinit(): void;
    /**
     * Handles the wheel event
     */
    private onWheel;
    /**
     * Registers the actions for the pan and zoom
     */
    private registerActions;
    /**
     * Removes the registered actions
     */
    private removeActions;
    /**
     * Add pinch and stretch touch events
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Calculates the mouse coordinates inside the element
     */
    private calculateOffsets;
}
export default Zoom;
