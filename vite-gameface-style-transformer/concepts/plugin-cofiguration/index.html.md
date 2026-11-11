# Plugin configuration

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/vite-gameface-style-transformer/concepts/plugin-cofiguration/

The plugin accepts an optional configuration object with two flags:

Option | Type | Default | Description
`suppressWarnings` | `boolean` | `false` | Disables plugin warning logs in the console.
`isSolidProject` | `boolean` | `false` | Treats JSX/TSX output as Solid-style and uses `class` instead of React-style `className` when injecting classes.

## suppressWarnings

Prevents warnings from being printed by the transformer.
