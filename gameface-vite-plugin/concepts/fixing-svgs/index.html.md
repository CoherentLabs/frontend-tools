# Fixing SVGs

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/gameface-vite-plugin/concepts/fixing-svgs/

Using SVGs in Gameface with SolidJS can lead to compatibility issues due to the way SolidJS handles SVG elements. The Gameface Vite plugin addresses these issues by reformatting SVG templates to ensure they are compatible with Gameface’s requirements. `<svg>` elements may contain unclosed inner tags and attributes without proper quotation marks. These issues prevent Gameface from parsing the SVG elements correctly.

The plugin resolves these problems by reformatting the `<svg>` templates into a valid structure, ensuring compatibility with Gameface.
