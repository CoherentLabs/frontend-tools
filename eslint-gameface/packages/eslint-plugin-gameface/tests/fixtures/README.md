Add `tests/fixtures/**/*` to your `eslint.config.js` `files` glob if you want them in CI.

From repo root:

```bash
npx eslint packages/eslint-plugin-gameface/tests/fixtures/warnings.css --config eslint.config.js
npx eslint packages/eslint-plugin-gameface/tests/fixtures/warnings.html --config eslint.config.js
```

For the repo root `eslint.config.js`, `@eslint/css` `css/use-baseline` also flags some Gameface-unsupported properties (e.g. `accent-color`). Disable it for fixture paths if you want to isolate `gameface/css-no-unsupported-properties`:

```js
{
  files: ["packages/eslint-plugin-gameface/tests/fixtures/**/*.css"],
  rules: { "css/use-baseline": "off" },
},
```

Expected highlights:

- **warnings.html:** `gameface/html-parsed-no-impl` on `<select>`; `gameface/html-partial-features` on `<img alt>` (partial catalog).
- **warnings.css:** unsupported property, partial value, `:any-link` (unsupported catalog), `:nth-child(2 of .class)` (partial catalog exact match).
