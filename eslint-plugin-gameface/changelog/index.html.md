# Changelog

Source: https://frontend-tools.coherent-labs.com/eslint-plugin-gameface/changelog/

## 1.3.1 Latest

Fix Fixed declarations inside SCSS suffix selectors (`&-option`, `&__item`, `&--active`) not being linted in `.scss` files.

Previously the CSS parser could not read these selectors, so the whole enclosing block—including any nested `&:hover` rules and following sibling blocks—was skipped and no Gameface errors were reported for it:

```scss
.dropdown {
    display: grid; // reported

    &-option {
        display: grid; // was not reported, now reported

        &:hover {
            display: grid; // was not reported, now reported
        }
    }
}
```

This works automatically with the `flat/recommended` preset—no configuration changes are needed.

## 1.3.0

Feature Added a config option to set specific Gameface target version.

This can be done by adding the `version` field under the `gameface` settings in your ESLint configuration, as shown below:

```js
import gameface from "eslint-plugin-gameface";

export default [
  {
    ignores: ["**/node_modules/**"],
  },
  ...gameface.configs["flat/recommended"],
  {
    settings: {
      gameface: {
        version: "3.1.2.1",
      }
    },
    files: ["examples/**/*"],
    rules: {
      "css/use-baseline": "off",
    },
  },
];
```

For more information about the supported version check the following section in the documentation: Enabling linter for a specific Gameface version.

## 1.1.0

Feature Added support for linting `.vue` files.

Feature Added support for linting `.svelte` files.

**Note:** Currently plugin supports Vue 3 single file components and Svelte 4/5 `.svelte` SFCs.

## 1.0.0

Feature First release of ESLint support for Gameface projects: HTML, CSS, SCSS, JavaScript, JSX, TypeScript, and TSX.

Feature Recommended flat config preset to catch unsupported CSS, HTML, data binding, SVG, and JS API usage before runtime.
