import { currentPageSize } from './currentPage';

export function convertPXtoVH(px: number): number {
    const VH = (px / currentPageSize.get().height) * 100;
    return VH;
}

export function getPercentage(value: number, total: number): number {
    return (value / total) * 100;
}