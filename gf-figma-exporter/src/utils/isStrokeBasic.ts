import { NodesWithFillsAndStrokes } from "../types/commonTypes";

/**
 * Returns true if the node's strokeGeometry is composed only of sharp-corner rectangles.
 * Accepts multiple rectangular subpaths (e.g., a frame built from strips/squares).
 * Rejects any curves (C/Q) or non-rectangular polygons (zig-zags, stars, etc.).
 */
export default function isBasicStroke(node: NodesWithFillsAndStrokes): boolean {
    if (!node.strokeGeometry || node.strokeGeometry.length === 0) return false;

    // Tunable tolerances
    const DIST_EPS = 1e-6; // distance equality / duplicate point threshold
    const AREA_EPS = 1e-9; // collinearity threshold (area ~ 0)
    const ORTHO_EPS = 1e-9; // right-angle threshold (dot ~ 0)
    const LENGTH_EPS = 1e-6; // opposite-side length equality (squared lengths)

    type Point = { x: number; y: number };

    /** --- Math helpers --- */
    const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
    const dot = (u: Point, v: Point) => u.x * v.x + u.y * v.y;
    const len2 = (u: Point) => u.x * u.x + u.y * u.y;
    const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
    const isRightAngle = (u: Point, v: Point) => Math.abs(dot(u, v)) <= ORTHO_EPS * Math.sqrt(len2(u) * len2(v));

    /** Tokenize "SVG-like" path data: commands + numbers (handles 'M0', 'L-20', etc.) */
    function tokenize(pathData: string): string[] {
        const re = /[MLCQZ]|-?\d+(?:\.\d+)?/g;
        const matches = [];
        let match;
        while ((match = re.exec(pathData)) !== null) {
            matches.push(match[0]);
        }
        return matches;
    }

    /** Parse into subpaths (each subpath is an array of points). Curves => empty (auto-fail). */
    function parseSubpaths(pathData: string): Point[][] {
        const t = tokenize(pathData);
        const out: Point[][] = [];
        let current: Point[] | null = null;

        for (let i = 0; i < t.length; ) {
            const cmd = t[i++];

            if (cmd === 'M') {
                if (current && current.length) out.push(current);
                current = [];
                const x = parseFloat(t[i++]),
                    y = parseFloat(t[i++]);
                current.push({ x, y });
            } else if (cmd === 'L') {
                const x = parseFloat(t[i++]),
                    y = parseFloat(t[i++]);
                current && current.push({ x, y });
            } else if (cmd === 'Z') {
                if (current) {
                    out.push(current);
                    current = null;
                }
            } else if (cmd === 'C' || cmd === 'Q') {
                // Any curve => not a basic (sharp-corner) stroke
                return [];
            }
        }
        if (current && current.length) out.push(current);
        return out;
    }

    /** Remove duplicate closing point and simplify collinear vertices *cyclically*. */
    function simplifyClosedPolygon(raw: Point[]): Point[] {
        if (raw.length < 2) return raw.slice();

        // 1) Drop consecutive duplicates
        const dedup: Point[] = [raw[0]];
        for (let i = 1; i < raw.length; i++) {
            if (dist(raw[i], dedup[dedup.length - 1]) > DIST_EPS) dedup.push(raw[i]);
        }

        // 2) Remove closing point if it's the same as the first
        if (dedup.length >= 2 && dist(dedup[0], dedup[dedup.length - 1]) <= DIST_EPS) {
            dedup.pop();
        }

        // 3) Iteratively remove collinear vertices on a *cycle*
        const pts = dedup.slice();
        let changed = true;
        while (changed && pts.length > 3) {
            changed = false;
            const n = pts.length;
            const toRemove: number[] = [];
            for (let i = 0; i < n; i++) {
                const a = pts[(i - 1 + n) % n];
                const b = pts[i];
                const c = pts[(i + 1) % n];
                const ab = sub(b, a);
                const bc = sub(c, b);
                const area2 = ab.x * bc.y - ab.y * bc.x;
                if (Math.abs(area2) <= AREA_EPS) {
                    toRemove.push(i);
                }
            }
            if (toRemove.length) {
                // Remove from highest index to lowest to avoid reindexing issues
                toRemove.sort((x, y) => y - x).forEach((idx) => pts.splice(idx, 1));
                changed = true;
            }
        }
        return pts;
    }

    /** Check if a simplified subpath is a rectangle (any rotation). */
    function isRectangularSubpath(points: Point[]): boolean {
        const pts = simplifyClosedPolygon(points);
        if (pts.length !== 4) return false;

        const e0 = sub(pts[1], pts[0]);
        const e1 = sub(pts[2], pts[1]);
        const e2 = sub(pts[3], pts[2]);
        const e3 = sub(pts[0], pts[3]);

        // Right angles at all corners
        if (!(isRightAngle(e0, e1) && isRightAngle(e1, e2) && isRightAngle(e2, e3) && isRightAngle(e3, e0))) {
            return false;
        }
        // Opposite sides equal
        if (Math.abs(len2(e0) - len2(e2)) > LENGTH_EPS) return false;
        if (Math.abs(len2(e1) - len2(e3)) > LENGTH_EPS) return false;

        return true;
    }

    /** --- Evaluate the whole strokeGeometry --- */
    let totalSubpaths = 0;

    for (const path of node.strokeGeometry) {
        const subpaths = parseSubpaths(path.data);
        if (subpaths.length === 0) return false; // curves or parse failure

        for (const sp of subpaths) {
            if (sp.length === 0) continue;
            totalSubpaths++;
            if (!isRectangularSubpath(sp)) return false;
        }
    }

    return totalSubpaths > 0;
}
