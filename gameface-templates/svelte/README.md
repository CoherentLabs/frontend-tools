# Gameface + Svelte

Minimal **TypeScript + Vite** starter for building Gameface UIs with **Svelte 5**.

Uses the Svelte 5 `mount()` API (no legacy `new App({ target })` constructor).

## Quick start

To install the template run

```bash
npm create gameface-app my-ui -- -t svelte -y
cd my-ui
npm run dev
```

After the installation is complete, open `http://localhost:3000/` in the Gameface Player.

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
| Inline styles | `style:prop` for dynamic values only (e.g. `style:width="{percent}%"` on `ProgressBar`). Static values become `gf-prop--*` classes via [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) |
| Responsive sizing | `rem` relative to `html` font-size; `useResponsiveRootFontSize` composable scales from a 1920×1080 reference |

Vite is configured with Sass `modern-compiler`, `base: './'`, and `cssCodeSplit: false` for Gameface-friendly output.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | `svelte-check` + production build to `dist/` |
| `npm run lint` | ESLint with `eslint-plugin-gameface` |
| `npm run preview` | Preview the production build locally |

## Production

```bash
npm run build
```

Load `dist/index.html` in the Gameface Player.

## Tooling

- [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) + UnoCSS `presetGameface()`
- [eslint-plugin-gameface](https://www.npmjs.com/package/eslint-plugin-gameface)
- `@sveltejs/vite-plugin-svelte`

## Svelte + Gameface notes

Root mount target is `#app` in `index.html`. The style transformer understands Svelte `style:prop` directives and merges generated `gf-prop` classes with existing `class` attributes.

Dynamic `style:prop` values (containing `{…}` interpolation) are left untouched so UnoCSS and Gameface never see invalid class names.
