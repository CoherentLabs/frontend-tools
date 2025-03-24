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
const ts = __importStar(require("typescript/lib/tsserverlibrary"));
// import * as vscode from 'vscode';
const { parse } = require("svg-parser");
const fs = require("fs");
const path = require("path");
async function getTsConfigPath() {
    return '';
    // const files = await vscode.workspace.findFiles("**/tsconfig.json", "**/node_modules/**");
    // return files.length > 0 ? files[0].fsPath : undefined;
}
async function extractSvgIds(svgPath) {
    const importPathMatch = svgPath.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (!importPathMatch)
        return [];
    let extractedPath = importPathMatch[1];
    // Replace alias with real directory
    const alias = "@assets";
    const tsConfigPath = await getTsConfigPath();
    log('tsConfigPath ' + tsConfigPath + ' ' + extractedPath);
    if (tsConfigPath && !fs.existsSync(tsConfigPath) && extractedPath.includes(alias))
        return [];
    const tsConfig = require(tsConfigPath);
    const realDirectory = tsConfig.compilerOptions.paths[alias][0].replace("/*", "");
    extractedPath = extractedPath.replace(alias, realDirectory);
    log('extractingsvgs ' + extractedPath);
    if (!fs.existsSync(extractedPath))
        return [];
    const content = fs.readFileSync(extractedPath, "utf-8");
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
function log(message) {
    console.log(`[SVG-REFS plugin] ${message}`);
}
function findNodeAtPosition(sourceFile, position) {
    function search(node) {
        if (position >= node.getStart() && position <= node.getEnd()) {
            return ts.forEachChild(node, search) || node;
        }
        return undefined;
    }
    return search(sourceFile);
}
module.exports = function init({ typescript }) {
    return {
        create(info) {
            // Create new language service
            log('test2');
            const proxy = Object.create(info.languageService);
            // Load types from a d.ts file (Example: global-svg-types.d.ts)
            const refType = "SVGSVGElement & { [key: string]: SVGElement }"; // Use actual type from your d.ts file
            // Override quick info (hover details)
            proxy.getQuickInfoAtPosition = (fileName, position) => {
                const prior = info.languageService.getQuickInfoAtPosition(fileName, position);
                if (!prior)
                    return;
                const program = info.languageService.getProgram();
                const sourceFile = program?.getSourceFile(fileName);
                if (!sourceFile)
                    return prior;
                const checker = program?.getTypeChecker();
                const node = findNodeAtPosition(sourceFile, position);
                if (!node)
                    return prior;
                // If the variable is `ref`, set its type explicitly
                if (node.getText(sourceFile) === "ref") {
                    return {
                        kind: ts.ScriptElementKind.variableElement,
                        kindModifiers: "declare",
                        textSpan: { start: position, length: "ref".length },
                        displayParts: [{ text: `(${refType})`, kind: "text" }],
                    };
                }
                return prior;
            };
            proxy.getCompletionsAtPosition = (fileName, position, options, formattingSettings) => {
                log(`${fileName}, ${position}, ${options}`);
                const prior = info.languageService.getCompletionsAtPosition(fileName, position, options, formattingSettings);
                if (!prior)
                    return;
                const source = info.languageService.getProgram()?.getSourceFile(fileName);
                if (!source)
                    return prior;
                prior.entries.push({
                    name: 'alabala',
                    kind: ts.ScriptElementKind.memberVariableElement,
                    sortText: "1",
                    insertText: `test.fill`,
                });
                return prior;
            };
            return proxy;
        },
        onConfigurationChanged(config) {
            console.log(config);
            // Receive configuration changes sent from VS Code
        }
    };
};
//# sourceMappingURL=index.js.map