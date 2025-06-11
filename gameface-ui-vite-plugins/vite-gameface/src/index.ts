import type { Plugin } from 'vite';
import { parseDocument } from "htmlparser2";
import { default as serialize } from "dom-serializer";
import MagicString from 'magic-string';

export interface GamefacePluginOptions { }

/**
 * Fixes a given HTML or SVG template string by applying specific transformations.
 *
 * For SVG templates, it ensures that attribute values are properly quoted.
 * For all templates, it replaces occurrences of `(<\!\>)` with the placeholder `<!---->`.
 *
 * @param template - The template string to be fixed.
 * @param isSVG - Optional flag indicating whether the template is an SVG. Defaults to `false`.
 * @returns The fixed template string with the applied transformations.
 */
function fixTemplate(template: string, isSVG?: boolean): string {
    let fixedTemplate = isSVG
        ? template.replace(/=\s*([^"'\s>]+)/g, '="$1"')
        : template;
    return fixedTemplate.replace(/\(<\!\>\)/g, '(<!---->)');
}

export default function solidGameface(options: GamefacePluginOptions = {}): Plugin {
    return {
        name: 'gameface',
        transform(code, id) {
            const isSVG = id.endsWith('.svg?component-solid');

            if (!isSVG && !id.endsWith('.tsx')) return;

            const s = new MagicString(code);
            const matches = [...code.matchAll(/_\$template\(`(.*?)`(?:,.*)?\)/gs)];

            for (const match of matches) {
                const [fullMatch, templateContent] = match;
                const start = match.index!;
                const end = start + fullMatch.length;

                const isSvgTemplate = fullMatch.endsWith(', false, true, false)');
                const fixedTemplate = fixTemplate(templateContent, isSvgTemplate);
                const doc = parseDocument(fixedTemplate, { lowerCaseTags: false });
                const serialized = serialize(doc);
                const replacement = `_$template(\`${serialized}\`${isSvgTemplate ? ', false, true, false' : ''})`;

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
    }
}
