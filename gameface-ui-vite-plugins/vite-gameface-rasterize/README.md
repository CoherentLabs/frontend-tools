# vite-gameface-rasterize

Write normal CSS. Ship textures.

cohtml pays a per-frame cost for `box-shadow`, `filter`, gradients and rounded fills, which is
why the Gameface guide tells you to avoid them. This plugin lets you use them anyway: at build
time it renders each marked element **in the Gameface Player itself**, saves the decoration as
a texture, and replaces the expensive CSS with an image the engine draws as a textured quad.
Your text, children, bindings and event handlers stay live DOM.

The output is verified against the original in the engine, so "pixel-identical" is a claim the
tool can actually check.

```html
<div class="panel" data-rasterize>
    <h2>Squad status</h2>
    <p>This text is still text.</p>
</div>
```

```ts
// vite.config.ts
import rasterize from 'vite-gameface-rasterize';

export default defineConfig({
    plugins: [rasterize()],
});
```

That is the whole integration. `GAMEFACE_PATH` in your `.env` points at the Player; the plugin
does the rest on `vite build` and leaves `vite dev` completely alone.

## What it costs and what it buys

Measured on the included stress example - 60 cards, each a rounded box with a
`0 20px 120px 30px` shadow, at 1920x1080 on cohtml 3.2.0.2, with the grid invalidated every
frame so the decorations genuinely re-render. Numbers are the `Coherent_GPU` trace event,
median over ~190 frames, reproducible across runs:

| Variant | GPU p50 | GPU p95 | Paint p50 |
|---|---|---|---|
| live CSS | 3.277 ms | 3.284 ms | 0.177 ms |
| baked | **2.182 ms** | **2.193 ms** | 0.149 ms |

**33% less GPU time per frame**, for 3.5 MB of VRAM - and all 60 cards share one texture,
because identical decorations bake once. The build summary prints that trade every time, so it
is never implicit:

```
rasterize cohtml 3.2.0.2 - scale 2x
  div-card-8608cb57  flat    1024x884    82.2 KB on disk     3.5 MB vram

  1 asset  3.5 MB vram of 32.0 MB budget  0 cached, 60.1s
```

Note that `box-shadow` on a *static* page is close to free on this engine - cohtml repaints
dirty regions only, so a shadow nothing disturbs is not redrawn. The win appears exactly where
you would expect it: when the UI moves.

## Modes

| Mode | What it bakes | When |
|---|---|---|
| `slice` | Decoration captured at a canonical size, emitted as a 9-slice | Any element whose size is decided at runtime |
| `flat` | Decoration captured at the element's own size, one image | Fixed-size elements |
| `element` | An entire subtree flattened into one image, with dynamic and interactable parts kept live and pinned on top | Nameplates, cards, HUD panels - deep static wrapper trees |
| `auto` | `flat` if the CSS declares a fixed size, otherwise `slice` | The default |

Element mode is the one that changes the shape of your DOM: in the demo, a nameplate's wrapper
hierarchy collapses to one image plus the three nodes that actually needed to stay live - the
bound name, the HP fill, and the report button.

## Every build checks itself

The failure modes that matter here are silent: a texture that never reached the DOM, one that
landed in the wrong place, one that is a picture of nothing. All three render as a page that
loads. So every build ends by rendering itself twice - as shipped, and with the generated tags
stripped out - and writing both plus their difference to `rz/report/`:

```
  index.html  16/17 textured  0.11% of pixels differ  rz/report/index.html.png
```

Three panels, keyed by a colour stripe: green is live CSS, blue is what shipped, red marks where
they disagree. Two extra page loads, and it is the only check that sees the page whole.

Alongside it, three assertions that need no extra work:

- **every marked element resolved to a texture** - counted in the built page, in the engine, with
  each miss named and explained ("its key is shared by 5 bakes and none of their ancestor classes
  matched")
- **no asset is a picture of nothing** - an empty capture is refused rather than shipped, so the
  element keeps the live CSS that was working
- **no two assets are the same image** - and the message names which part of the bake key split
  them

## Verification

```shell
npx gameface-rasterize verify dist --json rz/verify.json
```

Renders every baked asset twice in the Player and compares them with SSIM plus a maximum-delta
guard, slice assets stretched to three sizes. The work is per unique asset rather than per element
using one - sixty cards sharing a texture ask one question, not sixty - and each page is loaded
once per route, which is what makes it usable on a real UI.

## Dev tells you what the build would do

`vite dev` still renders live CSS untouched. It also injects an overlay - press **F9** - that
classifies every marked element the way the build would, in the page, with no Player launch and no
bake:

- **green** shares a texture, and with how many others
- **amber** gets its own, and what differs from its lookalikes
- **red** will not match at runtime, and why
- **grey** has nothing worth baking

It updates as you edit, so "will these forty nameplates share one texture" is answered while you
are in the CSS rather than two minutes later. `__rzOverlay.report()` returns the same data.

## Commands

```shell
npx gameface-rasterize bake dist        # capture and write textures into a built output
npx gameface-rasterize check dist       # plan and report only; no captures, no writes
npx gameface-rasterize check --url http://localhost:5173   # same, against a running dev server
npx gameface-rasterize verify dist      # baked vs live, in the engine
npx gameface-rasterize measure dist     # GPU time per frame, live against baked
```

## Measuring it

Frame time cannot see this plugin. The Player paces frames at a fixed cap, so an empty page and a
page full of blurred shadows both read ~31 ms, and the natural measurement returns "no change" for
any page. `gameface-rasterize measure` reads the engine's own `Coherent_GPU` trace instead, alternates
which variant runs first, repeats, and reports the spread:

```
live CSS  GPU p50 3.29 ms +/- 0.01    baked  GPU p50 2.19 ms +/- 0.00   -33.4% (n=4)
```

## Documentation

- [Getting started](./docs/getting-started/index.mdx)
- [Pause JavaScript-driven motion for the bake](./docs/getting-started/pausing-motion.mdx) - the
  largest single source of un-baked elements on a game HUD
- [Authoring for the bake](./docs/concepts/authoring.mdx) - the five rules, and why they follow
  from how the pipeline works
- [Measuring what the bake bought](./docs/concepts/measuring.mdx)
- [Looking at a baked page](./docs/concepts/looking-at-a-baked-page.mdx)
- [The attribute contract](./docs/concepts/attribute-contract.mdx)
- [Element mode](./docs/concepts/element-mode.mdx)
- [Diagnostics](./docs/concepts/diagnostics.mdx)
- [Configuration](./docs/api/configuration.mdx)
- [How it works, and what cohtml made us do differently](./docs/concepts/engine-notes.mdx)

## Examples

- `examples/demo` - one page covering every mode and every interesting diagnostic
- `examples/regressions` - the shapes that used to fail silently: variants selected through an
  ancestor, identical decorations under per-element transforms, an element transparent until the
  game shows it, a spinning one, one that genuinely cannot be captured, and a class that arrives
  after mount
- `examples/stress` - the benchmark behind the numbers above (`node generate.mjs 60`, bake,
  then `node measure.mjs <dist>`)
