# Gameface + React

Minimal **TypeScript + Vite** starter for building Gameface UIs with **React 19**.

## Quick start

To install the template run

```bash
npm create gameface-app my-ui -- -t react -y
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
| Inline styles | Kept minimal — only truly dynamic values (e.g. progress width, carousel `background-image`). Static values are transformed to `gf-prop--*` classes by [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) |
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
- [eslint-plugin-gameface](https://www.npmjs.com/package/eslint-plugin-gameface)

## React + Gameface notes

**Passive listener probe.** React DOM runs a one-time `addEventListener('test', …)` feature check at startup. Gameface may log *"Attempting to remove test event listener…"* — harmless noise from React internals, not your app code. This warning is not critical and can be ignored.

## Docs

- [React Support (legacy Webpack)](https://docs.coherent-labs.com/cpp-gameface/content_development/reactsupport/) — prefer this Vite template for new projects
