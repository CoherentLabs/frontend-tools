export type GestureDirection = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/**
 * @param {number} diffX - Difference in X axis
 * @param {number} diffY - Difference in Y axis
 */
export declare function getDirection(diffX: number, diffY: number): GestureDirection | undefined;
export declare function getElement(element: HTMLElement | string): HTMLElement | null;
