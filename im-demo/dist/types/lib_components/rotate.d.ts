interface RotateOptions {
    element: string;
    /**  Snaps the rotating element to increments of that angle */
    snapAngle?: number;
    onRotation?: (angle: number) => void;
}
/**
 * Allows for an element to be rotated
 */
declare class Rotate {
    private options;
    rotatingElement: HTMLElement | null;
    elementPosition: {
        x: number;
        y: number;
    };
    angle: number;
    enabled: boolean;
    initalAngle: number;
    readonly actionName: string;
    private touchEvents;
    private _touchEnabled;
    constructor(options: RotateOptions);
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled: boolean);
    /**
     * Initializes the rotation
     */
    private init;
    /**
     * Deinitilizes the rotation
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
     * Registers the actions
     */
    private registerAction;
    /**
     * Removes the action
     */
    private removeActions;
    /**
     * Add rotate touch events
     */
    private addTouchEvents;
    /**
     * Removes the touch events
     */
    private removeTouchEvents;
    /**
     * Finds the angle from the mouse coordinates based on the center of the element that is rotating
     */
    private getAngle;
}
export default Rotate;
