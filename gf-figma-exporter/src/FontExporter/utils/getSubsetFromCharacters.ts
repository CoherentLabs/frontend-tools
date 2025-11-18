export default function getSubsetFromCharacters(characters: string): string[] {
    const subsets = new Set<string>();

    for (const char of characters) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) continue;
        const subset = getUnicodeSubset(codePoint);
        subsets.add(subset);
    }

    return Array.from(subsets);
}

function getUnicodeSubset(codePoint: number): string {
    if (codePoint >= 0x0000 && codePoint <= 0x00FF) {
        return 'latin';
    } else if (codePoint >= 0x0100 && codePoint <= 0x017F) {
        return 'latin-ext';
    } else if (codePoint >= 0x0400 && codePoint <= 0x04FF) {
        return 'cyrillic';
    } else if (codePoint >= 0x0500 && codePoint <= 0x052F) {
        return 'cyrillic-ext';
    } else if (codePoint >= 0x0370 && codePoint <= 0x03FF) {
        return 'greek';
    } else if (codePoint >= 0x1F00 && codePoint <= 0x1FFF) {
        return 'greek-ext';
    } else if (codePoint >= 0x0590 && codePoint <= 0x05FF) {
        return 'hebrew';
    } else if (codePoint >= 0x0600 && codePoint <= 0x06FF) {
        return 'arabic';
    } else if (codePoint >= 0x0900 && codePoint <= 0x097F) {
        return 'devanagari';
    } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
        return 'chinese-simplified';
    } else if (codePoint >= 0x3400 && codePoint <= 0x4DBF) {
        return 'chinese-traditional';
    } else {
        return 'latin'; // default subset
    } 
}