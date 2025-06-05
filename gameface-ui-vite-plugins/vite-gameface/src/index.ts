import type { Plugin } from 'vite';
import { parseDocument } from "htmlparser2";
import { default as serialize } from "dom-serializer";
import MagicString from 'magic-string';

export interface GamefacePluginOptions { }

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
                const fixedTemplate = isSVG
                    ? templateContent.replace(/=\s*([^"'\s>]+)/g, '="$1"')
                    : templateContent;

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
