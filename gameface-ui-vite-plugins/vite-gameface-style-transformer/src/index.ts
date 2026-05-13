import { Plugin } from 'vite';
import MagicString from 'magic-string';
import { presetGameface } from './preset';

export { presetGameface };

let showWarnings = true;

function warn(message: string) {
    if (!showWarnings) return;
    const timestamp = new Date().toLocaleTimeString();
    console.warn(
        `\x1b[2m${timestamp}\x1b[0m \x1b[33m\x1b[1m[gameface-style-transformer]\x1b[0m \x1b[33mwarning:\x1b[0m ${message}`
    );
}

export default function gamefaceStyleTransformerPlugin(
    { suppressWarnings, isSolidProject } = { suppressWarnings: false, isSolidProject: false },
): Plugin {
    showWarnings = !suppressWarnings;

    return {
        name: 'vite-plugin-gameface-style-transformer',
        enforce: 'pre',

        transform(code, id) {
            if (!/\.(tsx|jsx|vue|svelte|html)$/.test(id)) return null;

            // Pass 1 — sanitize Tailwind arbitrary-value brackets & variant prefixes
            const s1 = new MagicString(code);
            sanitizeBrackets(code, s1, id);

            // Pass 2 — tag-level style extraction & single-class merging
            // A second MagicString avoids overlap crashes with pass-1 overwrites.
            const intermediate = s1.toString();
            const s2 = new MagicString(intermediate);
            const isVue = id.endsWith('.vue');
            const isJsx = /\.(tsx|jsx)$/.test(id);

            for (const tag of scanOpeningTags(intermediate)) {
                mergeTagStyles(tag, s2, id, isVue, isJsx, isSolidProject);
            }

            if (s1.hasChanged() || s2.hasChanged()) {
                const finalCode = s2.hasChanged() ? s2.toString() : intermediate;
                const map = s2.hasChanged()
                    ? s2.generateMap({ source: id, includeContent: true })
                    : s1.generateMap({ source: id, includeContent: true });
                return { code: finalCode, map };
            }
            return null;
        },
    };
}

// ──────────────────────────────────────────────────
// Pass 1 – Bracket / variant sanitisation
// ──────────────────────────────────────────────────

function sanitizeBrackets(code: string, s: MagicString, fileId: string): void {
    const touched = new Set<number>();

    const variantRe =
        /(hover|focus|active|first-child|last-child|only-child|before|after|selection|nth-child-[a-zA-Z0-9_-]+|sm|md|lg|xl|xsm):([a-zA-Z0-9\-\[\]_#]+)/g;

    for (const m of code.matchAll(variantRe)) {
        const full = m[0];
        const variant = m[1];
        let utility = m[2];
        const start = m.index!;
        const end = start + full.length;

        if (variant === 'selection' && !/^(bg-|text-|color-)/.test(utility)) {
            warn(
                `Gameface limits "::selection" to text and background colors. "${full}" may not work. (File: ${fileId})`
            );
        }

        for (let i = start; i < end; i++) touched.add(i);

        utility = utility.replace(
            /([a-zA-Z0-9-]+)-\[([^\]]+)\]/g,
            (_m, pre: string, val: string) =>
                `${pre}-${val.replace(/#/g, 'hex-').replace(/\./g, '_').replace(/,/g, '-')}`,
        );

        s.overwrite(start, end, `__${variant}__${utility}`);
    }

    const bracketRe = /([a-zA-Z0-9-]+)-\[([^\]]+)\]/g;
    for (const m of code.matchAll(bracketRe)) {
        const start = m.index!;
        if (touched.has(start)) continue;
        const safe = m[2].replace(/#/g, 'hex-').replace(/\./g, '_').replace(/,/g, '-');
        s.overwrite(start, start + m[0].length, `${m[1]}-${safe}`);
    }
}

// ──────────────────────────────────────────────────
// Tag scanner
// ──────────────────────────────────────────────────
// Returns every opening tag with correct boundaries.
// Handles nested braces, quoted strings, and template
// literals so that a `>` inside a JSX expression does
// not prematurely terminate the tag.

interface TagSpan {
    start: number;
    end: number;
    content: string;
}

function scanOpeningTags(code: string): TagSpan[] {
    const out: TagSpan[] = [];
    const len = code.length;
    let i = 0;

    while (i < len) {
        if (code[i] !== '<') { i++; continue; }

        const next = code[i + 1];
        if (!next || next === '/' || next === '!' || next === '?') { i++; continue; }
        if (!/[a-zA-Z]/.test(next)) { i++; continue; }

        const start = i;
        i++;
        while (i < len && /[a-zA-Z0-9._-]/.test(code[i])) i++;

        let braces = 0;
        let sq = false;
        let dq = false;
        let tl = false;
        let found = false;

        while (i < len) {
            const c = code[i];
            if (sq)        { if (c === '\\') i++; else if (c === "'")  sq = false; }
            else if (dq)   { if (c === '\\') i++; else if (c === '"')  dq = false; }
            else if (tl)   { if (c === '\\') i++; else if (c === '`')  tl = false; }
            else if (c === "'")  sq = true;
            else if (c === '"')  dq = true;
            else if (c === '`')  tl = true;
            else if (c === '{')  braces++;
            else if (c === '}')  braces = Math.max(0, braces - 1);
            else if (braces === 0 && c === '>') {
                i++;
                out.push({ start, end: i, content: code.slice(start, i) });
                found = true;
                break;
            }
            i++;
        }
        if (!found) break;
    }
    return out;
}

// ──────────────────────────────────────────────────
// Pass 2 – Per-tag style extraction & class merging
// ──────────────────────────────────────────────────

type SyntaxType = 'jsx' | 'vue' | 'html';

function mergeTagStyles(
    tag: TagSpan,
    s: MagicString,
    fileId: string,
    isVue: boolean,
    isJsx: boolean,
    isSolidProject: boolean,
): void {
    if (!/\bstyle[=:]/.test(tag.content)) return;

    const loc = `(File: ${fileId})`;
    let work = tag.content;
    const newClasses: string[] = [];
    const residual: { type: SyntaxType; mod: string; css: string }[] = [];

    // 1 — existing static class / className
    const cm = work.match(/\s(class|className)="([^"]*)"/);
    let existingCls = '';
    let attrName: string = isJsx && !isSolidProject ? 'className' : 'class';
    if (cm) {
        existingCls = cm[2];
        attrName = cm[1];
        work = work.replace(cm[0], ' ');
    }

    // 2 — state styles   style:hover={{…}}
    //     Must run before the generic style={{…}} regex.
    const stateRe = /\sstyle:([a-zA-Z0-9_-]+)=\{\{([\s\S]*?)\}\}/g;
    const stateHits: { raw: string; mod: string; body: string }[] = [];
    let sm: RegExpExecArray | null;
    while ((sm = stateRe.exec(work)) !== null) {
        stateHits.push({ raw: sm[0], mod: sm[1], body: sm[2] });
    }
    for (const h of stateHits) {
        const r = processObjectStyle(h.body, loc, h.mod, 'jsx');
        if (r.safeClasses) newClasses.push(r.safeClasses);
        if (r.remainingStyle) residual.push({ type: 'jsx', mod: h.mod, css: r.remainingStyle });
        work = work.replace(h.raw, ' ');
    }

    // 2b — Svelte style directives   style:font-size='1em'  style:color="red"
    //      Only static string values are extracted; dynamic style:prop={expr} is left in place.
    const svelteRe = /\sstyle:([a-zA-Z0-9_-]+)\s*=\s*(["'])(.*?)\2/g;
    const svelteHits: { raw: string; prop: string; val: string }[] = [];
    let svM: RegExpExecArray | null;
    while ((svM = svelteRe.exec(work)) !== null) {
        svelteHits.push({ raw: svM[0], prop: svM[1], val: svM[3] });
    }
    for (const h of svelteHits) {
        const cssStr = `${toKebabCase(h.prop)}: ${h.val}`;
        const r = processObjectStyle(cssStr, loc, '', 'html');
        if (r.safeClasses) newClasses.push(r.safeClasses);
        work = work.replace(h.raw, ' ');
    }

    // 3 — JSX   style={{…}}
    const jm = work.match(/\sstyle=\{\{([\s\S]*?)\}\}/);
    if (jm) {
        const r = processObjectStyle(jm[1], loc, '', 'jsx');
        if (r.safeClasses) newClasses.push(r.safeClasses);
        if (r.remainingStyle) residual.push({ type: 'jsx', mod: '', css: r.remainingStyle });
        work = work.replace(jm[0], ' ');
    }

    // 4 — Vue   :style="{…}"  or  :style={{…}}
    if (isVue) {
        const vm = work.match(/\s:style="\{([\s\S]*?)\}"/);
        if (vm) {
            const r = processObjectStyle(vm[1], loc, '', 'vue');
            if (r.safeClasses) newClasses.push(r.safeClasses);
            if (r.remainingStyle) residual.push({ type: 'vue', mod: '', css: r.remainingStyle });
            work = work.replace(vm[0], ' ');
        }
        const vjm = work.match(/\s:style=\{\{([\s\S]*?)\}\}/);
        if (vjm) {
            const r = processObjectStyle(vjm[1], loc, '', 'jsx');
            if (r.safeClasses) newClasses.push(r.safeClasses);
            if (r.remainingStyle) residual.push({ type: 'jsx', mod: '', css: r.remainingStyle });
            work = work.replace(vjm[0], ' ');
        }
    }

    // 5 — HTML / Svelte   style="…"
    //     The leading \s naturally prevents matching Vue's :style
    //     because \sstyle requires whitespace immediately before "style".
    const hm = work.match(/\sstyle="([^"]+)"/);
    if (hm) {
        const r = processObjectStyle(hm[1], loc, '', 'html');
        if (r.safeClasses) newClasses.push(r.safeClasses);
        if (r.remainingStyle) residual.push({ type: 'html', mod: '', css: r.remainingStyle });
        work = work.replace(hm[0], ' ');
    }

    if (newClasses.length === 0) return;

    // 6 — merge every generated class with existing ones into ONE attribute
    const merged = [existingCls, ...newClasses].filter(Boolean).join(' ');

    const parts: string[] = [`${attrName}="${merged}"`];
    for (const rs of residual) {
        if (rs.mod)                 parts.push(`style:${rs.mod}={{ ${rs.css} }}`);
        else if (rs.type === 'jsx') parts.push(`style={{ ${rs.css} }}`);
        else if (rs.type === 'vue') parts.push(`:style="{ ${rs.css} }"`);
        else                        parts.push(`style="${rs.css}"`);
    }

    // 7 — rebuild:  <TagName  <injected attrs>  …remaining attrs…  >
    const nameEnd = /^<[a-zA-Z][a-zA-Z0-9._-]*/.exec(work);
    if (!nameEnd) return;
    const pos = nameEnd[0].length;
    const rebuilt = work.slice(0, pos) + ' ' + parts.join(' ') + work.slice(pos);

    s.overwrite(tag.start, tag.end, rebuilt);
}

// ──────────────────────────────────────────────────
// Style-object / style-string processor
// ──────────────────────────────────────────────────

const gamefaceRules = {
    unsupportedProps: new Set([
        'alignment-baseline', // [cite: 24]
        'background-attachment', // [cite: 24]
        'background-blend-mode', // [cite: 24]
        'background-clip', // [cite: 24]
        'background-origin', // [cite: 29]
        'background-repeat-x', // [cite: 29]
        'background-repeat-y', // [cite: 29]
        'baseline-shift', // [cite: 29]
        'border-collapse', // [cite: 34]
        'border-spacing', // [cite: 39]
        'box-sizing', // [cite: 39]
        'buffered-rendering', // [cite: 39]
        'caption-side', // [cite: 39]
        'clear', // [cite: 39]
        'clip', // [cite: 44]
        'clip-rule', // [cite: 44]
        'color-interpolation', // [cite: 44]
        'color-interpolation-filters', // [cite: 44]
        'color-rendering', // [cite: 44]
        'column-fill', // [cite: 44]
        'counter-increment', // [cite: 44]
        'counter-reset', // [cite: 44]
        'dominant-baseline', // [cite: 49]
        'empty-cells', // [cite: 49]
        'enable-background', // [cite: 49]
        'fill', // [cite: 49]
        'fill-opacity', // [cite: 49]
        'fill-rule', // [cite: 49]
        'flex-flow', // [cite: 62]
        'flood-color', // [cite: 62]
        'flood-opacity', // [cite: 62]
        'float', // [cite: 62]
        'font-kerning', // [cite: 62]
        'font-size-adjust', // [cite: 62]
        'font-stretch', // [cite: 62]
        'font-variant', // [cite: 62]
        'font-variant-ligatures', // [cite: 62]
        'glyph-orientation-horizontal', // [cite: 67]
        'glyph-orientation-vertical', // [cite: 67]
        'grid-area', // [cite: 67]
        'grid-auto-columns', // [cite: 67]
        'grid-auto-flow', // [cite: 67]
        'grid-auto-rows', // [cite: 67]
        'grid-column', // [cite: 67]
        'grid-column-end', // [cite: 67]
        'grid-column-start', // [cite: 67]
        'grid-row', // [cite: 67]
        'grid-row-end', // [cite: 72]
        'grid-row-start', // [cite: 72]
        'grid-template', // [cite: 72]
        'grid-template-areas', // [cite: 72]
        'grid-template-columns', // [cite: 72]
        'grid-template-rows', // [cite: 72]
        'justify-items', // [cite: 72]
        'justify-self', // [cite: 72]
        'lighting-color', // [cite: 72]
        'list-style', // [cite: 72]
        'list-style-image', // [cite: 72]
        'list-style-position', // [cite: 72]
        'list-style-type', // [cite: 72]
        'marker', // [cite: 77]
        'marker-end', // [cite: 77]
        'marker-mid', // [cite: 77]
        'marker-start', // [cite: 77]
        'mask-source-type', // [cite: 77]
        'max-zoom', // [cite: 82]
        'min-zoom', // [cite: 82]
        'object-fit', // [cite: 82]
        'object-position', // [cite: 82]
        'order', // [cite: 82]
        'orientation', // [cite: 82]
        'orphans', // [cite: 87]
        'outline', // [cite: 87]
        'outline-color', // [cite: 87]
        'outline-offset', // [cite: 87]
        'outline-style', // [cite: 87]
        'outline-width', // [cite: 87]
        'page', // [cite: 87]
        'page-break-after', // [cite: 92]
        'page-break-before', // [cite: 92]
        'page-break-inside', // [cite: 92]
        'paint-order', // [cite: 92]
        'perspective', // [cite: 92]
        'perspective(n)', // [cite: 92]
        'quotes', // [cite: 92]
        'resize', // [cite: 92]
        'rx', // [cite: 92]
        'ry', // [cite: 92]
        'scroll-behavior', // [cite: 97]
        'scroll-blocks-on', // [cite: 97]
        'shape-image-threshold', // [cite: 97]
        'shape-margin', // [cite: 97]
        'shape-outside', // [cite: 97]
        'size', // [cite: 97]
        'skew(x-angle,y-angle)', // [cite: 97]
        'speak', // [cite: 97]
        'stop-color', // [cite: 102]
        'stop-opacity', // [cite: 102]
        'stroke-linecap', // [cite: 102]
        'stroke-linejoin', // [cite: 102]
        'stroke-miterlimit', // [cite: 102]
        'stroke-opacity', // [cite: 102]
        'stroke-width', // [cite: 102]
        'tab-size', // [cite: 102]
        'table-layout', // [cite: 102]
        'text-align-last', // [cite: 102]
        'text-anchor', // [cite: 102]
        'text-indent', // [cite: 107]
        'text-justify', // [cite: 107]
        'text-line-through-color', // [cite: 107]
        'text-line-through-mode', // [cite: 107]
        'text-line-through-style', // [cite: 107]
        'text-line-through-width', // [cite: 107]
        'text-overline-color', // [cite: 107]
        'text-overline-mode', // [cite: 107]
        'text-overline-style', // [cite: 107]
        'text-overline-width', // [cite: 107]
        'text-rendering', // [cite: 107]
        'text-underline-color', // [cite: 112]
        'text-underline-style', // [cite: 112]
        'text-underline-width', // [cite: 112]
        'touch-action', // [cite: 112]
        'touch-action-delay', // [cite: 112]
        'unicode-bidi', // [cite: 117]
        'unicode-range', // [cite: 117]
        'user-zoom', // [cite: 117]
        'vector-effect', // [cite: 117]
        'widows', // [cite: 117]
        'will-change', // [cite: 117]
        'word-break', // [cite: 122]
        'word-spacing', // [cite: 122]
        'word-wrap', // [cite: 122]
        'writing-mode', // [cite: 122]
        'X', // [cite: 122]
        'Y', // [cite: 122]
        'zoom' // [cite: 122]
    ]),
    unsupportedValues: {
        'all': ['inherit', 'unset', 'revert'], // [cite: 24]
        'background-image': ['.gif'], // [cite: 29]
        'background-position': ['offsets'], // [cite: 29]
        'background-position-x': ['offsets'], // [cite: 29]
        'background-position-y': ['offsets'], // [cite: 29]
        'background-repeat': ['space'], // [cite: 29]
        'border': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 29]
        'border-bottom': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 29]
        'border-bottom-style': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 29]
        'border-image': ['space', '.gif'], // [cite: 34]
        'border-image-repeat': ['space'], // [cite: 34]
        'border-left': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 34]
        'border-left-style': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 34]
        'border-right': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 34]
        'border-right-style': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 34]
        'border-style': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'], // [cite: 39]
        'border-top': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 39]
        'border-top-style': ['dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'], // [cite: 39]
        'box-shadow': ['inherit'], // [cite: 39]
        'clip-path': ['url', 'none'], // [cite: 44]
        'content': ['url', 'attr', 'counter'], // [cite: 44]
        'display': ['grid', 'inline', 'inline-block', 'table', 'table-cell', 'block'], // [cite: 49]
        'filter': ['url'], // [cite: 49]
        'flex-basis': ['content'], // [cite: 49]
        'font': ['caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'], // [cite: 62]
        'font-size': ['pt', 'pc', 'in', 'cm', 'mm', 'ex', 'ch', '%'], // [cite: 62]
        'mask-clip': ['padding-box', 'content-box', 'margin-box', 'no-clip'], // [cite: 77]
        'mask-image': ['multiple images', '.gif'], // [cite: 77]
        'mask-repeat': ['space'], // [cite: 77]
        'max-height': ['none'], // [cite: 82]
        'max-width': ['none'], // [cite: 82]
        'position': ['static', 'sticky'], // [cite: 92]
        'text-decoration-thickness': ['from-font'], // [cite: 102]
        'text-decoration-line': ['blink'], // [cite: 102]
        'text-decoration-style': ['double', 'dotted', 'dashed', 'wavy'], // [cite: 107]
        'text-underline-position': ['left', 'right'], // [cite: 112]
        'transform': ['turn', 'rad', 'grad', 'skew('], // [cite: 117]
        'user-select': ['all'], // [cite: 117]
        'vertical-align': ['sub', 'super', 'top', 'bottom', 'percentages', 'lengths'], // [cite: 117]
        'visibility': ['collapse'], // [cite: 117]
        'white-space': ['break-spaces', 'pre-line'], // [cite: 117]
    } as Record<string, string[]>,
    shorthandVariableRegex: /var\(--[a-zA-Z0-9-]+\)/,
};

const riskyShorthands = new Set(['border', 'background', 'margin', 'padding', 'font']);

function processObjectStyle(
    payload: string,
    loc: string,
    modifier: string,
    syntax: SyntaxType,
): { safeClasses: string; remainingStyle: string } {
    const classes: string[] = [];
    let remaining = payload;

    const collect = (raw: string, prop: string, value: string) => {
        const cssProp = toKebabCase(prop);

        if (gamefaceRules.unsupportedProps.has(cssProp)) {
            warn(`Gameface does not support the "${cssProp}" property. Element styling will fail. ${loc}`);
            return;
        }
        if (gamefaceRules.unsupportedValues[cssProp]?.includes(value)) {
            warn(`Gameface does not support "${cssProp}: ${value}". Please use a supported value. ${loc}`);
            return;
        }
        if (riskyShorthands.has(cssProp) && gamefaceRules.shorthandVariableRegex.test(value)) {
            warn(`Gameface does not support CSS variables in shorthand properties like "${cssProp}". Use the full form. ${loc}`);
            return;
        }

        const safeVal = sanitizeValue(value);
        const pre = modifier ? `__${modifier}__` : '';
        classes.push(`${pre}gf-prop--${cssProp}--${safeVal}`);
    };

    if (syntax === 'html') {
        const useComma = !payload.includes(';');
        const htmlRe = useComma
            ? /([a-zA-Z0-9_-]+)\s*:\s*([^,]+?)(?:,|$)/g
            : /([a-zA-Z0-9_-]+)\s*:\s*([^;]+?)(?:;|$)/g;
        for (const m of payload.matchAll(htmlRe)) {
            collect(m[0], m[1], m[2].trim());
            remaining = remaining.replace(m[0], '').trim();
        }
    } else {
        // Quoted-key string entries first:  'font-size': '1em'  or  "font-size": "1em"
        const qStrRe = /(["'])([a-zA-Z0-9_-]+)\1\s*:\s*(["'])(.*?)\3/g;
        for (const m of payload.matchAll(qStrRe)) {
            if (isDynamicEntry(payload, m.index!, m[0].length)) continue;
            collect(m[0], m[2], m[4]);
            remaining = remaining.replace(m[0], '').replace(/,\s*,/g, ',').trim();
        }

        // Unquoted-key string entries:  fontSize: '1em'
        // Runs on remaining so it can't match inside already-removed quoted-key entries.
        const afterQuoted = remaining;
        const strRe = /([a-zA-Z0-9_]+)\s*:\s*(["'])(.*?)\2/g;
        for (const m of afterQuoted.matchAll(strRe)) {
            if (isDynamicEntry(afterQuoted, m.index!, m[0].length)) continue;
            collect(m[0], m[1], m[3]);
            remaining = remaining.replace(m[0], '').replace(/,\s*,/g, ',').trim();
        }

        // Numeric values on remaining to avoid re-matching inside quoted strings.
        // Quoted-key numerics:  'opacity': 0.5
        const afterStrs = remaining;
        const qNumRe = /(["'])([a-zA-Z0-9_-]+)\1\s*:\s*([0-9]+(?:\.[0-9]+)?)/g;
        for (const m of afterStrs.matchAll(qNumRe)) {
            if (isDynamicEntry(afterStrs, m.index!, m[0].length)) continue;
            collect(m[0], m[2], m[3]);
            remaining = remaining.replace(m[0], '').replace(/,\s*,/g, ',').trim();
        }

        // Unquoted-key numerics:  opacity: 0.5
        const afterQNums = remaining;
        const numRe = /([a-zA-Z0-9_]+)\s*:\s*([0-9]+(?:\.[0-9]+)?)/g;
        for (const m of afterQNums.matchAll(numRe)) {
            if (isDynamicEntry(afterQNums, m.index!, m[0].length)) continue;
            collect(m[0], m[1], m[2]);
            remaining = remaining.replace(m[0], '').replace(/,\s*,/g, ',').trim();
        }

        remaining = remaining.replace(/^,|,$/g, '').trim();
    }

    return { safeClasses: classes.join(' '), remainingStyle: remaining };
}

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

/**
 * Returns true when the regex match sits inside a comma-delimited entry
 * that contains a ternary (`?`), logical AND (`&&`), or logical OR (`||`).
 * These operators signal a dynamic JS expression — the entry must be left
 * untouched so it stays in the runtime style object.
 */
function isDynamicEntry(source: string, matchStart: number, matchLen: number): boolean {
    const prevComma = source.lastIndexOf(',', matchStart - 1);
    const nextComma = source.indexOf(',', matchStart + matchLen);
    const entry = source.slice(prevComma + 1, nextComma === -1 ? source.length : nextComma);
    return /\?|&&|\|\|/.test(entry);
}

function toKebabCase(str: string): string {
    return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function sanitizeValue(val: string): string {
    return val
        .replace(/['"]/g, '')
        .replace(/#/g, 'hex-')
        .replace(/\./g, '_')
        .replace(/\s+/g, '--space--')
        .replace(/\(/g, '--lp--')
        .replace(/\)/g, '--rp--')
        .replace(/,/g, '--cm--');
}
