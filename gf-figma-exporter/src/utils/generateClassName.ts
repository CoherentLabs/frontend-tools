import sanitizeNames from "./sanitizeNames";

export default function generateClassName(name: string, id: string): string {
    return `${sanitizeNames(name)}-${sanitizeNames(id)}`;
}