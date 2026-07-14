# Gameface + Vue

Minimal **TypeScript + Vite** starter for building Gameface UIs with **Vue 3**.

## Quick start

To install the template run

```bash
npm create gameface-app my-ui -- -t vue -y
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
| Inline styles | Kept minimal — only truly dynamic values. Static values are transformed to `gf-prop--*` classes by [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) |
| Responsive sizing | `rem` relative to `html` font-size; `useResponsiveRootFontSize` composable scales from a 1920×1080 reference |

Vite is configured with Sass `modern-compiler`, `base: './'`, and `cssCodeSplit: false` for Gameface-friendly output.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | `vue-tsc` + production build to `dist/` |
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
- `@vitejs/plugin-vue`

## Vue + Gameface notes

Root mount target is `#app` in `index.html`. Responsive font scaling runs in `onMounted` via the `useResponsiveRootFontSize` composable — typically early enough for Gameface's first layout pass.

For `style:` bindings, only use dynamic values where the property must change at runtime; let the style transformer handle static declarations.
