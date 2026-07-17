export default function createRGBAColor(r: number, g: number, b: number, a: number = 1): string {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`;
}
