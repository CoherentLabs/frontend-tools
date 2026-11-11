# Changelog

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/vite-gameface-rasterize/changelog/

## 1.0.0

- Decoration baking for `flat` and `slice` modes in the Gameface Player.
- `element` mode for flattening a whole subtree into one image while keeping data-bound, animated, and interactable descendants live.
- State variants for `hover`, `active`, `focus`, `disabled`, and `class:<name>`.
- Content-addressed caching keyed by decoration, size, scale, state list, engine version, and contract version.
- Optional WebP companions, texture budget reporting, and a build summary showing the VRAM trade.
- A dev overlay for classifying marked elements without a full bake, plus `check` and `measure` commands for planning and benchmarking.
- Decorations are drawn as a `::before` on the marked element, with no child nodes, no attributes, and no JavaScript required for standard bakes.
- Element mode flattened directly into the built HTML, with runtime subtree flattening supported when needed.
- Selector-based matching so runtime class changes do not break a stable texture match.
- `filter` and `mask-image` baked in when nothing live remains, and kept live when they still need to affect content or the subtree (RZ025).
- Full build validation that compares the shipped page to the unbaked version and writes the result to `rz/report/` (RZ023).
- Marked elements that never received a texture are reported (RZ022).
- Empty or clipped captures are refused instead of shipped (RZ019).
- Duplicate byte-identical assets under different ids are reported (RZ021).
- `rz/rasterize.diagnostics.json` containing the full diagnostic set for every affected element.
- `verify` support for CI runs, with decoration assets intentionally refusing validation rather than reporting a false pass.
- Rejection of unsupported combinations such as `mix-blend-mode` and `backdrop-filter` (RZ001).
- Diagnostics coverage for known compatibility and runtime edge cases (RZ001–RZ026).
