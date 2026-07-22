/**
 * Curated map of CSS property names to the keyword values that should be
 * individually probed on the CSS sheet probe page.
 *
 * This supplements BCD's value sub-entries for properties where BCD's
 * granularity is incomplete or where game-UI-specific values matter.
 *
 * Properties that only accept non-keyword values (lengths, colors, URLs, …)
 * are NOT listed here — they fall back to `'initial'` in buildCssValueVariants.
 *
 * Shorthands (border, flex, animation, …) are handled separately via
 * SHORTHAND_MAP and receive a single canonical test value, not keyword lists.
 */
export const CSS_KEYWORD_VALUES: Record<string, string[]> = {
    // ── Layout mode ───────────────────────────────────────────────────────────
    display: [
        'block', 'inline', 'inline-block',
        'flex', 'inline-flex',
        'grid', 'inline-grid',
        'none', 'contents', 'flow-root',
        'table', 'table-cell', 'table-row', 'table-caption',
        'table-row-group', 'table-header-group', 'table-footer-group', 'table-column', 'table-column-group',
        'list-item',
    ],
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],

    // ── Overflow ──────────────────────────────────────────────────────────────
    overflow: ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'overflow-x': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'overflow-y': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'overflow-block': ['visible', 'hidden', 'scroll', 'auto'],
    'overflow-inline': ['visible', 'hidden', 'scroll', 'auto'],
    'overscroll-behavior': ['auto', 'contain', 'none'],
    'overscroll-behavior-x': ['auto', 'contain', 'none'],
    'overscroll-behavior-y': ['auto', 'contain', 'none'],

    // ── Visibility & display state ────────────────────────────────────────────
    visibility: ['visible', 'hidden', 'collapse'],
    'content-visibility': ['visible', 'hidden', 'auto'],

    // ── Flexbox ───────────────────────────────────────────────────────────────
    'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],

    // ── Alignment ─────────────────────────────────────────────────────────────
    'justify-content': [
        'flex-start', 'flex-end', 'center',
        'space-between', 'space-around', 'space-evenly',
        'start', 'end', 'stretch',
        'normal',
    ],
    'justify-items': ['auto', 'start', 'end', 'center', 'stretch', 'baseline', 'normal'],
    'justify-self': ['auto', 'start', 'end', 'center', 'stretch', 'baseline', 'normal'],
    'align-content': [
        'flex-start', 'flex-end', 'center',
        'space-between', 'space-around', 'space-evenly',
        'stretch', 'start', 'end', 'normal',
    ],
    'align-items': ['flex-start', 'flex-end', 'center', 'stretch', 'baseline', 'start', 'end', 'normal'],
    'align-self': ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline', 'start', 'end'],

    // ── Box model ─────────────────────────────────────────────────────────────
    'box-sizing': ['content-box', 'border-box'],

    // ── Floating & clearing ───────────────────────────────────────────────────
    float: ['none', 'left', 'right', 'inline-start', 'inline-end'],
    clear: ['none', 'left', 'right', 'both', 'inline-start', 'inline-end'],

    // ── Typography ────────────────────────────────────────────────────────────
    'font-style': ['normal', 'italic', 'oblique'],
    'font-weight': ['normal', 'bold', 'bolder', 'lighter'],
    'font-variant': ['normal', 'small-caps'],
    'font-kerning': ['auto', 'normal', 'none'],
    'font-stretch': [
        'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed',
        'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded',
    ],
    'text-transform': ['none', 'capitalize', 'uppercase', 'lowercase', 'full-width'],
    'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
    'text-align-last': ['auto', 'left', 'right', 'center', 'justify', 'start', 'end'],
    'text-decoration-line': ['none', 'underline', 'overline', 'line-through', 'blink'],
    'text-decoration-style': ['solid', 'double', 'dotted', 'dashed', 'wavy'],
    'text-underline-position': ['auto', 'under', 'left', 'right'],
    'text-overflow': ['clip', 'ellipsis'],
    'text-rendering': ['auto', 'optimizeSpeed', 'optimizeLegibility', 'geometricPrecision'],
    'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
    'word-break': ['normal', 'break-all', 'keep-all', 'break-word'],
    'word-wrap': ['normal', 'break-word', 'anywhere'],
    'overflow-wrap': ['normal', 'break-word', 'anywhere'],
    'line-break': ['auto', 'loose', 'normal', 'strict', 'anywhere'],
    'hyphens': ['none', 'manual', 'auto'],
    'vertical-align': ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'],
    direction: ['ltr', 'rtl'],
    'unicode-bidi': ['normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext'],
    'writing-mode': ['horizontal-tb', 'vertical-rl', 'vertical-lr'],
    'text-orientation': ['mixed', 'upright', 'sideways'],

    // ── Pointer & interaction ─────────────────────────────────────────────────
    'pointer-events': ['none', 'auto', 'all', 'visiblePainted', 'visibleFill', 'visibleStroke',
        'visible', 'painted', 'fill', 'stroke'],
    'user-select': ['none', 'auto', 'text', 'all', 'contain'],
    'touch-action': ['auto', 'none', 'pan-x', 'pan-y', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'manipulation'],
    resize: ['none', 'both', 'horizontal', 'vertical', 'block', 'inline'],
    cursor: [
        'auto', 'default', 'none', 'pointer', 'crosshair', 'text',
        'move', 'not-allowed', 'no-drop', 'grab', 'grabbing',
        'wait', 'progress', 'help',
        'zoom-in', 'zoom-out',
        'n-resize', 's-resize', 'e-resize', 'w-resize',
        'ne-resize', 'nw-resize', 'se-resize', 'sw-resize',
        'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize',
        'col-resize', 'row-resize',
        'all-scroll', 'copy', 'alias',
        'context-menu', 'cell',
    ],

    // ── Background ────────────────────────────────────────────────────────────
    'background-repeat': ['repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round'],
    'background-attachment': ['scroll', 'fixed', 'local'],
    'background-clip': ['border-box', 'padding-box', 'content-box', 'text'],
    'background-origin': ['border-box', 'padding-box', 'content-box'],
    'background-blend-mode': [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
        'color-dodge', 'color-burn', 'hard-light', 'soft-light',
        'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
    ],

    // ── Border style ──────────────────────────────────────────────────────────
    'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'hidden'],
    'border-top-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'border-right-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'border-bottom-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'border-left-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'border-block-start-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-block-end-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-inline-start-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-inline-end-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'outline-style': ['none', 'auto', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],

    // ── List ──────────────────────────────────────────────────────────────────
    'list-style-type': ['disc', 'circle', 'square', 'decimal', 'decimal-leading-zero',
        'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha',
        'lower-latin', 'upper-latin', 'none'],
    'list-style-position': ['inside', 'outside'],

    // ── Table ─────────────────────────────────────────────────────────────────
    'table-layout': ['auto', 'fixed'],
    'border-collapse': ['separate', 'collapse'],
    'caption-side': ['top', 'bottom'],
    'empty-cells': ['show', 'hide'],

    // ── Object fit ────────────────────────────────────────────────────────────
    'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'],

    // ── Compositing & blending ────────────────────────────────────────────────
    'mix-blend-mode': [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
        'color-dodge', 'color-burn', 'hard-light', 'soft-light',
        'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
        'plus-darker', 'plus-lighter',
    ],
    isolation: ['auto', 'isolate'],

    // ── Scroll ────────────────────────────────────────────────────────────────
    'scroll-behavior': ['auto', 'smooth'],
    'scroll-snap-type': ['none', 'x', 'y', 'block', 'inline', 'both'],
    'scroll-snap-align': ['none', 'start', 'end', 'center'],
    'scroll-snap-stop': ['normal', 'always'],
    'overscroll-behavior-block': ['auto', 'contain', 'none'],
    'overscroll-behavior-inline': ['auto', 'contain', 'none'],

    // ── Break (fragmentation) ─────────────────────────────────────────────────
    'break-before': ['auto', 'avoid', 'always', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
    'break-after': ['auto', 'avoid', 'always', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
    'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'],
    'page-break-before': ['auto', 'always', 'avoid', 'left', 'right'],
    'page-break-after': ['auto', 'always', 'avoid', 'left', 'right'],
    'page-break-inside': ['auto', 'avoid'],
    'column-fill': ['balance', 'auto'],
    'column-span': ['none', 'all'],

    // ── Appearance & form ─────────────────────────────────────────────────────
    appearance: ['none', 'auto', 'textfield', 'menulist-button', 'searchfield', 'textarea', 'push-button', 'slider-horizontal', 'checkbox', 'radio', 'square-button', 'menulist', 'listbox', 'meter', 'progress-bar'],

    // ── Misc ──────────────────────────────────────────────────────────────────
    'will-change': ['auto', 'scroll-position', 'contents', 'transform', 'opacity'],
    contain: ['none', 'strict', 'content', 'size', 'layout', 'style', 'paint'],
    'image-rendering': ['auto', 'crisp-edges', 'pixelated', 'optimizeQuality', 'optimizeSpeed'],
    'backface-visibility': ['visible', 'hidden'],
    'transform-style': ['flat', 'preserve-3d'],
    'transform-box': ['content-box', 'border-box', 'fill-box', 'stroke-box', 'view-box'],
    'perspective': ['none'],
    'animation-direction': ['normal', 'reverse', 'alternate', 'alternate-reverse'],
    'animation-fill-mode': ['none', 'forwards', 'backwards', 'both'],
    'animation-play-state': ['running', 'paused'],
    'animation-timing-function': ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'],
    'transition-timing-function': ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'],
    'font-display': ['auto', 'block', 'swap', 'fallback', 'optional'],
};
