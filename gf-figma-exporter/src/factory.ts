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

function generateCode(node: SceneNode): FactoryResult {
    const result = { html: '', css: '' };

    for (const [type, NodeClassRef] of Object.entries(NODE_TYPES)) {
        if (node.type === type) {
            const instance = new NodeClassRef(node as SceneNode);
            result.html += instance.createHTML();
            result.css += instance.createCSS();
        }
    }

    return result;
}

export default generateCode;