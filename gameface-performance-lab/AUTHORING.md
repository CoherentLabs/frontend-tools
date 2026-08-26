# Authoring rules

These rules are the standard. Standardization lives here, not in machinery —
`run.js` is deliberately dumb, so a case that breaks a rule produces a
confident, wrong row rather than an error.

Every case must state in `case.json.notes` how each rule is satisfied, or why a
listed exception applies. A case is reviewed by reading the diff between
`A.html` and `B.html`. If that diff is not small enough to check by eye, the
case is wrong.

## The applicability gate

Before authoring, check the pattern against Gameface reality rather than
against the web. Ground truth, in order:

1. The cohtml feature inventory at
   `../gameface-unsupported-features/results/` — `css/supported.json`,
   `css/partial.json`, `css/unsupported.json`, and the same for `js/`,
   `html/`, `selectors/`, `functions/`.
2. `eslint-plugin-gameface`'s supported-feature knowledge.

The gate has three outcomes, recorded in `case.json.status`:

- **`DIRECT`** — the pattern exists in cohtml and tests as-is.
- **`ADAPTED`** — the pattern exists but the web framing is wrong. Note the
  adaptation in `notes`.
- **`N/A`** — the pattern does not exist in cohtml (`will-change`,
  `content-visibility`). Record it with `status: "N/A"` and the reason in
  `notes`; `run.js` writes the row without measuring anything. **A documented
  N/A is a result** — it tells users which web advice to ignore.

Check the JS you write, not just the feature under test. `URLSearchParams` is
unsupported in cohtml, which is why every case parses `location.search` by
hand. `inset` is unsupported too, which is why cases use explicit
`left`/`top`/`width`/`height` — a case that silently collapses to zero size
measures nothing and reports it as a null result.

**If your case drives a property from JS, verify that write lands before you
trust the case.** A property cohtml ignores makes B identical to A, and the lab
will report a confident `NO RELIABLE DIFFERENCE` that means nothing. Verify with
`el.style.someProp` — **not** `getComputedStyle`, which in cohtml returns the
value from the last completed style pass and is stale within the same tick. A
write that was accepted reads back engine-normalised (set
`clip-path: polygon(30% 0%, …)` and `el.style.clipPath` returns
`border-box polygon(nonzero, 30% 0%, …)`), which is the signal you want.

## The rules

1. **One variable.** A and B differ in exactly one thing — the thing named in
   `case.json.variable`. If the comparison needs two changes, that is two cases.

2. **Identical DOM.** Same elements, same nesting, same order, same
   ids/classes except the class(es) under test. If the variable *is* structural
   (depth 5 vs 20, fragment vs loop insertion), keep total element count and
   rendered appearance as close as possible, and say so in `notes`.

3. **Identical JS.** Same script in both pages — byte-identical where possible,
   driven by a flag/constant where the variable lives in JS. Never "A has no
   script, B has a script" unless script presence is itself the variable.

4. **Identical assets and text.** Same strings, same lengths, same images. Text
   length changes layout; layout changes everything downstream.

5. **Visible and on-screen.** The tested elements must be inside the 1920×1080
   viewport and not fully occluded. The engine may skip offscreen work, silently
   measuring nothing.

6. **Steady state, driven by an identical damage driver.** The page reaches its
   state and holds it, so the 5 s trace window measures per-frame cost — *but
   it must still be given something to redraw*. A page that holds perfectly
   still does no paint and no GPU work at all in Gameface (measured: a static
   page emits no `Coherent_GPU`, no `Coherent_Backend`, no
   `Coherent_RecordRendering`, and a 0.015 ms empty `Coherent_Paint`). Every
   case therefore carries this identical driver in both variants:

   ```js
   var t = 0;
   function frame() {
     t += 1;
     root.style.transform = 'translateX(' + (t % 3) + 'px)';
     requestAnimationFrame(frame);
   }
   requestAnimationFrame(frame);
   ```

   It forces a genuine full re-render rather than a cheap re-composite, and it
   costs the same in A and B, so it cancels in the ratio. If churn is the
   subject of the case, the churn replaces the driver, runs at a fixed scripted
   rate from page load, and is identical in A and B.

   **The duty-cycle trap.** The lab reports steady-state *medians*. A churn
   that fires rarely — once a second, on a timer, on a long cycle — puts its
   cost outside the median entirely: both variants report their idle frames and
   the lab returns a confident, false `NO RELIABLE DIFFERENCE`. If the real
   scenario is low-duty-cycle, raise the rate to every frame, mark the case
   `ADAPTED`, and say in `notes` what the ratio now means ("what pooling saves
   per refresh", not "what a damage-number system costs").
   `mount-unmount-vs-visibility` and `pool-vs-create` are both adapted this way.

7. **No randomness.** Fixed seeds, fixed data, fixed positions. Two runs of the
   same page must do identical work.

8. **Scale when count is the story.** If the cost plausibly scales with element
   count, provide `counts` (e.g. `[10, 30, 100]`) and generate the elements
   from the same inline loop in both pages. The count arrives as `?count=N` and
   is read off `location.search`; default to a sensible value so the page can
   still be opened by hand in the Player.

   Take this rule seriously — it is not decoration. `text-shadow-blur` shows
   **no measurable difference at 10 or 30 elements and 5.49× GPU at 100**. A
   case authored at a single small count would have concluded, wrongly, that
   blurred text shadows are free.

9. **Plain HTML/CSS/JS.** No frameworks in case pages — the lab measures the
   engine, not Solid.

10. **Name the expected axis.** `case.json.hypothesis` names the phase expected
    to move (GPU / Layout / Styles / Paint). A result on a *different* axis than
    hypothesized is interesting and worth a note, not a failure.

## `case.json`

```json
{
  "title": "Blurred text-shadow vs solid text-shadow",
  "variable": "blur vs solid shadow",
  "hypothesis": "GPU",
  "status": "DIRECT",
  "counts": [10, 30, 100],
  "labels": { "a": "solid", "b": "blur" },
  "claim": "What this case is evidence for or against, and where that claim lives.",
  "notes": "Applicability gate: DIRECT. text-shadow is supported... Rule 1: ..."
}
```

`counts`, `labels` and `claim` are optional. `labels` only names the columns in
the printed table; omit it and they print as A and B.

`claim` is where the citation lives. The lab's whole point is that assertions
should carry measurements, so name the assertion this case tests — a RAG doc
section (`07-performance.md, "Node Pooling for High-Frequency Elements"`), a
`perf_lint` rule, or the piece of common web advice being checked against
Gameface reality. Case IDs are cited *from* `results.md` and `case.json`; the
lab does not edit other repos' docs.

## The standard grid

Cases that lay out a field of elements use one shared geometry, so counts mean
the same thing across cases and everything stays on-screen at 300:

```js
var COLS = 20, CELL_W = 92, CELL_H = 68;   // 88x64 tiles
el.style.left = (16 + (i % COLS) * CELL_W) + 'px';
el.style.top  = (16 + Math.floor(i / COLS) * CELL_H) + 'px';
```

At 300 elements that fills 1852×1032 of the pinned 1920×1080 viewport with
nothing clipped, which is what rule 5 needs.

## Examples

**Good case — `text-shadow-blur`.** A and B are byte-identical except one CSS
line (`text-shadow: 1px 1px 0 #000` vs `0 2px 4px #000`). Identical `<div>`s
from the same loop, same strings, fixed positions, shared damage driver. The
diff between `A.html` and `B.html` is one line:

```
13c13
<     text-shadow: 1px 1px 0 #000;
---
>     text-shadow: 0 2px 4px #000;
```

**Bad case (rule 2).** Testing "gradient vs solid" where B also adds a wrapper
div to hold the gradient: now the case measures a div plus a gradient.
Restructure so both have the wrapper.

**Bad case (rule 3).** "CSS animation vs JS rAF" where A has no script tag at
all: script *presence* (V8 wakeups, timer machinery) pollutes the comparison.
Both pages carry the same script; A's animation path is simply not invoked — or
better, both define both paths and a single constant selects one.

**Bad case (rule 6).** A churn test that starts inserting on a
`setTimeout(…, 3000)`: half the trace window is idle. Churn starts at load,
fixed rate, both pages.

**Bad case (rule 6, the Gameface-specific one).** A decoration case with no
damage driver at all. Both variants hold still, the engine does no rendering
work, both report an absent GPU phase, and the lab reports
`NO RELIABLE DIFFERENCE` — a confident null result caused entirely by the case,
not by the engine.

## Reading a row

- Ratios are **B/A** of the steady-state median for that phase.
- A ratio in **(parentheses)** did not clear the guardrail — either it failed to
  beat the run-to-run noise, or the effect was smaller than 1.10×. It is not a
  finding, no matter how large it looks. A large parenthesised ratio means the
  measurement was too unstable to trust, not that the effect is big.
- The verdict names the phase that moved **furthest per frame**. When two phases
  move together the label can flip between counts of the same case —
  `box-shadow-blur` reads GPU-bound at 100 and Paint-bound at 300 because GPU
  and Paint are within a few percent of each other at both. Read the ratios, not
  just the verdict.
- The **`other`** column names a phase outside the printed columns that moved.
  Take it as seriously as the printed ones: `dom-depth-shallow-vs-deep` and
  `offscreen-node-count` are both dominated by
  `UpdateNodeTransforms` (7.5× and 11.0×) with every printed column flat. If a
  case you author reports `other`, that is where its cost actually lives.
- **GPU ratios deserve extra suspicion.** The Player alternates between full and
  half vsync rate depending on load, and GPU durations track the frame rate. The
  runner warns when the six runs of a row did not all hold the same rate. A
  GPU-only finding on a mixed-rate row is probably an artefact.
- A **dash** means the engine did no work in that phase in either variant.
- **`B-only` / `A-only`** means one variant does work in that phase that the
  other does not at all — a qualitative result, which is why it is not a number.
- Negative results carry the qualifier "no measurable difference *on this
  machine*". A strong desktop GPU hides costs a console would feel.
