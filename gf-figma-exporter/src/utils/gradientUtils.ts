import { extractLinearGradientParamsFromTransform } from '../../node_modules/@figma-plugin/helpers/dist/index';
import createRGBAColor from './createRGBAColor';
import {
    getBottomProjectionOutsideBox,
    getTopProjectionOutsideBox,
    mapPercentToPointOnLine,
    mapPointToPercentOnLine,
} from './geometryUtils';

import extractRadialOrDiamondGradientParams from './extractRadialOrDiamondGradientParams';
import mixRgbaColors from './mixRGBAColors';


export function linearGradientHandle(
    paint: GradientPaint,
    shapeWidth: number,
    shapeHeight: number,
    shapeX: number,
    shapeY: number
): { gradient: string } {
    const { start, end } = extractLinearGradientParamsFromTransform(shapeWidth, shapeHeight, paint.gradientTransform);

    // Calculate angle in degrees
    const absoluteEnd = [end[0] + shapeY, end[1] + shapeX];
    const absoluteStart = [start[0] + shapeY, start[1] + shapeX];

    const deltaX = absoluteStart[0] - absoluteEnd[0];
    const deltaY = absoluteStart[1] - absoluteEnd[1];
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = ((angleRad * 180) / Math.PI + 270) % 360; // Convert to degrees and adjust

    // Get Color Stop start and end

    const topLeftProjection = getTopProjectionOutsideBox(
        { x: start[0], y: start[1] },
        { x: end[0], y: end[1] },
        { x: 0, y: 0, width: shapeWidth, height: shapeHeight }
    );

    const bottomLeftProjection = getBottomProjectionOutsideBox(
        { x: start[0], y: start[1] },
        { x: end[0], y: end[1] },
        { x: 0, y: 0, width: shapeWidth, height: shapeHeight }
    );

    const stops = paint.gradientStops
        .map((stop) => {
            const { r, g, b, a } = stop.color;
            const color = createRGBAColor(r, g, b, a);
            const pointOnGradientLine = mapPercentToPointOnLine(
                stop.position,
                { x: start[0], y: start[1] },
                { x: end[0], y: end[1] }
            );
            const percentOnSubLine =
                angleDeg < 90 || angleDeg > 270
                    ? mapPointToPercentOnLine(pointOnGradientLine, bottomLeftProjection!, topLeftProjection!)
                    : mapPointToPercentOnLine(pointOnGradientLine, topLeftProjection!, bottomLeftProjection!);

            const position = `${(percentOnSubLine * 100).toFixed(2)}%`;
            return `${color} ${position}`;
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

    const gradientScale = `50% 50% at 50% 50%`;
    const size = `height: ${(radius[0] * 200).toFixed(2)}%;\n width: ${(radius[1] * 200).toFixed(2)}%;`;
    const position = `left: ${(center[0] * 100).toFixed(2)}%;\ntop: ${(center[1] * 100).toFixed(2)}%;`;

    const stops = paint.gradientStops
        .map((stop, index, self) => {
            const { r, g, b } = stop.color;
            let a = stop.color.a;

            if (index === self.length - 1) a = 0; // Make last stop transparent to avoid hard edge

            return `${createRGBAColor(r, g, b, a)} ${stop.position * 100}%`;
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

    const radiusScale = (radius[1] * shapeWidth) / (radius[0] * shapeHeight);

    const stops = paint.gradientStops
        .map((stop, index, self) => {
            const { r, g, b, a } = stop.color;
            if (index === 0 || index === self.length - 1) {
                return `${createRGBAColor(r, g, b, a)} ${stop.position * 100}%`;
            }

            // Mixing colors to simulate changing radius in conic gradient
            const prevAddedStop = mixRgbaColors(self[index - 1].color, stop.color);
            const nextAddedStop = mixRgbaColors(stop.color, self[index + 1].color);

            return `${createRGBAColor(...prevAddedStop)} ${
                Math.abs(100 - stop.position * 100) - radiusScale * 15 - 1
            }%, ${createRGBAColor(r, g, b, a)} ${stop.position * 100}%, ${createRGBAColor(...nextAddedStop)} ${
                stop.position * 100 + radiusScale * 15 + 1
            }%`;
        })
        .join(', ');

    return {
        gradient: `conic-gradient(from ${(rotation + 90).toFixed(2)}deg at ${center[0] * 100}% ${
            center[1] * 100
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

    for (const direction of gradientDirections) {
        const stops = paint.gradientStops
            .map((stop, index, self) => {
                const { r, g, b } = stop.color;
                let a = stop.color.a;

                if (index === self.length - 1) a = 0; // Make last stop transparent to avoid hard edge

                const color = createRGBAColor(r, g, b, a);

                const position = `${((stop.position / 2) * 100).toFixed(2)}%`;
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
