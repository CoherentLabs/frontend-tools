# Changelog

Source: https://frontend-tools.coherent-labs.com/create-gameface-app/changelog/

## 1.1.1 Latest

Fix Remove the `src/recipes` directory from Projects scaffolded from the `gameface-ui` template.

## 1.1.0

Feature Projects scaffolded from the `gameface-ui` template now record the components they ship under `gameface-ui-components` in `package.json`, with versions read from the library registry. `gameface-cli` uses this to report and update them straight after scaffolding.

## 1.0.0

Feature Initial release of `create-gameface-app`.

Feature Interactive scaffolding of Gameface projects from the `gameface-ui`, `solid`, `react`, `preact`, `vue`, and `svelte` templates.

Feature Command-line arguments for non-interactive use: a project name positional plus `--template`, `--yes`, and `--help` flags.

Feature Optional automatic installation of dependencies with the detected package manager once scaffolding completes.
