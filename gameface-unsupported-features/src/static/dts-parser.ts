import * as ts from 'typescript';
import * as fs from 'node:fs';

export interface InterfaceInfo {
    members: string[];
    extends: string[];
}

export interface DtsParsed {
    /** All named interfaces/classes found in the .d.ts, keyed by name. */
    interfaces: Record<string, InterfaceInfo>;
    /**
     * Names declared as `declare var X: SomeType` at the top level.
     * These are the constructors exposed on `window`.
     */
    globals: string[];
    /**
     * Standard CSS property names (kebab-case) extracted from the
     * `CSSStyleDeclaration` interface in the .d.ts.
     * These are properties Gameface explicitly declares it supports.
     * Excludes Gameface-specific numeric unit variants (topPX, leftVH, etc.)
     * and the coh-* properties (those are in cohProperties).
     */
    cssStyleDeclarationProps: string[];
    /**
     * Gameface-specific `coh-*` CSS properties (kebab-case) extracted from
     * the `CSSStyleDeclaration` interface in the .d.ts.
     */
    cohProperties: string[];
}

/**
 * Parse a Gameface .d.ts file using the TypeScript compiler API.
 * Extracts every interface/class member and every `declare var` global.
 *
 * The result is intentionally plain-serializable so it can be passed
 * through gf.executeScript() as a JSON argument.
 */
export function parseDts(dtsPath: string): DtsParsed {
    const source = fs.readFileSync(dtsPath, 'utf-8');
    const sourceFile = ts.createSourceFile(
        dtsPath,
        source,
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
    );

    const interfaces: Record<string, InterfaceInfo> = {};
    const globals: string[] = [];
    const cssStyleDeclarationProps: string[] = [];
    const cohProperties: string[] = [];

    function visitNode(node: ts.Node): void {
        // Interface declarations: interface Foo extends Bar { ... }
        if (ts.isInterfaceDeclaration(node)) {
            const name = node.name.text;
            const extendsNames = collectHeritage(node.heritageClauses);
            const members = collectMembers(node.members);
            mergeInterface(name, members, extendsNames);
        }

        // Class declarations: class Foo extends Bar { ... }
        if (ts.isClassDeclaration(node) && node.name) {
            const name = node.name.text;
            const extendsNames = collectHeritage(node.heritageClauses);
            const members = collectClassMembers(node.members);
            mergeInterface(name, members, extendsNames);
        }

        // Module declarations: declare namespace/module { ... }
        if (ts.isModuleDeclaration(node) && node.body) {
            ts.forEachChild(node.body, visitNode);
        }

        // Variable declarations: declare var Foo: FooConstructor
        if (ts.isVariableStatement(node)) {
            const isDeclarare = node.modifiers?.some(
                (m) => m.kind === ts.SyntaxKind.DeclareKeyword,
            );
            if (isDeclarare || isInAmbientContext(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (ts.isIdentifier(decl.name)) {
                        globals.push(decl.name.text);
                    }
                }
            }
        }

        ts.forEachChild(node, visitNode);
    }

    ts.forEachChild(sourceFile, visitNode);

    // ── Extract CSS properties from CSSStyleDeclaration ───────────────────────
    // Skip non-property members and Gameface-specific numeric unit variant
    // properties (topPX, leftVH, widthREM, etc.) which are JS-only conveniences.
    const CSS_DECL_SKIP = new Set([
        'cssText', 'length', 'parentRule',
        'getPropertyValue', 'removeProperty', 'setProperty', 'item',
    ]);
    // Matches Gameface unit-suffixed numeric properties (e.g. topPX, leftVH, widthREM)
    const UNIT_SUFFIX_RE = /(?:PX|VH|VW|REM|PERCENT|EM|PT|PC|CM|MM|IN|EX|CH|Q)$/;

    const cssDecl = interfaces['CSSStyleDeclaration'];
    if (cssDecl) {
        for (const member of cssDecl.members) {
            if (CSS_DECL_SKIP.has(member)) continue;
            if (UNIT_SUFFIX_RE.test(member)) continue;

            // camelCase → kebab-case (e.g. borderRadius → border-radius,
            // cohEnableBackdropFilter → coh-enable-backdrop-filter)
            const kebab = member.replace(/([A-Z])/g, (m) => '-' + m.toLowerCase());

            if (kebab.startsWith('coh-')) {
                cohProperties.push(kebab);
            } else {
                cssStyleDeclarationProps.push(kebab);
            }
        }
    }

    return { interfaces, globals, cssStyleDeclarationProps, cohProperties };

    // ─── helpers ──────────────────────────────────────────────────────────────

    function mergeInterface(name: string, members: string[], extendsNames: string[]): void {
        if (!interfaces[name]) {
            interfaces[name] = { members: [], extends: extendsNames };
        }
        for (const m of members) {
            if (!interfaces[name].members.includes(m)) {
                interfaces[name].members.push(m);
            }
        }
        for (const e of extendsNames) {
            if (!interfaces[name].extends.includes(e)) {
                interfaces[name].extends.push(e);
            }
        }
    }

    function collectHeritage(clauses: ts.NodeArray<ts.HeritageClause> | undefined): string[] {
        const names: string[] = [];
        if (!clauses) return names;
        for (const clause of clauses) {
            for (const type of clause.types) {
                if (ts.isIdentifier(type.expression)) {
                    names.push(type.expression.text);
                } else if (ts.isPropertyAccessExpression(type.expression)) {
                    names.push(type.expression.name.text);
                }
            }
        }
        return names;
    }

    function collectMembers(members: ts.NodeArray<ts.TypeElement>): string[] {
        const names: string[] = [];
        for (const member of members) {
            if (
                (ts.isPropertySignature(member) ||
                    ts.isMethodSignature(member)) &&
                member.name
            ) {
                const name = memberName(member.name);
                if (name && !name.startsWith('[')) names.push(name);
            }
        }
        return names;
    }

    function collectClassMembers(members: ts.NodeArray<ts.ClassElement>): string[] {
        const names: string[] = [];
        for (const member of members) {
            if (
                (ts.isPropertyDeclaration(member) ||
                    ts.isMethodDeclaration(member)) &&
                member.name
            ) {
                const name = memberName(member.name);
                if (name && !name.startsWith('[')) names.push(name);
            }
        }
        return names;
    }

    function memberName(name: ts.PropertyName): string {
        if (ts.isIdentifier(name)) return name.text;
        if (ts.isStringLiteral(name)) return name.text;
        if (ts.isNumericLiteral(name)) return name.text;
        return '[computed]';
    }

    function isInAmbientContext(node: ts.Node): boolean {
        let current: ts.Node | undefined = node.parent;
        while (current) {
            if (ts.isSourceFile(current)) return true;
            if (ts.isModuleDeclaration(current)) return true;
            current = current.parent;
        }
        return false;
    }
}
