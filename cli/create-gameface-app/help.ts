import { box } from '@clack/prompts';
import TEMPLATES from './config.js';

const HELP = `
Usage: npm create gameface-app [name] -- [options]

Options:
  -t, --template <name>   Template to use (skips the prompt)
  -y, --yes               Skip confirmation prompts
  -h, --help              Show this help

Templates:
  ${Object.keys(TEMPLATES).join(', ')}

Example:
  npm create gameface-app my-app -- --template gameface-ui`;

export function printHelp() {
  box(HELP, 'Help', {
    contentAlign: 'left',
    titleAlign: 'center',
    width: 'auto',
    rounded: true,
  });
}
