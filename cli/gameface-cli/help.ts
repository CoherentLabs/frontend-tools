export function printHelp() {
  console.log(`
gameface-cli — add and update Gameface UI components in a SolidJS project

Usage
  gameface-cli <command> [components...]

Commands
  add <components...>      Add components, with their dependencies
  update [components...]   Update to the latest version (all installed if omitted)
  track                    Record components already in the project, so they can be updated
  status                   Show installed components and available updates

Options
  -y, --yes                Skip confirmation prompts
  -h, --help               Show this message
  -v, --verbose            List individual files       (add, update, track)
      --hard               Reinstall even when up to date, overwriting local edits (update)

Examples
  gameface-cli add Dropdown
  gameface-cli add Dropdown Scroll
  gameface-cli update
  gameface-cli update Dropdown --yes
  gameface-cli track
  gameface-cli track --verbose
  gameface-cli update Dropdown --hard
  gameface-cli status
`);
}