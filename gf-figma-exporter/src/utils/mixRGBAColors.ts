export default function mixRgbaColors(
    rgba1: ColorStop['color'],
    rgba2: ColorStop['color']
): [r: number, g: number, b: number, a: number] {
    const { r: r1, g: g1, b: b1, a: a1 } = rgba1;
    const { r: r2, g: g2, b: b2, a: a2 } = rgba2;

    // Interpolate each component
    const r = (r1 + r2) / 2;
    const g = (g1 + g2) / 2;
    const b = (b1 + b2) / 2;
    const a = +((a1 + a2) / 2).toFixed(3); // round alpha to 3 decimals

    return [r, g, b, a];
}
