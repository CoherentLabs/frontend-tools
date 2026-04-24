function sanitizeNames(name: string): string {
    name = name.replace(/[<>:"/\\|?*;.]/g, '');
    name = name.replace(/=/g, '-');
    name = name.replace(/\s+/g, '-').toLowerCase();
    name = name.replace(/-{2,}/g, '-');
    return name;
}

export default sanitizeNames;