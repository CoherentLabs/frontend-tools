# Coherent Gameface Figma Exporter

A Figma plugin that exports the current page's top-level frames or components as a downloadable zip of HTML, CSS, images, and fonts — ready to be loaded in the [Coherent Gameface](https://coherent-labs.com/) HTML-based game UI runtime.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Setup & Build Commands](#setup--build-commands)
5. [Loading & Testing in Figma](#loading--testing-in-figma)
6. [Export Flow](#export-flow)
7. [Export Modes](#export-modes)
8. [Font Handling](#font-handling)
9. [CSS & Asset Export Reference](#css--asset-export-reference)
10. [Known Limitations](#known-limitations)

---

## Overview

The plugin runs inside Figma Desktop. When triggered, it walks the visible top-level nodes of the current Figma page and converts each one into an HTML + CSS representation that can be rendered in Gameface.

- **Pages mode** — each visible top-level `FRAME` becomes its own folder with a full HTML page and accompanying CSS, images, and fonts.
- **Components mode** — each visible top-level `COMPONENT` or `COMPONENT_SET` variant becomes a folder under `components/`, with shared fonts collected at the zip root.

Output is a `.zip` named after the Figma file (`<filename>.zip`).

---

## Project Structure

```
gf-figma-exporter/
├── manifest.json              # Figma plugin manifest (entry points, network access)
├── package.json               # Root scripts and ESLint config
├── vite.config.mjs            # Bundles src/code.ts → code.js (plugin main thread)
├── tsconfig.json              # TypeScript config for plugin main thread
├── code.js                    # Built plugin entry (committed, referenced by manifest)
├── ui.html                    # Built single-file UI bundle (committed, referenced by manifest)
│
├── src/                       # Plugin main-thread source
│   ├── code.ts                # Bootstrap: shows UI, handles start-export / close-plugin
│   ├── exporter.ts            # Orchestrator: getPages() and getComponents()
│   ├── factory.ts             # Dispatches Figma nodes to GF* wrapper classes
│   ├── types/
│   │   └── commonTypes.ts     # Shared types (ExportableNodes, GFFont, GFImage, …)
│   ├── nodes/                 # One class per supported node type
│   │   ├── BaseNode.ts        # Shared createHTML() / createCSS() / images interface
│   │   ├── Frame/Frame.ts     # GFFrame — also used for INSTANCE and COMPONENT nodes
│   │   ├── Group/Group.ts     # GFGroup
│   │   ├── Rectangle/Rectangle.ts
│   │   ├── Ellipse/Ellipse.ts
│   │   ├── Text/TextNode.ts   # GFTextNode
│   │   ├── SVGNode/SVGNode.ts # GFSVGNode — vector nodes detected by isNodeSVG()
│   │   └── Mask/Mask.ts       # GFMask — synthetic mask wrapper
│   ├── CSSExporter/
│   │   ├── CSSExporter.ts     # Main CSS generation class
│   │   ├── StyleManager/      # Deduplicates CSS class names
│   │   └── utils/             # Per-property CSS helpers (position, flex, border, effects, …)
│   ├── ImageExporter/
│   │   └── ImageExporter.ts   # Exports PNG assets via cloned nodes + temp frame
│   ├── FontExporter/
│   │   └── FontExporter.ts    # Font discovery, server calls, missing-font pause flow
│   ├── MessageBus/
│   │   └── MessageBus.ts      # Main-thread side of the postMessage bridge
│   └── utils/                 # Geometry, gradients, masks, boilerplate, progress, …
│
├── ui-src/                    # Plugin UI source (runs in the browser iframe)
│   ├── vite.config.ts         # Builds SolidJS UI → parent ui.html (single-file)
│   ├── ui.html                # Dev-mode HTML entry (loads ./src/index.tsx)
│   └── src/
│       ├── index.tsx          # UI entry point
│       ├── App.tsx            # Main screen: mode toggle, export button, progress, missing-fonts flow
│       ├── MessageBus/
│       │   └── MessageBus.ts  # UI-side postMessage bridge
│       └── listeners/
│           ├── download-pages.ts   # Builds JSZip and triggers browser download
│           ├── flatten-svg.ts      # SVG path flattening (needs browser SVG DOM)
│           └── path-bbox.ts        # Path bounding-box calculation (needs browser SVG DOM)
```

---

## Architecture

### How the two build targets connect

`manifest.json` references two built files:

| Field | Built file | Source |
|-------|-----------|--------|
| `"main"` | `code.js` | `src/code.ts` via `vite.config.mjs` |
| `"ui"` | `ui.html` | `ui-src/src/index.tsx` via `ui-src/vite.config.ts` |

The plugin sandbox (`code.js`) and the UI iframe (`ui.html`) communicate exclusively through a `postMessage` bridge wrapped by `MessageBus` on each side.

### Main data flow

```
User clicks Export
        │
        ▼
App.tsx ──postMessage──► code.ts  (start-export, mode)
                              │
                              ▼
                        exporter.ts
                        ├── getPages()      ← Pages mode
                        └── getComponents() ← Components mode
                              │
                              ▼ (per frame/component)
                        FontExporter.init()
                              │  ← may pause here for missing fonts
                              ▼
                        factory.ts → generateCode(node)
                              │
                              ├── GFFrame / GFGroup / GFRectangle / …
                              │       └── CSSExporter  → CSS string
                              │       └── ImageExporter → PNG Uint8Array
                              │
                              ▼ (SVG paths / bbox)
                        postMessage ──► ui iframe listeners
                        postMessage ◄── result
                              │
                              ▼
                        MessageBus.postMessage('download-files', payload)
                              │
                              ▼
                        download-pages.ts  (JSZip → browser download)
                              │
                              ▼
                        MessageBus.postMessage('close-plugin')
```

### Key design points

- **Node dispatching** — `factory.ts` checks `node.type` and whether `isNodeSVG()` is true, then instantiates the matching `GF*` class. `INSTANCE` and `COMPONENT` nodes are treated the same as `GFFrame` (rendered as inline HTML, not as component references).
- **SVG bridge** — Path flattening and bbox calculation require a real browser SVG DOM, which is not available in the Figma plugin sandbox. These operations are delegated to the UI iframe via `flatten-svg` / `path-bbox` messages and resolved back as `flattened-svg-result` / `path-bbox-result`.
- **Image export** — `ImageExporter` clones the node onto a temporary off-screen frame, calls the Figma export API to get PNG bytes, then removes the temp frame.
- **Mask handling** — Mask chains are rewritten into synthetic `MaskNode` objects during frame traversal. A `masked-by` key is written to `pluginData` on affected nodes and read back during CSS position calculation.
- **Progress** — `src/utils/updateProgress.ts` maintains a counter of total descendants and sends `export-progress` messages to the UI for the progress bar.

---

## Setup & Build Commands

### Prerequisites

- Node.js ≥ 18
- Figma Desktop app (the plugin cannot run in the browser version unless it's published)

### Install dependencies

```bash
# Root (plugin main thread)
npm install

# UI subproject
cd ui-src && npm install
```

### Build commands (run from repo root)

| Command | What it does |
|---------|-------------|
| `npm run build` | Builds both `code.js` and `ui.html` — run this before loading into Figma |
| `npm run build:code` | Builds plugin main thread only (`src/code.ts` → `code.js`) |
| `npm run build:ui` | Builds SolidJS UI only (`ui-src/` → `ui.html`) |
| `npm run lint` | Runs ESLint across all `.ts` / `.tsx` files |
| `npm run lint:fix` | Auto-fixes lint issues where possible |

### UI hot-reload during development

If you are only iterating on the UI, you can run the Vite dev server instead of rebuilding `ui.html` every time:

```bash
cd ui-src
npm run dev   # starts on http://localhost:54322
```

Then temporarily change `manifest.json` `"ui"` to `"http://localhost:54322"` (this domain is already in `devAllowedDomains`). Remember to revert the manifest and rebuild `ui.html` before committing.

---

## Loading & Testing in Figma

1. **Build** the plugin:
   ```bash
   npm run build
   ```

2. **Import** the plugin in Figma Desktop:
   - Open any Figma file.
   - Go to **Main menu → Plugins → Development → Import plugin from manifest…**
   - Select `manifest.json` from the repo root.

3. **Run** the plugin:
   - **Main menu → Plugins → Development → Coherent Gameface Exporter**

4. **Choose a mode** in the plugin UI:
   - **Pages** — exports all visible top-level frames on the current page.
   - **Components** — exports all visible top-level components/component-sets on the current page.

5. Click **Export**. The plugin processes each node, shows a progress bar, and — once complete — automatically downloads a `.zip` file and closes.

6. **Inspect the zip**: unzip and open `<page-name>/<page-name>.html` in a browser or Gameface to verify the output.

> **Tip:** Keep the Figma DevTools console open (**Plugins → Development → Open Console**) to see any errors from the plugin main thread.

---

## Export Flow

A step-by-step trace through the code from button click to zip download:

1. **`ui-src/src/App.tsx`** — user clicks Export; sends `start-export` with `{ mode: 'page' | 'component' }` via `MessageBus.postMessage`.

2. **`src/code.ts`** — receives `start-export`; sets `figma.skipInvisibleInstanceChildren = true`; derives a sanitized filename from `figma.root.name`; calls `getPages()` or `getComponents()` from `src/exporter.ts`.

3. **`src/exporter.ts`** — filters `figma.currentPage.children` to visible `FRAME` nodes (pages mode) or visible `COMPONENT` / `COMPONENT_SET` nodes (components mode); counts all descendants for the progress bar; then loops:

   a. Sets `currentPageSize` (used for percentage-based CSS).
   b. Calls `FontExporter.init(node)` — may pause here if missing fonts are found (see [Font Handling](#font-handling)).
   c. Calls `generateCode(node)` from `src/factory.ts`.
   d. Wraps the returned HTML/CSS in boilerplate and stores in the result map.

4. **`src/factory.ts`** — receives a single node; detects its type; instantiates the matching class (`GFFrame`, `GFRectangle`, `GFEllipse`, `GFSVGNode`, `GFTextNode`, `GFMask`); calls `init()` on containers (which recursively processes children), then `createHTML()` and `createCSS()`.

5. **`src/CSSExporter/CSSExporter.ts`** — builds CSS property strings for position, size, flex, background, border, effects, transforms, and opacity using the helpers in `CSSExporter/utils/`.

6. **`src/ImageExporter/ImageExporter.ts`** — when a background, stroke, or full node needs rasterization, clones the node onto a temporary frame, exports PNG bytes via `figma.exportAsync`, then removes the temp frame.

7. **`src/code.ts`** — after all nodes are processed, calls `figma.notify('Code generated!')` and posts `download-files` with `{ mode, payload, filename }` back to the UI.

8. **`ui-src/src/listeners/download-pages.ts`** — receives `download-files`; uses **JSZip** to assemble the zip structure (see [Export Modes](#export-modes)); generates a `Blob`, creates a temporary `<a>` element with `download`, clicks it, and revokes the object URL.

9. Posts `close-plugin` → `src/code.ts` calls `figma.closePlugin()`.

---

## Export Modes

### Pages mode — zip structure

```
<filename>.zip
└── <page-name>/
    ├── <page-name>.html    # Full HTML page with boilerplate
    ├── <page-name>.css     # Font @face rules + CSS boilerplate + generated CSS
    ├── images/
    │   └── *.png           # Rasterized assets
    └── fonts/
        └── *.ttf           # Font binaries (Google Fonts + user-uploaded)
```

### Components mode — zip structure

```
<filename>.zip
├── fonts.css               # Shared @font-face rules for all components
├── fonts/
│   └── *.ttf               # Shared font binaries
└── components/
    └── <component-name>/
        ├── <component-name>.html
        ├── <component-name>.css
        └── images/
            └── *.png
```

`COMPONENT_SET` variants are named `<set-name>-<variant-name>` (sanitized to kebab-case). Duplicate names get a `-2`, `-3` suffix.

---

## Font Handling

Font resolution happens in `src/FontExporter/FontExporter.ts` before HTML/CSS generation for each frame:

1. **Discover** — all `TEXT` nodes in the frame are scanned; `getAllFonts()` collects every `FontName` in use.

2. **Check missing fonts** — the font list is sent to `https://coherent-labs.com/google-fonts/api/get-missing-fonts`. Fonts not available on Google Fonts are returned as "missing."

3. **Missing font flow** — if any fonts are missing, the plugin:
   - Sends `MISSING_FONTS_DETECTED` to the UI.
   - Resizes the plugin panel to 700 px tall.
   - Pauses export and waits for the user to either upload `.ttf`/`.otf` files or accept **Noto Sans** as a fallback.
   - Resumes when the UI sends `MISSING_FONTS_RESPONSE`.

4. **Fetch Google Fonts** — sends the used fonts to `set-available-fonts`; receives font binary data (per weight/style/subset).

5. **Backup fonts** — sends the resolved font list to `set-backup-fonts` to obtain any supplementary fallback variants.

6. **Final font map** — Google Fonts + user-uploaded fonts + backup fonts are merged into `FontExporter.fontMap`, which is later written to `.ttf` files and `@font-face` CSS rules in the zip.

> The font server endpoints are on `https://coherent-labs.com`. Network access to this domain is declared in `manifest.json` under `networkAccess.allowedDomains`.

---

## CSS & Asset Export Reference

This section documents exactly how each visual property in a Figma design is translated to HTML/CSS or rasterized to a PNG asset.

---

### Units and coordinate system

All pixel values from Figma are converted to `vh` units so the output scales with the viewport height in Gameface:

```
vh = (px / pageHeight) * 100
```

`pageHeight` is the height of the top-level frame being exported. In **components mode** it is always fixed at **1080** (from a 1920×1080 baseline).

Positions (`top`, `left`) are expressed as **percentages of the parent element's dimensions**, not as `vh`. This means a node that is halfway down its parent always renders at `top: 50%` regardless of viewport size.

---

### HTML structure per node

Every non-text node produces a pair of elements plus optional pseudo-elements:

```html
<div class="node-name-abc123">              <!-- main element: size, position, opacity, transform, border-radius -->
  <div class="node-name-abc123-background"> <!-- background layer: fills, shadows, clip-path -->
  </div>
</div>
```

When the node has auto-layout (Figma's flex), a third wrapper class `node-name-abc123-flex` is added and carries the `display: flex` styles.

**Class naming** — `generateClassName(name, id)` lowercases and kebab-cases the Figma node name, then appends the first 6 characters of the node ID to avoid collisions.

**Suffixes** (defined in `src/utils/constants.ts`):

| Suffix | Purpose |
|--------|---------|
| `-background` | Background + fill layer |
| `-flex` | Auto-layout (flex) container |

**Text nodes** follow a different structure — see [Text nodes](#text-nodes) below.

#### Why a separate background element?

The background is placed in a dedicated child `div` rather than on the main element for one core reason: **Figma's radial and diamond gradients are rotated ellipses, and CSS `radial-gradient()` has no rotation parameter.**

To reproduce a rotated radial gradient, the exporter puts the gradient on a `::before` pseudo-element and applies a `transform: rotate(...) translate(-50%, -50%)` to it. A rotated pseudo-element will bleed outside its parent's visual bounds, so the background element carries `overflow: hidden` to clip it back to the node's shape.

This same approach is what makes the `::before` the right tool — an absolutely-positioned pseudo on the background div can:
1. Grow larger than its container to fill the area when rotated.
2. Be clipped back to the node's exact shape via `overflow: hidden` on the parent.
3. Apply its own `transform` independently, without rotating the node's real children.

If the gradient were applied directly to the main element, rotating it via `::before` would conflict with the node's children (which are also children of the main element) and the main element's own `transform` property (already used for Figma node rotation).

The separation also gives `box-shadow` a clean layer — shadows go on the background element at the correct z-index, behind the node's children but correctly associated with the node's shape.

**Full pseudo-element layout per node:**

```
.className                    — layout: position, size, opacity, transform, border-radius
  .className-background       — visual: fills, overflow:hidden, box-shadow, clip-path (SVGs)
    ::before                  — radial/diamond gradient (rotated, oversized, clipped by parent)
  ::after                     — border/stroke (on main element, so it overlays children)
```

---

### Backgrounds and fills

Backgrounds are applied to the `.className-background` child element. The decision of whether to use CSS or a PNG image is made in `src/ImageExporter/utils/shouldExportBackground.ts`.

#### When CSS is used

| Figma fill | CSS output |
|-----------|-----------|
| Single `SOLID` fill | `background: rgba(r, g, b, a)` |
| `GRADIENT_LINEAR` | `background: linear-gradient(...)` computed from Figma's gradient handles |
| `GRADIENT_ANGULAR` | `background: conic-gradient(...)` |
| Single `GRADIENT_RADIAL` on a non-Frame node | `::before` pseudo-element with `background: radial-gradient(...)` + `transform: rotate(...) translate(-50%, -50%)` |
| Single `GRADIENT_DIAMOND` on a non-Frame node | Same `::before` approach as radial |

> **Radial and diamond gradients on Frame nodes are silently skipped** — this is the source of the known limitation. Use a Rectangle layer as the background instead.

#### When a PNG image is exported

The fill is rasterized and referenced as `background: url(./images/<name>_<id>_background.png) center / 100% 100% no-repeat` when any of the following is true:

- More than one `SOLID` fill is visible
- More than one radial/diamond gradient fill is present
- Any `IMAGE` or `PATTERN` fill is used
- The node has exportable effects (e.g. drop shadows that would require CSS filters)

The image export process in `src/ImageExporter/ImageExporter.ts` clones the node onto a temporary off-screen frame at position `x: 100000`, hides the node's children (for frames), strips effects, then calls `figma.exportAsync` to get PNG bytes. The temp frame is deleted afterwards.

The background rect position and size are computed from the fill geometry bounding box (`fillGeometry[0].data`) via `getPathBBox` — this delegates to the UI iframe since the SVG DOM is needed to compute the bbox.

---

### Borders and strokes

#### Why a `::after` pseudo-element?

Borders are placed on the `::after` pseudo-element of the main `.className` div, not as a CSS `border` property directly on the element. The reason is the same as for the background element: CSS `border` participates in box layout — it pushes children and changes the element's rendered size. An absolutely-positioned `::after` is an overlay that does not affect children, and its `width`, `height`, `top`, and `left` can be set freely to match the exact stroke geometry that Figma reports.

#### The `border-image` + `border-radius` incompatibility

This is the central constraint driving most of the image-export decisions. In CSS, **`border-image` and `border-radius` cannot be used together** — the spec requires `border-image` to reset `border-radius` to `0`. This means any stroke that needs `border-image` (gradient fills, image fills) on a rounded node cannot be represented in CSS at all. The only option is to rasterize the stroke as a PNG and display it as `background-image` on the `::after` element.

#### The stroke alignment problem

Figma strokes have three alignment modes that change both the rendered size and position of the stroke relative to the node's bounds:

- **`OUTSIDE`** — the stroke grows outward; the `::after` element is larger than the main element
- **`CENTER`** — the stroke straddles the edge; the `::after` is the geometry bbox size
- **`INSIDE`** — the stroke grows inward; the `::after` is snapped to `top: 0, left: 0` and sized to the bbox

CSS `border` always renders CENTER-aligned (half inside, half outside the box edge) and always adds to the element size. To correctly match Figma's three modes, the `::after` size and position are computed from the actual `strokeGeometry` bbox (retrieved via `getPathBBox`, which is delegated to the UI iframe) and then adjusted per `strokeAlign`.

#### Decision table

| Condition | Why | Output |
|-----------|-----|--------|
| Single `SOLID` stroke, no rounding, straight geometry | Fully representable in CSS | `border: Xvh solid rgba(...)` on `::after` |
| Single `GRADIENT_LINEAR` stroke, no rounding, straight geometry | `border-image` works on straight edges | `border-image: linear-gradient(...) 1` on `::after` |
| Any stroke on a rounded node (`cornerRadius > 0`) | `border-image` resets `border-radius` | PNG exported as `background-image` on `::after` |
| `ELLIPSE` node | Rendered as 50% border-radius in CSS; `border-image` incompatible | PNG exported |
| Multiple strokes | CSS has no multi-border support | PNG exported |
| Dashed stroke | Gameface does not support `border-style: dashed` | PNG exported |
| SVG / vector node | Stroke follows a free-form path; no CSS equivalent | PNG exported |
| Non-solid, non-linear-gradient stroke (radial, diamond, image, pattern) | No CSS `border` equivalent | PNG exported |
| Exportable effects on the node | Effects must be baked into the stroke image | PNG exported |

Mixed stroke weights (different widths per side) produce individual `border-left-width`, `border-right-width`, `border-top-width`, `border-bottom-width` properties.

The "basic stroke" check (`isBasicStroke` in `src/utils/isStrokeBasic.ts`) parses the raw `strokeGeometry` SVG path data and verifies it consists only of right-angle rectangular subpaths. Any curve command (`C`, `Q`) in the path causes it to fall through to the PNG path.

---

### Clip paths (SVG / vector nodes)

A node is treated as an SVG vector when `isNodeSVG()` returns true (i.e., it is a `VECTOR`, `LINE`, `STAR`, `POLYGON`, or `BOOLEAN_OPERATION`, or a `RECTANGLE`/`ELLIPSE` with complex vector paths).

The clip-path pipeline (`src/CSSExporter/utils/clipPath.ts`):

1. Concatenate every `fillGeometry[i].data` string — a node can have multiple disjoint fill regions (e.g. separate bars of a menu icon), and a single region can itself be a compound path with a hole (a ring, which Figma marks with `windingRule: EVENODD`).
2. Send a `flatten-svg` message to the UI iframe (`ui-src/src/listeners/flatten-svg.ts`) because the plugin sandbox has no SVG DOM. The iframe splits the path on each `M`/`m` command and flattens every subpath independently, returning one point array per subpath (`flattened-svg-result`) — not a single merged list, since `getTotalLength`/`getPointAtLength` would otherwise silently skip the zero-length jump between subpaths.
3. `buildClipPath` combines all subpaths into a single non-self-intersecting boundary via the "keyhole" technique: each subpath after the first is bridged in by walking to its closest point on the current combined boundary, tracing the subpath fully, then walking back along the same (zero-width, so invisible) edge. A shape with only one subpath is unaffected — bridging is a no-op.
4. Each point is converted to percentages: `x% = (x / width) * 100`.
5. The polygon is applied as `clip-path: polygon(evenodd, x1%,y1% x2%,y2% ...)` on the `.className-background` element. `evenodd` is used unconditionally — it doesn't depend on the relative winding direction of the bridged-in subpaths (unlike `nonzero`), and is equivalent to `nonzero` for the common single-subpath case.
6. If the bridged point count exceeds `MAX_CLIP_PATH_POINTS`, `isTooComplex` is returned instead and the node falls back to a rasterized image export.

**Clip-path is skipped** when the background is already being exported as a rasterized image — the image itself carries the shape.

---

### Masks

Figma masks are detected during frame traversal in `src/nodes/Frame/Frame.ts`. When a node is a mask (`isMask: true`), a synthetic `MaskNode` wrapper is created by `createMaskNode()` that carries:

- `originalNode` — the Figma mask shape
- `maskChildren` — the nodes that are masked by it
- `type: 'MASK'`

During traversal, the id of the mask node is written to `pluginData('masked-by')` on each masked child. Position calculation in `src/CSSExporter/utils/position.ts` reads this key back to re-anchor the child's `top`/`left` relative to the mask bounding box rather than the parent frame. The mask node itself is sized to the combined bounding box of itself and all its masked children (`getMaskBoundingBox`).

The mask shape is exported as a full PNG via `ImageExporter.exportMaskImage()` — the shape's `isMask` flag is temporarily set to `false` on the clone so Figma exports the fill rather than applying masking.

---

### Text nodes

Text nodes (`TEXT`) are handled by `GFTextNode` (`src/nodes/Text/TextNode.ts`).

**HTML output:**
```html
<p cohinline class="text-node-abc123">
  <span class="text-node-abc123-0">Hello </span>
  <span class="text-node-abc123-1">World</span>
</p>
```

Each `<span>` corresponds to one styled segment from Figma's `getStyledTextSegments()`. A text node with uniform styling produces a single span.

**Per-segment CSS properties:**

| Property | Source in Figma | Notes |
|----------|----------------|-------|
| `color` | First `SOLID` fill of the segment | Gradient fills fall back to `inherit` — `background-clip: text` is not supported in Gameface |
| `font-size` | `fontSize` | Converted to `vh` |
| `font-weight` | `fontWeight` | Numeric (100–900) |
| `font-family` | `fontName.family` + subset detection | May be a comma-separated list of subset-specific families; falls back to `'Noto Sans'` |
| `font-style` | `fontName.style` | `italic` if the style name contains "Italic", otherwise `normal` |
| `letter-spacing` | `letterSpacing` | `PERCENT` → `em`; `PIXELS` → converted to `em` relative to font size |
| `line-height` | `lineHeight` | `AUTO` → `normal`; `PERCENT` → unitless ratio; `PIXELS` → ratio relative to font size |
| `text-transform` | `textCase` | `UPPER`→`uppercase`, `LOWER`→`lowercase`, `TITLE`→`capitalize` |
| `text-decoration` | `textDecoration` | `UNDERLINE`→`underline`, `STRIKETHROUGH`→`line-through` |
| `text-stroke-color/width` | `strokes[0]` (solid only) |  |

**Container-level text CSS** (on the `<p>` element):
- `text-align` — from `textAlignHorizontal` (`LEFT`/`CENTER`/`RIGHT`/`JUSTIFIED`)
- `align-items` — from `textAlignVertical` mapped to flex alignment (`TOP`→`flex-start`, `CENTER`→`center`, `BOTTOM`→`flex-end`)
- `white-space: pre-wrap` — preserves newlines from Figma
- `margin: 0` — resets browser default `<p>` margin

---

### Font subsetting and locales

Font resolution happens before code generation in `src/FontExporter/FontExporter.ts`. The plugin detects which Unicode subsets are actually used in the text by scanning every character's code point (`src/FontExporter/utils/getSubsetFromCharacters.ts`):

| Unicode range | Subset name |
|--------------|------------|
| U+0000–U+00FF | `latin` |
| U+0100–U+017F | `latin-ext` |
| U+0370–U+03FF | `greek` |
| U+1F00–U+1FFF | `greek-ext` |
| U+0400–U+04FF | `cyrillic` |
| U+0500–U+052F | `cyrillic-ext` |
| U+0590–U+05FF | `hebrew` |
| U+0600–U+06FF | `arabic` |
| U+0900–U+097F | `devanagari` |
| U+4E00–U+9FFF | `chinese-simplified` |
| U+3400–U+4DBF | `chinese-traditional` |

Each subset that is actually used gets its own `font-family` entry and its own `.ttf` file in the zip (`<font>-regular_400_latin.ttf`, `<font>-regular_400_cyrillic.ttf`, etc.). The `font-family` list on each `<span>` includes the subset-specific family names in order, so the browser selects the right font file for each character.

If a subset is not available for a given font, the entry falls back to `'Noto Sans <subset>'`.

---

### Auto-layout (flex)

When a `FRAME`/`INSTANCE`/`COMPONENT` has Figma auto-layout enabled (`layoutMode !== 'NONE'`), the node is treated as a flex container. A separate `.className-flex` class is generated alongside the main class, carrying:

- `display: flex`
- `flex-direction`: `row` or `column`
- `flex-wrap`: `wrap` or `nowrap`
- `justify-content`, `align-items`, `align-content`
- `gap`, for non-negative `itemSpacing` (Gameface supports the native `gap` property since 2.1.0). Gameface does not accept negative `gap` values, so for negative `itemSpacing` (Figma's way of overlapping auto-layout items), a negative `margin-top`/`margin-left` on the container is used instead, compensating for a matching negative margin applied directly to each flex item. When the container wraps, the cross-axis margin uses Figma's `counterAxisSpacing` (row/column gap between wrapped lines) rather than reusing `itemSpacing` — the two are independent and `counterAxisSpacing` may be 0 even when `itemSpacing` isn't.

Flex item children get `position: relative` (overriding the default `absolute`), and their `top`/`left` are removed. They also receive `flex` and `align-self`; margin values are only added when `itemSpacing` (or `counterAxisSpacing`, for wrapped lines) is negative — the native `gap` on the container handles non-negative spacing.

---

### Effects

Effects are handled in `src/CSSExporter/utils/effects.ts`:

- **Drop shadow / inner shadow** → `box-shadow` on the background element
- **Layer blur** → `filter: blur(Xvh)` on the main element  
- **Background blur** → `backdrop-filter: blur(Xvh)` on the main element
- **Complex effects** (anything that does not map cleanly to a CSS filter) → the background is exported as a PNG and effects are baked into the image

---

### Transforms and rotation

Node rotations and skews from Figma are emitted as `transform: matrix(...)` on the main element with `transform-origin: top left`. The matrix is computed from Figma's `relativeTransform` property via `getRelativeCssTransform()` in `src/utils/transformUtils.ts`. Transforms are suppressed on mask nodes and component root elements.

---

## Known Limitations

- **Invisible items are not exported** — only nodes with `visible: true` are processed; hidden layers are skipped entirely.
- **Radial and Diamond gradients do not work on Frame nodes** — use a Rectangle as the background layer instead.
- **Instances are rendered inline** — `INSTANCE` and `COMPONENT` nodes are treated as `GFFrame` and output as flat HTML/CSS, not as component references. There are no `<Component/>` style includes.
- **No automated tests** — the project has no test suite. ESLint is the only automated quality gate (`npm run lint`).
- **Plugin sandbox SVG limitations** — SVG path operations (flatten, bbox) are offloaded to the UI iframe because the Figma plugin sandbox does not expose a full SVG DOM.
- **Component mode assumes 1920×1080** — individual component export uses a fixed viewport size of 1920×1080 for percentage-based CSS calculations.
