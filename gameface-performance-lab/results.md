# Results

One row per completed (case, count), appended by `run.js`. Never edit by hand -
re-running a case appends a new row and the old ones stay, because they are the
history and a free engine-version comparison later.

Ratios are B/A of the steady-state median for that phase. A ratio in
(parentheses) did not clear the noise guardrail and is not a finding. A dash
means the engine did no work in that phase in either variant.

The "other" column names any phase outside the printed set that moved - the
per-frame scene-graph walk lives there, and a case can be dominated by it while
every printed column stays flat.

The "fps" column is the frame rate the row was measured at. It is load-bearing:
the Player alternates between full and half vsync, and Coherent_GPU is NOT
emitted at all in the fast mode - so a row measured at 64 shows no GPU phase and
cannot be compared against one measured at 32.

The "spike" column is A->B frame jitter, as max/median of the main-thread frame.
1.0 means every frame cost the same; a large number means the work arrives in
bursts. Medians cannot see a hitch, so this is the column that can.

| case | count | variable | GPU | Paint | Layout | Styles | Script | other | spike | verdict | engine | fps | date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| animate-translate-vs-position | 30 | transform translateX vs left animation | (0.96x) | (0.85x) | B-only | (1.08x) | (0.91x) | UpdateNodeTransforms A-only | (6.2->6.7) | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| animate-translate-vs-position | 100 | transform translateX vs left animation | (1.13x) | (0.89x) | B-only | (1.03x) | 0.89x | UpdateNodeTransforms A-only | 2.5->4.1 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| animate-translate-vs-position | 300 | transform translateX vs left animation | (1.03x) | 0.69x | B-only | (1.03x) | 0.77x | UpdateNodeTransforms A-only | (2.6->2.6) | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| animate-width-vs-scalex | 30 | transform scaleX vs width animation | (0.83x) | (0.96x) | B-only | (1.10x) | (0.95x) | UpdateNodeTransforms A-only | (6.5->5.3) | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| animate-width-vs-scalex | 100 | transform scaleX vs width animation | (1.19x) | 0.83x | B-only | (1.00x) | (1.03x) | UpdateNodeTransforms A-only | 6.0->2.0 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| animate-width-vs-scalex | 300 | transform scaleX vs width animation | (1.00x) | 0.67x | B-only | (1.04x) | 0.65x | UpdateNodeTransforms A-only | 2.5->5.0 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-21 |
| appendchild-vs-fragment | 30 | DocumentFragment batch insert vs per-node appendChild | (0.90x) | (0.99x) | (1.00x) | (0.97x) | (0.94x) | -- | (6.2->6.1) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-21 |
| appendchild-vs-fragment | 100 | DocumentFragment batch insert vs per-node appendChild | (1.00x) | (1.00x) | (1.00x) | (1.02x) | (1.13x) | JSEvent 1.20x | (9.3->9.4) | B costs more (JSEvent) | 3.2.0.2 | 32 | 2026-08-21 |
| appendchild-vs-fragment | 300 | DocumentFragment batch insert vs per-node appendChild | (0.90x) | (0.94x) | (1.07x) | (1.04x) | (0.94x) | RecalcVisualStyle 1.13x | (5.5->5.1) | B costs more (RecalcVisualStyle) | 3.2.0.2 | 32 | 2026-08-21 |
| backdrop-filter-vs-none | 10 | backdrop-filter: blur(8px) vs none | 3.28x | 2.19x | -- | 1.56x | (1.00x) | RecordRendering 2.33x | (1.6->1.6) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| backdrop-filter-vs-none | 30 | backdrop-filter: blur(8px) vs none | 4.98x | 3.83x | -- | 2.06x | (1.01x) | RecordRendering 4.27x | (1.7->1.6) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| backdrop-filter-vs-none | 100 | backdrop-filter: blur(8px) vs none | 10.93x | 9.75x | -- | 4.69x | (1.06x) | RecordRendering 6.42x | (1.5->1.8) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| bg-position-vs-transform | 30 | background-position animation vs transform translate | (1.15x) | (0.98x) | -- | 1.20x | (1.08x) | UpdateNodeTransforms A-only | (6.6->3.7) | A introduces UpdateNodeTransforms work | 3.2.0.2 | 32 | 2026-08-25 |
| bg-position-vs-transform | 100 | background-position animation vs transform translate | (0.91x) | (1.05x) | -- | 1.35x | 1.36x | UpdateNodeTransforms A-only | 2.1->4.6 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| bg-position-vs-transform | 300 | background-position animation vs transform translate | (0.93x) | (1.02x) | -- | 1.25x | 1.35x | UpdateNodeTransforms A-only | (2.3->3.5) | A introduces UpdateNodeTransforms work | 3.2.0.2 | 32 | 2026-08-25 |
| box-shadow-baked | 30 | baked shadow texture vs live box-shadow | (1.04x) | (0.98x) | -- | (0.97x) | (1.03x) | RecordRendering 1.18x | (1.5->1.8) | B costs more (RecordRendering) | 3.2.0.2 | 32 | 2026-08-21 |
| box-shadow-baked | 100 | baked shadow texture vs live box-shadow | (0.98x) | 1.13x | -- | (1.00x) | (1.05x) | RecordRendering 1.30x | (1.5->1.5) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| box-shadow-baked | 300 | baked shadow texture vs live box-shadow | (1.06x) | 1.26x | -- | (1.08x) | 1.11x | RecordRendering 1.25x | (1.6->1.7) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| box-shadow-blur | 30 | blurred box-shadow vs none | (0.93x) | 1.16x | -- | (1.00x) | (1.01x) | RecordRendering 1.33x | (1.6->1.4) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| box-shadow-blur | 100 | blurred box-shadow vs none | 1.65x | 1.46x | -- | 1.24x | (1.01x) | RecordRendering 1.56x | (1.6->1.4) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-21 |
| box-shadow-blur | 300 | blurred box-shadow vs none | 2.12x | 2.16x | -- | 1.18x | 0.88x | RecordRendering 1.54x | (1.6->1.8) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-21 |
| class-string-vs-classlist | 30 | classList mutation vs className string rewrite | (0.89x) | (1.01x) | -- | (1.00x) | (1.05x) | -- | (6.6->7.4) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-21 |
| class-string-vs-classlist | 100 | classList mutation vs className string rewrite | (1.00x) | (1.05x) | -- | (1.03x) | (1.09x) | -- | (1.9->1.8) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-21 |
| class-string-vs-classlist | 300 | classList mutation vs className string rewrite | (1.06x) | (1.00x) | -- | (0.98x) | (0.85x) | -- | (1.6->1.9) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-21 |
| class-toggle-body-vs-leaf | 30 | N scoped class toggles vs 1 global class toggle | (1.00x) | (1.02x) | -- | (1.06x) | 0.81x | -- | (1.5->1.8) | B costs less (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| class-toggle-body-vs-leaf | 100 | N scoped class toggles vs 1 global class toggle | (1.16x) | (0.97x) | -- | (1.02x) | 0.69x | -- | 5.5->1.7 | B costs less (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| class-toggle-body-vs-leaf | 300 | N scoped class toggles vs 1 global class toggle | (1.00x) | (0.99x) | -- | (0.99x) | 0.48x | -- | (1.7->1.8) | B costs less (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| clip-path-animated-vs-static | 30 | per-frame clip-path change vs static clip-path | (1.14x) | (0.98x) | -- | 2.82x | 1.58x | RecordRendering 0.78x | (2.2->2.8) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| clip-path-animated-vs-static | 100 | per-frame clip-path change vs static clip-path | (1.00x) | (0.99x) | -- | 7.45x | 2.29x | RecordRendering 0.87x | 1.5->3.6 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| clip-path-animated-vs-static | 300 | per-frame clip-path change vs static clip-path | (1.08x) | (1.04x) | -- | 11.56x | 4.16x | RecalcVisualStyle A~0 | 1.6->2.7 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| csstext-vs-property-writes | 30 | cssText assignment vs individual style property writes | (0.94x) | (0.98x) | (0.95x) | 1.86x | 1.93x | JSEvent B-only | (6.3->4.3) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| csstext-vs-property-writes | 100 | cssText assignment vs individual style property writes | (1.00x) | (1.01x) | (0.99x) | 2.09x | 2.66x | JSEvent 0.50x | 3.0->2.2 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| csstext-vs-property-writes | 300 | cssText assignment vs individual style property writes | (0.96x) | (1.00x) | (0.95x) | 1.84x | 3.58x | JSEvent 0.71x | 2.4->1.9 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| damage-area-small-vs-large | 1 | 88px-wide mover vs 1872px-wide mover | 4.21x | (1.03x) | -- | (0.96x) | (1.01x) | -- | (1.5->1.9) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| damage-area-small-vs-large | 5 | 88px-wide mover vs 1872px-wide mover | 8.76x | (1.01x) | -- | (1.00x) | (1.00x) | -- | (1.6->1.7) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| damage-area-small-vs-large | 15 | 88px-wide mover vs 1872px-wide mover | 10.86x | (1.02x) | -- | (1.06x) | (0.99x) | -- | (4.1->4.1) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| dom-depth-shallow-vs-deep | 30 | wrapper depth 2 vs 20 | (0.99x) | (0.93x) | -- | 0.85x | 0.84x | UpdateNodeTransforms 3.48x | (1.8->1.7) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 32 | 2026-08-24 |
| dom-depth-shallow-vs-deep | 100 | wrapper depth 2 vs 20 | (1.01x) | (0.99x) | -- | 0.78x | 0.70x | UpdateNodeTransforms 5.35x | (2.1->2.0) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 64 | 2026-08-24 |
| dom-depth-shallow-vs-deep | 300 | wrapper depth 2 vs 20 | (0.84x) | (1.00x) | -- | (1.21x) | (1.02x) | UpdateNodeTransforms 7.50x | (1.7->1.4) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 43 | 2026-08-24 |
| dom-write-dirty-check | 30 | write only on change vs write unconditionally | (1.00x) | 1.14x | 1.47x | 1.70x | 1.28x | RecordRendering 1.38x | (6.0->6.3) | B costs more (Layout) | 3.2.0.2 | 32 | 2026-08-25 |
| dom-write-dirty-check | 100 | write only on change vs write unconditionally | 2.65x | 1.63x | 2.27x | 3.35x | 2.01x | RecordRendering 1.95x | (2.0->1.9) | B costs more (Layout) | 3.2.0.2 | 32 | 2026-08-25 |
| dom-write-dirty-check | 300 | write only on change vs write unconditionally | 9.73x | 2.52x | 2.58x | 5.64x | 2.61x | RecordRendering 2.52x | 1.6->2.2 | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| filter-blur-animated | 30 | per-frame blur radius change vs constant blur | (0.98x) | (0.93x) | -- | 2.29x | 1.27x | RecordRendering 0.73x | 1.8->3.8 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| filter-blur-animated | 100 | per-frame blur radius change vs constant blur | (1.22x) | (1.03x) | -- | 5.32x | 1.43x | RecalcVisualStyle A~0 | 1.8->5.5 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| filter-blur-animated | 300 | per-frame blur radius change vs constant blur | (1.01x) | (1.04x) | -- | 11.81x | 1.87x | RecalcVisualStyle A~0 | 1.6->2.8 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| filter-grayscale | 30 | filter:grayscale(1) vs an already-grey colour | (0.90x) | (0.95x) | -- | (1.00x) | (0.92x) | RecordRendering 1.40x | (1.6->1.6) | B costs more (RecordRendering) | 3.2.0.2 | 32 | 2026-08-21 |
| filter-grayscale | 100 | filter:grayscale(1) vs an already-grey colour | (1.08x) | 1.15x | -- | (1.00x) | (1.03x) | RecordRendering 1.67x | (1.6->1.5) | B costs more (RecordRendering) | 3.2.0.2 | 32 | 2026-08-21 |
| filter-grayscale | 300 | filter:grayscale(1) vs an already-grey colour | (1.13x) | 1.50x | -- | 1.18x | (0.99x) | RecordRendering 1.79x | (1.7->1.5) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| getcomputedstyle-polling | 30 | getComputedStyle read vs a cached JS value | (1.13x) | (0.98x) | (0.98x) | (0.95x) | 1.38x | JSEvent B-only | (7.1->5.7) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| getcomputedstyle-polling | 100 | getComputedStyle read vs a cached JS value | (0.90x) | (1.00x) | (1.03x) | (0.98x) | 1.53x | RecalcVisualStyle 1.11x | (4.0->3.5) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| getcomputedstyle-polling | 300 | getComputedStyle read vs a cached JS value | (1.03x) | (1.01x) | (1.03x) | (1.09x) | 2.00x | JSEvent 0.45x | (2.8->2.4) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-clip-baked | 30 | baked texture vs linear-gradient with clip-path | (1.19x) | 2.26x | -- | 1.29x | (0.97x) | RecordRendering 7.71x | (1.4->1.7) | B costs more (RecordRendering) | 3.2.0.2 | 32 | 2026-08-21 |
| gradient-clip-baked | 100 | baked texture vs linear-gradient with clip-path | 1.62x | 5.12x | -- | (1.74x) | (1.04x) | RecordRendering 8.55x | (1.6->1.7) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| gradient-clip-baked | 300 | baked texture vs linear-gradient with clip-path | 2.02x | 15.09x | -- | 1.41x | (1.07x) | RecordRendering 8.99x | (1.7->1.6) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-21 |
| gradient-conic-vs-linear | 30 | conic gradient vs linear gradient | (0.98x) | (0.99x) | -- | (1.00x) | (1.01x) | -- | (1.9->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-conic-vs-linear | 100 | conic gradient vs linear gradient | (0.95x) | (1.03x) | -- | (0.92x) | (0.99x) | -- | (1.9->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-conic-vs-linear | 300 | conic gradient vs linear gradient | (1.05x) | (1.04x) | -- | (1.00x) | (1.01x) | -- | (1.6->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-radial-vs-linear | 30 | radial gradient vs linear gradient | (0.94x) | (0.98x) | -- | (1.07x) | (1.00x) | -- | (1.6->1.3) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-radial-vs-linear | 100 | radial gradient vs linear gradient | (0.90x) | (1.00x) | -- | (1.00x) | (1.00x) | -- | (1.7->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| gradient-radial-vs-linear | 300 | radial gradient vs linear gradient | (1.01x) | (0.99x) | -- | (1.03x) | (0.99x) | -- | (1.8->1.8) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| hover-rules-many-vs-none | 30 | :hover rules present vs absent while the pointer moves | (0.91x) | (1.01x) | -- | (1.04x) | (1.00x) | -- | (1.8->1.9) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| hover-rules-many-vs-none | 100 | :hover rules present vs absent while the pointer moves | (1.00x) | (1.04x) | -- | 1.16x | (1.01x) | RecalcVisualStyle A~0 | (1.9->1.7) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| hover-rules-many-vs-none | 300 | :hover rules present vs absent while the pointer moves | (0.99x) | (1.02x) | -- | 2.47x | (1.01x) | RecordRendering 1.11x | (1.6->1.6) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| image-oversized-vs-sized | 30 | 352x256 texture scaled to 88x64 vs a native 88x64 texture | (0.95x) | (1.01x) | -- | (0.96x) | (1.01x) | -- | (1.7->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| image-oversized-vs-sized | 100 | 352x256 texture scaled to 88x64 vs a native 88x64 texture | (1.04x) | (1.01x) | -- | (1.00x) | (1.00x) | -- | (1.6->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| image-oversized-vs-sized | 300 | 352x256 texture scaled to 88x64 vs a native 88x64 texture | (1.21x) | (1.01x) | -- | (1.00x) | (0.99x) | -- | (1.7->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| important-specificity | 30 | 200 plain rules vs 600 overlapping rules with !important overrides | (1.14x) | (1.02x) | -- | 1.93x | (1.02x) | -- | (2.7->2.3) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| important-specificity | 100 | 200 plain rules vs 600 overlapping rules with !important overrides | (1.12x) | (1.21x) | -- | 1.95x | (1.09x) | -- | (5.2->4.9) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| important-specificity | 300 | 200 plain rules vs 600 overlapping rules with !important overrides | (0.92x) | (0.64x) | -- | 2.03x | 1.13x | -- | (2.4->2.6) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| inline-style-vs-class | 30 | identical inline declarations per element vs a shared class | (0.94x) | (1.06x) | -- | (1.00x) | (1.01x) | -- | (1.6->1.6) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| inline-style-vs-class | 100 | identical inline declarations per element vs a shared class | (1.00x) | (1.01x) | -- | (1.00x) | (1.03x) | -- | (1.4->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| inline-style-vs-class | 300 | identical inline declarations per element vs a shared class | (1.01x) | (0.99x) | -- | (1.00x) | (1.01x) | -- | (1.7->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| innerhtml-append-vs-appendchild | 10 | repeated innerHTML += vs createElement/appendChild | (1.02x) | (1.00x) | (1.06x) | 1.17x | 2.53x | BuildDOM B-only | (2.8->2.0) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| innerhtml-append-vs-appendchild | 30 | repeated innerHTML += vs createElement/appendChild | (0.99x) | (1.03x) | 0.89x | 0.66x | 8.49x | BuildDOM B-only | 9.5->2.4 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| innerhtml-append-vs-appendchild | 100 | repeated innerHTML += vs createElement/appendChild | (1.05x) | (0.93x) | (1.00x) | (0.97x) | 36.63x | BuildDOM B-only | 10.7->1.3 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| layout-read-in-loop | 30 | per-element getBoundingClientRect read vs no read | (0.99x) | (0.99x) | 0.88x | (0.92x) | 1.91x | JSEvent 2.13x | 3.8->4.7 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-24 |
| layout-read-in-loop | 100 | per-element getBoundingClientRect read vs no read | (1.00x) | (0.96x) | (0.95x) | 0.67x | 2.41x | JSEvent B-only | (4.7->4.6) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-24 |
| layout-read-in-loop | 300 | per-element getBoundingClientRect read vs no read | (1.00x) | (1.02x) | (0.99x) | (0.92x) | 4.21x | JSEvent B-only | 1.9->3.0 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-24 |
| layout-read-interleave | 30 | interleaved style-write/layout-read vs batched | (1.00x) | (1.02x) | (0.97x) | (1.03x) | (0.97x) | -- | (4.5->3.9) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| layout-read-interleave | 100 | interleaved style-write/layout-read vs batched | (0.88x) | (1.00x) | (1.00x) | (1.02x) | (1.02x) | -- | (3.9->4.1) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| layout-read-interleave | 300 | interleaved style-write/layout-read vs batched | (1.11x) | (1.00x) | (1.00x) | (1.04x) | (1.09x) | -- | (3.2->3.8) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| list-rebuild-vs-update | 30 | targeted row update vs full list rebuild | 23.18x | 1.22x | 2.07x | 13.17x | 3.93x | RecordRendering 1.64x | 2.2->19.9 | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| list-rebuild-vs-update | 100 | targeted row update vs full list rebuild | 31.89x | 1.98x | 2.94x | 26.82x | 8.65x | RecordRendering 3.73x | 2.0->12.3 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| list-rebuild-vs-update | 300 | targeted row update vs full list rebuild | 36.83x | 3.60x | 4.12x | 81.88x | 23.31x | RecordRendering 9.17x | 1.6->6.7 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| long-task-chunked-vs-burst | 100 | work spread across frames vs done in a burst | (1.08x) | (1.01x) | 0.83x | 0.87x | 0.44x | RecordRendering 0.80x | 1.3->11.7 | B hitches (frame spike 11.7x) | 3.2.0.2 | 32 | 2026-08-25 |
| long-task-chunked-vs-burst | 300 | work spread across frames vs done in a burst | (1.00x) | (1.00x) | 0.84x | 0.90x | 0.20x | RecordRendering 0.84x | 1.5->30.7 | B hitches (frame spike 30.7x) | 3.2.0.2 | 32 | 2026-08-25 |
| many-animations-vs-one | 30 | 1 CSS animation vs N identical CSS animations | 0.20x | (1.11x) | -- | 2.00x | (0.96x) | UpdateNodeTransforms 1.21x | (1.3->1.4) | B costs less (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| many-animations-vs-one | 100 | 1 CSS animation vs N identical CSS animations | 0.48x | (1.00x) | -- | 3.96x | (0.97x) | UpdateNodeTransforms 1.29x | (1.7->2.0) | B costs less (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| many-animations-vs-one | 300 | 1 CSS animation vs N identical CSS animations | (0.90x) | (1.04x) | -- | 6.77x | (0.90x) | UpdateNodeTransforms 1.52x | 1.5->2.6 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| many-images-vs-spritesheet | 30 | single atlas texture vs one texture per sprite | (0.89x) | (1.01x) | -- | (1.03x) | (0.99x) | -- | (2.0->1.6) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| many-images-vs-spritesheet | 100 | single atlas texture vs one texture per sprite | (0.94x) | (1.05x) | -- | (1.05x) | (1.00x) | -- | (2.0->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| many-images-vs-spritesheet | 300 | single atlas texture vs one texture per sprite | (1.11x) | 1.69x | -- | (1.07x) | (1.00x) | -- | (1.7->2.0) | B costs more (Paint) | 3.2.0.2 | 32 | 2026-08-25 |
| mix-blend-mode-vs-normal | 30 | mix-blend-mode multiply vs normal | 2.01x | 1.65x | -- | 1.19x | (0.99x) | RecordRendering 2.10x | (2.1->1.7) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| mix-blend-mode-vs-normal | 100 | mix-blend-mode multiply vs normal | 4.33x | 2.78x | -- | 1.23x | (1.03x) | RecordRendering 3.62x | (2.2->1.5) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| mix-blend-mode-vs-normal | 300 | mix-blend-mode multiply vs normal | 7.01x | 5.46x | -- | 1.31x | (1.09x) | RecordRendering 4.62x | (1.8->1.7) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| mount-unmount-vs-visibility | 30 | visibility hidden/visible vs removeChild/appendChild | (4.45x) | (0.98x) | B-only | 1.94x | (1.16x) | RecordRendering 0.71x | 2.8->6.4 | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-21 |
| mount-unmount-vs-visibility | 100 | visibility hidden/visible vs removeChild/appendChild | 2.68x | (0.96x) | B-only | (1.61x) | 1.33x | -- | 6.3->2.3 | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-21 |
| mount-unmount-vs-visibility | 300 | visibility hidden/visible vs removeChild/appendChild | (1.11x) | (1.02x) | B-only | (1.68x) | 2.37x | RecalcVisualStyle 0.41x | (2.1->2.3) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| move-node-vs-transform | 10 | per-row transform vs removeChild/appendChild reorder | (0.92x) | (1.02x) | B-only | 1.50x | 0.90x | UpdateNodeTransforms A-only | 4.3->1.9 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-25 |
| move-node-vs-transform | 30 | per-row transform vs removeChild/appendChild reorder | (0.93x) | (0.98x) | B-only | (1.00x) | 0.89x | UpdateNodeTransforms A-only | 6.0->2.1 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-25 |
| move-node-vs-transform | 60 | per-row transform vs removeChild/appendChild reorder | (1.01x) | (0.98x) | B-only | 0.69x | 0.81x | UpdateNodeTransforms A-only | 5.4->1.9 | B introduces Layout work | 3.2.0.2 | 32 | 2026-08-25 |
| mutation-observer-cascade | 30 | observer-driven follow-up mutation vs a direct one | (1.00x) | (1.01x) | -- | (1.04x) | 1.25x | JSEvent B-only | (6.1->4.2) | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| mutation-observer-cascade | 100 | observer-driven follow-up mutation vs a direct one | (1.19x) | (0.99x) | -- | (1.04x) | 1.39x | JSEvent B-only | 1.8->6.0 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| mutation-observer-cascade | 300 | observer-driven follow-up mutation vs a direct one | (0.99x) | (1.01x) | -- | 0.82x | 1.58x | JSEvent B-only | 1.7->5.9 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-25 |
| nth-child-churn | 30 | :nth-child selectors vs per-element classes on a reordering list | (0.86x) | (0.97x) | (1.04x) | (1.00x) | (1.01x) | -- | (1.5->1.6) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| nth-child-churn | 100 | :nth-child selectors vs per-element classes on a reordering list | (0.98x) | (0.99x) | (0.99x) | (0.98x) | (0.99x) | -- | (1.3->1.4) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| nth-child-churn | 300 | :nth-child selectors vs per-element classes on a reordering list | (1.05x) | (0.99x) | (1.01x) | (0.95x) | (0.97x) | -- | (1.7->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| offscreen-node-count | 300 | offscreen nodes mounted vs absent | (1.14x) | (0.98x) | -- | 1.49x | 0.91x | UpdateNodeTransforms 2.90x | (1.8->1.6) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 32 | 2026-08-24 |
| offscreen-node-count | 1000 | offscreen nodes mounted vs absent | (1.16x) | (0.98x) | -- | 2.11x | 0.77x | UpdateNodeTransforms 4.84x | (1.6->1.6) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 32 | 2026-08-24 |
| offscreen-node-count | 3000 | offscreen nodes mounted vs absent | (0.94x) | (0.94x) | -- | 4.60x | 0.73x | UpdateNodeTransforms 10.95x | (1.7->1.8) | B costs more (UpdateNodeTransforms) | 3.2.0.2 | 32 | 2026-08-24 |
| overdraw-layers | 2 | N translucent full-screen layers vs one pre-composited layer | (1.12x) | (0.98x) | -- | (1.04x) | (0.99x) | -- | (1.6->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| overdraw-layers | 5 | N translucent full-screen layers vs one pre-composited layer | 1.81x | (1.01x) | -- | (1.04x) | (0.99x) | UpdateNodeTransforms 1.20x | (1.6->1.6) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| overdraw-layers | 10 | N translucent full-screen layers vs one pre-composited layer | 3.22x | (1.00x) | -- | (1.04x) | (0.99x) | UpdateNodeTransforms 1.40x | (1.6->1.8) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| per-frame-allocation | 30 | pre-allocated objects reused vs new objects per frame | (1.11x) | (1.02x) | (1.00x) | (1.01x) | (1.05x) | JSEvent B-only | (5.2->4.8) | B introduces JSEvent work | 3.2.0.2 | 32 | 2026-08-25 |
| per-frame-allocation | 100 | pre-allocated objects reused vs new objects per frame | (0.90x) | (0.99x) | (1.02x) | (1.02x) | (1.01x) | JSEvent B-only | 1.9->3.0 | B hitches (frame spike 3.0x) | 3.2.0.2 | 32 | 2026-08-25 |
| per-frame-allocation | 300 | pre-allocated objects reused vs new objects per frame | (0.96x) | (0.99x) | (1.00x) | (0.93x) | (1.02x) | JSEvent B-only | (2.1->2.3) | B introduces JSEvent work | 3.2.0.2 | 32 | 2026-08-25 |
| percentage-vs-fixed-sizing | 30 | percentage sizing vs fixed px in a 5-level chain | (1.08x) | (1.08x) | -- | (1.03x) | (1.04x) | -- | (1.6->2.0) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| percentage-vs-fixed-sizing | 100 | percentage sizing vs fixed px in a 5-level chain | (1.10x) | (0.97x) | -- | (1.00x) | (0.99x) | -- | (2.1->1.9) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| percentage-vs-fixed-sizing | 300 | percentage sizing vs fixed px in a 5-level chain | (0.71x) | (1.04x) | -- | (1.07x) | (1.05x) | -- | (2.1->2.1) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-24 |
| pointer-handler-throttled | 30 | work batched to rAF vs done per mousemove event | (1.08x) | (0.98x) | (1.05x) | (1.14x) | 0.40x | JSEvent 1.68x | 7.2->2.4 | B costs more (JSEvent) | 3.2.0.2 | 32 | 2026-08-25 |
| pointer-handler-throttled | 100 | work batched to rAF vs done per mousemove event | (1.05x) | (1.01x) | (0.90x) | (0.99x) | 0.28x | JSEvent 2.59x | (2.3->1.9) | B costs more (JSEvent) | 3.2.0.2 | 32 | 2026-08-25 |
| pointer-handler-throttled | 300 | work batched to rAF vs done per mousemove event | (0.97x) | (1.02x) | (0.99x) | (1.01x) | 0.10x | JSEvent 5.29x | (2.8->2.2) | B costs more (JSEvent) | 3.2.0.2 | 32 | 2026-08-25 |
| pool-vs-create | 30 | pool reuse vs destroy/create per cycle | 7.05x | (1.00x) | 1.22x | 6.11x | 2.11x | RecalcVisualStyle A~0 | 4.1->19.3 | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-21 |
| pool-vs-create | 100 | pool reuse vs destroy/create per cycle | 2.37x | (1.01x) | (1.06x) | 8.90x | 3.89x | RecalcVisualStyle A~0 | 4.1->12.4 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| pool-vs-create | 300 | pool reuse vs destroy/create per cycle | (1.37x) | (1.00x) | (1.04x) | 8.19x | 5.43x | RecalcVisualStyle 32.50x | 2.7->6.0 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| radius-shadow-compound | 30 | border-radius added to an already-shadowed element | (1.15x) | (1.10x) | -- | (1.00x) | (1.01x) | -- | (1.5->1.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| radius-shadow-compound | 100 | border-radius added to an already-shadowed element | 1.67x | 1.16x | -- | (1.09x) | (1.04x) | RecordRendering 1.11x | (1.5->1.6) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| radius-shadow-compound | 300 | border-radius added to an already-shadowed element | 1.56x | 1.30x | -- | (1.08x) | (0.96x) | -- | (1.8->1.8) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-25 |
| selector-descendant-vs-flat | 30 | flat class selectors vs descendant-combinator selectors | (0.95x) | (1.02x) | -- | 1.10x | (0.95x) | -- | (2.6->3.2) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-21 |
| selector-descendant-vs-flat | 100 | flat class selectors vs descendant-combinator selectors | (1.01x) | (1.02x) | -- | 1.10x | (1.07x) | -- | (5.5->4.9) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-21 |
| selector-descendant-vs-flat | 300 | flat class selectors vs descendant-combinator selectors | (1.00x) | (1.02x) | -- | 1.10x | (1.14x) | -- | (2.1->2.3) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-21 |
| selector-universal-vs-class | 30 | class-subject selectors vs universal + attribute selectors | (0.90x) | (1.02x) | -- | 2.41x | (1.07x) | -- | (2.4->2.4) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| selector-universal-vs-class | 100 | class-subject selectors vs universal + attribute selectors | (0.95x) | 0.82x | -- | 2.65x | 1.17x | -- | (5.5->5.6) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| selector-universal-vs-class | 300 | class-subject selectors vs universal + attribute selectors | (1.04x) | (0.98x) | -- | 2.82x | 1.14x | -- | (2.2->2.6) | B costs more (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| style-write-scope | 30 | 1 class change on the parent vs N inline style writes | (1.07x) | (1.02x) | -- | 0.52x | 1.51x | -- | 1.6->2.1 | B costs less (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| style-write-scope | 100 | 1 class change on the parent vs N inline style writes | (0.99x) | (0.99x) | -- | 0.50x | 2.21x | -- | 1.6->4.1 | B costs less (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| style-write-scope | 300 | 1 class change on the parent vs N inline style writes | (1.07x) | (0.99x) | -- | 0.46x | 4.00x | -- | 1.8->1.4 | B costs less (Styles) | 3.2.0.2 | 32 | 2026-08-25 |
| stylesheet-size-200-vs-5000 | 30 | 200 rules vs 5000 rules, identical DOM | (1.11x) | (1.01x) | -- | (1.02x) | (1.01x) | -- | (2.5->2.2) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| stylesheet-size-200-vs-5000 | 100 | 200 rules vs 5000 rules, identical DOM | (1.07x) | (1.01x) | -- | (0.98x) | (0.95x) | -- | (6.9->5.2) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| stylesheet-size-200-vs-5000 | 300 | 200 rules vs 5000 rules, identical DOM | (0.88x) | (0.66x) | -- | (1.06x) | (0.96x) | -- | (2.2->2.2) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| text-shadow-blur | 10 | blur vs solid shadow | (1.06x) | (0.83x) | -- | (0.94x) | (1.00x) | -- | (1.4->1.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-21 |
| text-shadow-blur | 30 | blur vs solid shadow | -- | 0.89x | -- | (1.08x) | (0.98x) | -- | (2.1->2.0) | B costs less (Paint) | 3.2.0.2 | 63 | 2026-08-25 |
| text-shadow-blur | 100 | blur vs solid shadow | 5.61x | 1.60x | -- | (1.05x) | (1.01x) | RecordRendering 1.42x | (1.6->1.6) | B costs more (GPU) | 3.2.0.2 | 32 | 2026-08-21 |
| timer-vs-raf | 30 | setInterval(16ms) vs rAF as the update driver | (1.01x) | (1.01x) | (0.98x) | (0.97x) | (1.02x) | -- | (2.0->1.8) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| timer-vs-raf | 100 | setInterval(16ms) vs rAF as the update driver | (1.03x) | (1.00x) | (0.99x) | (1.01x) | (1.02x) | -- | (3.2->3.7) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| timer-vs-raf | 300 | setInterval(16ms) vs rAF as the update driver | (1.04x) | (1.02x) | (0.98x) | (1.02x) | (1.01x) | -- | (2.2->2.3) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| transform-vw-vs-px | 30 | vw units vs px units in transform | (1.15x) | (1.00x) | -- | (0.98x) | 1.18x | -- | 6.7->4.6 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| transform-vw-vs-px | 100 | vw units vs px units in transform | (0.94x) | (1.00x) | -- | (1.00x) | 1.70x | JSEvent 1.31x | 1.9->4.7 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| transform-vw-vs-px | 300 | vw units vs px units in transform | (1.12x) | (1.01x) | -- | (1.00x) | 1.48x | -- | 2.5->4.8 | B costs more (Script) | 3.2.0.2 | 32 | 2026-08-21 |
| transition-all-vs-specific | 30 | transition: all vs naming the one property that changes | (0.99x) | (1.14x) | -- | (0.96x) | (0.99x) | -- | (1.7->1.8) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| transition-all-vs-specific | 100 | transition: all vs naming the one property that changes | (1.04x) | (0.93x) | -- | (0.97x) | (0.97x) | -- | (2.6->2.3) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| transition-all-vs-specific | 300 | transition: all vs naming the one property that changes | (1.11x) | (0.95x) | -- | (1.03x) | (0.97x) | -- | (2.7->2.5) | NO RELIABLE DIFFERENCE | 3.2.0.2 | 32 | 2026-08-25 |
| png-vs-svg-static-complex | 30 | PNG texture vs SVG source, same picture, no churn | (1.01x) | 1.73x | -- | (1.11x) | (1.03x) | RecordRendering 1.74x | (3.5->2.8) | B costs more (Paint) | 3.1.2.1 | 11 | 2026-09-01 |
| png-vs-svg-static-complex | 100 | PNG texture vs SVG source, same picture, no churn | (1.03x) | 1.87x | -- | (0.98x) | 0.85x | RecordRendering 2.11x | (2.8->2.7) | B costs more (Paint) | 3.1.2.1 | 11 | 2026-09-01 |
| png-vs-svg-static-complex | 300 | PNG texture vs SVG source, same picture, no churn | 1.62x | 2.81x | -- | (0.79x) | (0.76x) | RecordRendering 1.79x | (2.3->1.3) | B costs more (Paint) | 3.1.2.1 | 11 | 2026-09-01 |
| png-vs-svg-churn-complex | 30 | PNG texture vs SVG source, same picture, tiles destroyed and recreated | 31.22x | 460.54x | 1.64x | 403.85x | 7.30x | RecordRendering 5935.76x | 4.5->1.3 | B costs more (Styles) | 3.1.2.1 | 5 | 2026-09-01 |
| png-vs-svg-churn-complex | 100 | PNG texture vs SVG source, same picture, tiles destroyed and recreated | 78.23x | 1421.58x | 1.71x | 479.38x | 7.82x | RecordRendering 11338.84x | (5.4->1.2) | B costs more (Styles) | 3.1.2.1 | 2 | 2026-09-01 |
| png-vs-svg-churn-complex | 300 | PNG texture vs SVG source, same picture, tiles destroyed and recreated | 280.72x | 7319.56x | (2.19x) | 461.82x | 11.04x | RecordRendering 9647.49x | 7.7->1.0 | B costs more (Styles) | 3.1.2.1 | 1 | 2026-09-01 |
| png-vs-svg-churn-simple | 30 | PNG texture vs a 4-shape SVG source, same picture, tiles destroyed and recreated | 4.82x | 4.75x | 1.14x | 4.16x | 1.26x | RecordRendering 40.80x | (14.6->10.4) | B costs more (Styles) | 3.1.2.1 | 32 | 2026-09-01 |
| png-vs-svg-churn-simple | 100 | PNG texture vs a 4-shape SVG source, same picture, tiles destroyed and recreated | 10.73x | 17.86x | (0.99x) | 3.16x | 1.31x | RecordRendering 60.76x | (16.1->12.6) | B costs more (Styles) | 3.1.2.1 | 32 | 2026-09-01 |
| png-vs-svg-churn-simple | 300 | PNG texture vs a 4-shape SVG source, same picture, tiles destroyed and recreated | 16.83x | 55.04x | 1.41x | 4.20x | 1.18x | RecordRendering 87.29x | (7.7->9.0) | B costs more (Styles) | 3.1.2.1 | 29 | 2026-09-01 |
| spritesheet-vs-files-churn | 30 | single atlas texture vs one texture per sprite, tiles destroyed and recreated | (1.01x) | 2.04x | 1.14x | 1.11x | (0.94x) | TextureCreated 0.40x | (23.4->20.8) | B costs more (Paint) | 3.1.2.1 | 32 | 2026-09-01 |
| spritesheet-vs-files-churn | 100 | single atlas texture vs one texture per sprite, tiles destroyed and recreated | (0.80x) | 3.17x | (1.03x) | (0.86x) | (0.94x) | JSEvent 0.26x | (13.7->13.0) | B costs more (Paint) | 3.1.2.1 | 32 | 2026-09-01 |
| spritesheet-vs-files-churn | 300 | single atlas texture vs one texture per sprite, tiles destroyed and recreated | (1.09x) | 2.14x | (1.01x) | (1.02x) | 0.87x | -- | (5.3->5.3) | B costs less (Script) | 3.1.2.1 | 32 | 2026-09-01 |
