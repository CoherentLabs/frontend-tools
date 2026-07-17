import { currentPageSize } from './currentPage';

export function convertPXtoVH(px: number): number {
    const height = currentPageSize.get().height;
    if (!height) return 0;
    return (px / height) * 100;
}

export function getPercentage(value: number, total: number): number {
    if (!total) return 0;
    return (value / total) * 100;
}