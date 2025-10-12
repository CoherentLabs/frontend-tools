import GFEllipse from "./nodes/Ellipse/Ellipse";
import GFFrame from "./nodes/Frame/Frame";
import GFRectangle from "./nodes/Rectangle/Rectangle";

interface FactoryResult {
    html: string;
    css: string;
    images: { name: string; data: Uint8Array | null }[];
}


const NODE_TYPES = {
    RECTANGLE: GFRectangle,
    FRAME: GFFrame,
    GROUP: GFFrame, // Treat GROUPs like FRAMEs for this purpose
    ELLIPSE: GFEllipse
}
const TYPES = {
    FRAME: "FRAME",
    RECTANGLE: "RECTANGLE",
    ELLIPSE: "ELLIPSE",
    GROUP: "GROUP"
}

async function generateCode(node: SceneNode): Promise<FactoryResult> {
    const result = { html: '', css: '', images: [] };

    if (!Object.prototype.hasOwnProperty.call(TYPES, node.type)) return result;

    const NodeClassRef = NODE_TYPES[node.type as keyof typeof NODE_TYPES];
    if (NodeClassRef) {
        //@ts-expect-error
        const instance = new NodeClassRef(node);
        if (node.type === 'FRAME' || node.type === 'GROUP') {
            await (instance as GFFrame).init();
        }
        result.html += await instance.createHTML();
        result.css += await instance.createCSS();
        result.images = result.images.concat(instance.images);
    }
    return result;
}

export default generateCode;