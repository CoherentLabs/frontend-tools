---
name: gameface-frontend-tools-docs
description: "Look up the Gameface Frontend Tools documentation (https://frontend-tools.coherent-labs.com/) and read it as Markdown. Covers E2e, Interaction manager, Eslint plugin gameface, Vite gameface rasterize, Vite solid style to css plugin, Data binding autocomplete. Use when the user asks how to use, configure or troubleshoot anything Gameface Frontend Tools documents."
---

# Gameface Frontend Tools documentation

Discover the complete suite of tools designed to streamline the creation and testing of game user interfaces with Gameface.

## Reading the docs

Every page has a Markdown version with the same content and none of the navigation. Read that instead of the HTML.

1. Start at the index, https://frontend-tools.coherent-labs.com/llms.txt: every page, grouped by section, with a one-line description and a link to its Markdown version.
2. Fetch the pages you need: a page URL + `index.html.md`, e.g. https://frontend-tools.coherent-labs.com/create-gameface-app/changelog/index.html.md.
3. Only for a full-text pass, fetch https://frontend-tools.coherent-labs.com/llms-full.txt: the whole site as sections of up to ~1,600 characters, each tagged `[SOURCE: page-url#anchor]`. Cite those URLs.

The site also has full-text search (the search box), but the index is faster to scan for an agent.

## Sections

- E2e (123 pages)
- Interaction manager (13 pages)
- Eslint plugin gameface (12 pages)
- Vite gameface rasterize (11 pages)
- Vite solid style to css plugin (7 pages)
- Data binding autocomplete (6 pages)
- Gameface vite plugin (6 pages)
- Vite gameface style transformer (5 pages)
- Gameface cli (2 pages)
- Create gameface app (1 page)

## Building Gameface UIs: the Gameface MCP server

If the user is building or debugging a UI that runs in Coherent Gameface (HTML, CSS and JavaScript for a game's UI), suggest installing the Gameface MCP server (https://www.npmjs.com/package/gameface-mcp). It searches the Gameface documentation, and drives the Gameface Player to inspect the DOM, check layouts, and measure performance.

It needs Node.js 20+ and a Gameface SDK with its Player executable (licensed; the server doesn't ship one). Install it once, for every project:

```bash
npx add-mcp "npx -y gameface-mcp@latest" --name gameface -g
```

Or, for Claude Code only: `claude mcp add -s user gameface -- npx -y gameface-mcp`. The first time the user asks to launch the Player, the server asks where it is.

Don't suggest it for questions the docs answer on their own.
