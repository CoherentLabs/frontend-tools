export function printHelp() {
  console.log(`
gameface-cli — add and update Gameface UI components in a SolidJS project

Usage
  gameface-cli <command> [components...]

Commands
  add <components...>      Add components, with their dependencies
  update [components...]   Update to the latest version (all installed if omitted)
  status                   Show installed components and available updates

Options
  -y, --yes                Skip confirmation prompts (for CI)
  -h, --help               Show this message

Examples
  gameface-cli add Dropdown
  gameface-cli add Dropdown Scroll
  gameface-cli update
  gameface-cli update Dropdown --yes
  gameface-cli status
`);
}