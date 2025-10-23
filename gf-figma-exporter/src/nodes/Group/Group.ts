import CSSExporter from "../../CSSExporter/CSSExporter";
import { FrameAndGroup } from "../../types/commonTypes";
import GFFrame from "../Frame/Frame";

class GFGroup extends GFFrame {
    constructor(node: FrameAndGroup) {
        super(node);
    }

    
    async createCSS(): Promise<string> {
        const CSSExporterInstance = new CSSExporter(this.node);

        return `
        .${this.className} {
            ${CSSExporterInstance.generateElementStyle()}
        }
        
        ${this.additionalCSS}
        `;
    }

}

export default GFGroup;
