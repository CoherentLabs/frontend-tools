import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightThemeRapide from 'starlight-theme-rapide'
import starlightLinksValidator from 'starlight-links-validator';
import starlightHeadingBadges from 'starlight-heading-badges'
import starlightSidebarTopics from 'starlight-sidebar-topics'
import generateChangelog from './src/changelogSideBar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateVersion(version, link) {
  const config: { label: string; link?: string; attrs?: { target: string }; badge?: { text: string; variant: string } } = {
    label: 'Version:',
    link: '',
    badge: {
      text: `${version}`,
      variant: 'tip',
    },
  }

  if (link) {
    config.link = link;
    config.attrs = { target: '_blank' };
  }

  return config;
}

async function generateVersionWithPackageJSON(packagePath, link?: string) {
  if (!fs.existsSync(packagePath)) throw new Error(`Version not found in ${packagePath}`);
  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageContent);
  const version = packageJson?.version;
  if (!version) throw new Error(`Version not defined in ${packagePath}`);

  return generateVersion(version, link);
}

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
        generateChangelog('e2e'),
        {
          label: 'API Reference',
          collapsed: true,
          autogenerate: { directory: 'e2e/api', collapsed: false },

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
        { label: 'Features', autogenerate: { directory: 'interaction-manager/features' } }
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
          label: 'Getting Started',
          autogenerate: { directory: 'gameface-vite-plugin/getting-started' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'gameface-vite-plugin/concepts' },
        },
        generateChangelog('gameface-vite-plugin'),
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
        generateChangelog('vite-solid-style-to-css-plugin'),
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
    redirects: documentations.reduce((acc, doc) => {
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
        components: {
          Sidebar: './src/components/Sidebar.astro',
        },
        credits: false,
        customCss: ['./src/styles/custom.css'],
        plugins: [
          starlightThemeRapide(),
          starlightLinksValidator(),
          starlightHeadingBadges(),
          starlightSidebarTopics(sideBarTopics, {
            topics: documentations.reduce((acc, doc) => {
              acc[doc] = [`/${doc}/changelog`];
              return acc;
            }, {})
          })
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
        title: 'Gameface Frontend Tools',
      }),
    ],
    site: 'https://frontend-tools.coherent-labs.com',
  })
}

export default getConfig();
