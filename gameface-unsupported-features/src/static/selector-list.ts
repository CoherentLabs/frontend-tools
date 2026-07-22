/**
 * CSS selector entries supplementing the BCD-derived list in bcd-source.ts.
 *
 * BCD covers all pseudo-classes, pseudo-elements, combinators, and basic
 * selectors.  This file holds only entries that BCD does NOT cover:
 *
 *   1. CSS At-rules (@supports, @media, etc.) — probed via style injection
 *      (probe B only, because at-rules cannot be used in querySelector).
 *   2. Complex compound selectors worth testing beyond simple BCD entries
 *      (e.g. `:nth-child(2n+1)`, `:not(.foo, .bar)`, `:is(:hover, :focus)`).
 *
 * The probe runner merges this list with the BCD-derived selectors.
 */

export interface SelectorEntry {
    selector: string;
    group: string;
}

/** At-rules — tested via probe B (style injection) only. */
export const SELECTOR_LIST: SelectorEntry[] = [
    // ── At-rules ──────────────────────────────────────────────────────────────
    { selector: '@supports (display: flex)',        group: 'at-rule' },
    { selector: '@media (max-width: 600px)',        group: 'at-rule' },
    { selector: '@layer base',                      group: 'at-rule' },
    { selector: '@container (min-width: 300px)',    group: 'at-rule' },
    { selector: '@scope (.foo)',                    group: 'at-rule' },
    { selector: '@starting-style',                  group: 'at-rule' },

    // ── Complex compound / forgiving variants worth explicit testing ───────────
    { selector: ':nth-child(2n+1)',                 group: 'pseudo-structural-complex' },
    { selector: ':nth-child(odd)',                  group: 'pseudo-structural-complex' },
    { selector: ':nth-child(even)',                 group: 'pseudo-structural-complex' },
    { selector: ':nth-child(2 of .class)',          group: 'pseudo-structural-of' },
    { selector: ':not(.foo)',                        group: 'pseudo-logical-forgiving' },
    { selector: ':is(:hover)',                      group: 'pseudo-logical-compound' },
    { selector: ':has(> .child)',                   group: 'pseudo-relational-direct' },

    // ── Attribute selector variants ────────────────────────────────────────────
    { selector: '[attr^="val"]',                    group: 'attribute-prefix' },
    { selector: '[attr$="val"]',                    group: 'attribute-suffix' },
    { selector: '[attr*="val"]',                    group: 'attribute-contains' },
    { selector: '[attr~="val"]',                    group: 'attribute-word' },
    { selector: '[attr|="val"]',                    group: 'attribute-hyphen' },
    { selector: '[attr="val"]',                     group: 'attribute-exact' },
    { selector: '[attr i]',                         group: 'attribute-case-insensitive' },

    // ── Shadow DOM ─────────────────────────────────────────────────────────────
    { selector: ':host-context(.foo)',              group: 'pseudo-shadow' },
    { selector: '::slotted(*)',                     group: 'pseudo-element-shadow' },
    { selector: '::part(foo)',                      group: 'pseudo-element-shadow' },
];
