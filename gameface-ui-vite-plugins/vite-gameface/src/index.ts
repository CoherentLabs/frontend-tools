import type { Plugin } from 'vite';
import { parseDocument } from "htmlparser2";
import { default as serialize } from "dom-serializer";
import MagicString from 'magic-string';

export interface GamefacePluginOptions { }

/**
 * Fixes template string by applying specific transformations.
 *
 * For SVG templates, it ensures that attribute values are properly quoted.
 *
 * @param template - The template string to be fixed.
 * @returns The fixed template string with the applied transformations.
 */
function fixSVGAttributes(template: string) {
    return template.replace(/=\s*([^"'\s>]+)/g, '="$1"');
}

/**
 * Fixes template string by applying specific transformations.
 *
 * For all templates, it replaces occurrences of `(<\!\>)` with the placeholder `<!---->`.
 *
 * @param template - The template string to be fixed.
 * @returns The fixed template string with the applied transformations.
 */
function fixComments(template: string) {
    return template.replace(/\<\!\>/g, '<!---->');
}

export default function solidGameface(options: GamefacePluginOptions = {}): Plugin {
    return {
        name: 'gameface',
        transform(code, id) {
            const isSVGFile = id.endsWith('.svg?component-solid');
            if (!isSVGFile && !id.endsWith('.tsx')) return;
            if (!code.includes('_$template')) return;

            const s = new MagicString(code);

            const regex = /_\$template\(`([\s\S]*?)`([\s\S]*?)\)/g;

            const matches = [...code.matchAll(regex)];

            for (const match of matches) {
                const [fullMatch, templateContent, originalArgs] = match;
                const start = match.index!;
                const end = start + fullMatch.length;

                const hasSVGContext = isSVGFile || (originalArgs && originalArgs.includes('true')) || templateContent.includes('<svg');

                let preFixedTemplate = templateContent;
                if (hasSVGContext) preFixedTemplate = fixSVGAttributes(preFixedTemplate);
                preFixedTemplate = fixComments(preFixedTemplate);

                const doc = parseDocument(preFixedTemplate, {
                    lowerCaseTags: false,
                    recognizeSelfClosing: true
                });

                let serialized = serialize(doc, {
                    selfClosingTags: false
                });

                const replacement = `_$template(\`${serialized}\`${originalArgs})`;

                s.overwrite(start, end, replacement);
            }

            return {
                code: s.toString(),
                map: s.generateMap({
                    source: id,
                    includeContent: true,
                    hires: true,
                }),
            };
        }
    };
}
