import { BACKGROUND_PREFIX, BORDER_PREFIX } from './constants';
import sanitizeNames from './sanitizeNames';

export default function generateImageName(name: string, id: string, type: 'background' | 'border' | 'full'): string {
    const prefix = type === 'background' ? BACKGROUND_PREFIX : type === 'border' ? BORDER_PREFIX : '';
    return `images/${prefix}${sanitizeNames(name)}_${sanitizeNames(id)}.png`;
}
