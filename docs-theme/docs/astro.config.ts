import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import coherentThemePlugin from 'coherent-docs-theme'
import { generateVersion, getCoherentReleases } from 'coherent-docs-theme'

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        ...coherentThemePlugin({
          documentationSearchTag: 'Test docs',
        })],
      sidebar: [
        generateVersion('1.0.0'),
        {
          label: 'Start Here',
          items: ['getting-started', 'customization', { label: 'Test', autogenerate: { directory: 'examples/test' } },],
        },
        { label: 'Examples', autogenerate: { directory: 'examples' } },
        { label: 'Changelog', autogenerate: { directory: 'changelog' } },
        ...getCoherentReleases(),
      ],
      social: [
        { href: 'https://github.com/CoherentLabs/frontend-tools/docs-theme/packages/coherent-docs-theme', icon: 'github', label: 'GitHub' },
      ],
      title: 'Coherent-theme',
    }),
  ],
})
