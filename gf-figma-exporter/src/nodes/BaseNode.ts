import { GFImage } from '../types/commonTypes';
import { generateClassName } from './commonNodeMethods';

export default class GFBaseNode {
    public node: SceneNode;
    public className: string;
    public images: GFImage[] = [];

    constructor(node: SceneNode) {
        this.node = node;
        this.className = generateClassName(this.node.name, this.node.id);
    }

    async createHTML(): Promise<string> {
        return `<div class="${this.className}"></div>`;
    }

    async createCSS(): Promise<string> {
        return '';
    }
}
