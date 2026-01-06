/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Converts radians to degrees
 */
export function toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

/**
 * Clamps a value in a range
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Creates a random 5 character hash
 */
export function createHash(): string {
    return (Math.random() + 1).toString(36).substring(7);
}

/**
 * Get the distance between two points
 */
export function distanceBetweenTwoPoints(x1: number, y1: number, x2: number, y2: number): number {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.hypot(a, b);
}

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
export function getMidPoint(x1: number, y1: number, x2: number, y2: number): Point {
    return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
    };
}
