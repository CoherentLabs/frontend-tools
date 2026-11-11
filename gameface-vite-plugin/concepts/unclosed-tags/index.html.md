# Resolving Unclosed Tags

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/gameface-vite-plugin/concepts/unclosed-tags/

SolidJS optimizes the build output by minimizing file size, which includes generating HTML with unclosed tags. However, Gameface requires valid HTML structure and cannot parse files with unclosed tags. This plugin addresses the issue by restructuring the tags into a valid format.
