export default function sanitizeFontName(fontName: string): string {
    return fontName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}