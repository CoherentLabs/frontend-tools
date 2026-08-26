# 50 Common Web Patterns That Slow Performance

Reference list for the Gameface Perf Lab intake. These are the patterns as the *web* knows them — each one goes through the lab's applicability gate (DIRECT / ADAPTED / N-A) before becoming a case, because some rest on browser machinery cohtml doesn't have. That's the point: a documented N/A tells Gameface users which web advice to ignore.

## Layout & reflow
1. Animating layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`) instead of `transform`/`opacity` — re-runs layout every frame.
2. Layout thrashing: interleaving style writes with layout reads (`offsetWidth`, `getBoundingClientRect`) — forces synchronous reflow per read.
3. Triggering layout in scroll/pointer/resize handlers that fire at high frequency.
4. Deep DOM nesting — every layout/style pass traverses more nodes than the visuals need.
5. Huge DOM node counts (thousands of elements mounted at once, most off-screen).
6. Percentage/`auto` sizing chains that make every parent resize cascade into children.
7. Table layout (or `display: table`) for large data — whole-table reflow on cell changes.
8. `position: sticky`/complex containing-block chains recalculated on every scroll.
9. Viewport units (`vw/vh`) sprinkled through frequently-updated styles — re-resolved on viewport-dependent passes.
10. Reading layout inside a loop over many elements (per-item `getBoundingClientRect`).

## Paint & compositing
11. Large blur radii (`box-shadow`, `filter: blur`) — Gaussian cost scales with blurred area.
12. Blurred `text-shadow` on body text — per-glyph shadow rendering.
13. `filter` effects on large or frequently-changing elements — forces offscreen surface + filter pass per frame.
14. `backdrop-filter` — samples and processes the live backdrop every frame.
15. `mix-blend-mode` — non-source-over compositing, breaks simple layer merging.
16. Heavy overdraw: many stacked semi-transparent layers repainting the same pixels.
17. Gradients (especially radial/conic) repainted every frame on animated elements.
18. `clip-path`/`mask` on animated elements — path clipping per frame.
19. `border-radius` combined with shadows/filters on the same element — compound per-pixel cost.
20. Full-screen repaints caused by tiny changes (a moving element with huge bounds dirtying everything).
21. Oversized images scaled down in CSS — decode + sample cost for pixels never shown.
22. Animating `background-position`/`background-size` on large areas instead of transforming a layer.

## Selectors & style recalculation
23. Long descendant selector chains (`.a .b .c .d .e`) — matching walks ancestors per candidate.
24. Universal (`*`) and bare attribute selectors in hot rules — no fast-path bucketing by class.
25. Toggling classes on `<html>`/`<body>` — invalidates style for the entire tree.
26. Rewriting the full `class` string instead of toggling one class — broad re-match of the subtree.
27. Enormous stylesheets (thousands of rules) — every match consults a bigger rule set.
28. `:hover`/`:focus-within` rules with descendant effects on many elements — pointer movement triggers subtree recalcs.
29. Inline styles per element for shared looks — defeats rule sharing, bloats style data.
30. `!important` and specificity wars producing redundant overriding rules that all still match.
31. `@import` chains in CSS — serialized fetch + parse before styling can settle.
32. Structural pseudo-classes (`:nth-child`) on lists that change — sibling-dependent re-matching on every mutation.

## DOM manipulation & churn
33. `appendChild` in a loop instead of batching via `DocumentFragment` — N invalidations instead of one.
34. Mount/unmount for visibility toggling instead of `visibility`/class — full style+layout for the subtree every toggle.
35. `innerHTML +=` — re-parses and rebuilds the entire container content.
36. Rebuilding whole lists on data change instead of updating changed rows (no keying/diffing).
37. Destroying and recreating repeated elements instead of pooling/reusing them.
38. Writing to the DOM every frame when the underlying value changed less often (no dirty-check).
39. Moving nodes with re-append (remove+insert) when a transform/order swap would do.
40. MutationObserver / event handlers that themselves mutate, cascading invalidation waves.

## JavaScript & the main thread
41. Long tasks blocking the frame: heavy synchronous work in handlers instead of chunked/deferred work.
42. Per-frame allocations (closures, arrays, strings in rAF loops) — GC pauses land as frame spikes.
43. High-frequency timers (`setInterval` at 16ms) running regardless of visibility or need.
44. Unthrottled scroll/pointermove/resize handlers doing real work per event.
45. Synchronous `getComputedStyle` polling for values the code itself set.
46. String-building style updates (`el.style.cssText = ...` or style attribute rewrite) instead of targeted property writes.

## Assets, fonts, animation machinery
47. Many separate small images instead of a spritesheet/atlas — per-image state and upload overhead.
48. Web font loading without fallback strategy — layout shifts and re-rasterization when fonts arrive.
49. `transition: all` — accidentally animating expensive properties that were never meant to move.
50. Running hundreds of simultaneous CSS animations/transitions instead of animating a parent or using a single driver.

---
*Browser-specific honorable mentions that likely gate to N/A or ADAPTED in cohtml (test the assumption, don't assume it): `will-change` misuse creating excess compositor layers; missing `content-visibility`/`contain` on long pages; forced style flush via `requestAnimationFrame` misordering; layer explosion from 3D transforms. These exist because of browser compositor architecture — the gate decides whether cohtml has an equivalent mechanism at all.*

---

# Coverage map

Status per pattern. `COVERED` links an existing case; `CASE` names one authored
for this intake; `N/A` records a gate rejection with its evidence. Verdicts live
in `results.md` and `report.html` — this table only tracks *coverage*.

Gate evidence comes from the cohtml feature inventory
(`../gameface-unsupported-features/results/`) **plus direct probing of the
Player**, because the inventory has been wrong in both directions here:
`DocumentFragment`, `MutationObserver` and `ResizeObserver` are all flagged
missing but exist, and `url()` is flagged unsupported when its own evidence says
"treat as present". Nothing below is marked N/A on inventory alone.

## Layout & reflow

| # | Pattern | Status |
|---|---|---|
| 1 | Animating layout properties | **COVERED** — `animate-width-vs-scalex`, `animate-translate-vs-position` — B introduces Layout work that A never does |
| 2 | Layout thrashing (write/read interleave) | **MEASURED — NOT CONFIRMED.** `layout-read-interleave`: no reliable difference at 30/100/300 |
| 3 | Layout in high-frequency handlers | **DEFERRED** → folded into #44, same underlying question |
| 4 | Deep DOM nesting | **MEASURED — CONFIRMED, badly.** `dom-depth-shallow-vs-deep`: `UpdateNodeTransforms` **3.48× / 5.35× / 7.50×** |
| 5 | Huge offscreen node counts | **MEASURED — CONFIRMED, badly.** `offscreen-node-count`: `UpdateNodeTransforms` **2.90× / 4.84× / 10.95×**, Styles up to 4.60× |
| 6 | Percentage/auto sizing chains | **MEASURED — NOT CONFIRMED.** `percentage-vs-fixed-sizing`: no reliable difference at any count |
| 7 | Table layout for large data | **N/A** — every `display:table*` value is rejected by cohtml |
| 8 | `position: sticky` chains | **N/A** — `sticky` rejected; only absolute/fixed/relative/static exist |
| 9 | Viewport units in hot styles | **CONFIRMED — verdict changed.** `transform-vw-vs-px`: Script 1.18× / **1.70×** / 1.48×. Originally recorded as refuted; see below |
| 10 | Reading layout in a loop | **MEASURED — CONFIRMED, differently.** `layout-read-in-loop`: Script **1.91× / 2.41× / 4.21×**, Layout untouched |

### What batch 1 settled

- **Deep nesting and offscreen nodes are the two real costs here**, and both hide
  in the same place: `Coherent_UpdateNodeTransforms`, the per-frame scene-graph
  walk. Neither shows up in GPU, Paint, Layout, Styles or Script. Mounting 3000
  offscreen nodes costs **11× the transform walk** — cohtml lays out and walks
  what it will never draw, so virtualising a long list is worth real time.
- **Layout thrashing is a myth in Gameface.** Interleaving reads and writes costs
  nothing (#2), because there is no synchronous reflow to force. But reading
  geometry is *not* free — it costs **JS-thread time** (#10, up to 4.21× Script)
  while inducing **zero** extra layout. The web's rule ("batch your reads") is
  pointless here; the useful rule is "don't read geometry at all in a loop".
- **Percentages are free.** No measurable difference against fixed px. The RAG
  warning about sizing is about *auto*-sizing, not relative units.

> **A null is only as good as the instrument — #9 changed verdict.**
> `transform-vw-vs-px` was measured in the original four-column sweep and
> recorded here as *no measurable difference*. It was wrong. Adding the **Script**
> column for the JS batch revealed **1.70×** at 100 elements, with every
> rendering phase still flat: resolving a viewport-relative length costs
> JS-thread time and never touches GPU, Paint, Layout or Styles. The row read as
> refuted for as long as the lab lacked the axis the cost lived on.
>
> This is the concrete argument for `--rederive`. Every row is rebuilt from
> stored traces whenever the instrument improves, so a finding the lab could not
> previously see appears everywhere at once rather than only in new cases.

> **Gate finding that reshapes #2, #3 and #10.** cohtml does **not** force a
> synchronous layout on a geometry read. Probed directly: after
> `el.style.width = '400px'`, both `getBoundingClientRect().width` and
> `offsetWidth` still return the old value, and the new one appears a frame
> later. The forced-reflow mechanism the web antipattern depends on does not
> exist here. That makes read/write interleaving a **correctness** hazard rather
> than a performance one — ported code that reads back what it just wrote gets
> stale numbers, silently.
>
> **This generalises beyond geometry.** Probing again while authoring batch 2:
> `getComputedStyle` is stale in the same way. Write `el.style.filter =
> 'blur(11px)'` and computed style still reports `blur(4px)`; the same holds for
> `clip-path`, `background-position`, `mix-blend-mode` and `backdrop-filter`.
> All of them report the new value once frames have passed. The inline value
> (`el.style.filter`) updates immediately and comes back engine-normalised
> — `clip-path` reads back as `border-box polygon(nonzero, …)` — which is how you
> can tell a write was accepted rather than ignored.
>
> Two consequences: **read `el.style.*`, never `getComputedStyle`, to confirm
> your own writes**; and any lab case that drives a property from JS must have
> that property's write verified before the case is trusted, or a silently
> ignored write produces a confident false null.

## Paint & compositing

| # | Pattern | Status |
|---|---|---|
| 11 | Large blur radii | **COVERED** — `box-shadow-blur`, `box-shadow-baked` |
| 12 | Blurred `text-shadow` | **COVERED** — `text-shadow-blur` (5.61× GPU at 100 elements) |
| 13 | `filter` on large/changing elements | **MEASURED — CONFIRMED, wrong axis.** `filter-blur-animated`: **Styles 11.81×**, GPU flat |
| 14 | `backdrop-filter` | **MEASURED — CONFIRMED, worst in the lab.** `backdrop-filter-vs-none`: GPU **10.93×**, Paint 9.75× at only 100 panels |
| 15 | `mix-blend-mode` | **MEASURED — CONFIRMED.** `mix-blend-mode-vs-normal`: GPU 2.01× / 4.33× / **7.01×** |
| 16 | Heavy overdraw | **MEASURED — CONFIRMED, linear.** `overdraw-layers`: GPU 1.81× at 5 layers, **3.22×** at 10 |
| 17 | Gradients repainted per frame | **MEASURED — NOT CONFIRMED.** `gradient-radial-vs-linear` and `gradient-conic-vs-linear`: no difference at any count |
| 18 | `clip-path`/`mask` animated | **MEASURED — CONFIRMED, wrong axis.** `clip-path-animated-vs-static`: **Styles 11.56×**, Paint flat |
| 19 | `border-radius` + shadow compound | **MEASURED — CONFIRMED, mild.** `radius-shadow-compound`: GPU 1.67× / 1.56× |
| 20 | Full-screen repaint from a small change | **MEASURED — CONFIRMED, badly.** `damage-area-small-vs-large`: GPU 4.21× / 8.76× / **10.86×** |
| 21 | Oversized images scaled down | **MEASURED — NOT CONFIRMED** per-frame. `image-oversized-vs-sized`: no difference. Memory cost untested |
| 22 | Animating `background-position`/`size` | **MEASURED — MARGINAL.** `bg-position-vs-transform`: Script ~1.35×, verdict flips between counts |

### What batch 2 settled

- **`backdrop-filter` is the most expensive thing in the lab.** GPU **10.93×** at
  100 panels — and that is a *lower bound*: in the Player the backdrop is the
  page's own gradient, where a shipping game composites the live 3D scene. RAG
  `05-graphics.md` recommends it for pause menus without a price attached; this
  is the price. `mix-blend-mode` is the runner-up at **7.01×**.
- **Element bounds are a repaint budget.** A full-width mover costs **10.86×** a
  small one for the same movement (#20). This is the batch's most *invisible*
  cost: a stretched wrapper or full-width row background that animates drags its
  whole area through repaint, and nothing in the markup looks wrong.
- **Gradient type is free.** Radial and conic cost exactly what linear costs, at
  every count. The web's "especially radial/conic" warning does not transfer —
  but `gradient-clip-baked` still showed a *live gradient* is 15× a baked texture
  in Paint, so the advice to bake stands; the choice of gradient function does not
  matter.
- **Oversized textures are free per frame.** Sampling a 4× texture down costs
  nothing measurable. The memory charge (16× the GPU footprint) is real and
  untested here — a null on this row is not a licence to ship oversized art.

### ~~The cross-case finding: per-element style writes dominate~~ — REFUTED

After batch 2 the lab inferred, across five cases, that "the expensive thing is
the per-element inline style write itself, whatever property it targets", and
flagged it as an inference needing a dedicated case. `style-write-scope` was that
case. **It refuted the inference**, and the correction is more useful than the
original claim was.

Measured at 300 elements, all invalidating the same 300 tiles every frame:

| How the restyle is applied | Styles | Script |
|---|---|---|
| Nothing invalidated (baseline) | 0.052 ms | 0.086 ms |
| N inline writes, cheap property (`background`) | 0.293 ms | 0.354 ms |
| N inline writes, visual property (`filter`) | 0.614 ms | 0.161 ms |
| 1 parent class change → descendant re-match | 0.633 ms | 0.088 ms |
| N leaf class toggles | 0.652 ms | 0.188 ms |
| 1 `<body>` class toggle | 0.648 ms | 0.091 ms |

**What actually governs styling cost is how many elements get invalidated per
frame.** Going from invalidating nothing to invalidating everything is a 6–12×
jump; that is the whole of the 11.81× and 11.56× results, not the write
mechanism. Two smaller terms modulate it:

- **Mechanism, ~2×.** An inline write is the *cheapest* way to invalidate many
  elements — it sets the property directly and skips selector matching. A
  selector-driven restyle costs about twice as much per element. The original
  inference had this exactly backwards.
- **Property, ~2×.** A visual-effect property (`filter`) costs roughly twice a
  flat one (`background`) for the same invalidation count.

And *where* the triggering change sits does not matter at all: one `<body>`
toggle, one parent-class change and N leaf toggles all land within a few percent
of each other, because all three invalidate the same 300 elements.

The actionable rule for Gameface: **reduce how many elements you restyle per
frame.** If you must touch many, an inline write is cheaper on the style thread
than a selector-driven restyle, paid for in JS time.

## Selectors & style recalculation

| # | Pattern | Status |
|---|---|---|
| 23 | Long descendant chains | **COVERED** — `selector-descendant-vs-flat` (flat 1.10× Styles at every count) |
| 24 | Universal/attribute selectors | **MEASURED — CONFIRMED, biggest selector effect.** `selector-universal-vs-class`: Styles 2.41× / 2.65× / **2.82×** |
| 25 | Class toggles on `<html>`/`<body>` | **MEASURED — REFUTED, and inverted.** `class-toggle-body-vs-leaf`: Styles flat, Script **0.48×** — the body toggle is *better* |
| 26 | Rewriting the full class string | **COVERED** — `class-string-vs-classlist` (no measurable difference) |
| 27 | Enormous stylesheets | **MEASURED — NOT CONFIRMED.** `stylesheet-size-200-vs-5000`: 25× the rules, no difference |
| 28 | `:hover`/`:focus-within` descendant rules | **MEASURED — CONFIRMED, scales.** `hover-rules-many-vs-none`: Styles 1.16× at 100, **2.47×** at 300, under a real pointer sweep. `:focus-within` is **N/A** |
| 29 | Inline styles vs shared class | **MEASURED — NOT CONFIRMED.** `inline-style-vs-class`: no difference at any count |
| 30 | `!important` / specificity wars | **MEASURED — CONFIRMED.** `important-specificity`: Styles ~**2.0×**, flat in element count |
| 31 | `@import` chains | **N/A — and it fails silently.** See below |
| 32 | `:nth-child` on changing lists | **MEASURED — NOT CONFIRMED.** `nth-child-churn`: no difference while reordering every frame |

> **`@import` does not work in cohtml, and says nothing about it.** Probed
> directly: a `<link>`ed stylesheet applies (`height: 77px` ✓) but a rule reached
> through `@import` does not (`width` stays `auto`, not `123px`), with **no
> warning in the Player log**. The performance antipattern is moot; the
> correctness trap is not. Any build step that relies on `@import` to assemble a
> stylesheet produces a page that silently loses those rules.

> `:not()` **throws** in `querySelector` ("Invalid CSS selector"). `:nth-child`
> works fine despite being absent from the feature inventory.

### What batch 3 settled

The selector rules that survive contact with Gameface are narrower than the web's:

- **Stylesheet size is free; a bad subject is not.** 5000 rules cost the same as
  200 when the extra rules match nothing (#27) — cohtml indexes rules by subject.
  But defeating that index with `* [data-k]` costs **2.82×** (#24), and rules that
  match and then *lose* a specificity war cost **2.0×** (#30). Grow the design
  system freely; keep a class in the subject position and stop writing
  `!important` chains.
- **Two more web rules don't transfer.** `:nth-child` on a list reordering every
  frame costs nothing (#32), and static inline styles cost nothing against a
  shared class (#29).
- **#25 is inverted.** Toggling one class on `<body>` is not a global-invalidation
  trap — it invalidates the same elements as N leaf toggles, at the same styling
  cost, for **1/300th** the JS. In Gameface it is the better technique, not the
  worse one.

## DOM manipulation & churn

| # | Pattern | Status |
|---|---|---|
| 33 | `appendChild` loop vs `DocumentFragment` | **COVERED** — `appendchild-vs-fragment` (**not confirmed**: no measurable difference) |
| 34 | Mount/unmount vs `visibility` | **COVERED** — `mount-unmount-vs-visibility` (unmount introduces Layout work) |
| 35 | `innerHTML +=` | **MEASURED — CONFIRMED, quadratic.** `innerhtml-append-vs-appendchild`: Script 2.53× / 8.49× / **36.63×**; 20.6 ms/frame at 100 items |
| 36 | Rebuilding lists vs updating rows | **MEASURED — CONFIRMED, biggest ratio in the lab.** `list-rebuild-vs-update`: Styles 13.17× / 26.82× / **81.88×** |
| 37 | Destroy/recreate vs pooling | **COVERED** — `pool-vs-create` (8.19× Styles at 300) |
| 38 | Writing the DOM every frame without dirty-check | **MEASURED — CONFIRMED.** `dom-write-dirty-check`: Styles 1.70× / 3.35× / **5.64×** |
| 39 | Moving nodes by remove+insert | **MEASURED — REFUTED.** `move-node-vs-transform`: the DOM move is *cheaper* (frame 0.120 ms vs 0.144 ms) up to 60 rows |
| 40 | MutationObserver cascades | **MEASURED — CONFIRMED, mild.** `mutation-observer-cascade`: Script 1.25× / 1.39× / **1.58×** |

### What batch 4 settled

This batch produced the two largest effects in the whole lab, and both are
*structural* — they are about how much work a render does, not which CSS feature
it uses.

- **`innerHTML +=` is quadratic and ruinous.** At 100 items it spends **20.6 ms
  per frame** on the JS thread against 0.563 ms for `appendChild` — two thirds of
  a 31 ms frame budget on one list. A phase no other case has produced,
  `Coherent_BuildDOM`, appears only in the `innerHTML` variant, and it is just
  0.085 ms. That locates the cost exactly: **parsing is cheap; serialising the
  whole container back to a string on every append is not.**
- **Rebuilding a list beats everything else for waste.** One changed row in a
  300-row list costs **81.88× the styling** if you redraw all of them (≈4 ms/frame
  against ≈0.3 ms). This is the lab's strongest argument for keyed/diffing
  rendering in Gameface.
- **The engine will not dirty-check for you.** Writing the same `textContent`
  back is *not* short-circuited, so an unconditional render loop invalidates ten
  times as many elements as a guarded one (#38). This independently confirms the
  corrected batch-3 model: styling cost tracks how many elements you invalidate.
- **#39 is refuted, with a caveat.** Moving a node is *cheaper* than transforming
  N rows — the reflow it triggers costs less than the per-element writes it
  avoids. But flow layout caps this at 60 rows on a 1080-tall screen, and one
  `appendChild` reflowing 60 rows is cheap; the balance could invert for a much
  longer list, which this row does not test.
- **MutationObserver is affordable.** ~25–60% more JS time than calling the same
  code directly — a real price for decoupling, but trivial next to the two
  structural findings above.

## JavaScript & the main thread

Untestable until now: these land on the JS thread, not on GPU/Paint/Layout/Styles.
The lab now prints a **Script** column (`Coherent_ExecuteTimers`) so this whole
group can be measured.

| # | Pattern | Status |
|---|---|---|
| 41 | Long tasks blocking the frame | **MEASURED — CONFIRMED.** `long-task-chunked-vs-burst`: frame spike 1.3→11.7 and 1.5→**30.7×**. Medians say the opposite — read the spike |
| 42 | Per-frame allocations / GC spikes | **MEASURED — NOT CONFIRMED.** `per-frame-allocation`: Script flat; spike cleared the gate at 100 only |
| 43 | High-frequency timers | **MEASURED — NOT CONFIRMED.** `timer-vs-raf`: no difference, because **cohtml clamps timers to the frame rate** |
| 44 | Unthrottled scroll/pointer/resize handlers | **MEASURED — CONFIRMED.** `pointer-handler-throttled`: **JSEvent 5.29×** at 300. Absorbs #3 |
| 45 | `getComputedStyle` polling | **MEASURED — CONFIRMED, and it is also a bug.** `getcomputedstyle-polling`: Script **2.00×**, and the value read back is stale |
| 46 | `cssText` / style-attribute rewriting | **MEASURED — CONFIRMED.** `csstext-vs-property-writes`: Script 1.93× / 2.66× / **3.58×**, Styles ~1.9× |

### What batch 5 settled

- **`setInterval` is clamped to the frame rate.** A 16 ms timer fires **159 times
  in 5 s — identical to rAF**, not the ~312 a real 16 ms timer would give. Timers
  are serviced once per frame inside `Coherent_ExecuteTimers`, so you cannot
  schedule work between frames at all. `setInterval(fn, 16)` and a rAF loop are
  the same thing here, and lowering the interval below frame time buys nothing.
  (The other half of #43 — a timer still running when the UI is hidden — is real
  and untested.)
- **Object allocation is not worth optimising at these rates.** Fresh arrays and
  objects every frame cost no measurable JS time against a recycled pool. The GC
  spike appeared at one count and not its neighbours, which is exactly the shape
  the size gate exists to distrust.
- **`getComputedStyle` polling is a bug before it is a cost.** 2.00× Script *and*
  the value returned is from the previous frame. The recommendation does not
  depend on the ratio.
- **`cssText` is the one JS-batch case where web advice, Gameface's own RAG docs
  and the measurement all agree** — 2–3.5× more Script than targeted property
  writes.

### Two ways this batch tested the lab itself

**#41 caught a bug in the frame-spike metric.** The first version only consulted
the spike when no median phase had cleared the guardrail. So the burst variant —
genuinely cheaper on nine frames in ten — published the verdict *"B costs less
(Script)"* with **30.7×** sitting in the spike column beside it. The lab was
recommending the antipattern in its own table. A case declaring
`metric: "frame-spike"` now has the spike decide its verdict outright.

**#44 vindicated the all-phase verdict.** Its Script ratios are **0.40× / 0.28× /
0.10×** — the unthrottled handler looks four to ten times *faster*. The work
didn't get cheaper; it moved. Handler work is accounted to `Coherent_JSEvent`,
not `Coherent_ExecuteTimers`, and JSEvent reads **1.68× / 2.59× / 5.29×**. Judged
on the printed columns alone — as the lab did before batch 1 — this row would
have concluded the antipattern was the faster option.

## Assets, fonts, animation machinery

| # | Pattern | Status |
|---|---|---|
| 47 | Many small images vs a spritesheet | **MEASURED — CONFIRMED at scale only.** `many-images-vs-spritesheet`: nothing at 30/100, Paint **1.69×** at 300 |
| 48 | Web font loading without fallback | **NOT MEASURABLE** by this protocol — see below |
| 49 | `transition: all` | **MEASURED — NOT CONFIRMED.** `transition-all-vs-specific`: no difference at any count |
| 50 | Hundreds of simultaneous animations | **MEASURED — CONFIRMED, with a trade-off.** `many-animations-vs-one`: Styles 2.00× / 3.96× / **6.77×**, but GPU runs the other way at low counts |

> **~~`transition: all` is likely worse in Gameface than on the web~~ — WRONG.**
> The probe behind that prediction was correct: `transition: all` really does
> expand to **45+ properties** in cohtml, including `filter`, `backdrop-filter`,
> `box-shadow` and `clip-path`. The inference from it was not. The engine pays
> per property with a transition *in flight*, not per property *declared*, so
> the other 44 cost nothing. `transition: all` is a correctness and maintenance
> hazard — it will animate something you did not mean to move — but this lab
> found no evidence for the performance claim.

> **#48 is outside what this lab can see.** `@font-face` works — a custom face
> measured 285.3px against the fallback's 336.0px for the same string. But
> `document.fonts` is **`undefined`**, so the Font Loading API that a fallback
> strategy is normally built on does not exist in cohtml. The antipattern itself
> is a *load-time* effect: layout shifts once, when the font arrives. The lab
> discards a 2 s warmup and measures 5 s of steady state, and unlike #41's
> periodic bursts a font swap happens exactly once — so neither the median nor
> the frame-spike metric can catch it. Recorded rather than forced into a case
> that would measure nothing. Worth noting the missing API makes this *harder*
> to handle in Gameface than on the web, not easier.

### What the last batch settled

- **Atlasing earns its keep only at density.** No difference at 30 or 100 tiles;
  1.69× Paint at 300. Worth the pipeline work for inventory grids and icon walls,
  not for a HUD with a few dozen sprites. The row measures steady-state drawing
  only — texture memory and Instaload entries are extra costs it cannot see.
- **#50 is real but conditional, and the antipattern's advice is incomplete.**
  N animations cost 6.77× the styling of one. But animating the *parent* moves a
  full-screen container, dirtying the whole viewport every frame — the same
  effect #20 measured at 10.86× — so at 30 elements the parent animation costs
  **5× the GPU** (0.560 ms vs 0.110 ms). The two cross over as the count rises.
  Animate the parent when the set is large; animate elements when the set is
  small and the parent covers far more screen than its children.

## Honorable mentions

| Pattern | Status |
|---|---|
| `will-change` layer misuse | **N/A** — "Unsupported CSS property detected (stylesheet parser)" |
| `content-visibility` | **N/A** — unsupported property |
| `contain` | **NOT RUN** — outside the 50; *is* supported (`layout paint` computes), so it would need a case of its own |
| Forced style flush via rAF misordering | **N/A** — there is no synchronous style/layout flush to misorder (see the #2 finding) |
| Layer explosion from 3D transforms | **NOT RUN** — outside the 50; `translate3d` is supported, so it is testable if wanted |
| `IntersectionObserver` lazy rendering | **N/A** — `IntersectionObserver` is `undefined` |
