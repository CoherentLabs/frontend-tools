import { definePreset } from 'unocss';

/**
 * Reverses every transformation applied by `sanitizeValue` in the
 * transformer plugin, recovering the original CSS value.
 *
 * Encoding table (transformer → preset):
 *   ' "       → removed (irreversible — quotes aren't valid in CSS values)
 *   #         → hex-       → #
 *   .         → _          → .
 *   (space)   → --space--  → (space)
 *   (         → --lp--     → (
 *   )         → --rp--     → )
 *   ,         → --cm--     → ,
 */
function decodeValue(encoded: string): string {
    return encoded
        .replace(/--cm--/g, ',')
        .replace(/--rp--/g, ')')
        .replace(/--lp--/g, '(')
        .replace(/--space--/g, ' ')
        .replace(/_/g, '.')
        .replace(/hex-/g, '#');
}

const contentKeywords = new Set([
    'none', 'normal', 'inherit', 'initial', 'unset', 'revert',
    'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote',
]);

const breakpoints: Record<string, string> = {
    xsm: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
};

const headingPattern = /^heading-(\d+)$/;
const paragraphPattern = /^paragraph-(\d+)$/;

export function presetGameface() {
    return definePreset({
        name: 'unocss-preset-gameface',
        rules: [
            // ── gf-prop classes (generated from inline styles) ───────
            // Pattern: gf-prop--<css-property>--<encoded-value>
            // The property regex `[a-z]+(?:-[a-z0-9]+)*` ensures the
            // capture cannot greedily swallow the `--` separator,
            // because CSS properties never contain consecutive hyphens.
            [
                /^gf-prop--([a-z]+(?:-[a-z0-9]+)*)--(.+)$/,
                ([, prop, value]) => {
                    let cssValue = decodeValue(value);
                    if (prop === 'content' && !contentKeywords.has(cssValue) && !cssValue.includes('(')) {
                        cssValue = `"${cssValue}"`;
                    }
                    return { [prop]: cssValue };
                },
            ],

            // ── Sanitised bracket utilities ──────────────────────────
            // These handle values produced by the bracket sanitiser in
            // pass 1 (e.g. w-[50.5px] → w-50_5px).
            [/^w-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ width: decodeValue(v) })],
            [/^h-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ height: decodeValue(v) })],
            [/^min-w-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ 'min-width': decodeValue(v) })],
            [/^max-w-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ 'max-width': decodeValue(v) })],
            [/^min-h-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ 'min-height': decodeValue(v) })],
            [/^max-h-([\d_]+(?:px|em|rem|%|vh|vw))$/, ([, v]) => ({ 'max-height': decodeValue(v) })],
            [/^bg-hex-([a-fA-F0-9]+)$/, ([, hex]) => ({ 'background-color': `#${hex}` })],
            [/^text-hex-([a-fA-F0-9]+)$/, ([, hex]) => ({ color: `#${hex}` })],
        ],
        variants: [
            (matcher) => {
                const variantMatch = matcher.match(/^__([a-zA-Z0-9_-]+)__(.+)$/);
                if (!variantMatch) return matcher;

                const variant = variantMatch[1];
                const utility = variantMatch[2];

                // 1. Standard pseudo-classes (single colon)
                const standardPseudos = [
                    'hover', 'focus', 'focus-within', 'focus-visible',
                    'active', 'first-child', 'last-child', 'only-child',
                ];
                if (standardPseudos.includes(variant)) {
                    return {
                        matcher: utility,
                        selector: (s: string) => `${s}:${variant}`,
                    };
                }

                // 2. Pseudo-elements (double colon)
                const pseudoElements = ['before', 'after', 'selection'];
                if (pseudoElements.includes(variant)) {
                    return {
                        matcher: utility,
                        selector: (s: string) => `${s}::${variant}`,
                    };
                }

                // 3. Nth-child (parameterised)
                if (variant.startsWith('nth-child-')) {
                    const nthValue = variant.replace('nth-child-', '');
                    return {
                        matcher: utility,
                        selector: (s: string) => `${s}:nth-child(${nthValue})`,
                    };
                }

                // 4. Responsive breakpoints (mobile-first min-width)
                if (variant in breakpoints) {
                    return {
                        matcher: utility,
                        parent: `@media (min-width: ${breakpoints[variant]})`,
                    };
                }

                // 5. Custom states (class-based compound selector)
                // e.g. __error__gf-prop--color--red →
                //   .__error__.__error__gf-prop--color--red { color: red; }
                return {
                    matcher: utility,
                    selector: (s: string) => `.__${variant}__${s}`,
                };
            },
        ],
        shortcuts: [
            [headingPattern, ([, size]) => `text-[${size}px] font-700 leading-[1.3em]`],
            [
                paragraphPattern,
                ([, size]) => {
                    const leading = Number(size) <= 15 ? '1.2em' : '1.3em';
                    return `text-[${size}px] font-400 leading-[${leading}]`;
                },
            ],
        ],
    });
}
