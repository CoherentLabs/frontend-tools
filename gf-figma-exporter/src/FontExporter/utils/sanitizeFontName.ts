export default function sanitizeFontName(fontName: string): string {
    return fontName.replace(/[^a-z0-9]/gi, '-').toLowerCase(); // Replace non-alphanumeric characters with hyphens and convert to lowercase
}