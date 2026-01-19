import { BACKGROUND_PREFIX, BORDER_PREFIX } from './constants';
import sanitizeNames from './sanitizeNames';

export default function generateImageName(
    name: string,
    id: string,
    type: 'background' | 'border' | 'full'
): string {
    const prefix = setPrefix(type);
    return `images/${prefix}${sanitizeNames(name)}_${sanitizeNames(id)}.png`;
}

function setPrefix(type: 'background' | 'border' | 'full'): string {
    if (type === 'background') {
        return BACKGROUND_PREFIX;
    } else if (type === 'border') {
        return BORDER_PREFIX;
    } else {
        return '';
    }
}
