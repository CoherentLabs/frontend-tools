# Changelog

Source: https://frontend-tools.coherent-labs.com/vite-solid-style-to-css-plugin/changelog/

## 1.0.3 Latest

Fix Resolved Vite warnings related to the plugin when building with source maps enabled by regenerating the source maps after transforming the code.

The warnings included:

```plaintext
[plugin solid-style-to-css] Sourcemap is likely to be incorrect: a plugin (solid-style-to-css) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help
```

## 1.0.2

New Added public documentation for the plugin.

## 1.0.1

Feature Plugin automatically converts `styles` property to `CSS` classes.

Feature Plugin adds unique class names to avoid style conflicts.
