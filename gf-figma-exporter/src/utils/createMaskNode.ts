import { ExportableNodes } from './../types/commonTypes';
import { MaskNode } from "../types/commonTypes";
import { MASK_PREFIX } from './constants';

export default function createMaskNode(node: ExportableNodes): MaskNode {
    return {
        type: 'MASK',
        id: node.id,
        name: MASK_PREFIX + node.name,
        maskChildren: [],
        originalNode: node,
        isMask: true,
        visible: node.visible,
        maskType: node.maskType,
    }
}