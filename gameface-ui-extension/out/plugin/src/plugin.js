"use strict";
function init(modules) {
    const typescript = modules.typescript;
    function create(info) {
        // Get the original language service
        const languageService = info.languageService;
        const proxy = Object.create(null);
        // Create a virtual file cache for injecting types
        const virtualFileCache = new Map();
        const projectRoot = info.project.getCurrentDirectory();
        const virtualFile = `${projectRoot}/node_modules/.vscode-svg-refs/index.d.ts`;
        // Intercept getScriptSnapshot to inject our virtual file
        proxy.getScriptSnapshot = (fileName) => {
            if (fileName === virtualFile && virtualFileCache.has(virtualFile)) {
                const content = virtualFileCache.get(virtualFile);
                return {
                    getText: (start, end) => content.substring(start, end),
                    getLength: () => content.length,
                    getChangeRange: () => undefined
                };
            }
            return info.languageServiceHost.getScriptSnapshot(fileName);
        };
        // Intercept getCompletionsAtPosition to enhance SVG ref completions
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            const source = languageService.getProgram()?.getSourceFile(fileName);
            if (!source)
                return languageService.getCompletionsAtPosition(fileName, position, options);
            // Update virtual file with latest SVG refs
            updateVirtualFile();
            return languageService.getCompletionsAtPosition(fileName, position, options);
        };
        // Function to update the virtual file with the latest SVG references
        function updateVirtualFile() {
            // Generate your type definitions here
            const content = `
import { JSX } from "solid-js";
export { };
declare global {
  var ref: SVGSVGElement & {
    "#mask": SVGMaskElement & JSX.MaskSVGAttributes<SVGMaskElement>;
    "#path-1-inside-1_17_10": SVGPathElement & JSX.PathSVGAttributes<SVGPathElement>
  };
  var ref2: SVGSVGElement & {
    "#mask2": SVGMaskElement & JSX.MaskSVGAttributes<SVGMaskElement>;
    "#path-2-inside-1_17_10": SVGPathElement & JSX.PathSVGAttributes<SVGPathElement>
  };
}`;
            virtualFileCache.set(virtualFile, content);
            // Notify the language service about our virtual file
            info.project.projectService.logger.info(`[svg-ref-helper] Updated virtual typings file`);
            // Add the file to project references if not already there
            const files = info.project.getFileNames();
            if (!files.includes(virtualFile)) {
                //@ts-ignore
                info.project.projectService.applyChangesInOpenFiles([{ fileName: virtualFile, content }], [], []);
            }
        }
        // Add the rest of the methods from the language service
        for (const k of Object.keys(languageService)) {
            if (!(k in proxy)) {
                proxy[k] = function () {
                    return languageService[k].apply(languageService, arguments);
                };
            }
        }
        // Initialize by updating the virtual file
        updateVirtualFile();
        return proxy;
    }
    return { create };
}
module.exports = init;
//# sourceMappingURL=plugin.js.map