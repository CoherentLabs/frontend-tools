# Gameface + Preact

Minimal **TypeScript + Vite** starter for building Gameface UIs with **Preact 10**.

Part of [gameface-templates](../README.md). Copy this folder or use [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit coherentlabs/frontend-tools/gameface-templates/preact my-ui
cd my-ui
npm install
npm run dev
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

| Layer             | Approach                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component layout  | SCSS modules (`.module.scss` per component)                                                                                                                                                 |
| Utilities         | UnoCSS with `presetGameface()`                                                                                                                                                              |
| Inline styles     | Kept minimal — only truly dynamic values. Static values are transformed to `gf-prop--*` classes by [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) |
| Responsive sizing | `rem` relative to `html` font-size; `useResponsiveRootFontSize` scales from a 1920×1080 reference                                                                                           |

Vite is configured with Sass `modern-compiler`, `base: './'`, and `cssCodeSplit: false` for Gameface-friendly output.

## Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Dev server on port 3000                 |
| `npm run build`   | Typecheck + production build to `dist/` |
| `npm run lint`    | ESLint with `eslint-plugin-gameface`    |
| `npm run preview` | Preview the production build locally    |

## Production

```bash
npm run build
```

Load `dist/index.html` in the Gameface Player.

## Tooling

- [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) + UnoCSS `presetGameface()`
- [eslint-plugin-gameface](https://www.npmjs.com/package/eslint-plugin-gameface)
- `@preact/preset-vite` with `react` → `preact/compat` aliasing where needed

## Preact + Gameface notes

Preact uses the same JSX patterns as the React template (`className`, hooks). `useResponsiveRootFontSize` applies the root font size synchronously on load, then subscribes to `resize` in `useEffect`.

## Docs

- [Preact Support (legacy preact-cli)](https://docs.coherent-labs.com/cpp-gameface/content_development/preactsupport/) — prefer this Vite template for new projects
