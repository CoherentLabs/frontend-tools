export function base64toUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function isBase64(str: string | Uint8Array): boolean {
    if (typeof str !== 'string' || str === '') return false;
    try {
        // Just try to decode it. If it's invalid, this throws an error.
        return window.atob(str) ? true : false;
    } catch (e) {
        return false;
    }
}
