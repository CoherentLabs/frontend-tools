/**
 * Maps the unit factories Gameface exposes on the global `CSS` interface to
 * the abstract CSS value categories, and tells the reconciler which of those
 * categories every standard property accepts.
 *
 * The Gameface DTS (src/cohtml.lib.dom.d.ts) is the source of truth for which
 * unit factories Gameface ships — never probe at runtime.  The CSS spec is
 * the source of truth for which categories each property accepts.
 *
 * Used by the reconciler to attach a `supportedUnits` array to each
 * unit-bearing CSS property in the supported / partial output buckets.
 *
 * Example for `margin-bottom` with the current Gameface DTS:
 *   getSupportedUnitsForProperty('margin-bottom', ...) →
 *     ['px', 'em', 'rem', 'in', 'pt', 'vh', 'vw', 'vmin', 'vmax', '%']
 */

export type ValueType =
    | 'length'
    | 'percentage'
    | 'angle'
    | 'time'
    | 'number'
    | 'integer';

/**
 * Maps every CSS value category to the DTS factory names that produce it.
 *
 * Keep these arrays in sync with the `CSS` interface in the Gameface DTS:
 * if a new factory appears (e.g. `cm(value)`), add the factory name here
 * AND its concrete CSS suffix in FACTORY_TO_SUFFIX below.
 */
const TYPE_TO_DTS_FACTORIES: Record<ValueType, readonly string[]> = {
    length: ['px', 'em', 'rem', 'in', 'pt', 'vh', 'vw', 'vmin', 'vmax'],
    percentage: ['percent'],
    angle: ['deg'],
    time: ['ms', 's'],
    // Both <number> and <integer> map to the same dimensionless factory in the
    // DTS — there's no integer-specific factory.  We split the categories so
    // the reconciler can later refine evidence (e.g. mark `z-index` as
    // integer-only) if we choose to surface that distinction.
    number: ['number'],
    integer: ['number'],
};

/**
 * Maps each DTS factory name to the concrete CSS unit suffix as it appears
 * in stylesheets.  Most factories share their name with the suffix
 * (`CSS.px` → `px`); the only special cases are `percent` (rendered `%`)
 * and the dimensionless `number` factory (rendered `<number>`).
 */
const FACTORY_TO_SUFFIX: Record<string, string> = {
    px: 'px', em: 'em', rem: 'rem', in: 'in', pt: 'pt',
    vh: 'vh', vw: 'vw', vmin: 'vmin', vmax: 'vmax',
    percent: '%',
    deg: 'deg',
    ms: 'ms', s: 's',
    number: '<number>',
};

/**
 * Resolves the concrete unit suffixes Gameface supports for each abstract
 * value category, given the members of the parsed `CSS` interface.
 *
 * Factories declared on `CSS` but not in FACTORY_TO_SUFFIX are surfaced as
 * the factory name itself, so a future Gameface release adding (say)
 * `CSS.cqw` will at least appear in the output unmapped rather than be
 * silently dropped.
 */
export function getGamefaceSupportedUnits(
    cssInterfaceMembers: readonly string[] | undefined,
): Record<ValueType, string[]> {
    const available = new Set(cssInterfaceMembers ?? []);
    const out = {} as Record<ValueType, string[]>;

    for (const type of Object.keys(TYPE_TO_DTS_FACTORIES) as ValueType[]) {
        const suffixes: string[] = [];
        for (const factory of TYPE_TO_DTS_FACTORIES[type]) {
            if (!available.has(factory)) continue;
            suffixes.push(FACTORY_TO_SUFFIX[factory] ?? factory);
        }
        out[type] = suffixes;
    }

    return out;
}

/**
 * Manual mapping of every standard CSS property whose grammar admits a
 * unit-bearing value to the abstract value categories it accepts.  Drives
 * the `supportedUnits` evidence emitted by the reconciler.
 *
 * Properties that ONLY take keyword / color / image / identifier values
 * (e.g. `display`, `position`, `background-color`, `cursor`) are
 * intentionally absent — for those we omit `supportedUnits` rather than
 * pretend the question is meaningful.
 *
 * Property categories follow the CSS specs (see MDN "Formal syntax" for
 * each property).  When a property accepts both a category and explicit
 * keywords (e.g. `font-size: <length> | xx-small | …`), only the category
 * is recorded here — the keywords are handled separately via
 * `supportedValues` evidence.
 */
export const CSS_PROPERTY_VALUE_TYPES: Record<string, readonly ValueType[]> = {
    // ── <length> | <percentage> ───────────────────────────────────────────
    'top':                   ['length', 'percentage'],
    'right':                 ['length', 'percentage'],
    'bottom':                ['length', 'percentage'],
    'left':                  ['length', 'percentage'],
    'inset':                 ['length', 'percentage'],
    'inset-block':           ['length', 'percentage'],
    'inset-block-start':     ['length', 'percentage'],
    'inset-block-end':       ['length', 'percentage'],
    'inset-inline':          ['length', 'percentage'],
    'inset-inline-start':    ['length', 'percentage'],
    'inset-inline-end':      ['length', 'percentage'],

    'width':                 ['length', 'percentage'],
    'height':                ['length', 'percentage'],
    'min-width':             ['length', 'percentage'],
    'min-height':            ['length', 'percentage'],
    'max-width':             ['length', 'percentage'],
    'max-height':            ['length', 'percentage'],
    'block-size':            ['length', 'percentage'],
    'inline-size':           ['length', 'percentage'],
    'min-block-size':        ['length', 'percentage'],
    'min-inline-size':       ['length', 'percentage'],
    'max-block-size':        ['length', 'percentage'],
    'max-inline-size':       ['length', 'percentage'],

    'margin':                ['length', 'percentage'],
    'margin-top':            ['length', 'percentage'],
    'margin-right':          ['length', 'percentage'],
    'margin-bottom':         ['length', 'percentage'],
    'margin-left':           ['length', 'percentage'],

    'padding':               ['length', 'percentage'],
    'padding-top':           ['length', 'percentage'],
    'padding-right':         ['length', 'percentage'],
    'padding-bottom':        ['length', 'percentage'],
    'padding-left':          ['length', 'percentage'],

    'gap':                   ['length', 'percentage'],
    'row-gap':               ['length', 'percentage'],
    'column-gap':            ['length', 'percentage'],
    'grid-gap':              ['length', 'percentage'],
    'grid-row-gap':          ['length', 'percentage'],
    'grid-column-gap':       ['length', 'percentage'],

    'flex-basis':            ['length', 'percentage'],

    'border-radius':                ['length', 'percentage'],
    'border-top-left-radius':       ['length', 'percentage'],
    'border-top-right-radius':      ['length', 'percentage'],
    'border-bottom-left-radius':    ['length', 'percentage'],
    'border-bottom-right-radius':   ['length', 'percentage'],

    'background-position':   ['length', 'percentage'],
    'background-position-x': ['length', 'percentage'],
    'background-position-y': ['length', 'percentage'],
    'background-size':       ['length', 'percentage'],
    'object-position':       ['length', 'percentage'],
    'mask-position':         ['length', 'percentage'],
    'mask-size':             ['length', 'percentage'],

    'transform-origin':      ['length', 'percentage'],
    'perspective-origin':    ['length', 'percentage'],

    'text-indent':           ['length', 'percentage'],
    'word-spacing':          ['length', 'percentage'],
    'letter-spacing':        ['length', 'percentage'],

    'font-size':             ['length', 'percentage'],
    'line-height':           ['number', 'length', 'percentage'],

    // ── <length> only (no percentage in the spec) ─────────────────────────
    'border-width':          ['length'],
    'border-top-width':      ['length'],
    'border-right-width':    ['length'],
    'border-bottom-width':   ['length'],
    'border-left-width':     ['length'],
    'outline-width':         ['length'],
    'outline-offset':        ['length'],
    'perspective':           ['length'],
    'box-shadow':            ['length'],
    'text-shadow':           ['length'],
    'border-image-width':    ['length', 'percentage', 'number'],
    'border-image-outset':   ['length', 'number'],
    'column-width':          ['length'],
    'column-rule-width':     ['length'],
    'column-gap-fixed':      ['length'],

    // ── <time> ────────────────────────────────────────────────────────────
    'transition-duration':   ['time'],
    'transition-delay':      ['time'],
    'animation-duration':    ['time'],
    'animation-delay':       ['time'],

    // ── <angle> ───────────────────────────────────────────────────────────
    // Standalone angle properties.  Function-valued grammars
    // (`transform: rotate(45deg)`, `filter: hue-rotate(90deg)`, …) embed
    // angles inside <transform-list> / <filter-list> rather than expose
    // them as a top-level property value, so they're not listed here.
    'rotate':                ['angle'],

    // ── <number> ──────────────────────────────────────────────────────────
    'opacity':                   ['number'],
    'flex-grow':                 ['number'],
    'flex-shrink':               ['number'],
    'animation-iteration-count': ['number'],
    'fill-opacity':              ['number'],
    'stop-opacity':              ['number'],
    'stroke-opacity':            ['number'],
    'stroke-width':              ['length', 'percentage', 'number'],
    'tab-size':                  ['number', 'length'],

    // ── <integer> ─────────────────────────────────────────────────────────
    'z-index':       ['integer'],
    'order':         ['integer'],
    'column-count':  ['integer'],
    'orphans':       ['integer'],
    'widows':        ['integer'],
};

/**
 * Looks up the concrete unit suffixes a property accepts under the running
 * Gameface engine.
 *
 * Returns `null` when the property is keyword-only (or otherwise not
 * unit-bearing per CSS_PROPERTY_VALUE_TYPES) so callers can omit the field
 * from their evidence rather than emit an empty array that might be read
 * as "no units accepted".
 *
 * Returns an empty array only in the unlikely case where the DTS strips
 * every factory in every category the property accepts.
 */
export function getSupportedUnitsForProperty(
    prop: string,
    unitsByType: Record<ValueType, string[]>,
): string[] | null {
    const types = CSS_PROPERTY_VALUE_TYPES[prop];
    if (!types) return null;

    const out = new Set<string>();
    for (const t of types) {
        for (const u of unitsByType[t] ?? []) out.add(u);
    }
    return [...out];
}
