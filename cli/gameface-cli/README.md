# gameface-cli

A command-line tool that adds and updates individual [Gameface UI](https://gameface-ui.coherent-labs.com/) components in an existing SolidJS project. Instead of pulling the whole library, you install the components you actually use, and the CLI keeps them current as new versions ship.

```bash
npx gameface-cli add Dropdown
```

| Command | Description |
| --- | --- |
| `add <components...>` | Install components, with their dependencies |
| `update [components...]` | Update to the latest version, or everything installed if omitted |
| `track` | Record components already in the project so they can be updated |
| `status` | Show installed components and available updates |

Already have Gameface UI components in your project but never used the CLI? Run `npx gameface-cli track` once to register them.

You can read the full documentation for the CLI [here](https://frontend-tools.coherent-labs.com/gameface-cli/getting-started/).
