/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface DragBaseOptions {
    element: string;
    restrictTo?: string;
    dragClass?: string;
    lockAxis?: 'x' | 'y';
    onDragStart?: (element: HTMLElement) => void;
    onDragMove?: (position: { x: number; y: number }) => void;
    onDragEnd?: (element: HTMLElement) => void;
}

export interface Offset {
    x: number;
    y: number;
}

export interface DragActionParams {
    x: number,
    y: number,
    index: number
}

/**
 * Makes an element draggable
 */
abstract class DragBase {
    protected draggableElements: NodeListOf<HTMLElement> | HTMLElement[] = [];
    protected draggedElement: HTMLElement | null = null;
    protected enabled = false;
    protected offset: Offset = { x: 0, y: 0 };

    protected abstract onMouseDown(e: MouseEvent): void;
    protected abstract onMouseMove(e: MouseEvent): void;
    protected abstract onMouseUp(): void;

    constructor(protected options: DragBaseOptions) {}

    /**
     * Get the index of the dragged item in the draggableElements
     */
    protected get draggedItemIndex(): number {
        return [...this.draggableElements].indexOf(this.draggedElement!);
    }

    /**
     * Gets the body scroll offset to calculate in the dragging
     */
    protected get bodyScrollOffset() {
        return {
            x: document.body.scrollLeft,
            y: document.body.scrollTop,
        };
    }

    protected setPointerOffset(clientX: number, clientY: number, target: HTMLElement) {
        const { x, y } = target.getBoundingClientRect();
        this.offset = {
            x: clientX - x,
            y: clientY - y,
        };
    }
}

export default DragBase;
