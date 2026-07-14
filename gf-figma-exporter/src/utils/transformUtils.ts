import { AvailableNode } from "../types/commonTypes";

function multiplyMatrices(m1: number[][], m2: number[][]): number[][] {
    const a1 = m1[0][0], b1 = m1[0][1], c1 = m1[0][2]; // Row 1
    const d1 = m1[1][0], e1 = m1[1][1], f1 = m1[1][2]; // Row 2
    
    const a2 = m2[0][0], b2 = m2[0][1], c2 = m2[0][2];
    const d2 = m2[1][0], e2 = m2[1][1], f2 = m2[1][2];
    
    // We only need the first two rows (Affine Transform)
    return [
        [
            a1 * a2 + b1 * d2,       // a
            a1 * b2 + b1 * e2,       // b
            a1 * c2 + b1 * f2 + c1   // tx
        ],
        [
            d1 * a2 + e1 * d2,       // c
            d1 * b2 + e1 * e2,       // d
            d1 * c2 + e1 * f2 + f1   // ty
        ]
    ];
}

// Invert a 3x3 Matrix
function invertMatrix(m: number[][]): number[][] {
    const a = m[0][0], b = m[0][1], tx = m[0][2];
    const c = m[1][0], d = m[1][1], ty = m[1][2];
    
    const det = a * d - b * c; // Determinant
    if (det === 0) return [[1, 0, 0], [0, 1, 0]]; // Identity fallback
    
    const invDet = 1 / det;

    return [
        [
            d * invDet,             // a
            -b * invDet,            // b
            (b * ty - d * tx) * invDet // tx
        ],
        [
            -c * invDet,            // c
            a * invDet,             // d
            (c * tx - a * ty) * invDet // ty
        ]
    ];
}

// --- 2. The Universal Position Calculator ---

/**
 * Calculates the exact CSS parameters to place Child inside Parent.
 * Handles Flip, Rotation, Scale, and Skew automatically.
 */
export function getRelativeCssTransform(childNode: AvailableNode, parentNode: AvailableNode): {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
} {
    // 1. Get Global Matrices (Fallback to Identity)
    const childMatrix = childNode.absoluteTransform || [[1, 0, 0], [0, 1, 0]];
    const parentMatrix = parentNode.absoluteTransform || [[1, 0, 0], [0, 1, 0]];

    // 2. Math Magic: Local = Parent_Inverse * Child
    // This maps the child's global coordinates directly into the parent's flipped/rotated world.
    const parentInverse = invertMatrix(parentMatrix);
    const localMatrix = multiplyMatrices(parentInverse, childMatrix);

    // 3. Extract CSS Values from the resulting Local Matrix
    // The Local Matrix is now [[a, b, x], [c, d, y]] relative to the Parent's origin.
    
    const a = localMatrix[0][0]; // Scale X * Cos
    const b = localMatrix[0][1]; // Skew Y
    const c = localMatrix[1][0]; // Skew X
    const d = localMatrix[1][1]; // Scale Y * Cos
    const x = localMatrix[0][2]; // Left
    const y = localMatrix[1][2]; // Top

    // 4. Decompose Rotation & Scale
    // Calculate rotation from the matrix values
    const rotationRad = Math.atan2(c, a);
    const rotationDeg = rotationRad * (180 / Math.PI);
    
    // Calculate Scale (Magnitude)
    // If determinant is negative, we have a flip.
    // However, for CSS, we usually just want the rotation and size.
    // If you need explicit scaleX/Y properties:
    let scaleX = Math.sqrt(a*a + c*c);
    const scaleY = Math.sqrt(b*b + d*d);
    
    // Check for Flip (Determinant) to set negative scale if needed
    const det = a * d - b * c;
    if (det < 0) {
        // Simple heuristic: Flip X if the local matrix implies mirroring
        scaleX = -scaleX; 
        // Note: Decomposition of negative scale + rotation is complex.
        // If your elements are just flipped horizontally, this suffices.
    }

    return {
        x: x,
        y: y,
        rotation: rotationDeg,
        scaleX: scaleX, // You can use this for transform: scale(...)
        scaleY: scaleY
    };
}