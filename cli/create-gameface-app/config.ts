export interface Template {
  label: string;
  hint: string;
  path: string;
}

const TEMPLATES = {
  'gameface-ui': { label: 'Gameface UI', hint: 'Recommended', path: 'CoherentLabs/Gameface-UI/' },
  solid: { label: 'SolidJS', hint: '', path: 'CoherentLabs/frontend-tools/gameface-templates/solid#frameworks-templates' },
  react: { label: 'React', hint: '', path: 'CoherentLabs/frontend-tools/gameface-templates/react#frameworks-templates' },
  preact: { label: 'Preact', hint: '', path: 'CoherentLabs/frontend-tools/gameface-templates/preact#frameworks-templates' },
  vue: { label: 'Vue', hint: '', path: 'CoherentLabs/frontend-tools/gameface-templates/vue#frameworks-templates' },
  svelte: { label: 'Svelte', hint: '', path: 'CoherentLabs/frontend-tools/gameface-templates/svelte#frameworks-templates' },
} satisfies Record<string, Template>;

export type TemplateKey = keyof typeof TEMPLATES;

export default TEMPLATES;
