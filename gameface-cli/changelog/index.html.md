# Changelog

Source: https://frontend-tools.coherent-labs.com/gameface-cli/changelog/

## 1.1.0 Latest

Feature `track` records components that are already in a project but were never registered under `gameface-ui-components`, so `status` and `update` can see them. It compares every file against the registry: components that match are recorded at their real version, components whose files differ are recorded as `0.0.0` so `update` picks them up, and components that are not present are left alone. Only `package.json` is written - component files are never touched unless you pick the update option.

Feature `--hard` reinstalls components even when their recorded version already matches the registry. Use it to restore a component you have edited, or to refresh the shared files a component depends on.

Feature `--verbose` lists the individual files behind each result instead of just the counts.

Improvement The **Setup required** note now names the steps a project is actually missing and links the guide. It is based on the project itself rather than on whether the CLI has run before, so a Gameface UI project no longer sees it and a project that still needs setting up keeps being told.

Improvement `add` and `update` now write only the files that differ from the published version, instead of rewriting every file of every component they touch. Updating a project that is behind by a few files no longer produces a diff spanning its whole component tree.

Fix Binary files are no longer corrupted on install. Component files were decoded as UTF-8 text before being written, which damaged assets such as the icon fallback image and any font shipped with a component.

## 1.0.0

Feature Initial release of `gameface-cli`.

Feature `add <components...>` installs one or more components together with their transitive dependencies. Shared dependencies are downloaded once and `npm install` runs a single time, however many components are requested.

Feature `update [components...]` brings installed components to the current published version. With no arguments it sweeps everything tracked in `package.json`, leaving up-to-date components untouched.

Feature `status` lists installed components with their versions, flags the ones that have updates available, and reports how many more components the library offers.

Feature Installed components and their versions are recorded under `gameface-ui-components` in the project’s `package.json`, preserving its existing indentation.

Feature `--yes` skips every confirmation prompt for non-interactive and CI use, and `--help` prints usage.

Feature Setup instructions are printed the first time components are installed into a project that has not used the CLI before.
