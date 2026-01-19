//@ts-expect-error No types available
import matrixInverse from 'matrix-inverse';
import { applyMatrixToPoint } from '../../node_modules/@figma-plugin/helpers/dist/helpers/applyMatrixToPoint';

/**
 * This method can extract the rotation (in degrees), center point and radius for a radial or diamond gradient
 *
 * @param shapeWidth
 * @param shapeHeight
 * @param t
 */
export default function extractRadialOrDiamondGradientParams(shapeWidth: number, shapeHeight: number, t: Transform) {
    const transform = t.length === 2 ? [...t, [0, 0, 1]] : [...t];

    const mxInv = matrixInverse(transform);

    const centerPoint = applyMatrixToPoint(mxInv, [0.5, 0.5]);
    const rxPoint = applyMatrixToPoint(mxInv, [1, 0.5]);
    const ryPoint = applyMatrixToPoint(mxInv, [0.5, 1]);

    const rx =
        Math.hypot(rxPoint[0] * shapeWidth - centerPoint[0] * shapeWidth, rxPoint[1] * shapeHeight - centerPoint[1] * shapeHeight) /
        shapeHeight;
    const ry =
        Math.hypot(ryPoint[0] * shapeWidth - centerPoint[0] * shapeWidth, ryPoint[1] * shapeHeight - centerPoint[1] * shapeHeight) /
        shapeWidth;

    const angle =
        Math.atan2(
            rxPoint[1] * shapeHeight - centerPoint[1] * shapeHeight,
            rxPoint[0] * shapeWidth - centerPoint[0] * shapeWidth
        ) *
        (180 / Math.PI);

    return {
        rotation: angle,
        center: [centerPoint[0], centerPoint[1]],
        radius: [rx, ry],
    };
}
