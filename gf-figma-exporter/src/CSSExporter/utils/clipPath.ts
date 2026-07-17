import { SVGNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import { MAX_CLIP_PATH_POINTS } from '../../utils/constants';
import flattenSVGPath from '../../utils/flattenSVGPath';

export async function createClipPath(node: SVGNodes): Promise<{ clipPath: string | null; isTooComplex: boolean }> {
    const { fillGeometry } = node;

    if (!fillGeometry || fillGeometry.length === 0 || !node.width || !node.height) {
        return { clipPath: null, isTooComplex: false };
    }

    // Every fill region — whether it's a separate disjoint shape (e.g. a menu icon's bars, each its own
    // fillGeometry entry) or a hole within one shape (a ring, signaled by a second EVENODD-wound subpath
    // inside a single entry) — needs to end up in the same clip-path. Concatenating the raw data strings
    // and letting buildClipPath split/bridge them handles both cases uniformly; it doesn't matter which
    // fillGeometry entry a subpath originally came from.
    const path = fillGeometry.map((geometry) => geometry.data).join(' ');
    return await buildClipPath(path, node.width, node.height);
}

export async function buildClipPath(
    path: string,
    width: number,
    height: number
): Promise<{ clipPath: string | null; isTooComplex: boolean }> {
    const subpaths = (await flattenSVGPath(path, width, height, 1)).filter((subpath) => subpath.length > 0);

    if (subpaths.length === 0) {
        return { clipPath: null, isTooComplex: false };
    }

    const points = bridgeSubpaths(subpaths);

    if (points.length > MAX_CLIP_PATH_POINTS) {
        return { clipPath: null, isTooComplex: true };
    }

    const polygon = points
        .map((point) => `${getPercentage(point.x, width).toFixed(2)}% ${getPercentage(point.y, height).toFixed(2)}%`)
        .join(', ');

    // evenodd (rather than the nonzero default) doesn't depend on the relative winding direction of the
    // bridged-in subpaths — any point is "inside" only if a ray from it crosses an odd number of edges —
    // which is what makes the keyhole bridge below correctly produce holes/disjoint regions regardless
    // of how each original subpath happened to be wound. For a single simple (non-self-intersecting)
    // subpath, evenodd and nonzero are equivalent, so this doesn't change anything for the common case.
    return { clipPath: `polygon(evenodd, ${polygon})`, isTooComplex: false };
}

// Combines multiple independent subpath point loops into a single, non-self-intersecting boundary via
// the "keyhole" technique: each subpath after the first is spliced into the combined boundary by walking
// to its closest point from the current boundary, tracing the subpath fully, then walking back along the
// exact same edge (a zero-width "slit"). The slit has no area, so it has no visible effect, but it lets
// one polygon() represent holes and/or multiple disjoint regions that clip-path otherwise has no way to
// express at all.
function bridgeSubpaths(subpaths: { x: number; y: number }[][]): { x: number; y: number }[] {
    let combined = subpaths[0];

    for (let i = 1; i < subpaths.length; i++) {
        combined = bridgeOne(combined, subpaths[i]);
    }

    return combined;
}

function bridgeOne(
    combined: { x: number; y: number }[],
    subpath: { x: number; y: number }[]
): { x: number; y: number }[] {
    const { combinedIndex, subpathIndex } = findClosestPointPair(combined, subpath);
    const bridgePoint = combined[combinedIndex];
    const rotatedSubpath = [...subpath.slice(subpathIndex), ...subpath.slice(0, subpathIndex)];
    const entryPoint = rotatedSubpath[0];

    return [
        ...combined.slice(0, combinedIndex + 1),
        ...rotatedSubpath,
        entryPoint,
        bridgePoint,
        ...combined.slice(combinedIndex + 1),
    ];
}

function findClosestPointPair(
    a: { x: number; y: number }[],
    b: { x: number; y: number }[]
): { combinedIndex: number; subpathIndex: number } {
    let minDistance = Infinity;
    let combinedIndex = 0;
    let subpathIndex = 0;

    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            const dx = a[i].x - b[j].x;
            const dy = a[i].y - b[j].y;
            const distance = dx * dx + dy * dy;

            if (distance < minDistance) {
                minDistance = distance;
                combinedIndex = i;
                subpathIndex = j;
            }
        }
    }

    return { combinedIndex, subpathIndex };
}
