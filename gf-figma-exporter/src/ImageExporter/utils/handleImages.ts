import generateImageName from '../../utils/generateImageName';

interface GFImageResult {
    name: string;
    data: Uint8Array | null;
}

async function handleImage(node: SceneNode, type: 'background' | 'border' |  'full', format: ExportSettings['format'], originalID?: string): Promise<GFImageResult> {
    const result: GFImageResult = { name: '', data: null };
    result.data = await node.exportAsync({ format });
    result.name = generateImageName(node.name, originalID ? originalID : node.id, type);

    return result;
}

export default handleImage;
