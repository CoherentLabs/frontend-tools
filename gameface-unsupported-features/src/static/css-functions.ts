/**
 * Catalogue of CSS functions to test against Gameface.
 *
 * Each entry pairs a CSS function name with:
 *   - the property it will be tested against (one rule per function),
 *   - a `canonicalValue` that is syntactically valid AND only uses a single
 *     unit type within the function (the form Gameface is expected to
 *     accept when the function is implemented at all), and
 *   - an optional `mixedUnitsValue` that intentionally mixes unit types
 *     inside the function arguments — Gameface's documented limitation is
 *     "no mixing units in math/sizing functions", so a function that
 *     supports its canonical form but rejects the mixed-units form lands
 *     in `partial` with that limitation noted as evidence.
 *
 * The reconciler matches probe outcomes by **exact value string**, not by
 * function name, so canonical and mixed-units forms are unambiguously
 * attributable even when several functions share the same test property.
 *
 * Detection model:
 *   canonical rejected         → `unsupported` (function is not implemented)
 *   canonical accepted,
 *     mixed-units rejected     → `partial`  (function works, mixing units doesn't)
 *   canonical accepted,
 *     mixed-units accepted     → `supported`
 *   canonical accepted,
 *     no mixed-units variant   → `supported`
 *
 * Source of truth: the Gameface log.  When the stylesheet parser rejects a
 * declaration it emits "Warning: Unable to parse declaration: <prop>:
 * <value>;" (or the `<prop> - <value>` form for keyword rejections).  Both
 * shapes are captured by `src/log/log-parser.ts`.
 */

export type CssFunctionCategory =
    | 'math'
    | 'color'
    | 'image'
    | 'transform'
    | 'filter'
    | 'timing'
    | 'shape'
    | 'grid'
    | 'counter'
    | 'reference';

export interface CssFunctionEntry {
    /** Function name as it appears in CSS (e.g. `clamp`, `linear-gradient`). */
    name: string;
    /** Family the function belongs to — used for filtering / summary only. */
    category: CssFunctionCategory;
    /**
     * Property to test the function against.  Choose a property whose
     * grammar accepts the function so a parse failure unambiguously points
     * at the function and not at the property.
     */
    testProperty: string;
    /**
     * Canonical, "should work" form of the function.  When Gameface supports
     * the function at all, this value parses cleanly and produces no log
     * warning.  Uses a single unit type within math/sizing arguments to
     * sidestep the documented "no mixing units" limitation.
     */
    canonicalValue: string;
    /**
     * Optional "should fail" form that mixes unit types inside the function
     * arguments.  Present only on math/sizing functions where mixing units
     * is meaningful (calc, clamp, min, max, …); omitted for functions whose
     * arguments are not numeric or whose grammar forbids mixing in the
     * first place (rgb, translate, blur, …).
     */
    mixedUnitsValue?: string;
    /**
     * Optional free-form note attached to every reconciled entry for this
     * function (independent of probe outcome).  Use for caveats the reader
     * should always see, e.g. "requires currentColor fallback in Gameface".
     */
    note?: string;
    /**
     * Mark functions that cannot be safely probed in-engine.  When set, the
     * runner does NOT emit a CSS rule for this entry, and the reconciler
     * classifies the entry as `unknown` with `skipReason` attached as
     * evidence.
     *
     * The known unsafe shapes are URL/image-fetching functions: Gameface's
     * image pipeline starts resolving `url(…)` / `image-set(…)` /
     * `cross-fade(…)` arguments as soon as a stylesheet containing them is
     * parsed, even when no element applies the rule.  Missing or unusual
     * resources (data URIs, non-existent paths) keep the renderer busy
     * long enough to time out the next CDP call, which previously cascaded
     * into HTML- and JS-surface failures.
     */
    skipProbe?: { reason: string };
}

/**
 * Shared note pinned onto the `partial` entry whenever a function supports
 * its canonical form but rejects the mixed-units form.  Keeping the wording
 * centralised makes the limitation easy to update if the engine ever
 * changes behaviour.
 */
export const MIXED_UNITS_NOTE =
    'Mixing units inside the function arguments (e.g. `clamp(100px, 20vw, 200px)`) is not supported by Gameface — use a single unit type per argument.';

/**
 * Each math/sizing function is tested in two forms: a uniform-units
 * canonical form and a mixed-units form that targets the "no mixing units"
 * limitation.  Functions whose arguments are not lengths (rgb, hsl,
 * rotate, …) only carry the canonical form.
 */
export const CSS_FUNCTIONS: readonly CssFunctionEntry[] = [
    // ── Math / sizing ─────────────────────────────────────────────────────
    // Math/sizing functions are tested against `font-size` because Gameface
    // applies the "no mixing units" limitation most strictly there:
    // documented example `font-size: clamp(100px, 20vw, 200px)` is rejected
    // at parse time with "Warning: Unable to parse declaration: font-size:
    // clamp(100px, 20vw, 200px);".  The same mixed-units value applied to
    // `width` is silently accepted (vw and px are both lengths), so it
    // wouldn't reliably exercise the limitation.
    {
        name: 'calc',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'calc(12px + 4px)',
        mixedUnitsValue: 'calc(12px + 1vw)',
    },
    {
        name: 'clamp',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'clamp(12px, 14px, 16px)',
        mixedUnitsValue: 'clamp(100px, 20vw, 200px)',
    },
    {
        name: 'min',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'min(12px, 16px)',
        mixedUnitsValue: 'min(12px, 1vw)',
    },
    {
        name: 'max',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'max(12px, 16px)',
        mixedUnitsValue: 'max(12px, 1vw)',
    },
    {
        name: 'mod',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'mod(20px, 6px)',
        mixedUnitsValue: 'mod(20px, 1vw)',
    },
    {
        name: 'rem',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'rem(20px, 6px)',
        mixedUnitsValue: 'rem(20px, 1vw)',
    },
    {
        name: 'round',
        category: 'math',
        testProperty: 'font-size',
        canonicalValue: 'round(14px, 2px)',
        mixedUnitsValue: 'round(14px, 1vw)',
    },
    {
        name: 'abs',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'abs(-100px)',
    },
    {
        name: 'sign',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(sign(-1) * -100px)',
    },
    {
        name: 'pow',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(pow(2, 5) * 1px)',
    },
    {
        name: 'sqrt',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(sqrt(100) * 1px)',
    },
    {
        name: 'hypot',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(hypot(3, 4) * 1px)',
    },
    {
        name: 'log',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(log(100) * 1px)',
    },
    {
        name: 'exp',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(exp(1) * 1px)',
    },
    {
        name: 'sin',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(sin(0) * 100px + 100px)',
    },
    {
        name: 'cos',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(cos(0) * 100px)',
    },
    {
        name: 'tan',
        category: 'math',
        testProperty: 'width',
        canonicalValue: 'calc(tan(0) * 100px + 100px)',
    },
    {
        name: 'asin',
        category: 'math',
        testProperty: 'transform',
        canonicalValue: 'rotate(asin(1))',
    },
    {
        name: 'acos',
        category: 'math',
        testProperty: 'transform',
        canonicalValue: 'rotate(acos(1))',
    },
    {
        name: 'atan',
        category: 'math',
        testProperty: 'transform',
        canonicalValue: 'rotate(atan(1))',
    },
    {
        name: 'atan2',
        category: 'math',
        testProperty: 'transform',
        canonicalValue: 'rotate(atan2(1, 1))',
    },

    // ── Color ─────────────────────────────────────────────────────────────
    {
        name: 'rgb',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'rgb(255, 0, 0)',
    },
    {
        name: 'rgba',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'rgba(255, 0, 0, 0.5)',
    },
    {
        name: 'hsl',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'hsl(0, 100%, 50%)',
    },
    {
        name: 'hsla',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'hsla(0, 100%, 50%, 0.5)',
    },
    {
        name: 'hwb',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'hwb(0 0% 0%)',
    },
    {
        name: 'lab',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'lab(50% 40 59.5)',
    },
    {
        name: 'lch',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'lch(50% 70 30)',
    },
    {
        name: 'oklab',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'oklab(0.5 0.1 0.1)',
    },
    {
        name: 'oklch',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'oklch(0.5 0.1 30)',
    },
    {
        name: 'color',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'color(srgb 1 0 0)',
    },
    {
        name: 'color-mix',
        category: 'color',
        testProperty: 'color',
        canonicalValue: 'color-mix(in srgb, red, blue)',
    },

    // ── Image / gradient ──────────────────────────────────────────────────
    {
        name: 'url',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'url("data:image/svg+xml,%3Csvg/%3E")',
        skipProbe: {
            reason: 'Gameface starts resolving url(…) at stylesheet-parse time; '
                + 'a hanging fetch can deadlock the next CDP call.  Treat as '
                + 'present (the engine universally supports url() for image '
                + 'and font sources) — manual verification recommended.',
        },
    },
    {
        name: 'linear-gradient',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'linear-gradient(red, blue)',
    },
    {
        name: 'radial-gradient',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'radial-gradient(red, blue)',
    },
    {
        name: 'conic-gradient',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'conic-gradient(red, blue)',
    },
    {
        name: 'repeating-linear-gradient',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'repeating-linear-gradient(red 0 10px, blue 10px 20px)',
    },
    {
        name: 'repeating-radial-gradient',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'repeating-radial-gradient(red 0 10px, blue 10px 20px)',
    },
    {
        name: 'image-set',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'image-set("img.png" 1x, "img2.png" 2x)',
        skipProbe: {
            reason: 'image-set() requires real image sources; Gameface attempts '
                + 'to resolve them at parse time and stalls the renderer. '
                + 'Verify manually against the Gameface CSS support docs.',
        },
    },
    {
        name: 'cross-fade',
        category: 'image',
        testProperty: 'background-image',
        canonicalValue: 'cross-fade(50% url("a.png"), url("b.png"))',
        skipProbe: {
            reason: 'cross-fade() requires real image sources; Gameface attempts '
                + 'to resolve them at parse time and stalls the renderer. '
                + 'Verify manually against the Gameface CSS support docs.',
        },
    },

    // ── Transform functions ───────────────────────────────────────────────
    {
        name: 'translate',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'translate(10px, 20px)',
        mixedUnitsValue: 'translate(10px, 5%)',
    },
    {
        name: 'translateX',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'translateX(10px)',
    },
    {
        name: 'translateY',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'translateY(10px)',
    },
    {
        name: 'translateZ',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'translateZ(10px)',
    },
    {
        name: 'translate3d',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'translate3d(10px, 20px, 30px)',
    },
    {
        name: 'rotate',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'rotate(45deg)',
    },
    {
        name: 'rotateX',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'rotateX(45deg)',
    },
    {
        name: 'rotateY',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'rotateY(45deg)',
    },
    {
        name: 'rotateZ',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'rotateZ(45deg)',
    },
    {
        name: 'rotate3d',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'rotate3d(1, 1, 1, 45deg)',
    },
    {
        name: 'scale',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'scale(2)',
    },
    {
        name: 'scaleX',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'scaleX(2)',
    },
    {
        name: 'scaleY',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'scaleY(2)',
    },
    {
        name: 'scaleZ',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'scaleZ(2)',
    },
    {
        name: 'scale3d',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'scale3d(2, 2, 2)',
    },
    {
        name: 'skew',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'skew(10deg)',
    },
    {
        name: 'skewX',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'skewX(10deg)',
    },
    {
        name: 'skewY',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'skewY(10deg)',
    },
    {
        name: 'matrix',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'matrix(1, 0, 0, 1, 10, 20)',
    },
    {
        name: 'matrix3d',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue:
            'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 10,20,30,1)',
    },
    {
        name: 'perspective',
        category: 'transform',
        testProperty: 'transform',
        canonicalValue: 'perspective(500px)',
    },

    // ── Filter functions ──────────────────────────────────────────────────
    {
        name: 'blur',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'blur(5px)',
    },
    {
        name: 'brightness',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'brightness(0.5)',
    },
    {
        name: 'contrast',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'contrast(2)',
    },
    {
        name: 'drop-shadow',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'drop-shadow(2px 4px 6px black)',
    },
    {
        name: 'grayscale',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'grayscale(1)',
    },
    {
        name: 'hue-rotate',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'hue-rotate(45deg)',
    },
    {
        name: 'invert',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'invert(1)',
    },
    {
        // `opacity()` is the filter-function form (distinct from the
        // `opacity` property).  It only makes sense inside `filter:`.
        name: 'opacity',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'opacity(0.5)',
    },
    {
        name: 'saturate',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'saturate(2)',
    },
    {
        name: 'sepia',
        category: 'filter',
        testProperty: 'filter',
        canonicalValue: 'sepia(1)',
    },

    // ── Timing functions ──────────────────────────────────────────────────
    {
        name: 'cubic-bezier',
        category: 'timing',
        testProperty: 'transition-timing-function',
        canonicalValue: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    {
        name: 'steps',
        category: 'timing',
        testProperty: 'transition-timing-function',
        canonicalValue: 'steps(4, end)',
    },
    {
        // `linear()` is the *function* form of the linear easing — easy to
        // confuse with the bare keyword `linear`.  We test only the function
        // form here; the keyword is covered by the keyword-value probe.
        name: 'linear',
        category: 'timing',
        testProperty: 'transition-timing-function',
        canonicalValue: 'linear(0, 0.25, 0.5, 0.75, 1)',
    },

    // ── Shape (used by clip-path) ─────────────────────────────────────────
    {
        name: 'circle',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'circle(50%)',
    },
    {
        name: 'ellipse',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'ellipse(40% 30%)',
    },
    {
        name: 'polygon',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'polygon(0 0, 100% 0, 50% 100%)',
    },
    {
        name: 'inset',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'inset(10px)',
    },
    {
        name: 'path',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'path("M 0 0 L 10 0 L 10 10 Z")',
    },
    {
        name: 'rect',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'rect(0 100% 100% 0)',
    },
    {
        name: 'xywh',
        category: 'shape',
        testProperty: 'clip-path',
        canonicalValue: 'xywh(0 0 100% 100%)',
    },

    // ── Grid ──────────────────────────────────────────────────────────────
    {
        name: 'repeat',
        category: 'grid',
        testProperty: 'grid-template-columns',
        canonicalValue: 'repeat(3, 1fr)',
    },
    {
        name: 'minmax',
        category: 'grid',
        testProperty: 'grid-template-columns',
        canonicalValue: 'minmax(100px, 1fr)',
        mixedUnitsValue: 'minmax(10%, 1fr)',
    },
    {
        name: 'fit-content',
        category: 'grid',
        testProperty: 'grid-template-columns',
        canonicalValue: 'fit-content(200px)',
    },

    // ── Counter / content ─────────────────────────────────────────────────
    {
        name: 'counter',
        category: 'counter',
        testProperty: 'content',
        canonicalValue: 'counter(item)',
    },
    {
        name: 'counters',
        category: 'counter',
        testProperty: 'content',
        canonicalValue: 'counters(item, ".")',
    },

    // ── Reference / indirection ───────────────────────────────────────────
    {
        // `var()` resolves a custom property — testing it requires the
        // referenced custom property to exist on something the rule applies
        // to.  Using a literal fallback keeps the test self-contained: a
        // working `var()` resolves the fallback when --gf-test-x is undefined.
        name: 'var',
        category: 'reference',
        testProperty: 'width',
        canonicalValue: 'var(--gf-test-x, 100px)',
    },
    {
        name: 'env',
        category: 'reference',
        testProperty: 'width',
        canonicalValue: 'env(safe-area-inset-top, 100px)',
    },
    {
        // `attr()` reads from a target element's attribute.  In strict CSS
        // 2.1 it only works inside `content:`; the level-5 form expands to
        // typed values for other properties but is not universally
        // implemented.  Test the level-2 form on `content:` so a passing
        // probe means *some* form of attr() works.
        name: 'attr',
        category: 'reference',
        testProperty: 'content',
        canonicalValue: 'attr(data-gf)',
    },
];
