# Negative Rules — HTML

Generated from `results/html/{partial,unsupported}.json`. The most dangerous statuses (`silently-coerced`, `parsed-no-impl`, `unknown`) appear under CRITICAL.

Total rules in this file: **135** (critical: 45, high: 21, medium: 69, low: 0).

## CRITICAL (45)

---
### [HTML-012] — input[type="checkbox"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="checkbox" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for checkbox semantics -->
```

**Rule for AI agents:** Never use `<input type="checkbox">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-013] — input[type="color"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="color" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for color semantics -->
```

**Rule for AI agents:** Never use `<input type="color">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-014] — input[type="date"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="date" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for date semantics -->
```

**Rule for AI agents:** Never use `<input type="date">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-015] — input[type="datetime-local"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="datetime-local" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for datetime-local semantics -->
```

**Rule for AI agents:** Never use `<input type="datetime-local">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-016] — input[type="email"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="email" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for email semantics -->
```

**Rule for AI agents:** Never use `<input type="email">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-017] — input[type="file"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="file" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for file semantics -->
```

**Rule for AI agents:** Never use `<input type="file">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-018] — input[type="hidden"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="hidden" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for hidden semantics -->
```

**Rule for AI agents:** Never use `<input type="hidden">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-019] — input[type="image"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="image" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for image semantics -->
```

**Rule for AI agents:** Never use `<input type="image">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-020] — input[type="month"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="month" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for month semantics -->
```

**Rule for AI agents:** Never use `<input type="month">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-021] — input[type="number"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="number" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for number semantics -->
```

**Rule for AI agents:** Never use `<input type="number">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-022] — input[type="radio"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="radio" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for radio semantics -->
```

**Rule for AI agents:** Never use `<input type="radio">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-023] — input[type="range"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="range" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for range semantics -->
```

**Rule for AI agents:** Never use `<input type="range">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-024] — input[type="reset"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="reset" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for reset semantics -->
```

**Rule for AI agents:** Never use `<input type="reset">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-025] — input[type="search"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="search" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for search semantics -->
```

**Rule for AI agents:** Never use `<input type="search">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-026] — input[type="submit"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="submit" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for submit semantics -->
```

**Rule for AI agents:** Never use `<input type="submit">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-027] — input[type="tel"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="tel" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for tel semantics -->
```

**Rule for AI agents:** Never use `<input type="tel">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-028] — input[type="time"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="time" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for time semantics -->
```

**Rule for AI agents:** Never use `<input type="time">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-029] — input[type="url"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="url" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for url semantics -->
```

**Rule for AI agents:** Never use `<input type="url">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-030] — input[type="week"]
**Status:** silently-coerced
**Surface:** html-input-type
**Severity:** critical

**❌ Never generate:**
```html
<input type="week" name="x">
```

**✅ Generate instead:**
```html
<input type="text" name="x"> <!-- + JS-side validation / custom widget for week semantics -->
```

**Rule for AI agents:** Never use `<input type="week">`; Gameface coerces the type to `text`. Use `type="text"` plus a custom widget or manual validation.

**Why:** scraper roundTripType: "text"; the engine reset `input.type` to `text` after assignment.

---
### [HTML-001] — a
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<a href="page.html">click</a>
```

**✅ Generate instead:**
```html
<div role="link" tabindex="0" data-href="page.html" class="link"></div>
```

**Rule for AI agents:** Never use `<a href>`; click / navigation is not implemented. Use `<div role="link">` plus a JS click handler that calls into the engine.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-002] — area
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<area></area>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<area>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-003] — audio
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<audio src="snd.ogg" controls></audio>
```

**✅ Generate instead:**
```html
<!-- Use the engine's audio APIs from the host runtime; no <audio> playback. -->
```

**Rule for AI agents:** Never use `<audio>`; element exists but has no playback. Use the host engine's audio APIs.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-004] — datalist
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<datalist id="d"><option>A</option></datalist>
```

**✅ Generate instead:**
```html
<!-- Implement an autocomplete with <div> menu rendered from JS. -->
```

**Rule for AI agents:** Never use `<datalist>`; it parses but has no widget behavior. Build a custom dropdown / autocomplete with `<div>`/`<span>` and JS state.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-005] — details
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<details><summary>More</summary>...</details>
```

**✅ Generate instead:**
```html
<div class="disclosure">
  <div class="disclosure__head" data-toggle="open">More</div>
  <div class="disclosure__body">…</div>
</div>
```

**Rule for AI agents:** Never use `<details>`/`<summary>` toggling; emulate disclosure with class toggling in JS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-007] — embed
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<embed></embed>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<embed>`; no plugin / object embedding is implemented.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-009] — fieldset
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<fieldset><legend>X</legend><input></fieldset>
```

**✅ Generate instead:**
```html
<div role="group">
  <div class="legend">X</div>
  <input>
</div>
```

**Rule for AI agents:** Never use `<fieldset>` for grouping behavior; use `<div role="group">`.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-010] — form
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<form action="/submit"><input name="q"><button>Go</button></form>
```

**✅ Generate instead:**
```html
<!-- No form lifecycle; collect values from inputs and submit via XMLHttpRequest stub or game-engine hook. -->
```

**Rule for AI agents:** Never use `<form>`; submit / reset / validation are not implemented. Read input values from JS and post via the engine bridge.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-011] — iframe
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<iframe src="other.html"></iframe>
```

**✅ Generate instead:**
```html
<!-- No iframe support. Embed via separate Gameface page or engine-side composition. -->
```

**Rule for AI agents:** Never use `<iframe>`; framing is not implemented. Compose multiple Gameface views host-side.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-031] — label
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<label for="x">Name</label><input id="x">
```

**✅ Generate instead:**
```html
<div class="row">
  <span class="row__label">Name</span>
  <input class="row__input" id="x">
</div>
```

**Rule for AI agents:** Never use `<label>` for click-forwarding to inputs; the for/click association is not implemented. Wire focus from JS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-032] — legend
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<legend></legend>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<legend>` for grouping behavior; use `<div role="group">`.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-033] — map
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<map></map>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<map>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-034] — meter
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<meter value="0.7"></meter>
```

**✅ Generate instead:**
```html
<div class="meter"><div class="meter__bar" style="width: 70%;"></div></div>
```

**Rule for AI agents:** Never use `<meter>`; build a custom bar with `<div>` and width-animation.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-035] — object
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<object></object>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<object>`; no plugin / object embedding is implemented.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-036] — optgroup
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<optgroup></optgroup>
```

**✅ Generate instead:**
```html
<div class="dropdown__item" data-value="1">One</div>
```

**Rule for AI agents:** Never use `<optgroup>`; it parses but has no widget behavior. Build a custom dropdown / autocomplete with `<div>`/`<span>` and JS state.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-037] — option
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<option value="1">One</option>
```

**✅ Generate instead:**
```html
<div class="dropdown__item" data-value="1">One</div>
```

**Rule for AI agents:** Never use `<option>`; it parses but has no widget behavior. Build a custom dropdown / autocomplete with `<div>`/`<span>` and JS state.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-038] — output
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<output></output>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<output>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-040] — progress
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<progress value="0.5"></progress>
```

**✅ Generate instead:**
```html
<div class="progress"><div class="progress__bar" style="width: 50%;"></div></div>
```

**Rule for AI agents:** Never use `<progress>`; build a custom bar with `<div>` and width-animation.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-042] — select
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<select>
  <option>One</option>
  <option>Two</option>
</select>
```

**✅ Generate instead:**
```html
<!-- Build a custom dropdown with <div> elements; toggle visibility from JS. -->
<div class="dropdown">
  <div class="dropdown__trigger">Choose…</div>
  <div class="dropdown__menu">
    <div class="dropdown__item">One</div>
    <div class="dropdown__item">Two</div>
  </div>
</div>
```

**Rule for AI agents:** Never use `<select>`; it parses but has no widget behavior. Build a custom dropdown / autocomplete with `<div>`/`<span>` and JS state.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-044] — summary
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<summary></summary>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<summary>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-045] — track
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<track></track>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<track>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-006] — dialog
**Status:** unknown
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<dialog open>Hello</dialog>
```

**✅ Generate instead:**
```html
<!-- Build a custom modal: a <div class="modal"> overlay toggled with .modal--open. No native showModal(). -->
```

**Rule for AI agents:** Never use `<dialog>`; the engine treats it as HTMLUnknownElement and gives it no behavior.

**Why:** scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.

---
### [HTML-008] — fencedframe
**Status:** unknown
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<fencedframe></fencedframe>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<fencedframe>`; the engine treats it as HTMLUnknownElement and gives it no behavior.

**Why:** scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.

---
### [HTML-039] — picture
**Status:** unknown
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<picture><source srcset="img@2x.png 2x"><img src="img.png"></picture>
```

**✅ Generate instead:**
```html
<img src="img.png"> <!-- No <picture> resolution; pick the right asset in JS. -->
```

**Rule for AI agents:** Never use `<picture>`; the engine treats it as HTMLUnknownElement and gives it no behavior.

**Why:** scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.

---
### [HTML-041] — search
**Status:** unknown
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<search></search>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<search>`; the engine treats it as HTMLUnknownElement and gives it no behavior.

**Why:** scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.

---
### [HTML-043] — selectedcontent
**Status:** unknown
**Surface:** html-tag
**Severity:** critical

**❌ Never generate:**
```html
<selectedcontent></selectedcontent>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<selectedcontent>`; the engine treats it as HTMLUnknownElement and gives it no behavior.

**Why:** scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.

---

## HIGH (21)

---
### [HTML-046] — canvas
**Status:** partial-values
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<canvas id="c"></canvas>
<script>
  const c = document.getElementById('c');
  const data = c.toDataURL(); // returns no-op / undefined
</script>
```

**✅ Generate instead:**
```html
<canvas id="c"></canvas>
<script>
  const c = document.getElementById('c');
  const ctx = c.getContext('2d'); // 2D context only; toDataURL is missing.
</script>
```

**Rule for AI agents:** Never depend on the missing parts of `<canvas>` (toDataURL); the constructor exists but those APIs return falsy/no-op.

**Why:** scraper checks set false: toDataURL.

---
### [HTML-053] — img
**Status:** partial-values
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<img id="i" src="x.png">
<script>
  const i = document.getElementById('i');
  if (i.complete && i.naturalWidth > 0) { /* never true */ }
  console.log(i.alt); // undefined
</script>
```

**✅ Generate instead:**
```html
<img id="i" src="x.png">
<script>
  // No alt / complete / naturalWidth — measure size with getBoundingClientRect on a parent.
</script>
```

**Rule for AI agents:** Never depend on the missing parts of `<img>` (altProperty, completeProperty, naturalWidthProperty, naturalHeightProperty); the constructor exists but those APIs return falsy/no-op.

**Why:** scraper checks set false: altProperty, completeProperty, naturalWidthProperty, naturalHeightProperty.

---
### [HTML-054] — input
**Status:** partial-values
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<input id="x" required>
<script>
  if (!document.getElementById('x').checkValidity()) { /* not callable */ }
</script>
```

**✅ Generate instead:**
```html
<input id="x">
<script>
  // Validate manually: const v = document.getElementById('x').value; if (!v) showError();
</script>
```

**Rule for AI agents:** Never depend on the missing parts of `<input>` (checkValidity); the constructor exists but those APIs return falsy/no-op.

**Why:** scraper checks set false: checkValidity.

---
### [HTML-056] — link
**Status:** partial-values
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<link rel="stylesheet" href="a.css">
<script>
  document.querySelector('link').sheet.cssRules; // sheet is null
</script>
```

**✅ Generate instead:**
```html
<link rel="stylesheet" href="a.css"> <!-- href/rel work; .sheet is null. Inspect rules with a fetched copy if needed. -->
```

**Rule for AI agents:** Never depend on the missing parts of `<link>` (sheetProperty); the constructor exists but those APIs return falsy/no-op.

**Why:** scraper checks set false: sheetProperty.

---
### [HTML-047] — caption
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<caption></caption>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<caption>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-048] — col
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<col></col>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<col>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-049] — colgroup
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<colgroup></colgroup>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<colgroup>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-050] — dd
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<dd></dd>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<dd>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-051] — dl
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<dl></dl>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<dl>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-052] — dt
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<dt></dt>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<dt>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-055] — li
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<li></li>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<li>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-057] — menu
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<menu></menu>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<menu>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-058] — ol
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<ol><li>a</li></ol>
```

**✅ Generate instead:**
```html
<div class="list">
  <div class="list__item"><span class="list__bullet">•</span><span>a</span></div>
</div>
```

**Rule for AI agents:** Never rely on `<ol>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-059] — table
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<table><tr><td>1</td></tr></table>
```

**✅ Generate instead:**
```html
<div class="table">
  <div class="table__row"><div class="table__cell">1</div></div>
</div>
```

**Rule for AI agents:** Never use `<table>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-060] — tbody
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<tbody></tbody>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<tbody>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-061] — td
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<td></td>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<td>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-062] — tfoot
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<tfoot></tfoot>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<tfoot>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-063] — th
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<th></th>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<th>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-064] — thead
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<thead></thead>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<thead>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-065] — tr
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<tr></tr>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<tr>` for layout; Gameface has no table layout. Use `display: flex` containers.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-066] — ul
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** high

**❌ Never generate:**
```html
<ul><li>a</li></ul>
```

**✅ Generate instead:**
```html
<div class="list">
  <div class="list__item"><span class="list__bullet">•</span><span>a</span></div>
</div>
```

**Rule for AI agents:** Never rely on `<ul>` list semantics or markers; render bullets manually with styled `<div>`s.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---

## MEDIUM (69)

---
### [HTML-067] — abbr
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<abbr></abbr>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<abbr>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-068] — acronym
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<acronym></acronym>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<acronym>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-069] — address
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<address></address>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<address>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-070] — article
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<article></article>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<article>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-071] — aside
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<aside></aside>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<aside>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-072] — b
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<b>bold</b>
```

**✅ Generate instead:**
```html
<span style="font-weight: bold;">bold</span>
```

**Rule for AI agents:** Never rely on `<b>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-073] — base
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<base></base>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<base>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-074] — bdi
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<bdi></bdi>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<bdi>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-075] — bdo
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<bdo></bdo>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<bdo>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-076] — big
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<big></big>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<big>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-077] — blockquote
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<blockquote></blockquote>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<blockquote>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-078] — br
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
Line A<br>Line B
```

**✅ Generate instead:**
```html
<div>Line A</div><div>Line B</div>
```

**Rule for AI agents:** Never use `<br>`; insert breaks with separate block-level `<div>`s or `white-space: pre-wrap`.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-079] — center
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<center></center>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<center>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-080] — cite
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<cite></cite>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<cite>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-081] — code
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<code></code>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<code>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-082] — data
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<data></data>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<data>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-083] — del
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<del></del>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<del>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-084] — dfn
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<dfn></dfn>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<dfn>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-085] — dir
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<dir></dir>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<dir>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-086] — em
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<em>emphasis</em>
```

**✅ Generate instead:**
```html
<span style="font-style: italic;">emphasis</span>
```

**Rule for AI agents:** Never rely on `<em>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-087] — figcaption
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<figcaption></figcaption>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<figcaption>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-088] — figure
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<figure></figure>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<figure>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-089] — font
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<font></font>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<font>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-090] — footer
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<footer></footer>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<footer>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-091] — frame
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<frame></frame>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<frame>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-092] — frameset
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<frameset></frameset>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<frameset>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-093] — h1
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h1>Title</h1>
```

**✅ Generate instead:**
```html
<div class="heading heading--h1">Title</div>
```

**Rule for AI agents:** Never use `<h1>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-094] — h2
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h2>Title</h2>
```

**✅ Generate instead:**
```html
<div class="heading heading--h2">Title</div>
```

**Rule for AI agents:** Never use `<h2>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-095] — h3
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h3>Title</h3>
```

**✅ Generate instead:**
```html
<div class="heading heading--h3">Title</div>
```

**Rule for AI agents:** Never use `<h3>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-096] — h4
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h4>Title</h4>
```

**✅ Generate instead:**
```html
<div class="heading heading--h4">Title</div>
```

**Rule for AI agents:** Never use `<h4>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-097] — h5
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h5>Title</h5>
```

**✅ Generate instead:**
```html
<div class="heading heading--h5">Title</div>
```

**Rule for AI agents:** Never use `<h5>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-098] — h6
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<h6>Title</h6>
```

**✅ Generate instead:**
```html
<div class="heading heading--h6">Title</div>
```

**Rule for AI agents:** Never use `<h6>` expecting browser default styling; use `<div>` with an explicit heading class.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-099] — header
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<header></header>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<header>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-100] — hgroup
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<hgroup></hgroup>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<hgroup>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-101] — hr
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<hr>
```

**✅ Generate instead:**
```html
<div class="rule"></div>
```

**Rule for AI agents:** Never use `<hr>`; render a divider with a styled `<div>`.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-102] — i
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<i>emphasis</i>
```

**✅ Generate instead:**
```html
<span style="font-style: italic;">emphasis</span>
```

**Rule for AI agents:** Never rely on `<i>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-103] — ins
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<ins></ins>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<ins>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-104] — kbd
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<kbd></kbd>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<kbd>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-105] — main
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<main></main>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<main>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-106] — mark
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<mark></mark>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<mark>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-107] — marquee
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<marquee></marquee>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<marquee>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-108] — meta
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<meta></meta>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<meta>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-109] — nav
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<nav></nav>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<nav>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-110] — nobr
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<nobr></nobr>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<nobr>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-111] — noembed
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<noembed></noembed>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<noembed>`; the engine has no fallback semantics.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-112] — noframes
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<noframes></noframes>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<noframes>`; the engine has no fallback semantics.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-113] — noscript
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<noscript></noscript>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<noscript>`; the engine has no fallback semantics.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-114] — param
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<param></param>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<param>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-115] — plaintext
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<plaintext></plaintext>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<plaintext>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-116] — q
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<q></q>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<q>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-117] — rb
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<rb></rb>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<rb>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-118] — rp
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<rp></rp>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<rp>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-119] — rt
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<rt></rt>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<rt>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-120] — rtc
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<rtc></rtc>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<rtc>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-121] — ruby
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<ruby></ruby>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<ruby>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-122] — s
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<s></s>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<s>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-123] — samp
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<samp></samp>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<samp>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-124] — section
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<section></section>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<section>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-125] — small
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<small></small>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<small>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-126] — strike
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<strike></strike>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<strike>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-127] — strong
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<strong>bold</strong>
```

**✅ Generate instead:**
```html
<span style="font-weight: bold;">bold</span>
```

**Rule for AI agents:** Never rely on `<strong>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-128] — sub
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<sub></sub>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<sub>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-129] — sup
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<sup></sup>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<sup>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-130] — time
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<time></time>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<time>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-131] — tt
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<tt></tt>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<tt>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-132] — u
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<u></u>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<u>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-133] — var
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<var></var>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never rely on `<var>` styling defaults; wrap with `<span>` and apply explicit CSS.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-134] — wbr
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<wbr></wbr>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<wbr>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
### [HTML-135] — xmp
**Status:** parsed-no-impl
**Surface:** html-tag
**Severity:** medium

**❌ Never generate:**
```html
<xmp></xmp>
```

**✅ Generate instead:**
```html
<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->
```

**Rule for AI agents:** Never use `<xmp>`; it parses but has no specialized behavior — Gameface returns a generic `HTMLElement`. Replace with `<div>` or `<span>` and apply styling.

**Why:** scraper constructorName: "HTMLElement"; no specialised JS constructor — Gameface returns a generic HTMLElement framework-compat shim. Use <div> or <span> with styling instead.

---
