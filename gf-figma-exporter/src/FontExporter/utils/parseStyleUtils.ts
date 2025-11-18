import { FontWidth, ParsedStyle } from "./typings";

export function parseStyle(style: string): ParsedStyle {
    const s = style.toLowerCase();

    const italic = isItalicStyle(s);
    const width = getFontWidth(s);

    return { italic, width };
}

export function isItalicStyle(style: string): boolean {
    return style.toLowerCase().includes('italic');
}

export function getFontWidth(style: string): FontWidth | null {
    const s = style.toLowerCase();
    if (s.includes('condensed')) return 'Condensed';
    if (s.includes('expanded')) return 'Expanded';
    return null;
}

export function getFontWidthSuffix(width: FontWidth | null): string {
    return width ? `-${width.toLowerCase()}` : '';
}


