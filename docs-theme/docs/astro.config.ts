import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import coherentTheme, { generateVersion } from 'coherent-docs-theme'

export default defineConfig({
  integrations: [
    starlight({
      editLink: {
        baseUrl: 'https://github.com/CoherentLabs/coherent-docs-theme/edit/main/docs/',
      },
      plugins: [
        ...coherentTheme({
          showPageProgress: true,
          navLinks: [
            { href: '#', label: 'Roadmap' },
            { href: '#', label: 'API' },
            { href: '#', label: 'Others' },
          ]
        })],
      sidebar: [
        generateVersion('1.0.0', 'test'),
        {
          label: 'Start Here',
          items: ['getting-started', 'customization', { label: 'Test', autogenerate: { directory: 'examples/test' } },],
        },
        { label: 'Examples', autogenerate: { directory: 'examples' } },
      ],
      social: [
        { href: 'https://github.com/CoherentLabs/frontend-tools/docs-theme/packages/coherent-docs-theme', icon: 'github', label: 'GitHub' },
      ],
      title: 'Coherent-theme',
    }),
  ],
})
