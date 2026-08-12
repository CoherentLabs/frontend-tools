# gameface-cli

A command-line tool that adds and updates individual [Gameface UI](https://gameface-ui.coherent-labs.com/) components in an existing SolidJS project. Instead of pulling the whole library, you install the components you actually use, and the CLI keeps them current as new versions ship.

```bash
npx gameface-cli add Dropdown
```

| Command | Description |
| --- | --- |
| `add <components...>` | Install components, with their dependencies |
| `update [components...]` | Update to the latest version, or everything installed if omitted |
| `status` | Show installed components and available updates |

You can read the full documentation for the CLI [here](https://frontend-tools.coherent-labs.com/gameface-cli/getting-started/).
