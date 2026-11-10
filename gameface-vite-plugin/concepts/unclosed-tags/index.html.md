# Resolving Unclosed Tags

Source: https://frontend-tools.coherent-labs.com/gameface-vite-plugin/concepts/unclosed-tags/

SolidJS optimizes the build output by minimizing file size, which includes generating HTML with unclosed tags. However, Gameface requires valid HTML structure and cannot parse files with unclosed tags. This plugin addresses the issue by restructuring the tags into a valid format.
