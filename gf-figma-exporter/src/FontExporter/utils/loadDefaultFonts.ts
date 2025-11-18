export default function loadDefaultFonts(
    fontWeights: string[],
    subsets: string[]
): { family: string; subsets: string[]; weights: string[] } {
    return {
        family: 'noto-sans',
        subsets: subsets,
        weights: fontWeights,
    };
}
