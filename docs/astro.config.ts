import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightSidebarTopics from 'starlight-sidebar-topics'
import starlightLinksValidator from 'starlight-links-validator';
import coherentTheme, { generateMultipleDocsChangelog, generateVersionWithPackageJSON } from 'coherent-docs-theme'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getConfig() {
  const documentations = ['e2e', 'gameface-vite-plugin', 'vite-solid-style-to-css-plugin', 'interaction-manager', 'data-binding-autocomplete'];

  const sideBarTopics = [
    {
      link: '/e2e/getting-started',
      label: 'Gameface E2E',
      id: 'e2e',
      icon: 'rocket',
      items: [
        await generateVersionWithPackageJSON(
          '../e2e/package.json',
          'https://npmjs.org/gameface-e2e'
        ),
        {
          label: 'Getting Started',
          autogenerate: { directory: 'e2e/getting-started' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'e2e/concepts' },
        },
        generateMultipleDocsChangelog('e2e', path.join(__dirname, `./src/content/docs/e2e/changelog/index.mdx`)),
        {
          label: 'API Reference',
          collapsed: true,
          autogenerate: { directory: 'e2e/api', collapsed: true },

        },
      ],
    },
    {
      link: '/interaction-manager/getting-started',
      label: 'Interaction manager',
      id: 'interaction-manager',
      icon: 'puzzle',
      items: [
        await generateVersionWithPackageJSON(
          '../interaction-manager/package.json',
          'https://npmjs.org/coherent-gameface-interaction-manager'
        ),

        { label: 'Getting Started', autogenerate: { directory: 'interaction-manager/getting-started' } },
        { label: 'Features', autogenerate: { directory: 'interaction-manager/features' } },
        generateMultipleDocsChangelog('interaction-manager', path.join(__dirname, `./src/content/docs/interaction-manager/changelog/index.mdx`)),
      ],
    },
    {
      link: '/gameface-vite-plugin/getting-started',
      label: 'Gameface Vite Plugin',
      id: 'gameface-vite-plugin',
      icon: 'seti:vite',
      items: [
        await generateVersionWithPackageJSON(
          '../gameface-ui-vite-plugins/vite-gameface/package.json',
          'https://npmjs.org/vite-gameface'
        ),
        {
          label: 'Vite Solid Plugin Notice',
          link: '/gameface-vite-plugin/vite-plugin-solid/',
          badge: {
            text: `Important`,
            variant: 'caution',
          },
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'gameface-vite-plugin/getting-started' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'gameface-vite-plugin/concepts' },
        },
        generateMultipleDocsChangelog('gameface-vite-plugin', path.join(__dirname, `./src/content/docs/gameface-vite-plugin/changelog/index.mdx`)),
      ],
    },
    {
      link: '/vite-solid-style-to-css-plugin/getting-started',
      label: 'Solid Style to CSS Plugin',
      id: 'vite-solid-style-to-css-plugin',
      icon: 'seti:css',
      items: [
        await generateVersionWithPackageJSON(
          '../gameface-ui-vite-plugins/vite-solid-style-to-css/package.json',
          'https://npmjs.org/vite-solid-style-to-css'
        ),
        {
          label: 'Getting Started',
          autogenerate: { directory: 'vite-solid-style-to-css-plugin/getting-started' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'vite-solid-style-to-css-plugin/concepts' },
        },
        generateMultipleDocsChangelog('vite-solid-style-to-css-plugin', path.join(__dirname, `./src/content/docs/vite-solid-style-to-css-plugin/changelog/index.mdx`)),
      ],
    },
    {
      link: '/data-binding-autocomplete/getting-started',
      label: 'Data binding autocomplete',
      id: 'data-binding-autocomplete',
      icon: 'vscode',
      items: [
        await generateVersionWithPackageJSON(
          '../language-server/package.json',
          '/data-binding-autocomplete/getting-started/'
        ),
        {
          label: 'Getting Started',
          autogenerate: { directory: 'data-binding-autocomplete/getting-started' },
        },
        {
          label: 'Downloads',
          link: 'data-binding-autocomplete/downloads'
        },
      ],
    },
  ];

  return defineConfig({
    vite: {
      server: {
        fs: {
          allow: ['.', './src/content/docs/interaction-manager'],
        },
      },
      resolve: {
        preserveSymlinks: true,
        alias: {
          '@components': path.join(__dirname, "src", "components"),
        }
      }
    },
    redirects: documentations.reduce((acc: Record<string, string>, doc) => {
      acc[`/${doc}`] = `/${doc}/getting-started/`;
      return acc;
    }, {}),
    integrations: [
      starlight({
        favicon: '/favicon-32x32.png',
        logo: {
          dark: './src/assets/gameface-ui-header-dark.svg',
          light: './src/assets/gameface-ui-header-light.svg',
          replacesTitle: true
        },
        title: 'Gameface Frontend Tools',
        components: {
          Sidebar: 'coherent-docs-theme/components/SidebarWithDropdown.astro',
        },
        credits: false,
        customCss: ['./src/styles/custom.css'],
        plugins: [
          ...coherentTheme({
            documentationSearchTag: "UI Tools"
          }),
          starlightLinksValidator(),
          starlightSidebarTopics(sideBarTopics, {
            topics: documentations.reduce((acc: Record<string, string[]>, doc) => {
              acc[doc] = [`/${doc}/changelog`];
              return acc;
            }, {})
          }),
        ],
        social: [
          {
            icon: 'open-book',
            label: 'Documentation',
            href: 'https://coherent-labs.com/documentation',
          },
          {
            icon: 'email',
            label: 'Email',
            href: 'https://coherent-labs.com/get-in-touch'
          },
        ],
      }),
    ],
    site: 'https://frontend-tools.coherent-labs.com',
  })
}

export default getConfig();
