import { GF_PREFIX } from "./constants";
import sanitizeNames from "./sanitizeNames";

const INVALID_CSS_IDENT_START = /^-?[0-9]/;

export default function generateClassName(name: string, id: string): string {
    const className = `${sanitizeNames(name)}-${sanitizeNames(id)}`;
    return INVALID_CSS_IDENT_START.test(className) ? `${GF_PREFIX}${className}` : className;
}