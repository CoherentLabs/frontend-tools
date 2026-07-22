# Negative Rules — CSS

Generated from `results/css/{partial,unsupported}.json` and `results/selectors/{partial,unsupported}.json`. Each rule maps to the cited scraper file via `source_path` in `negative-rules-index.json`. Examples and "why" fields are derived directly from the scraper evidence.

Total rules in this file: **175** (critical: 16, high: 56, medium: 97, low: 6).

## CRITICAL (16)

---
### [CSS-007] — align-content
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
### [CSS-008] — align-items
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

**Why:** scraper logRejectedValues: ["start","anchor-center","normal","baseline","end"]; the renderer rejects these tokens.

---
### [CSS-009] — align-self
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
### [CSS-013] — display
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

**Why:** scraper logRejectedValues: ["flow-root","inline-flex","table-cell","table-column-group","table-row-group","inline-table","contents","inline-grid","table-footer-group","table-caption","ruby-base-container","ruby-text-container","grid","inline-block","list-item","math","ruby","ruby-base","ruby-text","table","table-column","table-header-group","table-row"]; the renderer rejects these tokens.

---
### [CSS-014] — flex-basis
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
### [CSS-015] — justify-content
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
### [CSS-016] — position
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
### [CSS-010] — CSS Grid layout
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
### [CSS-001] — :checked
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:checked { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:checked` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :checked".

---
### [CSS-002] — :disabled
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:disabled { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:disabled` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :disabled".

---
### [CSS-003] — :enabled
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:enabled { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:enabled` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :enabled".

---
### [CSS-004] — :first-of-type
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:first-of-type { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:first-of-type` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :first-of-type".

---
### [CSS-005] — :focus-visible
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:focus-visible { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:focus-visible` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :focus-visible".

---
### [CSS-006] — :focus-within
**Status:** parser-only
**Surface:** css-selector
**Severity:** critical

**❌ Never generate:**
```css
:focus-within { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:focus-within` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :focus-within".

---
### [CSS-011] — CSS modern color functions
**Status:** missing
**Surface:** css-function
**Severity:** critical

**❌ Never generate:**
```css
.foo { color: hsl(0, 100%, 50%); }
```

**✅ Generate instead:**
```css
.foo { color: rgba(255, 0, 0, 0.5); }
```

**Rule for AI agents:** Never use the modern color functions (`hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `color-mix`); pre-convert to `rgb()`/`rgba()`/`color(srgb …)` (all of which are honored).

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: hsl(), hsla(), hwb(), lab(), lch(), oklab(), oklch(), color-mix().

---
### [CSS-012] — CSS modern math functions
**Status:** missing
**Surface:** css-function
**Severity:** critical

**❌ Never generate:**
```css
.foo { font-size: clamp(12px, 14px, 16px); }
```

**✅ Generate instead:**
```css
.foo { font-size: calc(12px + 4px); }
```

**Rule for AI agents:** Never use the missing CSS math functions (`clamp`, `min`, `max`, `mod`, `rem`, `round`, `abs`, `asin`, `acos`, `atan`, `atan2`); precompute the value in JS or use `calc()` with arithmetic that resolves to a constant. `calc`, `sign`, `pow`, `sqrt`, `hypot`, `log`, `exp`, `sin`, `cos`, `tan` are honored.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: clamp(), min(), max(), mod(), rem(), round(), abs(), asin(), acos(), atan(), atan2().

---

## HIGH (56)

---
### [CSS-039] — background-image
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

**Rule for AI agents:** Never assign `element, gradients, image-rect, image-set, repeating-linear-gradient(red 0 10px,blue 10px 20px), repeating-radial-gradient(red 0 10px,blue 10px 20px)` to `background-image`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["gradients","image-set","image-rect","element","repeating-linear-gradient(red 0 10px,blue 10px 20px)","repeating-radial-gradient(red 0 10px,blue 10px 20px)"]; the renderer rejects these tokens.

---
### [CSS-040] — background-repeat
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
### [CSS-041] — border-bottom-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-bottom-style: dashed; }
```

**✅ Generate instead:**
```css
.foo { border-bottom-style: solid; }
```

**Rule for AI agents:** Never assign `dashed, dotted, double, groove, ridge, inset` to `border-bottom-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","ridge","outset","inset","groove","dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-042] — border-image-repeat
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
### [CSS-043] — border-left-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-left-style: dashed; }
```

**✅ Generate instead:**
```css
.foo { border-left-style: solid; }
```

**Rule for AI agents:** Never assign `dashed, dotted, double, groove, ridge, inset` to `border-left-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","groove","outset","inset","ridge","dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-044] — border-right-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-right-style: dashed; }
```

**✅ Generate instead:**
```css
.foo { border-right-style: solid; }
```

**Rule for AI agents:** Never assign `dashed, dotted, double, groove, ridge, inset` to `border-right-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["double","ridge","inset","outset","groove","dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-045] — border-style
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
### [CSS-046] — border-top-style
**Status:** partial-values
**Surface:** css-value
**Severity:** high

**❌ Never generate:**
```css
.foo { border-top-style: dashed; }
```

**✅ Generate instead:**
```css
.foo { border-top-style: solid; }
```

**Rule for AI agents:** Never assign `dashed, dotted, double, groove, ridge, inset` to `border-top-style`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["outset","double","groove","ridge","inset","dashed","dotted"]; the renderer rejects these tokens.

---
### [CSS-050] — font-size
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

**Rule for AI agents:** Never assign `math, round(14px,2px), min(12px,16px), max(12px,16px), mod(20px,6px), mod(20px,1vw)` to `font-size`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["math","round(14px,2px)","min(12px,16px)","max(12px,16px)","mod(20px,6px)","mod(20px,1vw)","min(12px,1vw)","rem(20px,6px)","rem(20px,1vw)","clamp(100px,20vw,200px)","clamp(12px,14px,16px)","max(12px,1vw)","round(14px,1vw)"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-051] — font-style
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
### [CSS-052] — font-weight
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
### [CSS-053] — image-rendering
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
### [CSS-056] — mask-clip
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
### [CSS-057] — mask-mode
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
### [CSS-059] — mix-blend-mode
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
### [CSS-060] — overflow-x
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
### [CSS-061] — overflow-y
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
### [CSS-062] — pointer-events
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
### [CSS-063] — text-align
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
### [CSS-064] — text-decoration-line
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
### [CSS-065] — text-decoration-style
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
### [CSS-066] — text-decoration-thickness
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
### [CSS-067] — text-overflow
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
### [CSS-068] — text-transform
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
### [CSS-069] — text-underline-offset
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
### [CSS-070] — text-underline-position
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
### [CSS-071] — visibility
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
### [CSS-072] — white-space
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
### [CSS-055] — Logical and physical-mapped CSS properties
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
### [CSS-054] — List, table, form-control native styling
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
### [CSS-058] — Misc modern positioning / sizing helpers
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

**Why:** Scraper marked these layout/positioning helpers as `missing`. For 3D-style transforms keep using the 2D-only `transform` property. Members: clear, clip, contain-intrinsic-block-size, contain-intrinsic-height, contain-intrinsic-inline-size, contain-intrinsic-size, contain-intrinsic-width, content-visibility, direction, float, justify-items, justify-self, math-depth, math-shift, math-style, object-fit, object-position, object-view-box, order, outline, outline-color, outline-offset, outline-style, outline-width, overflow-anchor, overflow-block, overflow-clip-margin, overflow-inline, overlay, place-content, place-items, place-self, rotate, scale, touch-action, transform-box, translate, unicode-bidi, will-change, writing-mode, zoom.

---
### [CSS-017] — ::backdrop
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::backdrop { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::backdrop` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::backdrop".

---
### [CSS-018] — ::checkmark
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::checkmark { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::checkmark` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::checkmark".

---
### [CSS-019] — ::cue
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::cue { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::cue` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::cue".

---
### [CSS-020] — ::details-content
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::details-content { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::details-content` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::details-content".

---
### [CSS-021] — ::file-selector-button
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::file-selector-button { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::file-selector-button` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::file-selector-button".

---
### [CSS-022] — ::first-letter
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::first-letter { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::first-letter` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::first-letter".

---
### [CSS-023] — ::first-line
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::first-line { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::first-line` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::first-line".

---
### [CSS-024] — ::grammar-error
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
::grammar-error { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `::grammar-error` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: ::grammar-error".

---
### [CSS-025] — :active-view-transition
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:active-view-transition { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:active-view-transition` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :active-view-transition".

---
### [CSS-026] — :active-view-transition-type(fade)
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:active-view-transition-type(fade) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:active-view-transition-type(fade)` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :active-view-transition-type".

---
### [CSS-027] — :any-link
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:any-link { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:any-link` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :any-link".

---
### [CSS-028] — :autofill
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:autofill { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:autofill` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :autofill".

---
### [CSS-029] — :buffering
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:buffering { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:buffering` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :buffering".

---
### [CSS-030] — :closed
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:closed { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:closed` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :closed".

---
### [CSS-031] — :default
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:default { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:default` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :default".

---
### [CSS-032] — :defined
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:defined { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:defined` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :defined".

---
### [CSS-033] — :dir(ltr)
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:dir(ltr) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:dir(ltr)` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :dir".

---
### [CSS-034] — :empty
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:empty { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:empty` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :empty".

---
### [CSS-035] — :fullscreen
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:fullscreen { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:fullscreen` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :fullscreen".

---
### [CSS-036] — :future
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:future { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:future` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :future".

---
### [CSS-037] — :has-slotted
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:has-slotted { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:has-slotted` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :has-slotted".

---
### [CSS-038] — :has(.child)
**Status:** parser-only
**Surface:** css-selector
**Severity:** high

**❌ Never generate:**
```css
:has(.child) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:has(.child)` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :has".

---
### [CSS-047] — CSS image functions
**Status:** missing
**Surface:** css-function
**Severity:** high

**❌ Never generate:**
```css
.foo { background-image: repeating-linear-gradient(red 0 10px, blue 10px 20px); }
```

**✅ Generate instead:**
```css
.foo { background-image: linear-gradient(red 0 10px, blue 10px 20px, red 20px 30px, blue 30px 40px); }
```

**Rule for AI agents:** Never use `repeating-linear-gradient()` or `repeating-radial-gradient()`; emit a `linear-gradient()`/`radial-gradient()` with enough explicit color stops to look identical. `url(...)`, `image-set(...)`, and `cross-fade(...)` are unverified (resolving them at parse time stalls Gameface); use `url()` only with cached engine-side assets and treat `image-set`/`cross-fade` as missing.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: repeating-linear-gradient(), repeating-radial-gradient().

---
### [CSS-048] — CSS reference functions
**Status:** missing
**Surface:** css-function
**Severity:** high

**❌ Never generate:**
```css
.foo { width: env(safe-area-inset-top, 100px); }
```

**✅ Generate instead:**
```css
.foo { width: var(--gf-width, 100px); }
```

**Rule for AI agents:** Never use `env()` (no environment variables) or `attr()` (only the most basic spec form is shipped in browsers and Gameface does not parse it); inline the literal value, or write it via element.style/JS. `var(--name, fallback)` is supported.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: env(), attr().

---
### [CSS-049] — CSS transform functions
**Status:** missing
**Surface:** css-function
**Severity:** high

**❌ Never generate:**
```css
.foo { transform: skew(10deg); }
```

**✅ Generate instead:**
```css
.foo { transform: skewX(10deg) skewY(5deg); }
```

**Rule for AI agents:** Never use the missing transform functions (`skew()` combined form, `perspective()`); use `skewX()` + `skewY()` and apply 3D effects via the engine-side camera. `translate*`, `scale*`, `rotate*`, `matrix`, `matrix3d` are honored.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: skew(), perspective().

---

## MEDIUM (97)

---
### [CSS-085] — animation-delay
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
### [CSS-086] — animation-duration
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
### [CSS-087] — animation-timing-function
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
### [CSS-088] — backdrop-filter
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
### [CSS-089] — background-color
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
### [CSS-090] — border-bottom-left-radius
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
### [CSS-091] — border-bottom-right-radius
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
### [CSS-092] — border-image-outset
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
### [CSS-093] — border-image-slice
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
### [CSS-094] — border-top-left-radius
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
### [CSS-095] — border-top-right-radius
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
### [CSS-096] — bottom
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
### [CSS-097] — box-shadow
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
### [CSS-098] — caret-color
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
### [CSS-099] — clip-path
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

**Rule for AI agents:** Never assign `fill-box, path, stroke-box, view-box, rect(0 100% 100% 0), xywh(0 0 100% 100%)` to `clip-path`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["fill-box","path","stroke-box","view-box","rect(0 100% 100% 0)","xywh(0 0 100% 100%)"]; the renderer rejects these tokens.

---
### [CSS-100] — coh-partitioned
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
### [CSS-101] — coh-rendering-option
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
### [CSS-102] — coh-simple-opacity
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
### [CSS-103] — color
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

**Rule for AI agents:** Never assign `initial, oklab(0.5 0.1 0.1), lch(50% 70 30), color-mix(in srgb,red,blue), hsla(0,100%,50%,0.5), hsl(0,100%,50%)` to `color`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial","oklab(0.5 0.1 0.1)","lch(50% 70 30)","color-mix(in srgb,red,blue)","hsla(0,100%,50%,0.5)","hsl(0,100%,50%)","lab(50% 40 59.5)","hwb(0 0% 0%)","oklch(0.5 0.1 30)"]; the renderer rejects these tokens.

---
### [CSS-104] — contain
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
### [CSS-106] — content
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

**Rule for AI agents:** Never assign `gradient, image-set, url, counters(item,"."), attr(data-gf), counter(item)` to `content`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["url","gradient","image-set","counters(item,\".\")","attr(data-gf)","counter(item)"]; the renderer rejects these tokens.

---
### [CSS-111] — cx
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
### [CSS-112] — cy
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
### [CSS-113] — d
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
### [CSS-114] — fill
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
### [CSS-115] — fill-opacity
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
### [CSS-116] — filter
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
### [CSS-117] — flex-grow
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
### [CSS-118] — flex-shrink
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
### [CSS-119] — height
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
### [CSS-120] — left
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
### [CSS-121] — margin-bottom
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
### [CSS-122] — margin-left
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
### [CSS-123] — margin-right
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
### [CSS-124] — margin-top
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
### [CSS-125] — mask-repeat
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
### [CSS-126] — max-height
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
### [CSS-127] — max-width
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
### [CSS-128] — min-height
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
### [CSS-129] — min-width
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
### [CSS-134] — offset
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
### [CSS-135] — opacity
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
### [CSS-136] — padding-bottom
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
### [CSS-137] — padding-left
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
### [CSS-138] — padding-right
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
### [CSS-139] — padding-top
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
### [CSS-140] — r
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
### [CSS-141] — right
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
### [CSS-142] — rx
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
### [CSS-143] — ry
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
### [CSS-145] — shape-rendering
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
### [CSS-146] — stop-color
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
### [CSS-147] — stop-opacity
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
### [CSS-148] — stroke
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
### [CSS-149] — stroke-dasharray
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
### [CSS-150] — stroke-dashoffset
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
### [CSS-151] — stroke-miterlimit
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
### [CSS-152] — stroke-opacity
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
### [CSS-153] — stroke-width
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
### [CSS-155] — text-anchor
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
### [CSS-156] — text-decoration-color
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
### [CSS-157] — text-stroke-color
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
### [CSS-158] — text-stroke-width
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
### [CSS-159] — top
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
### [CSS-160] — transform
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

**Rule for AI agents:** Never assign `initial, rotate(acos(1)), perspective(500px), rotate(asin(1)), rotate(atan(1)), skew(10deg)` to `transform`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["initial","rotate(acos(1))","perspective(500px)","rotate(asin(1))","rotate(atan(1))","skew(10deg)","rotate(atan2(1,1))"]; the renderer rejects these tokens.

---
### [CSS-161] — transition-delay
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
### [CSS-162] — transition-duration
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
### [CSS-163] — transition-timing-function
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

**Rule for AI agents:** Never assign `jump, linear(0,0.25,0.5,0.75,1)` to `transition-timing-function`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["jump","linear(0,0.25,0.5,0.75,1)"]; the renderer rejects these tokens.

---
### [CSS-164] — user-select
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
### [CSS-165] — vertical-align
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
### [CSS-167] — width
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

**Rule for AI agents:** Never assign `anchor-size, fit-content, max-content, min-content, stretch, abs(-100px)` to `width`; only the documented Gameface subset is honored.

**Why:** scraper logRejectedValues: ["anchor-size","stretch","fit-content","max-content","min-content","abs(-100px)","env(safe-area-inset-top,100px)"]; the renderer rejects these tokens. Supported units: px, em, rem, in, pt, vh, vw, vmin, vmax, %.

---
### [CSS-168] — x
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
### [CSS-169] — y
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
### [CSS-133] — Multi-column layout
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
### [CSS-105] — Container queries
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
### [CSS-084] — Anchor positioning
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
### [CSS-144] — Scroll snap, scroll margin / padding, scrollbar customization
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
### [CSS-166] — View transitions, animation timeline, scroll timeline
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
### [CSS-132] — Modern typography (font-variant, hyphens, text-wrap, font-feature-settings, etc.)
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

**Why:** Scraper marked every modern typography property as `missing`. Supported text-related properties: see partial entries for `font-size`, `font-style`, `font-weight`, `line-height`, `text-align`, `text-overflow`, `text-transform`, `text-decoration-*`, `text-underline-position`, `text-underline-offset`, `text-shadow`, `text-stroke-*`, `letter-spacing`, `vertical-align`, `white-space`. Members: font-feature-settings, font-kerning, font-language-override, font-optical-sizing, font-palette, font-size-adjust, font-smooth, font-stretch, font-synthesis, font-synthesis-position, font-synthesis-small-caps, font-synthesis-style, font-synthesis-weight, font-variant, font-variant-alternates, font-variant-caps, font-variant-east-asian, font-variant-emoji, font-variant-ligatures, font-variant-numeric, font-variant-position, font-variation-settings, font-width, hanging-punctuation, hyphenate-character, hyphenate-limit-chars, hyphens, initial-letter, line-break, line-clamp, line-height-step, tab-size, text-align-last, text-autospace, text-box, text-box-edge, text-box-trim, text-combine-upright, text-decoration-skip, text-decoration-skip-ink, text-emphasis, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-indent, text-justify, text-orientation, text-size-adjust, text-spacing-trim, text-wrap, text-wrap-mode, text-wrap-style, white-space-collapse, word-break, word-spacing.

---
### [CSS-154] — SVG-only presentation properties
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
### [CSS-130] — Modern background properties
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
### [CSS-131] — Modern mask longhands
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

**Why:** Scraper marked these mask longhands as `missing`. Members: mask-border, mask-border-outset, mask-border-repeat, mask-border-slice, mask-border-source, mask-border-width, mask-composite, mask-origin.

---
### [CSS-108] — CSS Motion-path / offset-*
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
### [CSS-073] — ::selection
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
::selection { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `::selection` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "only the `color` and `background-color` properties are honoured; other declarations are ignored.". Group: pseudo-element.

---
### [CSS-076] — :nth-child(2 of .class)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(2 of .class) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-child(2 of .class)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-structural-of.

---
### [CSS-077] — :nth-child(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(2) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-child(2)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-class.

---
### [CSS-078] — :nth-child(2n+1)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(2n+1) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-child(2n+1)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-structural-complex.

---
### [CSS-079] — :nth-child(even)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(even) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-child(even)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-structural-complex.

---
### [CSS-080] — :nth-child(odd)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-child(odd) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-child(odd)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-structural-complex.

---
### [CSS-081] — :nth-last-child(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-last-child(2) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-last-child(2)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-class.

---
### [CSS-082] — :nth-last-of-type(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-last-of-type(2) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-last-of-type(2)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-class.

---
### [CSS-083] — :nth-of-type(2)
**Status:** partial-values
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:nth-of-type(2) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS instead of relying on this selector.
```

**Rule for AI agents:** Never rely on `:nth-of-type(2)` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.

**Why:** scraper note: "no support for the `[ of <complex-selector-list> ]` syntax (CSS Selectors-4).". Group: pseudo-class.

---
### [CSS-074] — :first
**Status:** parser-only
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:first { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:first` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :first".

---
### [CSS-075] — :has(> .child)
**Status:** parser-only
**Surface:** css-selector
**Severity:** medium

**❌ Never generate:**
```css
:has(> .child) { color: red; }
```

**✅ Generate instead:**
```css
// Toggle classes from JS based on application state.
```

**Rule for AI agents:** Never use the `:has(> .child)` selector; the renderer parses it but does not apply matching rules.

**Why:** scraper probeA=false, probeB=false; logWarning: "unsupported pseudo: :has".

---
### [CSS-107] — CSS image functions — unverified (NEEDS REVIEW)
**Status:** unknown
**Surface:** css-function
**Severity:** medium

**❌ Never generate:**
```css
.foo { background-image: url("data:image/svg+xml,%3Csvg/%3E"); }
```

**✅ Generate instead:**
```css
// [NEEDS REVIEW: scraper skipped this function because it stalls the renderer at parse time; confirm with Gameface docs whether it is supported]
```

**Rule for AI agents:** Treat `url()`, `image-set()`, `cross-fade()` as unverified — the scraper could not safely probe them; do not emit unless an integrator confirms support against the Gameface CSS reference.

**Why:** Scraper skipReason: "Gameface starts resolving url(…) at stylesheet-parse time; a hanging fetch can deadlock the next CDP call.  Treat as present (the engine universally supports url() for image and font sources) — manual verification recommended.".

---
### [CSS-109] — CSS shape functions
**Status:** missing
**Surface:** css-function
**Severity:** medium

**❌ Never generate:**
```css
.foo { clip-path: rect(0 100% 100% 0); }
```

**✅ Generate instead:**
```css
.foo { clip-path: inset(10px); }
```

**Rule for AI agents:** Never use `rect()` or `xywh()` shape functions in `clip-path`; the engine does not parse them. Use `inset()`, `circle()`, `ellipse()`, `polygon()`, or `path()`.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: rect(), xywh().

---
### [CSS-110] — CSS timing functions
**Status:** missing
**Surface:** css-function
**Severity:** medium

**❌ Never generate:**
```css
.foo { transition-timing-function: linear(0, 0.25, 0.5, 0.75, 1); }
```

**✅ Generate instead:**
```css
.foo { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
```

**Rule for AI agents:** Never use the `linear(...)` easing function (the multi-stop variant); use `cubic-bezier(...)` or `steps(...)` instead — both are honored.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: linear().

---

## LOW (6)

---
### [CSS-172] — Legacy `box-*` flexbox model
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
.foo { box-align: center; box-flex: 1; box-orient: horizontal; }
```

**✅ Generate instead:**
```css
.foo { align-items: center; flex-grow: 1; flex-direction: row; }
```

**Rule for AI agents:** Never use the legacy `box-*` flexbox model (`box-align`, `box-flex`, `box-orient`, `box-pack`, …); use the modern flexbox longhands (`align-items`, `flex-grow`, `flex-direction`, `justify-content`).

**Why:** Scraper logWarning: "Unsupported CSS property detected (stylesheet parser)" for every legacy `box-*` property. Members: box-align, box-decoration-break, box-direction, box-flex, box-flex-group, box-lines, box-ordinal-group, box-orient, box-pack.

---
### [CSS-174] — Page / print layout
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
### [CSS-175] — Ruby, BIDI, CJK, math, hanja
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
### [CSS-171] — CSS counters
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
### [CSS-173] — Other unsupported CSS properties
**Status:** missing
**Surface:** css-property
**Severity:** low

**❌ Never generate:**
```css
/* Property names listed in index.json under this family's `members`. */
```

**✅ Generate instead:**
```css
/* Omit; pick a supported property from `results/css/supported.json` or `results/css/partial.json`. */
```

**Rule for AI agents:** Never use these CSS properties; the engine logs "Unsupported CSS property detected (stylesheet parser)" for each. Members listed in the index JSON.

**Why:** Scraper logWarning: "Unsupported CSS property detected (stylesheet parser)" for every member. Members: box-sizing, coh-custom-effect-float-param1, coh-custom-effect-float-param10, coh-custom-effect-float-param11, coh-custom-effect-float-param12, coh-custom-effect-float-param2, coh-custom-effect-float-param3, coh-custom-effect-float-param4, coh-custom-effect-float-param5, coh-custom-effect-float-param6, coh-custom-effect-float-param7, coh-custom-effect-float-param8, coh-custom-effect-float-param9, coh-custom-effect-string-param1, coh-custom-effect-string-param2, coh-sdf, custom-property, flex-flow, image-orientation, margin-trim, quotes, shape-image-threshold, shape-margin, shape-outside.

---
### [CSS-170] — CSS counter functions
**Status:** missing
**Surface:** css-function
**Severity:** low

**❌ Never generate:**
```css
.foo { content: counter(item); }
```

**✅ Generate instead:**
```css
.foo { content: "1."; }
```

**Rule for AI agents:** Never use `counter()` or `counters()` in `content`; the engine does not implement CSS counters. Inject the number from JS or pre-render the text.

**Why:** Scraper logged "Unable to parse declaration: …" for every member. Missing functions: counter(), counters().

---
