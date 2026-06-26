# Gameface Vite Templates

Minimal **Vite-only** starters for building Gameface UIs with React, Preact, SolidJS, Vue, or Svelte. Each template is pre-wired with Gameface Vite plugins, UnoCSS, and ESLint.

## Template matrix

| Framework | TypeScript | JavaScript |
|-----------|------------|------------|
| React | [`react-typescript`](react-typescript/) | [`react-javascript`](react-javascript/) |
| Preact | [`preact-typescript`](preact-typescript/) | [`preact-javascript`](preact-javascript/) |
| SolidJS | [`solid-typescript`](solid-typescript/) | [`solid-javascript`](solid-javascript/) |
| Vue | [`vue-typescript`](vue-typescript/) | [`vue-javascript`](vue-javascript/) |
| Svelte | [`svelte-typescript`](svelte-typescript/) | [`svelte-javascript`](svelte-javascript/) |

## Quick start

Copy a template into your project folder:

```bash
cp -r gameface-templates/react-typescript my-ui
cd my-ui
npm install
npm run dev
```

Or with [degit](https://github.com/Rich-Harris/degit) from this repository:

```bash
npx degit coherentlabs/frontend-tools/gameface-templates/react-typescript my-ui
cd my-ui
npm install
npm run dev
```

## Gameface Player

**Development:** run `npm run dev`, then open Player with `--url=http://localhost:3000/`

**Production:** run `npm run build`, then load `dist/index.html` in Player

## SolidJS + components?

These templates are **minimal scaffolds**. For a full SolidJS component library (HUD, menus, routing), use [Gameface UI](https://gameface-ui.coherent-labs.com/):

```bash
npx degit CoherentLabs/Gameface-UI my-gameface-ui
```

## What's included

All templates:

- [vite-plugin-gameface-styles](https://www.npmjs.com/package/vite-plugin-gameface-styles) + UnoCSS `presetGameface()`
- [eslint-plugin-gameface](https://www.npmjs.com/package/eslint-plugin-gameface)
- `base: './'` for relative production asset paths
- `gameface-models/Model.json` for ESLint data-binding validation

Solid templates additionally include:

- [vite-gameface](https://www.npmjs.com/package/vite-gameface)
- [vite-solid-style-to-css](https://www.npmjs.com/package/vite-solid-style-to-css)

## Validate all templates

```bash
node gameface-templates/scripts/validate-templates.mjs
```

## Sync checklist

When updating templates, keep these in sync across all ten variants:

- `vite.config` plugin order and `build` / `server` / `base` options
- `uno.config` preset
- `eslint.config.js`
- Demo app styles (Gameface-supported properties only)
- `gameface-models/Model.json`
- `.vscode/settings.json`

## Future CLI

A `create-gameface-app` CLI may copy these templates with an interactive framework/language picker. For now, use copy or degit as shown above.

## Docs

- [SolidJS Support](https://docs.coherent-labs.com/cpp-gameface/content_development/solidjssupport/) (current, Vite)
- [React Support](https://docs.coherent-labs.com/cpp-gameface/content_development/reactsupport/) (legacy Webpack/CRA — use these Vite templates instead)
- [Preact Support](https://docs.coherent-labs.com/cpp-gameface/content_development/preactsupport/) (legacy preact-cli — use these Vite templates instead)
- Svelte — supported via `vite-plugin-gameface-styles` (no official Gameface framework page yet)
- [Gameface UI](https://gameface-ui.coherent-labs.com/)
