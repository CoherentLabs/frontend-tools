/**
 * Converts radians to degrees
 */
export declare function toDeg(rad: number): number;
/**
 * Clamps a value in a range
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Creates a random 5 character hash
 */
export declare function createHash(): string;
/**
 * Get the distance between two points
 */
export declare function distanceBetweenTwoPoints(x1: number, y1: number, x2: number, y2: number): number;
/**
 * 2D coordinate point
 */
export interface Point {
    /** Horizontal position */
    x: number;
    /** Vertical position */
    y: number;
}
/**
 * Calculates the midpoint between two points
 */
export declare function getMidPoint(x1: number, y1: number, x2: number, y2: number): Point;
