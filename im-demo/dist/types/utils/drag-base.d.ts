export interface DragBaseOptions {
    element: string;
    restrictTo?: string;
    dragClass?: string;
    lockAxis?: 'x' | 'y';
    onDragStart?: (element: HTMLElement) => void;
    onDragMove?: (position: {
        x: number;
        y: number;
    }) => void;
    onDragEnd?: (element: HTMLElement) => void;
}
export interface Offset {
    x: number;
    y: number;
}
export interface DragActionParams {
    x: number;
    y: number;
    index: number;
}
/**
 * Makes an element draggable
 */
declare abstract class DragBase {
    protected options: DragBaseOptions;
    protected draggableElements: NodeListOf<HTMLElement> | HTMLElement[];
    protected draggedElement: HTMLElement | null;
    protected enabled: boolean;
    protected offset: Offset;
    protected abstract onMouseDown(e: MouseEvent): void;
    protected abstract onMouseMove(e: MouseEvent): void;
    protected abstract onMouseUp(): void;
    constructor(options: DragBaseOptions);
    /**
     * Get the index of the dragged item in the draggableElements
     */
    protected get draggedItemIndex(): number;
    /**
     * Gets the body scroll offset to calculate in the dragging
     */
    protected get bodyScrollOffset(): {
        x: number;
        y: number;
    };
    protected setPointerOffset(clientX: number, clientY: number, target: HTMLElement): void;
}
export default DragBase;
