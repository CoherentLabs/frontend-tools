# Negative Rules — CSS

Generated from `results/css/{partial,unsupported}.json` and `results/selectors/{partial,unsupported}.json`. Each rule maps to the cited scraper file via `source_path` in `negative-rules-index.json`. Examples and "why" fields are derived directly from the scraper evidence.

Total rules in this file: **232** (critical: 27, high: 61, medium: 140, low: 4).

## CRITICAL (27)

---
### [CSS-323] — ::backdrop
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
::backdrop { color: red; }
```

**✅ Generate instead:**
```css
.modal-backdrop { background-color: rgba(0, 0, 0, 0.5); }
// Render an explicit backdrop element.
```

**Rule for AI agents:** Never use the `::backdrop` pseudo-element; the renderer logs "unsupported pseudo: ::backdrop" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: ::backdrop".

---
### [CSS-324] — ::checkmark
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
::checkmark { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — render a custom checkmark element.
```

**Rule for AI agents:** Never use the `::checkmark` pseudo-element; the renderer logs "unsupported pseudo: ::checkmark" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: ::checkmark".

---
### [CSS-325] — ::cue
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
::cue { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — WebVTT cue styling is not implemented.
```

**Rule for AI agents:** Never use the `::cue` pseudo-element; the renderer logs "unsupported pseudo: ::cue" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: ::cue".

---
### [CSS-326] — :active-view-transition
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:active-view-transition { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — view-transition pseudo-classes are not implemented.
```

**Rule for AI agents:** Never use the `:active-view-transition` pseudo-class; the renderer logs "unsupported pseudo: :active-view-transition" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :active-view-transition".

---
### [CSS-327] — :active-view-transition-type(fade)
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:active-view-transition-type(fade) { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — view-transition pseudo-classes are not implemented.
```

**Rule for AI agents:** Never use the `:active-view-transition-type(fade)` pseudo-class; the renderer logs "unsupported pseudo: :active-view-transition-type" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :active-view-transition-type".

---
### [CSS-328] — :any-link
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:any-link { color: red; }
```

**✅ Generate instead:**
```css
.link { color: red; }
// Apply the class directly to anchors.
```

**Rule for AI agents:** Never use the `:any-link` pseudo-class; the renderer logs "unsupported pseudo: :any-link" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :any-link".

---
### [CSS-329] — :autofill
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:autofill { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — autofill is not implemented; do not rely on autofill styling.
```

**Rule for AI agents:** Never use the `:autofill` pseudo-class; the renderer logs "unsupported pseudo: :autofill" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :autofill".

---
### [CSS-330] — :buffering
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:buffering { color: red; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — media buffering state is not exposed; toggle a class from JS.
```

**Rule for AI agents:** Never use the `:buffering` pseudo-class; the renderer logs "unsupported pseudo: :buffering" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :buffering".

---
### [CSS-331] — :checked
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:checked { color: red; }
```

**✅ Generate instead:**
```css
.checkbox.is-checked { color: red; }
// Toggle the .is-checked class from JS when state changes.
```

**Rule for AI agents:** Never use the `:checked` pseudo-class; the renderer logs "unsupported pseudo: :checked" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :checked".

---
### [CSS-332] — :closed
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
.foo:closed { color: red; }
```

**✅ Generate instead:**
```css
.popover:not(.is-open) { display: none; }
// Toggle .is-open from JS.
```

**Rule for AI agents:** Never use the `:closed` pseudo-class; the renderer logs "unsupported pseudo: :closed" and the rule never matches.

**Why:** scraper logWarning: "unsupported pseudo: :closed".

---
### [CSS-334] — :nth-child(2 of .class)
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:nth-child(2 of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(2) { color: red; }
// Use only the An+B form; if you need scoped matching, add an explicit class to the matched elements from JS.
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension on `:nth-child`/`:nth-of-type` (e.g. `:nth-child(2 of .class)`); only the `An+B` form is honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-340] — :nth-last-of-type(2)
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:nth-last-of-type(2) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(2) { color: red; }
// Use only the An+B form; if you need scoped matching, add an explicit class to the matched elements from JS.
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension on `:nth-child`/`:nth-of-type` (e.g. `:nth-last-of-type(2)`); only the `An+B` form is honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-341] — :nth-of-type(2)
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:nth-of-type(2) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(2) { color: red; }
// Use only the An+B form; if you need scoped matching, add an explicit class to the matched elements from JS.
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension on `:nth-child`/`:nth-of-type` (e.g. `:nth-of-type(2)`); only the `An+B` form is honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-017] — align-content
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { align-content: space-between; }
```

**✅ Generate instead:**
```css
.foo { align-content: center; }
```

**Rule for AI agents:** Never assign `space-between, space-around, space-evenly, start, end, normal` to `align-content`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["space-evenly","space-around","space-between","end","start","normal"]; the renderer rejects these tokens.

---
### [CSS-018] — align-items
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { align-items: anchor-center; }
```

**✅ Generate instead:**
```css
.foo { align-items: center; }
```

**Rule for AI agents:** Never assign `anchor-center, baseline, start, end, normal` to `align-items`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["start","anchor-center","normal","end","baseline"]; the renderer rejects these tokens.

---
### [CSS-019] — align-self
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { align-self: anchor-center; }
```

**✅ Generate instead:**
```css
.foo { align-self: center; }
```

**Rule for AI agents:** Never assign `anchor-center, baseline, start, end` to `align-self`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["baseline","start","anchor-center","end"]; the renderer rejects these tokens.

---
### [CSS-020] — animation
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { animation: fadeIn 300ms ease-in-out; }
```

**✅ Generate instead:**
```css
.foo {
  animation-name: fadeIn;
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
}
```

**Rule for AI agents:** Never use the `animation` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-021] — background
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { background: red url(bg.png) no-repeat; }
```

**✅ Generate instead:**
```css
.foo {
  background-color: rgba(0, 0, 0, 0.5);
  background-image: none;
  background-position: center;
  background-size: cover;
}
```

**Rule for AI agents:** Never use the `background` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-022] — border
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { border: 1px solid red; }
```

**✅ Generate instead:**
```css
.foo {
  border-width: auto;
  border-style: solid;
  border-color: auto;
}
```

**Rule for AI agents:** Never use the `border` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-023] — CSS Grid layout
**Status:** missing
**Surface:** css-property
**Severity:** critical

**❌ Never generate:**
```css
.layout { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; }
```

**✅ Generate instead:**
```css
.layout { display: flex; flex-direction: row; }
.layout > .col-a { flex: 1; } .layout > .col-b { flex: 2; margin-left: 8px; }
```

**Rule for AI agents:** Never use CSS Grid (`grid`, `grid-template-*`, `grid-area`, `grid-auto-*`, `grid-column*`, `grid-row*`, `grid-gap`); Gameface has no grid layout. Use Flexbox (`display: flex` with the supported subset) instead.

**Why:** Scraper marked every `grid-*` property as `missing`; Gameface does not implement grid layout. Members: grid, grid-area, grid-auto-columns, grid-auto-flow, grid-auto-rows, grid-column, grid-column-end, grid-column-start, grid-gap, grid-row, grid-row-end, grid-row-start, grid-template, grid-template-areas, grid-template-columns, grid-template-rows.

---
### [CSS-024] — display
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { display: contents; }
```

**✅ Generate instead:**
```css
.foo { display: flex; }
```

**Rule for AI agents:** Never assign `contents, flow-root, grid, inline-block, inline-flex, inline-grid` to `display`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["flow-root","inline-flex","table-cell","table-column-group","table-row-group","inline-table","contents","inline-grid","table-footer-group","table-caption","ruby-base-container","ruby-text-container","grid","list-item","table","ruby","table-row","math","table-header-group","inline-block","ruby-base","ruby-text","table-column"]; the renderer rejects these tokens.

---
### [CSS-025] — flex
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { flex: 1 1 auto; }
```

**✅ Generate instead:**
```css
.foo {
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100px;
}
```

**Rule for AI agents:** Never use the `flex` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-026] — flex-basis
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { flex-basis: content; }
```

**✅ Generate instead:**
```css
.foo { flex-basis: 100px; }
```

**Rule for AI agents:** Never assign `content, fit-content, max-content, min-content` to `flex-basis`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["min-content","content","max-content","fit-content"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-027] — font
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { font: bold 16px/1.2 sans-serif; }
```

**✅ Generate instead:**
```css
.foo {
  font-family: sans-serif;
  font-size: 16px;
  font-style: italic;
  font-weight: bold;
}
```

**Rule for AI agents:** Never use the `font` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-028] — justify-content
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { justify-content: space-evenly; }
```

**✅ Generate instead:**
```css
.foo { justify-content: space-between; }
```

**Rule for AI agents:** Never assign `space-evenly, start, end, stretch, normal` to `justify-content`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["start","stretch","space-evenly","normal","end"]; the renderer rejects these tokens.

---
### [CSS-029] — position
**Status:** partial-values
**Surface:** css-value
**Severity:** critical

**❌ Never generate:**
```css
.foo { position: sticky; }
```

**✅ Generate instead:**
```css
.foo { position: absolute; }
```

**Rule for AI agents:** Never assign `sticky` to `position`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["sticky"]; the renderer rejects these tokens.

---
### [CSS-030] — transition
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** critical

**❌ Never generate:**
```css
.foo { transition: opacity 200ms ease-in-out; }
```

**✅ Generate instead:**
```css
.foo {
  transition-property: opacity;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
  transition-delay: 0ms;
}
```

**Rule for AI agents:** Never use the `transition` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---

## HIGH (61)

---
### [CSS-333] — ::selection
**Status:** partial-values
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::selection { color: white; background-color: blue; text-shadow: 0 0 4px black; }
```

**✅ Generate instead:**
```css
::selection { color: white; background-color: blue; }
```

**Rule for AI agents:** Never set any property other than `color` or `background-color` inside a `::selection` rule; only those two properties are honored.

**Why:** scraper note: "only the `color` and `background-color` properties are honoured; other declarations are ignored.".

---
### [CSS-107] — all
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { all: unset; }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — implement via supported longhands or omit.
```

**Rule for AI agents:** Never use the `all` shorthand; assign the longhands explicitly.

**Why:** scraper logWarning: "shorthand has known limitations"; shorthand parses but does not propagate to longhands.

---
### [CSS-108] — aspect-ratio
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { aspect-ratio: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `aspect-ratio`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-109] — background-image
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { background-image: element; }
```

**✅ Generate instead:**
```css
.foo { background-image: none; }
```

**Rule for AI agents:** Never assign `element, gradients, image-rect, image-set` to `background-image`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["gradients","image-set","image-rect","element"]; the renderer rejects these tokens.

---
### [CSS-110] — background-position
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { background-position: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `background-position`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-111] — background-repeat
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { background-repeat: space; }
```

**✅ Generate instead:**
```css
.foo { background-repeat: no-repeat; }
```

**Rule for AI agents:** Never assign `space` to `background-repeat`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["space"]; the renderer rejects these tokens.

---
### [CSS-112] — background-size
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { background-size: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `background-size`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-113] — border-bottom
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-bottom: 1px solid red; }
```

**✅ Generate instead:**
```css
.foo {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: red;
}
```

**Rule for AI agents:** Never use the `border-bottom` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-114] — border-bottom-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-bottom-style: double; }
```

**✅ Generate instead:**
```css
.foo { border-bottom-style: solid; }
```

**Rule for AI agents:** Never assign `double, groove, ridge, inset, outset` to `border-bottom-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","ridge","outset","inset","groove"]; the renderer rejects these tokens.

---
### [CSS-115] — border-color
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-color: red; }
```

**✅ Generate instead:**
```css
.foo {
  border-top-color: red;
  border-right-color: red;
  border-bottom-color: red;
  border-left-color: red;
}
```

**Rule for AI agents:** Never use the `border-color` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-116] — border-image
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-image: url(border.png) 30 round; }
```

**✅ Generate instead:**
```css
.foo {
  border-image-source: url(border.png);
  border-image-slice: 30;
  border-image-width: 1;
  border-image-outset: 0;
}
```

**Rule for AI agents:** Never use the `border-image` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-117] — border-image-repeat
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-image-repeat: space; }
```

**✅ Generate instead:**
```css
.foo { border-image-repeat: stretch; }
```

**Rule for AI agents:** Never assign `space` to `border-image-repeat`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["space"]; the renderer rejects these tokens.

---
### [CSS-118] — border-left
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-left: 1px solid red; }
```

**✅ Generate instead:**
```css
.foo {
  border-left-width: 1px;
  border-left-style: solid;
  border-left-color: red;
}
```

**Rule for AI agents:** Never use the `border-left` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-119] — border-left-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-left-style: double; }
```

**✅ Generate instead:**
```css
.foo { border-left-style: solid; }
```

**Rule for AI agents:** Never assign `double, groove, ridge, inset, outset` to `border-left-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","groove","outset","inset","ridge"]; the renderer rejects these tokens.

---
### [CSS-120] — border-radius
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-radius: 4px; }
```

**✅ Generate instead:**
```css
.foo {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
```

**Rule for AI agents:** Never use the `border-radius` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-121] — border-right
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-right: 1px solid red; }
```

**✅ Generate instead:**
```css
.foo {
  border-right-width: 1px;
  border-right-style: solid;
  border-right-color: red;
}
```

**Rule for AI agents:** Never use the `border-right` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-122] — border-right-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-right-style: double; }
```

**✅ Generate instead:**
```css
.foo { border-right-style: solid; }
```

**Rule for AI agents:** Never assign `double, groove, ridge, inset, outset` to `border-right-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","ridge","inset","outset","groove"]; the renderer rejects these tokens.

---
### [CSS-123] — border-style
**Status:** partial-values
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-style: dashed; }
```

**✅ Generate instead:**
```css
.foo { border-style: solid; }
```

**Rule for AI agents:** Never assign `dashed, dotted` to `border-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-124] — border-top
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-top: 1px solid red; }
```

**✅ Generate instead:**
```css
.foo {
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: red;
}
```

**Rule for AI agents:** Never use the `border-top` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-125] — border-top-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-top-style: double; }
```

**✅ Generate instead:**
```css
.foo { border-top-style: solid; }
```

**Rule for AI agents:** Never assign `double, groove, ridge, inset, outset` to `border-top-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["outset","double","groove","ridge","inset"]; the renderer rejects these tokens.

---
### [CSS-126] — border-width
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { border-width: 1px; }
```

**✅ Generate instead:**
```css
.foo {
  border-top-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 1px;
  border-left-width: 1px;
}
```

**Rule for AI agents:** Never use the `border-width` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-127] — cursor
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { cursor: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `cursor`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-128] — font-size
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { font-size: math; }
```

**✅ Generate instead:**
```css
.foo { font-size: 16px; }
```

**Rule for AI agents:** Never assign `math` to `font-size`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["math"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-129] — font-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { font-style: oblique-angle; }
```

**✅ Generate instead:**
```css
.foo { font-style: italic; }
```

**Rule for AI agents:** Never assign `oblique-angle` to `font-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["oblique-angle"]; the renderer rejects these tokens.

---
### [CSS-130] — font-variant-east-asian
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { font-variant-east-asian: full-width; }
```

**✅ Generate instead:**
```css
.foo { font-variant-east-asian: normal; }
```

**Rule for AI agents:** Never assign `full-width, jis04, jis78, jis83, jis90, ruby` to `font-variant-east-asian`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["jis04","jis83","ruby","simplified","jis90","traditional","full-width","jis78"]; the renderer rejects these tokens.

---
### [CSS-131] — font-weight
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { font-weight: number; }
```

**✅ Generate instead:**
```css
.foo { font-weight: bold; }
```

**Rule for AI agents:** Never assign `number` to `font-weight`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["number"]; the renderer rejects these tokens.

---
### [CSS-132] — gap
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { gap: 8px 16px; }
```

**✅ Generate instead:**
```css
.foo {
  row-gap: 8px;
  column-gap: 8px;
}
```

**Rule for AI agents:** Never use the `gap` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-133] — image-rendering
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { image-rendering: smooth; }
```

**✅ Generate instead:**
```css
.foo { image-rendering: pixelated; }
```

**Rule for AI agents:** Never assign `smooth, optimizequality, optimizespeed` to `image-rendering`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["optimizequality","smooth","optimizespeed"]; the renderer rejects these tokens.

---
### [CSS-134] — isolation
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { isolation: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `isolation`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-135] — List, table, form-control native styling
**Status:** missing
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
ul { list-style-type: disc; }
table { border-collapse: collapse; }
```

**✅ Generate instead:**
```css
/* render bullets manually inside .li::pseudo, lay out tables with display:flex */
```

**Rule for AI agents:** Never use list / table / form-control native styling (`list-style*`, `table-layout`, `caption-side`, `border-collapse`, `border-spacing`, `appearance`, `accent-color`, `resize`, `field-sizing`, `ime-mode`, `interpolate-size`); none are implemented. Build list bullets and tables manually with flex.

**Why:** Scraper marked every list-style-*, table-layout, caption-side, border-collapse/spacing, appearance, accent-color, resize, field-sizing as `missing`. Members: accent-color, appearance, border-collapse, border-spacing, caption-side, empty-cells, field-sizing, ime-mode, interactivity, interpolate-size, list-style, list-style-image, list-style-position, list-style-type, reading-flow, resize, table-layout, user-modify.

---
### [CSS-136] — Logical and physical-mapped CSS properties
**Status:** missing
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { margin-block: 8px; inset-inline: 0; }
```

**✅ Generate instead:**
```css
.foo { margin-top: 8px; margin-bottom: 8px; left: 0; right: 0; }
```

**Rule for AI agents:** Never use logical / writing-mode-relative properties (`*-block`, `*-inline`, `inset-*`, etc.); they are not implemented. Use the physical-axis properties (`top/right/bottom/left`, `margin-top/right/bottom/left`, etc.).

**Why:** Scraper marked every logical-property as `missing`; Gameface only implements the physical-axis equivalents. Members: block-size, border-block, border-block-color, border-block-end, border-block-end-color, border-block-end-style, border-block-end-width, border-block-start, border-block-start-color, border-block-start-style, border-block-start-width, border-block-style, border-block-width, border-end-end-radius, border-end-start-radius, border-inline, border-inline-color, border-inline-end, border-inline-end-color, border-inline-end-style, border-inline-end-width, border-inline-start, border-inline-start-color, border-inline-start-style, border-inline-start-width, border-inline-style, border-inline-width, border-start-end-radius, border-start-start-radius, inline-size, inset, inset-block, inset-block-end, inset-block-start, inset-inline, inset-inline-end, inset-inline-start, margin-block, margin-block-end, margin-block-start, margin-inline, margin-inline-end, margin-inline-start, max-block-size, max-inline-size, min-block-size, min-inline-size, padding-block, padding-block-end, padding-block-start, padding-inline, padding-inline-end, padding-inline-start, scroll-margin-block, scroll-margin-block-end, scroll-margin-block-start, scroll-margin-inline, scroll-margin-inline-end, scroll-margin-inline-start, scroll-padding-block, scroll-padding-block-end, scroll-padding-block-start, scroll-padding-inline, scroll-padding-inline-end, scroll-padding-inline-start.

---
### [CSS-137] — margin
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { margin: 4px 8px; }
```

**✅ Generate instead:**
```css
.foo {
  margin-top: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
  margin-left: 4px;
}
```

**Rule for AI agents:** Never use the `margin` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-138] — mask
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { mask: url(m.png) no-repeat; }
```

**✅ Generate instead:**
```css
.foo {
  mask-image: url(m.png);
  mask-position: center;
  mask-size: contain;
  mask-repeat: no-repeat;
}
```

**Rule for AI agents:** Never use the `mask` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-139] — mask-clip
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { mask-clip: border; }
```

**✅ Generate instead:**
```css
.foo { mask-clip: auto; }
```

**Rule for AI agents:** Never assign `border, content, padding, text` to `mask-clip`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["text","border","content","padding"]; the renderer rejects these tokens.

---
### [CSS-140] — mask-image
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { mask-image: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `mask-image`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-141] — mask-mode
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { mask-mode: luminance; }
```

**✅ Generate instead:**
```css
.foo { mask-mode: alpha; }
```

**Rule for AI agents:** Never assign `luminance, match-source` to `mask-mode`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["luminance","match-source"]; the renderer rejects these tokens.

---
### [CSS-142] — mask-position
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { mask-position: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `mask-position`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-143] — mask-size
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { mask-size: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `mask-size`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-144] — Misc modern positioning / sizing helpers
**Status:** missing
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.thumb { object-fit: cover; transform-style: preserve-3d; }
```

**✅ Generate instead:**
```css
.thumb { /* size via width/height + background-size */ }
```

**Rule for AI agents:** Never use these layout/positioning helpers (`float`, `clear`, `clip`, `object-fit`, `object-position`, `overflow-anchor`, `writing-mode`, `direction`, `zoom`, `translate`/`rotate`/`scale` standalone, `transform-style`, `will-change`, `content-visibility`, `order`, `place-*`, `justify-items/self`, `outline*`, `caret-color`, `tab-size`, `touch-action`, `math-*`); not implemented.

**Why:** Scraper marked these layout/positioning helpers as `missing`. For 3D-style transforms keep using the 2D-only `transform` property. Members: clear, clip, contain-intrinsic-block-size, contain-intrinsic-height, contain-intrinsic-inline-size, contain-intrinsic-size, contain-intrinsic-width, content-visibility, direction, float, justify-items, justify-self, math-depth, math-shift, math-style, object-fit, object-position, object-view-box, order, outline, outline-color, outline-offset, outline-style, outline-width, overflow-anchor, overflow-block, overflow-clip-margin, overflow-inline, overlay, place-content, place-items, place-self, rotate, scale, touch-action, transform-box, transform-style, translate, unicode-bidi, will-change, writing-mode, zoom.

---
### [CSS-145] — mix-blend-mode
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { mix-blend-mode: plus-darker; }
```

**✅ Generate instead:**
```css
.foo { mix-blend-mode: multiply; }
```

**Rule for AI agents:** Never assign `plus-darker, plus-lighter` to `mix-blend-mode`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["plus-darker","plus-lighter"]; the renderer rejects these tokens.

---
### [CSS-146] — overflow
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { overflow: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `overflow`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-147] — overflow-wrap
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { overflow-wrap: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `overflow-wrap`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-148] — overflow-x
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { overflow-x: clip; }
```

**✅ Generate instead:**
```css
.foo { overflow-x: hidden; }
```

**Rule for AI agents:** Never assign `clip` to `overflow-x`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["clip"]; the renderer rejects these tokens.

---
### [CSS-149] — overflow-y
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { overflow-y: clip; }
```

**✅ Generate instead:**
```css
.foo { overflow-y: auto; }
```

**Rule for AI agents:** Never assign `clip` to `overflow-y`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["clip"]; the renderer rejects these tokens.

---
### [CSS-150] — padding
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { padding: 4px 8px; }
```

**✅ Generate instead:**
```css
.foo {
  padding-top: 4px;
  padding-right: 4px;
  padding-bottom: 4px;
  padding-left: 4px;
}
```

**Rule for AI agents:** Never use the `padding` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-151] — pointer-events
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { pointer-events: all; }
```

**✅ Generate instead:**
```css
.foo { pointer-events: auto; }
```

**Rule for AI agents:** Never assign `all, visible, painted, fill, stroke, visiblepainted` to `pointer-events`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["visiblepainted","visible","painted","visiblestroke","stroke","visiblefill","all","fill"]; the renderer rejects these tokens.

---
### [CSS-152] — text-align
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-align: end; }
```

**✅ Generate instead:**
```css
.foo { text-align: center; }
```

**Rule for AI agents:** Never assign `end, match-parent, start` to `text-align`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["match-parent","end","start"]; the renderer rejects these tokens.

---
### [CSS-153] — text-decoration
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { text-decoration: underline solid red; }
```

**✅ Generate instead:**
```css
.foo {
  text-decoration-line: underline;
  text-decoration-color: red;
  text-decoration-style: solid;
  text-decoration-thickness: auto;
}
```

**Rule for AI agents:** Never use the `text-decoration` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-154] — text-decoration-line
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-decoration-line: blink; }
```

**✅ Generate instead:**
```css
.foo { text-decoration-line: underline; }
```

**Rule for AI agents:** Never assign `blink, grammar-error, spelling-error` to `text-decoration-line`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["spelling-error","blink","grammar-error"]; the renderer rejects these tokens.

---
### [CSS-155] — text-decoration-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-decoration-style: wavy; }
```

**✅ Generate instead:**
```css
.foo { text-decoration-style: solid; }
```

**Rule for AI agents:** Never assign `wavy, double, dotted, dashed` to `text-decoration-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","wavy","dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-156] — text-decoration-thickness
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-decoration-thickness: from-font; }
```

**✅ Generate instead:**
```css
.foo { text-decoration-thickness: auto; }
```

**Rule for AI agents:** Never assign `from-font, percentage` to `text-decoration-thickness`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["from-font","percentage"]; the renderer rejects these tokens.

---
### [CSS-157] — text-overflow
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-overflow: string; }
```

**✅ Generate instead:**
```css
.foo { text-overflow: ellipsis; }
```

**Rule for AI agents:** Never assign `string` to `text-overflow`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["string"]; the renderer rejects these tokens.

---
### [CSS-158] — text-shadow
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { text-shadow: 1px 1px 2px black; }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — implement via supported longhands or omit.
```

**Rule for AI agents:** Never use the `text-shadow` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-159] — text-stroke
**Status:** partial-shorthand
**Surface:** css-shorthand
**Severity:** high

**❌ Never generate:**
```css
.foo { text-stroke: 1px black; }
```

**✅ Generate instead:**
```css
.foo {
  text-stroke-width: 1px;
  text-stroke-color: black;
}
```

**Rule for AI agents:** Never use the `text-stroke` shorthand; assign the longhands explicitly.

**Why:** scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.

---
### [CSS-160] — text-transform
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-transform: full-size-kana; }
```

**✅ Generate instead:**
```css
.foo { text-transform: uppercase; }
```

**Rule for AI agents:** Never assign `full-size-kana, full-width, math-auto` to `text-transform`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["full-width","math-auto","full-size-kana"]; the renderer rejects these tokens.

---
### [CSS-161] — text-underline-offset
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-underline-offset: percentage; }
```

**✅ Generate instead:**
```css
.foo { text-underline-offset: auto; }
```

**Rule for AI agents:** Never assign `percentage` to `text-underline-offset`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentage"]; the renderer rejects these tokens.

---
### [CSS-162] — text-underline-position
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { text-underline-position: from-font; }
```

**✅ Generate instead:**
```css
.foo { text-underline-position: under; }
```

**Rule for AI agents:** Never assign `from-font, left, right` to `text-underline-position`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["right","from-font","left"]; the renderer rejects these tokens.

---
### [CSS-163] — transform-origin
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { transform-origin: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `transform-origin`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-164] — transition-property
**Status:** parser-only
**Surface:** css-property
**Severity:** high

**❌ Never generate:**
```css
.foo { transition-property: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `transition-property`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-165] — visibility
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { visibility: collapse; }
```

**✅ Generate instead:**
```css
.foo { visibility: hidden; }
```

**Rule for AI agents:** Never assign `collapse` to `visibility`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["collapse"]; the renderer rejects these tokens.

---
### [CSS-166] — white-space
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { white-space: break-spaces; }
```

**✅ Generate instead:**
```css
.foo { white-space: pre-wrap; }
```

**Rule for AI agents:** Never assign `break-spaces, pre-line` to `white-space`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["break-spaces","pre-line"]; the renderer rejects these tokens.

---

## MEDIUM (140)

---
### [CSS-335] — :nth-child(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(2 of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(2) { color: red; }
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension with `:nth-child`; only the An+B / odd / even forms are honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-336] — :nth-child(2n+1)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(2n+1 of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(2n+1) { color: red; }
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension with `:nth-child`; only the An+B / odd / even forms are honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-337] — :nth-child(even)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(even of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(even) { color: red; }
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension with `:nth-child`; only the An+B / odd / even forms are honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-338] — :nth-child(odd)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(odd of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-child(odd) { color: red; }
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension with `:nth-child`; only the An+B / odd / even forms are honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-339] — :nth-last-child(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-last-child(2 of .class) { color: red; }
```

**✅ Generate instead:**
```css
:nth-last-child(2) { color: red; }
```

**Rule for AI agents:** Never use the `[ of <selector-list> ]` extension with `:nth-last-child`; only the An+B / odd / even forms are honored.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).".

---
### [CSS-184] — Anchor positioning
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.tooltip { position-anchor: --button; position-area: top right; }
```

**✅ Generate instead:**
```css
// Compute position in JS using getBoundingClientRect() and set top/left manually.
```

**Rule for AI agents:** Never use the anchor-positioning module (`anchor-name`, `position-anchor`, `position-area`, `position-try*`); use script-driven positioning instead.

**Why:** Scraper marked every anchor-* and position-* (modern) property as `missing`. Members: anchor-name, anchor-scope, position-anchor, position-area, position-try, position-try-fallbacks, position-try-order, position-visibility.

---
### [CSS-185] — animation-delay
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { animation-delay: initial; }
```

**✅ Generate instead:**
```css
.foo { animation-delay: 0s; }
```

**Rule for AI agents:** Never assign `initial` to `animation-delay`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: ms, s.

---
### [CSS-186] — animation-duration
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { animation-duration: auto; }
```

**✅ Generate instead:**
```css
.foo { animation-duration: 300ms; }
```

**Rule for AI agents:** Never assign `auto` to `animation-duration`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["auto"]; the renderer rejects these tokens. Supported units: ms, s.

---
### [CSS-187] — animation-iteration-count
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { animation-iteration-count: var(--x); }
```

**✅ Generate instead:**
```css
.foo { animation-iteration-count: 1; }
```

**Rule for AI agents:** Never rely on `animation-iteration-count`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: <number>.

---
### [CSS-188] — animation-name
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { animation-name: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `animation-name`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-189] — animation-timing-function
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { animation-timing-function: jump; }
```

**✅ Generate instead:**
```css
.foo { animation-timing-function: ease-in-out; }
```

**Rule for AI agents:** Never assign `jump` to `animation-timing-function`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["jump"]; the renderer rejects these tokens.

---
### [CSS-190] — backdrop-filter
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { backdrop-filter: initial; }
```

**✅ Generate instead:**
```css
.foo { backdrop-filter: auto; }
```

**Rule for AI agents:** Never assign `initial` to `backdrop-filter`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-191] — background-color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { background-color: initial; }
```

**✅ Generate instead:**
```css
.foo { background-color: rgba(0, 0, 0, 0.5); }
```

**Rule for AI agents:** Never assign `initial` to `background-color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-192] — background-position-x
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { background-position-x: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `background-position-x`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-193] — background-position-y
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { background-position-y: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `background-position-y`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-194] — border-bottom-color
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-bottom-color: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-bottom-color`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-195] — border-bottom-left-radius
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-bottom-left-radius: percentages; }
```

**✅ Generate instead:**
```css
.foo { border-bottom-left-radius: auto; }
```

**Rule for AI agents:** Never assign `percentages` to `border-bottom-left-radius`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentages"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-196] — border-bottom-right-radius
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-bottom-right-radius: percentages; }
```

**✅ Generate instead:**
```css
.foo { border-bottom-right-radius: auto; }
```

**Rule for AI agents:** Never assign `percentages` to `border-bottom-right-radius`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentages"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-197] — border-bottom-width
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-bottom-width: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-bottom-width`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-198] — border-image-outset
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-image-outset: initial; }
```

**✅ Generate instead:**
```css
.foo { border-image-outset: auto; }
```

**Rule for AI agents:** Never assign `initial` to `border-image-outset`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, <number>.

---
### [CSS-199] — border-image-slice
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-image-slice: initial; }
```

**✅ Generate instead:**
```css
.foo { border-image-slice: auto; }
```

**Rule for AI agents:** Never assign `initial` to `border-image-slice`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-200] — border-image-source
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-image-source: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-image-source`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-201] — border-image-width
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-image-width: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-image-width`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %, <number>.

---
### [CSS-202] — border-left-color
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-left-color: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-left-color`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-203] — border-left-width
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-left-width: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-left-width`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-204] — border-right-color
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-right-color: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-right-color`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-205] — border-right-width
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-right-width: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-right-width`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-206] — border-top-color
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-top-color: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-top-color`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-207] — border-top-left-radius
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-top-left-radius: percentages; }
```

**✅ Generate instead:**
```css
.foo { border-top-left-radius: auto; }
```

**Rule for AI agents:** Never assign `percentages` to `border-top-left-radius`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentages"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-208] — border-top-right-radius
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-top-right-radius: percentages; }
```

**✅ Generate instead:**
```css
.foo { border-top-right-radius: auto; }
```

**Rule for AI agents:** Never assign `percentages` to `border-top-right-radius`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentages"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-209] — border-top-width
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { border-top-width: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `border-top-width`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-210] — bottom
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { bottom: anchor; }
```

**✅ Generate instead:**
```css
.foo { bottom: auto; }
```

**Rule for AI agents:** Never assign `anchor, anchor-size` to `bottom`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","anchor"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-211] — box-shadow
**Status:** partial-values
**Surface:** css-shorthand
**Severity:** medium

**❌ Never generate:**
```css
.foo { box-shadow: inset; }
```

**✅ Generate instead:**
```css
.foo { box-shadow: auto; }
```

**Rule for AI agents:** Never assign `inset` to `box-shadow`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["inset"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-212] — caret-color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { caret-color: initial; }
```

**✅ Generate instead:**
```css
.foo { caret-color: auto; }
```

**Rule for AI agents:** Never assign `initial` to `caret-color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-213] — clip-path
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { clip-path: fill-box; }
```

**✅ Generate instead:**
```css
.foo { clip-path: inset(10px); }
```

**Rule for AI agents:** Never assign `fill-box, path, stroke-box, view-box` to `clip-path`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["fill-box","path","stroke-box","view-box"]; the renderer rejects these tokens.

---
### [CSS-214] — clip-rule
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { clip-rule: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `clip-rule`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-215] — coh-composition-id
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-composition-id: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-composition-id` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-216] — coh-custom-effect-float-param1
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param1: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param1` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-217] — coh-custom-effect-float-param10
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param10: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param10` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-218] — coh-custom-effect-float-param11
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param11: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param11` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-219] — coh-custom-effect-float-param12
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param12: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param12` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-220] — coh-custom-effect-float-param2
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param2: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param2` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-221] — coh-custom-effect-float-param3
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param3: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param3` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-222] — coh-custom-effect-float-param4
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param4: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param4` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-223] — coh-custom-effect-float-param5
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param5: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param5` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-224] — coh-custom-effect-float-param6
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param6: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param6` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-225] — coh-custom-effect-float-param7
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param7: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param7` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-226] — coh-custom-effect-float-param8
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param8: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param8` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-227] — coh-custom-effect-float-param9
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-float-param9: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-float-param9` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-228] — coh-custom-effect-name
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-name: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-name` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-229] — coh-custom-effect-string-param1
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-string-param1: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-string-param1` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-230] — coh-custom-effect-string-param2
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-custom-effect-string-param2: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-custom-effect-string-param2` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-231] — coh-enable-backdrop-filter
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-enable-backdrop-filter: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-enable-backdrop-filter` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-232] — coh-font-fit
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-font-fit: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-font-fit` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-233] — coh-font-fit-max-size
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-font-fit-max-size: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-font-fit-max-size` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-234] — coh-font-fit-min-size
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-font-fit-min-size: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-font-fit-min-size` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-235] — coh-font-fit-mode
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-font-fit-mode: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-font-fit-mode` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-236] — coh-partitioned
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-partitioned: 1; }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-partitioned` unless following an explicit Gameface integration recipe.

**Why:** scraper logRejectedValues: ["1"].

---
### [CSS-237] — coh-rendering-option
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-rendering-option: 0; }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-rendering-option` unless following an explicit Gameface integration recipe.

**Why:** scraper logRejectedValues: ["0"].

---
### [CSS-238] — coh-sdf
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-sdf: var(--x); }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-sdf` unless following an explicit Gameface integration recipe.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-239] — coh-simple-opacity
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { coh-simple-opacity: 1; }
```

**✅ Generate instead:**
```css
// Gameface-internal property — only set when explicitly required by Coherent docs.
```

**Rule for AI agents:** Never set `coh-simple-opacity` unless following an explicit Gameface integration recipe.

**Why:** scraper logRejectedValues: ["1"].

---
### [CSS-240] — color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { color: initial; }
```

**✅ Generate instead:**
```css
.foo { color: auto; }
```

**Rule for AI agents:** Never assign `initial` to `color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-241] — column-gap
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { column-gap: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `column-gap`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-242] — contain
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { contain: inline-size; }
```

**✅ Generate instead:**
```css
.foo { contain: layout; }
```

**Rule for AI agents:** Never assign `inline-size` to `contain`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["inline-size"]; the renderer rejects these tokens.

---
### [CSS-243] — Container queries
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.parent { container-type: inline-size; }
@container (min-width: 200px) { .child { ... } }
```

**✅ Generate instead:**
```css
// Compute parent size in JS and apply class names; or use absolute sizing.
```

**Rule for AI agents:** Never use container queries (`container`, `container-name`, `container-type`); use static breakpoint logic in JS or fixed sizes.

**Why:** Scraper marked every container-query property as `missing`. Members: container, container-name, container-type.

---
### [CSS-244] — content
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { content: gradient; }
```

**✅ Generate instead:**
```css
.foo { content: normal; }
```

**Rule for AI agents:** Never assign `gradient, image-set, url` to `content`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["url","gradient","image-set"]; the renderer rejects these tokens.

---
### [CSS-245] — CSS Motion-path / offset-*
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.particle { offset-path: path("M0,0 L100,0"); offset-distance: 50%; }
```

**✅ Generate instead:**
```css
@keyframes move { from { transform: translateX(0) } to { transform: translateX(100px) } }
.particle { animation: move 1s linear infinite; }
```

**Rule for AI agents:** Never use the CSS motion-path module (`offset-anchor`, `offset-distance`, `offset-path`, `offset-position`, `offset-rotate`); animate position via @keyframes on `transform`/`top`/`left` instead.

**Why:** Scraper marked offset-* (modern) properties as `missing`. Members: offset-anchor, offset-distance, offset-path, offset-position, offset-rotate.

---
### [CSS-246] — cx
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { cx: initial; }
```

**✅ Generate instead:**
```css
.foo { cx: auto; }
```

**Rule for AI agents:** Never assign `initial` to `cx`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-247] — cy
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { cy: initial; }
```

**✅ Generate instead:**
```css
.foo { cy: auto; }
```

**Rule for AI agents:** Never assign `initial` to `cy`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-248] — d
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { d: initial; }
```

**✅ Generate instead:**
```css
.foo { d: auto; }
```

**Rule for AI agents:** Never assign `initial` to `d`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-249] — fill
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { fill: initial; }
```

**✅ Generate instead:**
```css
.foo { fill: auto; }
```

**Rule for AI agents:** Never assign `initial` to `fill`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-250] — fill-opacity
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { fill-opacity: initial; }
```

**✅ Generate instead:**
```css
.foo { fill-opacity: auto; }
```

**Rule for AI agents:** Never assign `initial` to `fill-opacity`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-251] — fill-rule
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { fill-rule: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `fill-rule`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-252] — filter
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { filter: initial; }
```

**✅ Generate instead:**
```css
.foo { filter: auto; }
```

**Rule for AI agents:** Never assign `initial` to `filter`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-253] — flex-grow
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { flex-grow: initial; }
```

**✅ Generate instead:**
```css
.foo { flex-grow: 1; }
```

**Rule for AI agents:** Never assign `initial` to `flex-grow`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-254] — flex-shrink
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { flex-shrink: initial; }
```

**✅ Generate instead:**
```css
.foo { flex-shrink: 0; }
```

**Rule for AI agents:** Never assign `initial` to `flex-shrink`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-255] — font-family
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { font-family: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `font-family`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-256] — height
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { height: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { height: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, stretch` to `height`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["min-content","fit-content","anchor-size","stretch","max-content"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-257] — left
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { left: anchor; }
```

**✅ Generate instead:**
```css
.foo { left: auto; }
```

**Rule for AI agents:** Never assign `anchor, anchor-size` to `left`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","anchor"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-258] — letter-spacing
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { letter-spacing: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `letter-spacing`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-259] — line-height
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { line-height: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `line-height`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: <number>, px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-260] — margin-bottom
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { margin-bottom: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { margin-bottom: auto; }
```

**Rule for AI agents:** Never assign `anchor-size` to `margin-bottom`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-261] — margin-left
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { margin-left: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { margin-left: auto; }
```

**Rule for AI agents:** Never assign `anchor-size` to `margin-left`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-262] — margin-right
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { margin-right: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { margin-right: auto; }
```

**Rule for AI agents:** Never assign `anchor-size` to `margin-right`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-263] — margin-top
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { margin-top: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { margin-top: auto; }
```

**Rule for AI agents:** Never assign `anchor-size` to `margin-top`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-264] — mask-border-repeat
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { mask-border-repeat: space; }
```

**✅ Generate instead:**
```css
.foo { mask-border-repeat: auto; }
```

**Rule for AI agents:** Never assign `space` to `mask-border-repeat`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["space"]; the renderer rejects these tokens.

---
### [CSS-265] — mask-repeat
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { mask-repeat: space; }
```

**✅ Generate instead:**
```css
.foo { mask-repeat: auto; }
```

**Rule for AI agents:** Never assign `space, initial` to `mask-repeat`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["space","initial"]; the renderer rejects these tokens.

---
### [CSS-266] — mask-type
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { mask-type: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `mask-type`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-267] — max-height
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { max-height: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { max-height: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, none, stretch` to `max-height`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["max-content","min-content","fit-content","none","stretch","anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-268] — max-width
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { max-width: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { max-width: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, none, stretch` to `max-width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["fit-content","min-content","max-content","none","stretch","anchor-size"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-269] — min-height
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { min-height: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { min-height: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, stretch` to `min-height`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["fit-content","max-content","anchor-size","min-content","stretch"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-270] — min-width
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { min-width: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { min-width: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, stretch` to `min-width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","fit-content","stretch","max-content","min-content"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-271] — Modern background properties
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { background-attachment: fixed; background-clip: text; background-blend-mode: multiply; }
```

**✅ Generate instead:**
```css
.foo { background-color: red; background-image: url(bg.png); background-repeat: no-repeat; background-size: cover; }
```

**Rule for AI agents:** Never use `background-attachment`, `background-blend-mode`, `background-clip`, or `background-origin`; only `background-color`, `background-image: none|url(...)`, `background-position`, `background-repeat`, and `background-size` are honored.

**Why:** Scraper marked these background longhands as `missing`. Members: background-attachment, background-blend-mode, background-clip, background-origin.

---
### [CSS-272] — Modern mask longhands
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { mask-border: url(b.png) 30; mask-composite: subtract; }
```

**✅ Generate instead:**
```css
.foo { mask-image: url(m.png); mask-mode: alpha; }
```

**Rule for AI agents:** Never use `mask-border*`, `mask-composite`, or `mask-origin`; only `mask-image`, `mask-position`, `mask-size`, `mask-repeat`, `mask-clip`, `mask-mode` are honored.

**Why:** Scraper marked these mask longhands as `missing`. Members: mask-border, mask-border-outset, mask-border-slice, mask-border-source, mask-border-width, mask-composite, mask-origin.

---
### [CSS-273] — Modern typography (font-variant, hyphens, text-wrap, font-feature-settings, etc.)
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.title { font-variant-numeric: tabular-nums; hyphens: auto; word-break: break-word; tab-size: 4; }
```

**✅ Generate instead:**
```css
.title { font-size: 16px; font-weight: bold; text-align: center; text-overflow: ellipsis; }
```

**Rule for AI agents:** Never use modern typography properties (`font-variant-*`, `font-feature-settings`, `hyphens`, `text-wrap`, `text-justify`, `text-indent`, `text-emphasis-*`, `tab-size`, `word-break`, `word-spacing`, `line-clamp`, `text-decoration-skip*`, etc.); use only the supported font/text properties.

**Why:** Scraper marked every modern typography property as `missing`. Supported text-related properties: see partial entries for `font-size`, `font-style`, `font-weight`, `line-height`, `text-align`, `text-overflow`, `text-transform`, `text-decoration-*`, `text-underline-position`, `text-underline-offset`, `text-shadow`, `text-stroke-*`, `letter-spacing`, `vertical-align`, `white-space`. Members: font-feature-settings, font-kerning, font-language-override, font-optical-sizing, font-palette, font-size-adjust, font-smooth, font-stretch, font-synthesis, font-synthesis-position, font-synthesis-small-caps, font-synthesis-style, font-synthesis-weight, font-variant, font-variant-alternates, font-variant-caps, font-variant-emoji, font-variant-ligatures, font-variant-numeric, font-variant-position, font-variation-settings, font-width, hanging-punctuation, hyphenate-character, hyphenate-limit-chars, hyphens, initial-letter, line-break, line-clamp, line-height-step, tab-size, text-align-last, text-autospace, text-box, text-box-edge, text-box-trim, text-combine-upright, text-decoration-skip, text-decoration-skip-ink, text-emphasis, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-indent, text-justify, text-orientation, text-size-adjust, text-spacing-trim, text-wrap, text-wrap-mode, text-wrap-style, white-space-collapse, word-break, word-spacing.

---
### [CSS-274] — Multi-column layout
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.text { columns: 3 200px; column-gap: 16px; }
```

**✅ Generate instead:**
```css
.text { display: flex; flex-direction: row; }
.text > .col { flex: 1; }
```

**Rule for AI agents:** Never use CSS multi-column layout (`columns`, `column-count`, `column-width`, `column-rule*`, `column-span`, `column-fill`); they are not implemented. Use multiple flex containers if you need column-like layout.

**Why:** Scraper marked every multi-column property as `missing`. Members: column-count, column-fill, column-rule, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, columns.

---
### [CSS-275] — offset
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { offset: initial; }
```

**✅ Generate instead:**
```css
.foo { offset: auto; }
```

**Rule for AI agents:** Never assign `initial` to `offset`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-276] — opacity
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { opacity: percentages; }
```

**✅ Generate instead:**
```css
.foo { opacity: 0.5; }
```

**Rule for AI agents:** Never assign `percentages` to `opacity`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["percentages"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-277] — padding-bottom
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { padding-bottom: initial; }
```

**✅ Generate instead:**
```css
.foo { padding-bottom: auto; }
```

**Rule for AI agents:** Never assign `initial` to `padding-bottom`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-278] — padding-left
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { padding-left: initial; }
```

**✅ Generate instead:**
```css
.foo { padding-left: auto; }
```

**Rule for AI agents:** Never assign `initial` to `padding-left`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-279] — padding-right
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { padding-right: initial; }
```

**✅ Generate instead:**
```css
.foo { padding-right: auto; }
```

**Rule for AI agents:** Never assign `initial` to `padding-right`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-280] — padding-top
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { padding-top: initial; }
```

**✅ Generate instead:**
```css
.foo { padding-top: auto; }
```

**Rule for AI agents:** Never assign `initial` to `padding-top`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-281] — perspective
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { perspective: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `perspective`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax.

---
### [CSS-282] — perspective-origin
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { perspective-origin: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `perspective-origin`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-283] — r
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { r: initial; }
```

**✅ Generate instead:**
```css
.foo { r: auto; }
```

**Rule for AI agents:** Never assign `initial` to `r`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-284] — right
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { right: anchor; }
```

**✅ Generate instead:**
```css
.foo { right: auto; }
```

**Rule for AI agents:** Never assign `anchor, anchor-size` to `right`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","anchor"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-285] — row-gap
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { row-gap: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `row-gap`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-286] — rx
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { rx: initial; }
```

**✅ Generate instead:**
```css
.foo { rx: auto; }
```

**Rule for AI agents:** Never assign `initial` to `rx`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-287] — ry
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { ry: initial; }
```

**✅ Generate instead:**
```css
.foo { ry: auto; }
```

**Rule for AI agents:** Never assign `initial` to `ry`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-288] — Scroll snap, scroll margin / padding, scrollbar customization
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.list { scroll-snap-type: y mandatory; scrollbar-width: thin; }
```

**✅ Generate instead:**
```css
// No Gameface equivalent — implement via JS scroll handlers, or omit.
```

**Rule for AI agents:** Never use scroll-snap, scroll-margin/padding, scrollbar-* customization, scroll-timeline, or overscroll-behavior; none of them are implemented.

**Why:** Scraper marked every scroll-* / overscroll-* / scrollbar-* property as `missing`. Members: overscroll-behavior, overscroll-behavior-block, overscroll-behavior-inline, overscroll-behavior-x, overscroll-behavior-y, scroll-behavior, scroll-initial-target, scroll-margin, scroll-margin-bottom, scroll-margin-left, scroll-margin-right, scroll-margin-top, scroll-marker-group, scroll-padding, scroll-padding-bottom, scroll-padding-left, scroll-padding-right, scroll-padding-top, scroll-snap-align, scroll-snap-stop, scroll-snap-type, scroll-timeline, scroll-timeline-axis, scroll-timeline-name, scrollbar-color, scrollbar-gutter, scrollbar-width.

---
### [CSS-289] — shape-rendering
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { shape-rendering: initial; }
```

**✅ Generate instead:**
```css
.foo { shape-rendering: auto; }
```

**Rule for AI agents:** Never assign `initial` to `shape-rendering`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-290] — stop-color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stop-color: initial; }
```

**✅ Generate instead:**
```css
.foo { stop-color: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stop-color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-291] — stop-opacity
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stop-opacity: initial; }
```

**✅ Generate instead:**
```css
.foo { stop-opacity: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stop-opacity`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-292] — stroke
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke: initial; }
```

**✅ Generate instead:**
```css
.foo { stroke: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stroke`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-293] — stroke-dasharray
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-dasharray: none; }
```

**✅ Generate instead:**
```css
.foo { stroke-dasharray: auto; }
```

**Rule for AI agents:** Never assign `none` to `stroke-dasharray`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["none"]; the renderer rejects these tokens.

---
### [CSS-294] — stroke-dashoffset
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-dashoffset: initial; }
```

**✅ Generate instead:**
```css
.foo { stroke-dashoffset: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stroke-dashoffset`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-295] — stroke-linecap
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-linecap: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `stroke-linecap`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-296] — stroke-linejoin
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-linejoin: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `stroke-linejoin`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-297] — stroke-miterlimit
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-miterlimit: initial; }
```

**✅ Generate instead:**
```css
.foo { stroke-miterlimit: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stroke-miterlimit`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-298] — stroke-opacity
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-opacity: initial; }
```

**✅ Generate instead:**
```css
.foo { stroke-opacity: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stroke-opacity`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: <number>.

---
### [CSS-299] — stroke-width
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { stroke-width: initial; }
```

**✅ Generate instead:**
```css
.foo { stroke-width: auto; }
```

**Rule for AI agents:** Never assign `initial` to `stroke-width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %, <number>.

---
### [CSS-300] — SVG-only presentation properties
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.svg-text { alignment-baseline: middle; paint-order: stroke fill; }
```

**✅ Generate instead:**
```css
/* No Gameface equivalent — restructure SVG geometry instead. */
```

**Rule for AI agents:** Never use these SVG presentation properties (`alignment-baseline`, `baseline-shift`, `dominant-baseline`, `color-interpolation*`, `flood-*`, `lighting-color`, `paint-order`, `marker-*`, `vector-effect`, `glyph-orientation-vertical`, `alt`, `speak*`); not implemented.

**Why:** Scraper marked these SVG presentation properties as `missing`. Members: alignment-baseline, alt, baseline-shift, baseline-source, dominant-baseline, flood-color, flood-opacity, glyph-orientation-vertical, lighting-color, marker, marker-end, marker-mid, marker-start, paint-order, speak, speak-as, stroke-color, vector-effect.

---
### [CSS-301] — text-anchor
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { text-anchor: initial; }
```

**✅ Generate instead:**
```css
.foo { text-anchor: auto; }
```

**Rule for AI agents:** Never assign `initial` to `text-anchor`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-302] — text-decoration-color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { text-decoration-color: initial; }
```

**✅ Generate instead:**
```css
.foo { text-decoration-color: auto; }
```

**Rule for AI agents:** Never assign `initial` to `text-decoration-color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-303] — text-rendering
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { text-rendering: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `text-rendering`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-304] — text-stroke-color
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { text-stroke-color: initial; }
```

**✅ Generate instead:**
```css
.foo { text-stroke-color: auto; }
```

**Rule for AI agents:** Never assign `initial` to `text-stroke-color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-305] — text-stroke-width
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { text-stroke-width: initial; }
```

**✅ Generate instead:**
```css
.foo { text-stroke-width: auto; }
```

**Rule for AI agents:** Never assign `initial` to `text-stroke-width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-306] — top
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { top: anchor; }
```

**✅ Generate instead:**
```css
.foo { top: auto; }
```

**Rule for AI agents:** Never assign `anchor, anchor-size` to `top`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","anchor"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-307] — transform
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { transform: initial; }
```

**✅ Generate instead:**
```css
.foo { transform: auto; }
```

**Rule for AI agents:** Never assign `initial` to `transform`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-308] — transition-behavior
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { transition-behavior: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `transition-behavior`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style.

---
### [CSS-309] — transition-delay
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { transition-delay: initial; }
```

**✅ Generate instead:**
```css
.foo { transition-delay: auto; }
```

**Rule for AI agents:** Never assign `initial` to `transition-delay`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: ms, s.

---
### [CSS-310] — transition-duration
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { transition-duration: initial; }
```

**✅ Generate instead:**
```css
.foo { transition-duration: auto; }
```

**Rule for AI agents:** Never assign `initial` to `transition-duration`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens. Supported units: ms, s.

---
### [CSS-311] — transition-timing-function
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { transition-timing-function: jump; }
```

**✅ Generate instead:**
```css
.foo { transition-timing-function: ease-in-out; }
```

**Rule for AI agents:** Never assign `jump` to `transition-timing-function`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["jump"]; the renderer rejects these tokens.

---
### [CSS-312] — user-select
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { user-select: all; }
```

**✅ Generate instead:**
```css
.foo { user-select: none; }
```

**Rule for AI agents:** Never assign `all, contain` to `user-select`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["contain","all"]; the renderer rejects these tokens.

---
### [CSS-313] — vertical-align
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { vertical-align: bottom; }
```

**✅ Generate instead:**
```css
.foo { vertical-align: middle; }
```

**Rule for AI agents:** Never assign `bottom, sub, super, top` to `vertical-align`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["super","bottom","sub","top"]; the renderer rejects these tokens.

---
### [CSS-314] — View transitions, animation timeline, scroll timeline
**Status:** missing
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.page { view-transition-name: hero; }
```

**✅ Generate instead:**
```css
// Use classic @keyframes + animation-name/duration/timing-function/delay/iteration-count/direction/fill-mode/play-state.
```

**Rule for AI agents:** Never use view transitions, view-timeline, scroll-timeline, animation-timeline, or animation-range; only the classic CSS animation longhands are implemented.

**Why:** Scraper marked every view-transition-* / view-timeline-* / animation-timeline / animation-range / animation-composition / timeline-scope property as `missing`. Members: animation-composition, animation-range, animation-range-end, animation-range-start, animation-timeline, timeline-scope, view-timeline, view-timeline-axis, view-timeline-inset, view-timeline-name, view-transition-class, view-transition-name.

---
### [CSS-315] — width
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { width: anchor-size; }
```

**✅ Generate instead:**
```css
.foo { width: auto; }
```

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, stretch` to `width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","stretch","fit-content","max-content","min-content"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-316] — x
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { x: initial; }
```

**✅ Generate instead:**
```css
.foo { x: auto; }
```

**Rule for AI agents:** Never assign `initial` to `x`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-317] — y
**Status:** partial-values
**Surface:** css-value
**Severity:** medium

**❌ Never generate:**
```css
.foo { y: initial; }
```

**✅ Generate instead:**
```css
.foo { y: auto; }
```

**Rule for AI agents:** Never assign `initial` to `y`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial"]; the renderer rejects these tokens.

---
### [CSS-318] — z-index
**Status:** parser-only
**Surface:** css-property
**Severity:** medium

**❌ Never generate:**
```css
.foo { z-index: var(--x); }
```

**✅ Generate instead:**
```css
// No direct Gameface equivalent — omit or implement custom.
```

**Rule for AI agents:** Never rely on `z-index`; the parser accepts it but the renderer ignores the value.

**Why:** scraper probe: "value-accepted-but-not-computed"; value is accepted by the parser but does not appear in computed style. Supported units: <number>.

---

## LOW (4)

---
### [CSS-319] — CSS counters
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
ol { counter-reset: section; }
```

**✅ Generate instead:**
```css
// Render number labels manually from data.
```

**Rule for AI agents:** Never use CSS counters (`counter-increment`, `counter-reset`, `counter-set`); inject numbering from JS instead.

**Why:** Scraper marked all counter-* properties as `missing`. Members: counter-increment, counter-reset, counter-set.

---
### [CSS-320] — Other missing cosmetic / niche properties
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
/* No representative example — see index.json members for this family. */
```

**✅ Generate instead:**
```css
/* Omit or replace with a supported property. */
```

**Rule for AI agents:** Never use these miscellaneous missing CSS properties; they have no Gameface implementation.

**Why:** Scraper marked these properties as `missing`. Names listed in the index JSON. Members: box-align, box-decoration-break, box-direction, box-flex, box-flex-group, box-lines, box-ordinal-group, box-orient, box-pack, coh-custom-effect-float-param-1, coh-custom-effect-float-param-10, coh-custom-effect-float-param-11, coh-custom-effect-float-param-12, coh-custom-effect-float-param-2, coh-custom-effect-float-param-3, coh-custom-effect-float-param-4, coh-custom-effect-float-param-5, coh-custom-effect-float-param-6, coh-custom-effect-float-param-7, coh-custom-effect-float-param-8, coh-custom-effect-float-param-9, coh-custom-effect-string-param-1, coh-custom-effect-string-param-2, custom-property, flex-flow, image-orientation, margin-trim, quotes, shape-image-threshold, shape-margin, shape-outside.

---
### [CSS-321] — Page / print layout
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
.foo { page-break-after: always; color-scheme: dark; }
```

**✅ Generate instead:**
```css
// Omit; not applicable to Gameface.
```

**Rule for AI agents:** Never use page-layout / print properties (`page`, `page-break-*`, `break-after/before/inside`, `orphans`, `widows`, `color-scheme`, `print-color-adjust`); not relevant in a game UI runtime.

**Why:** Scraper marked every page/print/color-scheme property as `missing`. Members: break-after, break-before, break-inside, color-adjust, color-interpolation, color-interpolation-filters, color-scheme, dynamic-range-limit, forced-color-adjust, orphans, page, page-break-after, page-break-before, page-break-inside, print-color-adjust, widows.

---
### [CSS-322] — Ruby, BIDI, CJK, math, hanja
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
rt { ruby-position: under; }
```

**✅ Generate instead:**
```css
/* Omit. */
```

**Rule for AI agents:** Never use ruby/CJK/math properties (`ruby-*`, `math-*`); not implemented.

**Why:** Scraper marked ruby/math properties as `missing`. Members: ruby-align, ruby-overhang, ruby-position.

---

