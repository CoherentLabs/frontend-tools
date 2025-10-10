import GFEllipse from "./nodes/Ellipse/Ellipse";
import GFFrame from "./nodes/Frame/Frame";
import GFRectangle from "./nodes/Rectangle/Rectangle";

interface FactoryResult {
    html: string;
    css: string;

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
function generateCode(node: SceneNode): FactoryResult {
    const result = { html: '', css: '' };
     
    if (!Object.prototype.hasOwnProperty.call(TYPES, node.type)) return result;

    const NodeClassRef = NODE_TYPES[node.type as keyof typeof NODE_TYPES];
    if (NodeClassRef) {
        //@ts-expect-error
        const instance = new NodeClassRef(node);
        result.html += instance.createHTML();
        result.css += instance.createCSS();
    }
    return result;
}

export default generateCode;