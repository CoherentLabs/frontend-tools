export default function verticalAlignToFlex(verticalAlign: 'TOP' | 'CENTER' | 'BOTTOM'): string {
    switch (verticalAlign) {
        case 'TOP':
            return 'flex-start';
        case 'CENTER':
            return 'center';
        case 'BOTTOM':
            return 'flex-end';
        default:
            return 'flex-start';
    }
}