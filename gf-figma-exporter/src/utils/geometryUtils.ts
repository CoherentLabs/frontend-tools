function getOrthogonalProjectionFromPointToLine(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
): { x: number; y: number } {
    const AP = { x: point.x - lineStart.x, y: point.y - lineStart.y };
    const AB = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };
    const ab2 = AB.x * AB.x + AB.y * AB.y;
    const ap_ab = AP.x * AB.x + AP.y * AB.y;
    const t = ap_ab / ab2;
    return { x: lineStart.x + t * AB.x, y: lineStart.y + t * AB.y };
}

function isInsideRectangle(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function extendLineOutsideBox(
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
    box: { x: number; y: number; width: number; height: number }
): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
    const boxLines = [
        // Top edge
        { start: { x: box.x, y: box.y }, end: { x: box.x + box.width, y: box.y } },
        // Right edge
        { start: { x: box.x + box.width, y: box.y }, end: { x: box.x + box.width, y: box.y + box.height } },
        // Bottom edge
        { start: { x: box.x, y: box.y + box.height }, end: { x: box.x + box.width, y: box.y + box.height } },
        // Left edge
        { start: { x: box.x, y: box.y }, end: { x: box.x, y: box.y + box.height } },
    ];

    for (const boxLine of boxLines) {
        const intersection = getLineIntersection(lineStart, lineEnd, boxLine.start, boxLine.end);
        if (intersection) {
            return { start: intersection.start, end: intersection.end };
        }
    }

    return null;
}

function getLineIntersection(
    line1Start: { x: number; y: number },
    line1End: { x: number; y: number },
    line2Start: { x: number; y: number },
    line2End: { x: number; y: number }
): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
    const A1 = line1End.y - line1Start.y;
    const B1 = line1Start.x - line1End.x;
    const C1 = A1 * line1Start.x + B1 * line1Start.y;

    const A2 = line2End.y - line2Start.y;
    const B2 = line2Start.x - line2End.x;
    const C2 = A2 * line2Start.x + B2 * line2Start.y;

    const determinant = A1 * B2 - A2 * B1;

    if (determinant === 0) {
        // Lines are parallel
        return null;
    }

    const intersectionX = (B2 * C1 - B1 * C2) / determinant;
    const intersectionY = (A1 * C2 - A2 * C1) / determinant;

    return {
        start: { x: intersectionX, y: intersectionY },
        end: { x: intersectionX, y: intersectionY },
    };
}

function findClosestTopCorner(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
    const topLeft = { x: rect.x, y: rect.y };
    const topRight = { x: rect.x + rect.width, y: rect.y };
    const distToLeft = getDistanceBetweenPoints(point, topLeft);
    const distToRight = getDistanceBetweenPoints(point, topRight);
    return distToLeft < distToRight ? topLeft : topRight;
}

function findClosestBottomCorner(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
    const bottomLeft = { x: rect.x, y: rect.y + rect.height };
    const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };
    const distToLeft = getDistanceBetweenPoints(point, bottomLeft);
    const distToRight = getDistanceBetweenPoints(point, bottomRight);
    return distToLeft < distToRight ? bottomLeft : bottomRight;
}

function getDistanceBetweenPoints(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function mapPercentToPointOnLine(
    percent: number,
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
): { x: number; y: number } {
    return {
        x: parseFloat((lineStart.x + (lineEnd.x - lineStart.x) * percent).toFixed(2)),
        y: parseFloat((lineStart.y + (lineEnd.y - lineStart.y) * percent).toFixed(2)),
    };
}

function mapPointToPercentOnLine(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lineLengthSquared = dx * dx + dy * dy;
    if (lineLengthSquared === 0) return 0; // Avoid division by zero

    const px = point.x - lineStart.x;
    const py = point.y - lineStart.y;
    // Project vector (lineStart -> point) onto (lineStart -> lineEnd)
    const percent = (px * dx + py * dy) / lineLengthSquared;
    return percent;
}

function getLineStartAndEndFromAngleAndDistance(
    angleInRadians: number,
    distance: number,
    center: { x: number; y: number }
): { start: { x: number; y: number }; end: { x: number; y: number } } {
    const halfDistance = distance / 2;
    const deltaX = Math.cos(angleInRadians) * halfDistance;
    const deltaY = Math.sin(angleInRadians) * halfDistance;

    return {
        start: { x: center.x - deltaX, y: center.y - deltaY },
        end: { x: center.x + deltaX, y: center.y + deltaY },
    };
}

function getTopProjectionOutsideBox(
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
    box: { x: number; y: number; width: number; height: number }
): { x: number; y: number } | null {
    const topLeftProjection = getOrthogonalProjectionFromPointToLine({ x: box.x, y: box.y }, lineStart, lineEnd);
    const topRightProjection = getOrthogonalProjectionFromPointToLine(
        { x: box.x + box.width, y: box.y },
        lineStart,
        lineEnd
    );

    let result = isInsideRectangle(topLeftProjection, box) ? topRightProjection : topLeftProjection;

    if (!isInsideRectangle(result, box)) {
        // If the projection is outside the box, find the closest top corner
        result =
            getDistanceBetweenPoints(topLeftProjection, { x: box.x, y: box.y }) <
            getDistanceBetweenPoints(topRightProjection, { x: box.x + box.width, y: box.y })
                ? topLeftProjection
                : topRightProjection;
    }

    return result;
}

function getBottomProjectionOutsideBox(
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
    box: { x: number; y: number; width: number; height: number }
): { x: number; y: number } | null {
    const bottomLeftProjection = getOrthogonalProjectionFromPointToLine(
        { x: box.x, y: box.y + box.height },
        lineStart,
        lineEnd
    );
    const bottomRightProjection = getOrthogonalProjectionFromPointToLine(
        { x: box.x + box.width, y: box.y + box.height },
        lineStart,
        lineEnd
    );

    let result = isInsideRectangle(bottomLeftProjection, box) ? bottomRightProjection : bottomLeftProjection;

    if (!isInsideRectangle(result, box)) {
        // If the projection is outside the box, find the closest bottom corner
        result =
            getDistanceBetweenPoints(bottomLeftProjection, { x: box.x, y: box.y + box.height }) <
            getDistanceBetweenPoints(bottomRightProjection, { x: box.x + box.width, y: box.y + box.height })
                ? bottomLeftProjection
                : bottomRightProjection;
    }

    return result;
}

function findRotatedEllipseAxisLengths(halfWidth: number, halfHeight: number, angle: number): { semiMajor: number; semiMinor: number } {
    const W = halfWidth * halfWidth;
    const H = halfHeight * halfHeight;
    const alpha = angle % (2 * Math.PI);

    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);
    const cos2A = Math.cos(2 * alpha);

    if (Math.abs(cos2A) < 1e-10) {
        throw new Error("cos(2A) is too close to zero, cannot compute axes reliably.");
    }

    const a2_minus_b2 = (W - H) / cos2A;

    // Equation: W = a² * cos²(α) + b² * sin²(α)
    // So: a² = (W - b² * sin²(α)) / cos²(α)
    // But we can solve directly for b² using substitution

    const b2 = (H * cosA * cosA - W * sinA * sinA) / (cosA * cosA - sinA * sinA);
    const a2 = b2 + a2_minus_b2;

    if (a2 < 0 || b2 < 0) {
        throw new Error("Invalid geometry: calculated negative squared axis length.");
    }

    const semiMajor = Math.sqrt(Math.max(a2, b2));
    const semiMinor = Math.sqrt(Math.min(a2, b2));

    return { semiMajor, semiMinor };
}
export {
    getOrthogonalProjectionFromPointToLine,
    isInsideRectangle,
    extendLineOutsideBox,
    getLineIntersection,
    getDistanceBetweenPoints,
    mapPercentToPointOnLine,
    mapPointToPercentOnLine,
    findClosestTopCorner,
    findClosestBottomCorner,
    findRotatedEllipseAxisLengths,
    getLineStartAndEndFromAngleAndDistance,
    getTopProjectionOutsideBox,
    getBottomProjectionOutsideBox,
};
