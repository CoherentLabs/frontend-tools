## vite-plugin-gameface-styles
A framework-agnostic Vite plugin and UnoCSS preset designed specifically for Coherent Gameface.

Because Gameface's CSS parser cannot handle standard web escape characters (like \: or \[\]), using standard Tailwind or UnoCSS classes directly will break your game's UI. This plugin acts as a pre-compiler that sanitizes your HTML/JSX templates, safely extracts inline styles into atomic classes, and warns you about Gameface-unsupported CSS constraints at build time.

Supports SolidJS, React, Vue, Svelte, and vanilla HTML.