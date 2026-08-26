# Gameface Perf Lab

Turns performance opinions into rows.

Every "is X slow in Gameface?" debate should end with someone running a case
instead of someone guessing, and every claim in the performance linter should
cite a case ID. The lab exists to make that cheap.

The workflow is conversational: *"test X vs Y"* → author a small A/B case
following [AUTHORING.md](AUTHORING.md) → `run.js` measures it in the Gameface
Player → the result lands as one row in [results.md](results.md). No registry,
no database, no framework. Standardization lives in the authoring rules, not in
machinery.

## Requirements

- Node 22+
- A Gameface Player. `run.js` finds it via `browserExecutable` in
  `~/.gameface-mcp/config.json`, or `--player <path-to-Player.exe>`.
- Developed against cohtml **3.2.0.2**.

```sh
npm install
```

## Running

```sh
node run.js text-shadow-blur              # every count in case.json
node run.js text-shadow-blur --count 100  # one count
node run.js --all                         # every case
node run.js text-shadow-blur --self-test  # A measured against itself
node run.js text-shadow-blur --dry-run    # print URLs, launch nothing
```

Options: `--repeats <n>` (default 3), `--player <path>`.

```
text-shadow-blur (100 elements)
           A (solid)     B (blur)      ratio
  GPU      0.72 ms       4.06 ms       5.61x
  Paint    0.59 ms       0.95 ms       1.60x
  Layout     --            --          --
  Styles   0.04 ms       0.04 ms       (1.05x)
  Script   0.08 ms       0.08 ms       (1.00x)
  spike    1.6->1.7  (frame max/median)
  verdict: MEANINGFUL - B costs more (GPU-bound)
  (3 A/B pairs, 157 frames/trace, 31.2ms frame interval, cohtml 3.2.0.2, 1920x1080, vsync true)
```

Each row is appended to `results.md`. Re-running appends a new row; old rows
stay, because they are the history and a free engine-version comparison later.

## Running the whole lab yourself

```sh
npm install
node run.js --all
```

That is the entire procedure. Nothing else has to be built first: the generated
textures and the rule-heavy case pages are committed, so a fresh clone is ready
to measure. **`report.html` is rebuilt automatically** at the end of every run
and every `--rederive` — you never invoke the report builder by hand.

Before you start it, four things are worth knowing.

**It takes about three hours.** `--all` is **152 (case, count) pairs**, and each
one launches the Player six times — three interleaved A/B repeats, warmup and
trace on each. Check the number for yourself without launching anything:

```sh
node run.js --all --dry-run
```

**Leave the machine alone while it runs.** Each measurement is a real Player
window that takes focus, and background load moves the numbers — GPU durations
in particular track the frame rate, and the Player alternates between full and
half vsync depending on load. The runner warns on any row whose six runs did not
hold the same rate.

**An interrupted run loses nothing.** Rows are appended as each (case, count)
finishes, and raw traces land in `runs/` as they go. Re-run just the cases you
missed by name, then tidy the table:

```sh
node run.js --rederive
```

That rebuilds every row from the traces on disk under one consistent verdict
rule, and drops the duplicates that a second `--all` would otherwise leave
behind. It takes seconds and launches nothing.

**Sanity-check the lab before trusting a fresh sweep:**

```sh
node run.js text-shadow-blur --self-test --count 100
```

A measured against itself must report `NO RELIABLE DIFFERENCE`. If it does not,
the machine is too noisy for the results to mean anything that day.

If you want a subset rather than the lot, pass case ids:

```sh
node run.js backdrop-filter-vs-none mix-blend-mode-vs-normal
```

## The overview page

`report.html` is a self-contained page with one card per case — what it tests,
the applicability-gate status, the hypothesised axis, and every count's ratios
and verdict, with the claim and rule notes behind a disclosure.

```sh
node tools/build-report.js     # or: npm run report
```

`run.js` rebuilds it after every sweep and after `--rederive`, so it cannot
drift from `results.md`. Open it by double-clicking — no server, no
dependencies, and it follows your system light/dark setting.

It is built from `results.md` and each `case.json`, and enriched with absolute
per-phase milliseconds from `runs/` when those traces are present. `runs/` is
gitignored, so on a fresh clone the page still builds and simply omits the
"absolute ms" toggle rather than failing.

Cards flag two things worth noticing at a glance: an `ADAPTED` badge where the
case had to deviate from the pattern as specified, and a struck axis badge (↯)
where the case produced a finding on a *different* phase than it hypothesised —
which AUTHORING.md rule 10 calls interesting rather than a failure.

## The protocol

Per (case, count):

1. Launch the Player on `A.html?count=N` at a pinned 1920×1080, vsync on,
   GUI shell off.
2. Discard 2 s of warmup, trace 5 s over CDP, kill the Player.
3. Same for `B.html`, and repeat the pair 3 times **interleaved** (A B A B A B)
   so any drift over the session lands on both variants equally.
4. `parse.js` pairs the `Coherent_*` begin/end events into per-frame phase
   durations and takes steady-state medians.
5. Print the per-case table, append one row per (case, count).

A fresh Player per variant, rather than navigating one Player between pages, so
no state carries across and launch variance is inside the measured spread the
guardrail accounts for.

## Measurement rules

- **Phase durations, never frame rate.** Durations are valid under any fps cap
  — a cap changes how often frames run, not how long the work takes. (This
  Player caps at ~32 fps; a page whose GPU phase costs 20 ms still reports a
  31 ms frame interval.)
- **Ratios, never absolute claims.** Same machine, same session, A vs B. Ratios
  roughly survive hardware differences; absolute ms don't. Negative results
  carry the qualifier "no measurable difference *on this machine*".
- **The guardrail, in two parts.** Signal is the gap between the variants'
  medians. Noise is the worse of the two variants' own run-to-run spreads
  (max − min across the 3 repeats). A finding must clear **both**:
  `signal > noise`, **and** an effect size outside 1.10× either way. If it
  clears neither, the verdict is `NO RELIABLE DIFFERENCE`. That is the entire
  statistics — the lab never invents a conclusion.

  The size gate was added after the first full sweep, on evidence: 8 of 43
  findings sat below 1.10×, and some contradicted themselves across counts of
  the same case (`class-string-vs-classlist` read 1.03× at 100 elements and no
  difference at both 30 and 300). Clearing a spread that happens to be small on
  a quiet machine is not the same as an effect worth acting on.

  A phase present in one variant and absent in the other is exempt from the
  size gate — "runs at all vs does not run" has no meaningful ratio.

Changing the verdict rule does not mean re-measuring. `node run.js --rederive`
rebuilds every row from the per-repeat data already in `runs/`, so the whole
table stays under one consistent rule.

The A/A self-test (`--self-test`) measures `A.html` against itself and must
report `NO RELIABLE DIFFERENCE`. It is the proof that the lab cannot be fooled
by its own noise.

## What the phases are

Gameface emits `Coherent_*` begin/end pairs across five threads and two
processes. `parse.js` records medians for **every** phase in the trace into
`runs/<case>/<variant>.phases.json`; four are printed:

| Column | Event | Where it runs |
|---|---|---|
| GPU | `Coherent_GPU` | GPU thread, separate process |
| Paint | `Coherent_Paint` | Rendering thread |
| Layout | `Coherent_Layout` | Layout thread |
| Styles | `Coherent_Styling` | Styling worker pool (its tid changes between frames) |
| Script | `Coherent_ExecuteTimers` | Main thread — rAF callbacks, timers, handlers |

**The verdict is decided over every recorded phase, not just those six.** The
`other` column names any phase outside the printed set that moved. This is not
decoration: `dom-depth-shallow-vs-deep` costs **7.5×** in
`Coherent_UpdateNodeTransforms` — the per-frame scene-graph walk on the Layout
thread — while all six printed columns stay inside the guardrail. Deciding the
verdict on the printed columns alone reported that case as
`NO RELIABLE DIFFERENCE`, which was flatly wrong.

Phases nested inside a printed column (Paint's and Styles' children), the
blocking `Wait*` phases, and the `Coherent_Advance` roll-up are excluded from
`other` — surfacing them is double-counting, and the roll-up outranks its own
contents while saying less.

Ranking is by **per-frame** time moved, not raw duration. `Coherent_JSEvent`
fires about five times in a 5 s trace; without amortising by `perFrame` it
outranked a phase costing real time on every single frame.

Two things about the trace that shape the parser:

- Phases are paired on **(pid, tid, name)**, never name alone, because the
  styling worker's thread id changes between frames.
- Most end events carry `args.frameId`, which is what allows a phase to be
  attributed to a frame rather than to a point in time. The pipeline is deep —
  frame N's Paint runs well after frame N's Advance finishes — so bucketing by
  timestamp would mis-assign it.
- **A phase that has nothing to do emits no events at all.** A page that never
  dirties layout produces zero `Coherent_Layout` events, not zero-duration
  ones. Absent is reported as absent, never as 0.

## Layout

```
cases/<case-id>/
  A.html      # baseline (the recommended / cheap form)
  B.html      # identical except the ONE variable under test
  case.json   # title, variable, hypothesis, counts?, labels?, claim?, status, notes
run.js        # the protocol
parse.js      # the Coherent_* phase-table parser
player.js     # Player launch + CDP, and the Gameface quirks it takes to work
results.md    # the shared table (auto-appended, never edited by hand)
report.html   # the overview page (generated - never edit it by hand)
AUTHORING.md  # the authoring rules
tools/
  build-report.js       # builds report.html from results.md + case.json
  make-baked-images.js  # generates the baked textures the "is baking it
                        # worth it?" cases compare against
runs/         # raw traces from the last run (gitignored)
```

Two cases compare a live CSS effect against a pre-rendered texture. Those
textures are generated, not hand-drawn, so they are reproducible and the diff
is readable:

```sh
node tools/make-baked-images.js
```

## Non-goals

Result registry/versioning beyond the table, hardware profiles, scaffold
generators, MCP tool wrappers, CI integration, client distribution. This is an
internal tool: open source, never published to npm.
