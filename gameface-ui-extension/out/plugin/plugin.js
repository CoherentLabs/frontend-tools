"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const ts = __importStar(require("typescript/lib/tsserverlibrary"));
function create(info) {
    const proxy = Object.create(info.languageService);
    proxy.getCompletionsAtPosition = (fileName, position, options) => {
        const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
        if (!prior)
            return;
        const source = info.languageService.getProgram()?.getSourceFile(fileName);
        if (!source)
            return prior;
        // Extract the imported SVG file
        const importRegex = /import\s+(\w+)\s+from\s+['"](.+\.svg\?component-solid)['"];/g;
        const matches = source.getText().match(importRegex);
        if (matches) {
            const svgIds = extractSvgIds(matches[0]); // Function to extract IDs from the actual file
            for (const id of svgIds) {
                prior.entries.push({
                    name: id,
                    kind: ts.ScriptElementKind.memberVariableElement,
                    sortText: "1",
                    insertText: `${id}.fill`,
                });
            }
        }
        return prior;
    };
    return proxy;
}
function extractSvgIds(svgPath) {
    const fs = require("fs");
    const { parse } = require("svg-parser");
    if (!fs.existsSync(svgPath))
        return [];
    const content = fs.readFileSync(svgPath, "utf-8");
    const ast = parse(content);
    const ids = [];
    traverseSvg(ast, node => {
        if (node.properties?.id) {
            ids.push(node.properties.id);
        }
    });
    return ids;
}
function traverseSvg(node, callback) {
    callback(node);
    if (node.children) {
        node.children.forEach((child) => traverseSvg(child, callback));
    }
}
//# sourceMappingURL=plugin.js.map