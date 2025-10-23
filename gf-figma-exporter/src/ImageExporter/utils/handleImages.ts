import { NodesWithFillsAndStrokes } from '../../types/commonTypes';

import generateImageName from '../../utils/generateImageName';

interface GFImageResult {
    name: string;
    data: Uint8Array | null;
}

async function handleImage(node: NodesWithFillsAndStrokes, type: 'background' | 'border'): Promise<GFImageResult> {
    const result: GFImageResult = { name: '', data: null };
    result.data = await node.exportAsync({ format: 'PNG' });
    result.name = generateImageName(node.name, node.id, type);

    return result;
}

export default handleImage;
