export interface Template {
  label: string;
  path: string;
}

const TEMPLATES = {
  'gameface-ui': { label: 'Gameface UI (Recommended)', path: 'CoherentLabs/Gameface-UI/' },
  solid: { label: 'SolidJS', path: 'CoherentLabs/frontend-tools/gameface-templates/solid' },
  react: { label: 'React', path: 'CoherentLabs/frontend-tools/gameface-templates/react' },
  preact: { label: 'Preact', path: 'CoherentLabs/frontend-tools/gameface-templates/preact' },
  vue: { label: 'Vue', path: 'CoherentLabs/frontend-tools/gameface-templates/vue' },
  svelte: { label: 'Svelte', path: 'CoherentLabs/frontend-tools/gameface-templates/svelte' },
} satisfies Record<string, Template>;

export type TemplateKey = keyof typeof TEMPLATES;

export default TEMPLATES;
