import hasImage from "../utils/hasImage";
import sanitizeNames from "../utils/sanitizeNames";

interface GFImageResult {
    name: string;
    buffer: Uint8Array | null;
}

type SceneNodeWithFills = SceneNode & { fills: readonly Paint[] | PluginAPI["mixed"] };

async function handleImage(node: SceneNodeWithFills): Promise<GFImageResult> {
    const { fills } = node;

    const result = { name: '', buffer: null } as GFImageResult;

    // @ts-expect-error If the fill is 'figma.mixed' it won't have length property, but if it's an array it will
    if (!fills || typeof fills === 'string' || fills.length === 0) {
        return result;
    }

    if (!hasImage(node.fills)) {
        return result;
    }

    result.buffer = await node.exportAsync({ format: 'PNG' });
    result.name = `images/${sanitizeNames(node.name)}.png`;

    return result;
}

export default handleImage;