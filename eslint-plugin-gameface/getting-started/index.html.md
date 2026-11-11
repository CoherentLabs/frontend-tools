# Overview

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/eslint-plugin-gameface/getting-started/

Use **eslint-plugin-gameface** in your projects to catch unsupported or risky Gameface patterns **during development**, instead of at runtime.

The plugin checks the same kinds of problems you would hit in Gameface for:

- **CSS and SCSS** — properties, functions, selectors, and documented limits (for example `var()` inside `@keyframes`)
- **HTML** — unsupported or partial elements, inline and embedded styles, data binding attributes
- **JSX / TSX** — inline styles, data binding, and SVG markup in components
- **Vue SFC** (`.vue`) — template, script, and `<style>` blocks with the same checks as HTML/JSX/CSS
- **Svelte SFC** (`.svelte`) — markup, script, and `<style>` blocks with the same checks as HTML/JSX/CSS
- **JavaScript / TypeScript** — globals and APIs that Gameface does not support or only partially supports
