import generateImageName from '../../utils/generateImageName';

interface GFImageResult {
    name: string;
    data: Uint8Array | null;
}

async function handleImage(node: SceneNode, type: 'background' | 'border' |  'full', format: ExportSettings['format'], originalID?: string): Promise<GFImageResult> {
    const result: GFImageResult = { name: '', data: null };

    try {
        result.data = await node.exportAsync({ format });
    } catch (error) {
        console.error('[handleImage] exportAsync failed for node', node.name, node.id, error);
        throw error;
    }

    result.name = generateImageName(node.name, originalID ? originalID : node.id, type, format === 'SVG' ? 'svg' : 'png');

    return result;
}

export default handleImage;
