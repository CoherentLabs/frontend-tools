import { PrimitiveNodes } from "../../types/commonTypes";
import getNestedLevel from "../../utils/getNestedLevel";

export function generateZIndex(node: PrimitiveNodes): number { 
    return getNestedLevel(node) * 3;

}