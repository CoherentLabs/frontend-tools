---
title: Customization
---

## Custom CSS

To customize the styles applied to your Starlight site when using `coherent-docs-theme`, you can provide additional CSS files to modify or extend Starlight and `coherent-docs-theme` default styles.

[Learn more about custom CSS in the Starlight documentation.](https://starlight.astro.build/guides/css-and-tailwind/#custom-css-styles)

## Cascade layers

Like Starlight, `coherent-docs-theme` uses [cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers) internally to manage the order of its styles.
This ensures a predictable CSS order and allows for simpler overrides.
Any custom unlayered CSS will override the default styles from Starlight and `coherent-docs-theme`.

If you are using cascade layers, you can use [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) in your [custom CSS](https://starlight.astro.build/guides/css-and-tailwind/#custom-css-styles) to define the order of precedence for different layers relative to styles from the `starlight` and `coh-theme` layers:

```css "starlight" "coh-theme"
/* src/styles/custom.css */
@layer my-reset, starlight, coh-theme, my-overrides;
```

The example above defines a custom layer named `my-reset`, applied before all Starlight and `coherent-docs-theme` layers, and another named `my-overrides`, applied after all Starlight and `coherent-docs-theme` layers.
Any styles in the `my-overrides` layer would take precedence over Starlight and `coherent-docs-theme` styles, but Starlight or `coherent-docs-theme` could still change styles set in the `my-reset` layer.
