# Gameface + SolidJS

Minimal **TypeScript + Vite** starter for building Gameface UIs with **SolidJS**.

Part of [gameface-templates](../README.md). Copy this folder or use [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit coherentlabs/frontend-tools/gameface-templates/solid my-ui
cd my-ui
npm install
npm run dev
```

For a full component library (HUD, menus, routing), see [Gameface UI](https://gameface-ui.coherent-labs.com/):

```bash
npx degit CoherentLabs/Gameface-UI my-gameface-ui
```

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000/` in the Gameface Player.

## What's included

Sample **entry page** demo:

- Parallax-style animated background
- `Achievements` (left column)
- `PlayerStats` (top right)
- Interactive `CarouselMenu` (bottom center)
- `START GAME` action button

`gameface-models/Model.json` is wired for ESLint data-binding checks.

## Styling

| Layer | Approach |
|-------|----------|
| Component layout | SCSS modules (`.module.scss` per component) |
| Utilities | UnoCSS with `presetGameface()` |
| Inline styles | Kept minimal — static values become `gf-prop--*` classes via [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) with `isSolidProject: true` |
| Responsive sizing | `rem` relative to `html` font-size; `useResponsiveRootFontSize` scales from a 1920×1080 reference |

Vite is configured with Sass `modern-compiler`, `base: './'`, and `cssCodeSplit: false` for Gameface-friendly output.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run lint` | ESLint with `eslint-plugin-gameface` |
| `npm run preview` | Preview the production build locally |

## Production

```bash
npm run build
```

Load `dist/index.html` in the Gameface Player.

## Tooling

- [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) + UnoCSS `presetGameface()`
- [vite-gameface](https://www.npmjs.com/package/vite-gameface) — Solid-specific compile options for Gameface
- [eslint-plugin-gameface](https://www.npmjs.com/package/eslint-plugin-gameface)
- `vite-plugin-solid` with explicit `solid` compiler flags (closing tags and quotes preserved for the engine)

## Solid + Gameface notes

`vite.config.mts` passes `isSolidProject: true` to the style transformer and loads `vite-gameface()` after the Solid plugin. Do not enable `omitLastClosingTag` / `omitNestedClosingTags` / `omitQuotes` — Gameface expects standard HTML-like output.

`useResponsiveRootFontSize` runs on mount via Solid's `onMount`, which aligns well with Gameface's layout timing.

## Docs

- [SolidJS Support (Gameface)](https://docs.coherent-labs.com/cpp-gameface/content_development/solidjssupport/)
- [Gameface UI](https://gameface-ui.coherent-labs.com/)
