# Technical Specification: Gameface Perf Lab

**Status:** Draft for owner review
**Owner:** Frontend Lead, Coherent Labs
**Principle:** deliberately simple. The workflow is conversational: *"test X vs Y"* → the AI authors a small A/B case following the authoring rules → `run.js` measures it in the Gameface Player → the result lands as one row in a shared table. No registry, no database, no framework. Standardization lives in the **authoring rules**, not in machinery.

The lab exists to turn performance opinions into rows: every claim in the performance linter (and later the analyst) should cite a case ID, and every "is X slow in Gameface?" debate should end with someone running a case instead of someone guessing.

---

## Vertical 1 — the runner

### Layout
```
perf-lab/
  cases/<case-id>/
    A.html          # baseline (the recommended / cheap form)
    B.html          # identical except the ONE variable under test
    case.json       # { "title", "variable", "hypothesis", "counts"?, "status", "notes" }
  run.js
  parse.js          # the Coherent_* phase-table parser (already exists — from the nameplate analysis)
  results.md        # the shared table (auto-appended, human-readable)
  AUTHORING.md      # the authoring rules (§ Vertical 2), with the good/bad examples
```

### Protocol (`node run.js <case-id> [--all]`)
1. Load `A.html` in the Player over CDP (reuses the rasterize spec's capture backend for Player control; programmatic trace start/stop confirmed available).
2. Discard 2 s warmup → trace 5 s → save JSON.
3. Same for `B.html`. Repeat the A/B pair 3 times, interleaved (A B A B A B) to cancel drift.
4. `parse.js` each trace: pair `Coherent_*` begin/end events → per-frame phase durations → steady-state medians.
5. Print the per-case table; append one row per (case, count) to `results.md`.

### Output (printed per run)
```
text-shadow-blur (30 elements)
             A (solid)   B (blur)    ratio
  GPU        0.91 ms     2.14 ms     2.4x
  Paint      0.29 ms     0.44 ms     1.5x
  Layout     0.02 ms     0.02 ms     1.0x
  verdict: MEANINGFUL — B costs more (GPU-bound)
```

### The shared table (`results.md`)
One row per completed (case, count), appended by the runner, never edited by hand:

| case | count | variable | GPU | Paint | Layout | Styles | verdict | engine | date |
|---|---|---|---|---|---|---|---|---|---|
| text-shadow-blur | 30 | blur vs solid shadow | 2.4x | 1.5x | 1.0x | 1.0x | B expensive | 1.62 | 2026-08-21 |

Re-running a case appends a new row (old rows stay — they are history, and free engine-version comparison later). This table is the lab's product: the linter docs, the guide, and future tool 5 cite rows from it.

### Measurement rules (the whole methodology, three sentences)
- **Phase durations, never frame rate.** Durations are valid under any fps cap — a cap changes how often frames run, not how long the work takes (proven on the 30fps-capped nameplate profile).
- **Ratios, never absolute claims.** Same machine, same session, A vs B. Ratios roughly survive hardware differences; absolute ms don't. Negative results carry the qualifier "no measurable difference *on this machine*" (a strong GPU can hide a cost consoles would feel).
- **One guardrail:** if |A−B| is smaller than the spread between repeat runs, the verdict is `NO RELIABLE DIFFERENCE` — the lab never invents a conclusion. That is the entire statistics.

### Non-goals (v1)
Result registry/versioning beyond the table, hardware profiles, scaffold/template generators, MCP tool wrappers (the AI authors cases and reads tables through Claude Code + the filesystem; wrap `run.js` in an MCP tool only once usage earns it), CI integration, client distribution.

---

## Vertical 2 — case authoring (the conversational workflow + the rules)

### The workflow
1. Owner: *"test `:hover` on many elements vs none."*
2. AI runs the **applicability gate**: check the pattern against Gameface reality using the cohtml feature inventory (the CDP feature-detection scraper's JSON is ground truth) and eslint-plugin-gameface's supported-feature knowledge. Outcomes: `DIRECT` (test as-is), `ADAPTED` (pattern exists but the web framing is wrong — note the adaptation), `N/A` (pattern doesn't exist in cohtml, e.g. `will-change`, `content-visibility` — record it in the table with status N/A and the reason; **a documented N/A is a result**: it tells users which web advice to ignore).
3. AI writes `cases/<id>/A.html`, `B.html`, `case.json` **following AUTHORING.md** (below).
4. Owner reviews the diff between A and B (they are tiny files; the diff should be a few lines) and runs `node run.js <id>`.
5. AI (or owner) reads the printed table; the row is already in `results.md`.

### AUTHORING.md — the rules every case must follow
These rules are the standard. The AI must state, in `case.json.notes`, how each rule is satisfied or why a listed exception applies.

1. **One variable.** A and B differ in exactly one thing — the thing named in `case.json.variable`. If the comparison needs two changes, that is two cases.
2. **Identical DOM.** Same elements, same nesting, same order, same ids/classes except the class(es) under test. If the variable *is* structural (e.g. depth 5 vs 20, fragment vs loop insertion), keep total element count and rendered appearance as close as possible, and say so in `notes`.
3. **Identical JS.** Same script in both pages — byte-identical where possible, driven by a flag/constant where the variable lives in JS. Never "A has no script, B has a script" unless script presence is itself the variable.
4. **Identical assets and text.** Same strings, same lengths, same images. Text length changes layout; layout changes everything downstream.
5. **Visible and on-screen.** The tested elements must be inside the viewport and not fully occluded — the engine may skip offscreen work, silently measuring nothing.
6. **Steady state by default.** The page reaches its state and holds it, so the 5 s trace window measures per-frame cost. If churn is the subject, the churn runs at a fixed scripted rate from page load, identical in A and B.
7. **No randomness.** Fixed seeds, fixed data, fixed positions. Two runs of the same page must do identical work.
8. **Scale when count is the story.** If the cost plausibly scales with element count, provide `counts` (e.g. `[10, 30, 100]`) and generate the elements from the same inline loop in both pages.
9. **Plain HTML/CSS/JS.** No frameworks in case pages — the lab measures the engine, not Solid.
10. **Name the expected axis.** `case.json.hypothesis` names the phase expected to move (GPU / Layout / Styles / Paint). A result on a *different* axis than hypothesized is interesting and worth a note, not a failure.

### Examples (ship these verbatim in AUTHORING.md)

**Good case** — `text-shadow-blur`: A and B are byte-identical except one CSS line (`text-shadow: 1px 1px 0 #000` vs `0 2px 4px #000`). 30 identical `<span>`s from the same loop, same strings, static page. The diff between A.html and B.html is one line.

**Bad case (rule 2 violation)** — testing "gradient vs solid" where B also adds a wrapper div to hold the gradient: now the case measures a div plus a gradient. Restructure so both have the wrapper.

**Bad case (rule 3 violation)** — "CSS animation vs JS rAF" where A has no script tag at all: script *presence* (V8 wakeups, timer machinery) pollutes the comparison. Both pages carry the same script; A's animation path is simply not invoked — or better, both define both paths and a single constant selects one.

**Bad case (rule 6 violation)** — a churn test that starts inserting on a `setTimeout(…, 3000)`: half the trace window is idle. Churn starts at load, fixed rate, both pages.

### Starter work queue — 50 common web performance patterns
Status assigned by the applicability gate at authoring time. ★ = evidences a shipped linter rule or a nameplate-analysis inference (run these first).

**Decoration & paint:** 1★ text-shadow blur vs solid · 2★ box-shadow blur vs none vs baked image · 3 linear gradient vs solid · 4 radial vs linear gradient · 5 border-radius vs none · 6 radius+shadow vs baked image · 7★ filter:grayscale on N elements vs color-class · 8 filter:blur vs pre-blurred image · 9 drop-shadow vs box-shadow · 10★ gradient+clip-path vs baked image · 11 mask-image vs pre-masked image · 12 mix-blend-mode present vs absent (small vs large area) · 13 opacity<1 subtree vs opaque · 14 overdraw: 2/5/10 stacked translucent layers · 15 oversized background-image scaled down vs pre-sized asset

**Layout & geometry:** 16★ animate width vs scaleX (fill) · 17★ animate top/left vs translate (30 movers) · 18★ vw/vh in transform vs px (per-frame JS writes) · 19 percentage vs fixed px subtree · 20 depth 5 vs 20, static · 21 leaf text update at depth 5 vs 20 · 22 nested flex ×5 vs absolute, same layout · 23 read-write interleave vs batched · 24 margin animation vs transform · 25 element count 100/1000/5000 static · 26 display:none vs visibility:hidden held state · 27 toggling display vs visibility (30 elements) · 28 overflow:hidden vs none, deep content

**Selectors & styling:** 29★ class toggle under 500 descendant-combinator rules vs 500 flat rules · 30 chain length `.a .b .c .d .e` vs `.a .e` vs `.e` under churn · 31 no-class subject (`div > span`) ×200 rules vs class-subject · 32★ class string rewrite vs classList.toggle, 30 el/frame · 33 :hover rules on 200 elements vs none (pointer sweep) · 34 attribute vs class selector ×200 rules · 35 inline style per element vs shared class ×500 · 36 stylesheet 200 vs 5000 rules, same page · 37 class toggle on body vs on the changing leaf

**DOM mutation & churn:** 38★ appendChild ×100 loop vs one DocumentFragment · 39★ mount/unmount per second vs visibility toggle (30 el) · 40 innerHTML replace vs textContent update · 41 rebuild 100-row list vs update changed rows · 42★ pool-reuse 30 elements vs destroy/create per cycle · 43 text update per frame vs on-change (30 counters) · 44 insertion under complex rules vs flat rules (selector×insertion coupling)

**Animation & motion:** 45 CSS keyframes vs JS rAF transform ×30 · 46 transition:all vs transition:transform · 47 simultaneous animations 10/100/500 (opacity pulse) · 48 animate opacity vs background-color

**Text & assets:** 49 one long text node vs 50 sibling spans (the distance-meter case) · 50 30 small images vs one spritesheet via background-position

---

## Implementation order
- **M1:** `run.js` + `parse.js` extraction (parser exists; wrap it), the 3-repeat interleaved protocol, the guardrail, `results.md` appending. `AUTHORING.md` written with the rules + the four examples. Case #1 authored by hand end-to-end.
- **M2:** ★ cases authored via the conversational workflow (AI-authored, owner-reviewed, rules-checked), run, rows in the table; linter docs pages updated to cite case IDs.
- **M3:** selector cases (29–31, 44) — they quantify the selector-flattening tool's value before it is built. Remaining queue opportunistically.

**Acceptance:** case #1 yields agreeing verdicts across two separate sessions; an A/A self-test (same page as both variants) produces `NO RELIABLE DIFFERENCE` — proof the lab can't be fooled by its own noise; every ★ case has a row; at least one authored case is rejected in review for an AUTHORING.md violation and fixed (proof the rules are actually load-bearing); every linter rule's docs page cites a case row or is explicitly marked "engine-doc-based" (complex selectors) / "compositing-math-based" (blend/backdrop).
