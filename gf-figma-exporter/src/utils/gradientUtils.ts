import { extractLinearGradientParamsFromTransform } from '../../node_modules/@figma-plugin/helpers/dist/index';
import createRGBAColor from './createRGBAColor';
import extractRadialOrDiamondGradientParams from './extractRadialOrDiamondGradientParams';
import mixRgbaColors from './mixRGBAColors';

// Whichever end of the gradient is already more transparent is the intended "fade to nothing" side;
// forcing it fully transparent avoids a hard edge where CSS would otherwise paint that stop's color
// solid beyond the gradient's mapped ellipse/diamond. Ties default to the last stop (prior behavior).
export function getFadeToTransparentIndex(stops: readonly ColorStop[]): number {
    const firstAlpha = stops[0].color.a;
    const lastAlpha = stops[stops.length - 1].color.a;

    return firstAlpha < lastAlpha ? 0 : stops.length - 1;
}

export function linearGradientHandle(
    paint: GradientPaint,
    shapeWidth: number,
    shapeHeight: number,
): { gradient: string } {
    const { start, end } = extractLinearGradientParamsFromTransform(shapeWidth, shapeHeight, paint.gradientTransform);

    // Calculate angle in degrees
    // const absoluteEnd = [end[0] + shapeY, end[1] + shapeX];
    // const absoluteStart = [start[0] + shapeY, start[1] + shapeX];

    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    const dyCartesian = -deltaY; // Invert Y axis for Cartesian coordinate system
    const angleRad = Math.atan2(dyCartesian, deltaX);
    const angleDeg = (90 - (angleRad * 180) / Math.PI + 360) % 360; // Convert to degrees and adjust

    // Get Color Stop start and end
    const cssRad = (angleDeg * Math.PI) / 180;

    // We project the corners onto the gradient vector to find the CSS 0% and 100%
    // The gradient line direction vector (normalized):
    const gx = Math.sin(cssRad);
    const gy = -Math.cos(cssRad); // Y is flipped in CSS rendering logic

    // Find the extent of the shape along this gradient vector
    // We project all 4 corners and find min/max projection
    const corners = [
        { x: 0, y: 0 },
        { x: shapeWidth, y: 0 },
        { x: shapeWidth, y: shapeHeight },
        { x: 0, y: shapeHeight },
    ];

    let minProj = Infinity;
    let maxProj = -Infinity;

    corners.forEach((c) => {
        // Project corner onto gradient vector: dot product
        // (Relative to center doesn't matter for length, but helps visualization)
        const proj = c.x * gx + c.y * gy;
        if (proj < minProj) minProj = proj;
        if (proj > maxProj) maxProj = proj;
    });

    const cssLength = maxProj - minProj;

    // 4. Project Figma Start/End points onto the Gradient Vector
    const startProj = start[0] * gx + start[1] * gy;
    const endProj = end[0] * gx + end[1] * gy;

    // 5. Map the Projections to Percentages relative to the CSS Box
    // CSS 0% is at 'minProj', CSS 100% is at 'maxProj'
    const getPercent = (proj: number) => (proj - minProj) / cssLength;

    const realStartT = getPercent(startProj);
    const realEndT = getPercent(endProj);

    // 6. Adjust Stops
    // NewPercent = StartT + (StopOffset * (EndT - StartT))
    const stops = paint.gradientStops
        .map((stop) => {
            const finalPercent = realStartT + stop.position * (realEndT - realStartT);
            return `${createRGBAColor(stop.color.r, stop.color.g, stop.color.b, stop.color.a)} ${(finalPercent * 100).toFixed(2)}%`;
        })
        .join(', ');

    // Build Gradient object

    return {
        gradient: `linear-gradient(${angleDeg.toFixed(2)}deg, ${stops})`,
    };
}

export function radialGradientHandle(
    paint: GradientPaint,
    shapeHeight: number,
    shapeWidth: number
): { gradient: string; rotation: string; size: string; position: string } {
    const { center, radius, rotation } = extractRadialOrDiamondGradientParams(
        shapeWidth,
        shapeHeight,
        paint.gradientTransform
    );

    const gradientScale = `50% 50% at 50% 50%`; // Keeping gradient centered to avoid odd behavior with radial gradients
    const size = `height: ${(radius[0] * 200).toFixed(2)}%;\n width: ${(radius[1] * 200).toFixed(2)}%;`;
    const position = `left: ${(center[0] * 100).toFixed(2)}%;\ntop: ${(center[1] * 100).toFixed(2)}%;`;

    const transparentIndex = getFadeToTransparentIndex(paint.gradientStops);

    const stops = paint.gradientStops
        .map((stop, index) => {
            const { r, g, b } = stop.color;
            const a = index === transparentIndex ? 0 : stop.color.a;

            return `${createRGBAColor(r, g, b, a)} ${(stop.position * 100).toFixed(2)}%`;
        })
        .join(', ');

    return {
        gradient: `radial-gradient(${gradientScale}, ${stops})`,
        rotation: (rotation + 90).toFixed(2),
        size,
        position,
    };
}

export function angularGradientHandle(
    paint: GradientPaint,
    shapeWidth: number,
    shapeHeight: number
): { gradient: string } {
    const { center, rotation, radius } = extractRadialOrDiamondGradientParams(
        shapeWidth,
        shapeHeight,
        paint.gradientTransform
    );

    const GRADIENT_STOP_LIMIT = 15;

    const radiusScale = (radius[1] * shapeWidth) / (radius[0] * shapeHeight); // Since there is no radius in conic gradients, we simulate it by adjusting color stops

    const stops = paint.gradientStops
        .map((stop, index, self) => {
            const { r, g, b, a } = stop.color;
            if (index === 0 || index === self.length - 1) {
                return `${createRGBAColor(r, g, b, a)} ${(stop.position * 100).toFixed(2)}%`;
            }

            // Mixing colors to simulate changing radius in conic gradient
            const prevAddedStop = mixRgbaColors(self[index - 1].color, stop.color);
            const nextAddedStop = mixRgbaColors(stop.color, self[index + 1].color);

            return `${createRGBAColor(...prevAddedStop)} ${
                (Math.abs(100 - stop.position * 100) - radiusScale * GRADIENT_STOP_LIMIT - 1).toFixed(2)
            }%, ${createRGBAColor(r, g, b, a)} ${(stop.position * 100).toFixed(2)}%, ${createRGBAColor(...nextAddedStop)} ${
                (stop.position * 100 + radiusScale * GRADIENT_STOP_LIMIT + 1).toFixed(2)
            }%`;
        })
        .join(', ');

    return {
        gradient: `conic-gradient(from ${(rotation + 90).toFixed(2)}deg at ${(center[0] * 100).toFixed(2)}% ${
            (center[1] * 100).toFixed(2)
        }%, ${stops})`,
    };
}

export function diamondGradientHandle(
    paint: GradientPaint,
    shapeWidth: number,
    shapeHeight: number
): { gradient: string; size: string; position: string; rotation: string } {
    const { center, radius, rotation } = extractRadialOrDiamondGradientParams(
        shapeWidth,
        shapeHeight,
        paint.gradientTransform
    );

    const size = `height: ${(radius[0] * 200).toFixed(2)}%;\n width: ${(radius[1] * 200).toFixed(2)}%;`;

    const position = `left: ${(center[0] * 100).toFixed(2)}%;\ntop: ${(center[1] * 100).toFixed(2)}%;`;

    const gradientDirections = ['top left', 'top right', 'bottom right', 'bottom left'];
    const gradients = [];
    const transparentIndex = getFadeToTransparentIndex(paint.gradientStops);

    for (const direction of gradientDirections) {
        const stops = paint.gradientStops
            .map((stop, index) => {
                const { r, g, b } = stop.color;
                const a = index === transparentIndex ? 0 : stop.color.a;

                const color = createRGBAColor(r, g, b, a);

                const position = `${((stop.position / 2) * 100).toFixed(2)}%`; // Dividing by 2 to have gradient cover only half the distance
                return `${color} ${position}`;
            })
            .join(', ');

        gradients.push(`linear-gradient(to ${direction}, ${stops}) ${direction} / 50% 50% no-repeat`);
    }

    return {
        gradient: gradients.join(', '),
        size,
        position,
        rotation: (rotation + 90).toFixed(2),
    };
}
