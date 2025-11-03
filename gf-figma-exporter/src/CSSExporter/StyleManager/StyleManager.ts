class StyleManager {
    private rules: Map<string, string>;
    constructor() {
        this.rules = new Map();
    }

    add(rule: string, declaration: string) {
        this.rules.set(rule, declaration);
    }

    remove(rule: string) {
        this.rules.delete(rule);
    }

    getCSS(): string {
        let css = '';
        this.rules.forEach((declaration, rule) => {
            css += `${rule}: ${declaration} ;\n`;
        });
        return css;
    }
}
export default StyleManager;