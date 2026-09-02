/**
 * The diagnostic codes from the spec, their levels, and a collector that formats them
 * for the build log. Every diagnostic carries the element it is about so the developer
 * can find it; none of them are silent.
 */

export type Level = 'error' | 'warn' | 'info';

export interface DiagnosticSpec {
    level: Level;
    message: string;
    docs: string;
}

const DOCS = 'https://docs.coherent-labs.com/vite-gameface-rasterize/diagnostics';

export const CODES = {
    RZ001: {
        level: 'error',
        message: 'mix-blend-mode / backdrop-filter cannot be baked: they do not composite source-over',
        docs: `${DOCS}#rz001`,
    },
    RZ002: {
        level: 'warn',
        message: 'a transition or animation targets a baked property; the baked variants swap instantly',
        docs: `${DOCS}#rz002`,
    },
    RZ003: {
        level: 'warn',
        message: 'a baked value comes from a custom property that is written from JS; the value is frozen at build time',
        docs: `${DOCS}#rz003`,
    },
    RZ004: { level: 'error', message: 'flat mode requires a statically resolvable size', docs: `${DOCS}#rz004` },
    RZ005: { level: 'error', message: 'decoration cannot be 9-sliced: a stretch zone is not uniform', docs: `${DOCS}#rz005` },
    RZ006: { level: 'warn', message: 'texture budget exceeded', docs: `${DOCS}#rz006` },
    RZ007: { level: 'warn', message: 'marked element has no bakeable properties', docs: `${DOCS}#rz007` },
    RZ008: { level: 'error', message: 'verification SSIM below threshold', docs: `${DOCS}#rz008` },
    RZ009: { level: 'warn', message: 'requested format cannot carry the alpha this asset needs', docs: `${DOCS}#rz009` },
    RZ010: { level: 'error', message: 'element mode: nothing bakeable remains after live exclusions', docs: `${DOCS}#rz010` },
    RZ011: {
        level: 'error',
        message: 'element mode: layout-affecting dynamism inside the subtree; contents may change what they show, not how much space they take',
        docs: `${DOCS}#rz011`,
    },
    RZ012: { level: 'warn', message: 'element mode: live parts were excluded from the bake', docs: `${DOCS}#rz012` },
    RZ013: { level: 'warn', message: 'element skipped: layout-affecting media queries apply inside the subtree', docs: `${DOCS}#rz013` },
    RZ014: { level: 'warn', message: 'redundant nested rasterize marker, subsumed by the enclosing element-mode bake', docs: `${DOCS}#rz014` },
    RZ015: { level: 'info', message: 'unmarked element uses expensive properties; add data-rasterize if it is static', docs: `${DOCS}#rz015` },
    RZ016: { level: 'warn', message: 'state variant produced no visual difference from the base bake', docs: `${DOCS}#rz016` },
    RZ017: { level: 'warn', message: 'the capture pass reported a problem with this element', docs: `${DOCS}#rz017` },
    RZ018: { level: 'warn', message: 'the element was not displayed when it was captured', docs: `${DOCS}#rz018` },
    RZ019: {
        level: 'warn',
        message: 'the capture came back empty, so nothing was baked and the live CSS was left in place',
        docs: `${DOCS}#rz019`,
    },
    RZ020: {
        level: 'warn',
        message: 'elements that look alike baked differently and cannot all be matched at runtime',
        docs: `${DOCS}#rz020`,
    },
    RZ021: { level: 'warn', message: 'several assets are the same image under different ids', docs: `${DOCS}#rz021` },
    RZ022: { level: 'warn', message: 'marked elements did not receive a texture in the built page', docs: `${DOCS}#rz022` },
    RZ023: { level: 'warn', message: 'the baked page does not match the live one', docs: `${DOCS}#rz023` },
    RZ024: {
        level: 'warn',
        message: 'too small to 9-slice, so it was baked flat at its measured size',
        docs: `${DOCS}#rz024`,
    },
    RZ025: {
        level: 'warn',
        message: 'a filter or mask survived the bake and still costs a pass every frame',
        docs: `${DOCS}#rz025`,
    },
} satisfies Record<string, DiagnosticSpec>;

export type Code = keyof typeof CODES;

export interface Diagnostic {
    code: Code;
    level: Level;
    /** The element this is about, in human terms (selector path or author id). */
    where: string;
    /** Extra context appended to the canonical message. */
    detail?: string;
    route?: string;
    /** How many elements produced this exact diagnostic. */
    count: number;
    /** The other elements it was raised for, for the manifest and for reporting. */
    others: string[];
}

export class DiagnosticBag {
    readonly items: Diagnostic[] = [];

    constructor(private readonly strictTransitions: boolean) {}

    add(code: Code, where: string, detail?: string, route?: string): Diagnostic {
        // RZ002 is the one code whose level is configurable (§8.2): the escape hatch for a
        // transitioned shadow is to drop the marker, which is the author's call, not ours.
        const level: Level = code === 'RZ002' && this.strictTransitions ? 'error' : CODES[code].level;

        // Nine elements sharing one decoration produce one problem, not nine lines of it. The
        // same code with the same detail collapses into a count, keeping the report readable on
        // a page with hundreds of marked elements - which is where it matters most.
        const existing = this.items.find((d) => d.code === code && d.detail === detail && d.route === route);
        if (existing) {
            existing.count++;
            if (existing.where !== where && existing.others.length < 20) existing.others.push(where);
            return existing;
        }

        const item: Diagnostic = { code, level, where, detail, route, count: 1, others: [] };
        this.items.push(item);
        return item;
    }

    has(code: Code, where: string): boolean {
        return this.items.some((d) => d.code === code && (d.where === where || d.others.includes(where)));
    }

    forElement(where: string): Diagnostic[] {
        return this.items.filter((d) => d.where === where || d.others.includes(where));
    }

    get errors(): Diagnostic[] {
        return this.items.filter((d) => d.level === 'error');
    }

    format(d: Diagnostic): string {
        const spec = CODES[d.code];
        const detail = d.detail ? ` - ${d.detail}` : '';
        const route = d.route ? ` [${d.route}]` : '';
        const where = d.count > 1 ? `${d.where} and ${d.count - 1} more` : d.where;
        return `${d.code} ${where}${route}: ${spec.message}${detail}\n      ${spec.docs}`;
    }
}
