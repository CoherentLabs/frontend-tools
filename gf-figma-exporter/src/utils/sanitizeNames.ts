function sanitizeNames(name: string): string {
    name = name.replace(/[<>:"/\\|?*;]/g, '');
    name = name.replace(/\s+/g, '-').toLowerCase();
    return name;
}

export default sanitizeNames;