/**
 * Derives candidate lists for HTML tags, CSS properties, and CSS selectors
 * from the MDN Browser Compatibility Data (@mdn/browser-compat-data v5).
 *
 * This module is used at build/probe time only — it runs on Node.js, not
 * in the browser.  Import it in the probe runner, not in browser-side probes.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcd = require('@mdn/browser-compat-data') as any;

import type { SelectorEntry } from './selector-list';

// ── Pseudo-element names (BCD keys without any : prefix) ─────────────────────
// Everything in this set maps to `::key` syntax; everything else defaults to `:key`.
const PSEUDO_ELEMENTS = new Set([
    'after', 'before', 'first-letter', 'first-line',
    'selection', 'placeholder', 'marker', 'backdrop',
    'file-selector-button', 'spelling-error', 'grammar-error',
    'highlight', 'cue', 'cue-region', 'slotted', 'part',
    'view-transition', 'view-transition-group', 'view-transition-image-pair',
    'view-transition-new', 'view-transition-old',
    'target-text', 'details-content', 'checkmark',
    'picker', 'picker-icon',
    'scroll-button', 'scroll-marker', 'scroll-marker-group',
]);

// ── Arguments required for functional pseudo-classes ─────────────────────────
const PSEUDO_CLASS_ARGS: Record<string, string> = {
    'nth-child':       '(2)',
    'nth-last-child':  '(2)',
    'nth-of-type':     '(2)',
    'nth-last-of-type':'(2)',
    'not':             '(.foo)',
    'is':              '(.foo, .bar)',
    'where':           '(.foo, .bar)',
    'has':             '(.child)',
    'has-slotted':     '',
    'lang':            '(en)',
    'dir':             '(ltr)',
    'host':            '',
    'state':           '(custom-state)',
    'active-view-transition-type': '(fade)',
    'nth-col':         '(2)',
    'nth-last-col':    '(2)',
};

// ── Arguments required for functional pseudo-elements ────────────────────────
const PSEUDO_ELEMENT_ARGS: Record<string, string> = {
    'highlight':                   '(custom)',
    'slotted':                     '(*)',
    'part':                        '(foo)',
    'cue':                         '',
    'cue-region':                  '',
    'view-transition-group':       '(*)',
    'view-transition-image-pair':  '(*)',
    'view-transition-new':         '(*)',
    'view-transition-old':         '(*)',
    'scroll-button':               '(down)',
    'picker':                      '(select)',
};

// ── BCD keys that map to specific test selectors (combinators, basic, etc.) ───
// Keys not in this map AND not pseudo-elements default to pseudo-class `:key`.
const SPECIAL_SELECTOR_MAP: Record<string, SelectorEntry | null> = {
    // Combinators
    'child':              { selector: 'div > p',   group: 'combinator-child' },
    'descendant':         { selector: 'div p',     group: 'combinator-descendant' },
    'next-sibling':       { selector: 'div + p',   group: 'combinator-adjacent-sibling' },
    'subsequent-sibling': { selector: 'div ~ p',   group: 'combinator-general-sibling' },
    'column':             { selector: 'div || td', group: 'combinator-column' },

    // Basic selectors
    'type':               { selector: 'div',        group: 'basic-type' },
    'universal':          { selector: '*',           group: 'basic-universal' },
    'class':              { selector: '.foo',        group: 'basic-class' },
    'id':                 { selector: '#foo',        group: 'basic-id' },
    'attribute':          { selector: '[attr]',      group: 'basic-attribute' },

    // CSS nesting
    'nesting':            { selector: '& .nested',   group: 'css-nesting' },

    // Page pseudo-classes (only meaningful in @page context)
    'first':              { selector: ':first',      group: 'page-pseudo' },
    'left':               { selector: ':left',       group: 'page-pseudo' },
    'right':              { selector: ':right',      group: 'page-pseudo' },

    // The :host() functional form (BCD key is 'hostfunction')
    'hostfunction':       { selector: ':host(.foo)', group: 'pseudo-shadow' },

    // Skip: 'list' is the selector-list concept (comma combinator), not a standalone selector
    'list':               null,
    // Skip: 'namespace' requires XML namespace setup that Gameface doesn't use
    'namespace':          null,
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns a map of CSS property names to arrays of keyword values from BCD.
 *
 * BCD stores value-specific compat data as sub-entries of each property:
 *   bcd.css.properties.display.flex  → value "flex" for the display property
 *   bcd.css.properties.display.grid  → value "grid" for the display property
 *
 * Only keys matching /^[a-z][a-z0-9-]*$/ are included — this excludes BCD
 * sub-feature entries that use underscores (e.g. "multi-keyword_values",
 * "position_values") which are NOT valid CSS keyword values.
 *
 * Properties with no qualifying sub-entries are omitted from the result;
 * the caller should fall back to `['initial']` for those.
 */
export function getBcdCssPropertyValues(): Record<string, string[]> {
    const props = bcd.css.properties as Record<string, any>;
    const result: Record<string, string[]> = {};

    for (const [prop, data] of Object.entries(props)) {
        if (prop.startsWith('_') || prop.startsWith('-')) continue;
        if (typeof data !== 'object' || data === null) continue;

        const values: string[] = [];
        for (const key of Object.keys(data as object)) {
            if (key === '__compat') continue;
            // Only include keys that look like actual CSS keyword values:
            // lower-case letters and hyphens only, starting with a letter.
            if (/^[a-z][a-z0-9-]*$/.test(key)) {
                values.push(key);
            }
        }

        if (values.length > 0) {
            result[prop] = values;
        }
    }

    return result;
}

/**
 * Returns a map of Web API interface names to their member names from BCD.
 *
 * BCD stores members as sub-entries of each interface:
 *   bcd.api.HTMLElement.animate    → the animate() method
 *   bcd.api.HTMLElement.className  → the className property
 *
 * Only member keys matching /^[a-zA-Z][a-zA-Z0-9]*$/ are included — this
 * excludes BCD sub-feature entries that use underscores (e.g. "event_toggle",
 * "beforetoggle_event") which are documentation sub-features, not JS members.
 *
 * The result is suitable for direct use as `interfaceMap` in jsProbe, or for
 * merging with a parsed .d.ts file.
 */
export function getBcdJsInterfaces(): Record<string, string[]> {
    const api = bcd.api as Record<string, any>;
    const result: Record<string, string[]> = {};

    for (const [name, data] of Object.entries(api)) {
        if (name.startsWith('_')) continue;
        if (typeof data !== 'object' || data === null) continue;

        const members: string[] = [];
        for (const key of Object.keys(data as object)) {
            if (key === '__compat') continue;
            // Only include keys that are valid JS identifiers without underscores.
            // Underscore-containing keys are BCD sub-feature descriptions, not members.
            if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(key)) {
                members.push(key);
            }
        }

        result[name] = members;
    }

    return result;
}

/**
 * Returns all standard HTML tag names from the BCD database.
 * Excludes non-tag entries (none exist in BCD v5, but filtering is defensive).
 */
export function getBcdHtmlTags(): string[] {
    const elements = bcd.html.elements as Record<string, unknown>;
    return Object.keys(elements).filter(
        (k) => !k.startsWith('_') && !k.includes('_'),
    );
}

/**
 * Returns all standard CSS property names (kebab-case) from BCD.
 * Excludes vendor-prefixed properties (starting with `-moz-`, `-webkit-`, etc.)
 * since those are engine-specific and Gameface doesn't expose them.
 */
export function getBcdCssProperties(): string[] {
    const props = bcd.css.properties as Record<string, unknown>;
    return Object.keys(props).filter(
        (k) => !k.startsWith('_') && !k.startsWith('-'),
    );
}

/**
 * Returns CSS selector entries derived from BCD.
 * Each entry has the actual CSS selector string and a group label.
 *
 * Covers:
 *   - All standard pseudo-classes (e.g. `:hover`, `:nth-child(2)`)
 *   - All standard pseudo-elements (e.g. `::before`, `::slotted(*)`)
 *   - Combinators (e.g. `div > p`, `div + p`)
 *   - Basic selector types (e.g. `*`, `.foo`, `#foo`, `[attr]`)
 *
 * At-rules (@supports, @media, etc.) are NOT included here — they are
 * handled separately in selector-list.ts because they need probe-B-only logic.
 */
export function getBcdCssSelectors(): SelectorEntry[] {
    const selectors = bcd.css.selectors as Record<string, unknown>;
    const result: SelectorEntry[] = [];

    for (const key of Object.keys(selectors)) {
        if (key.startsWith('_') || key.startsWith('-')) continue;

        // Check the special-case map first.
        if (Object.prototype.hasOwnProperty.call(SPECIAL_SELECTOR_MAP, key)) {
            const mapped = SPECIAL_SELECTOR_MAP[key];
            if (mapped !== null) result.push(mapped);
            continue;
        }

        if (PSEUDO_ELEMENTS.has(key)) {
            const args = PSEUDO_ELEMENT_ARGS[key] ?? '';
            result.push({ selector: `::${key}${args}`, group: 'pseudo-element' });
        } else {
            // Pseudo-class (default)
            const args = PSEUDO_CLASS_ARGS[key] ?? '';
            result.push({ selector: `:${key}${args}`, group: 'pseudo-class' });
        }
    }

    return result;
}
