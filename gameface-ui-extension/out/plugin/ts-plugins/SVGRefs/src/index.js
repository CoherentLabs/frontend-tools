"use strict";
function init(modules) {
    const ts = modules.typescript;
    function create(info) {
        console.log("svg refs plugin loaded");
        const proxy = Object.create(info.languageService);
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            console.log(`Getting completions in: ${fileName}`);
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
            if (!prior)
                return;
            return prior;
        };
        return proxy;
    }
    return { create };
}
module.exports = init;
//# sourceMappingURL=index.js.map