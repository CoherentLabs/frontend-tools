export function generateOpacity(opacity: number | undefined): string {
    if (opacity === undefined || opacity === 1) {
        return '1';
    }
    return `${opacity}`;
}