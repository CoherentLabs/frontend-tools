export type GestureDirection = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/**
 * @param {number} diffX - Difference in X axis
 * @param {number} diffY - Difference in Y axis
 */
export function getDirection(diffX: number, diffY: number): GestureDirection | undefined {
    const MIN_SWIPE_OFFSET = 200;
    if (diffY < 0 && diffX > -MIN_SWIPE_OFFSET && diffX < MIN_SWIPE_OFFSET) return 'top';
    if (diffY > 0 && diffX > -MIN_SWIPE_OFFSET && diffX < MIN_SWIPE_OFFSET) return 'bottom';
    if (diffX < 0 && diffY > -MIN_SWIPE_OFFSET && diffY < MIN_SWIPE_OFFSET) return 'left';
    if (diffX > 0 && diffY > -MIN_SWIPE_OFFSET && diffY < MIN_SWIPE_OFFSET) return 'right';
    if (diffX <= -MIN_SWIPE_OFFSET && diffY <= -MIN_SWIPE_OFFSET) return 'top-left';
    if (diffX >= MIN_SWIPE_OFFSET && diffY <= -MIN_SWIPE_OFFSET) return 'top-right';
    if (diffX <= -MIN_SWIPE_OFFSET && diffY >= MIN_SWIPE_OFFSET) return 'bottom-left';
    if (diffX >= MIN_SWIPE_OFFSET && diffY >= MIN_SWIPE_OFFSET) return 'bottom-right';
}

export function getElement(element: HTMLElement | string): HTMLElement | null {
    return element instanceof HTMLElement ? element : document.querySelector(element);
}
