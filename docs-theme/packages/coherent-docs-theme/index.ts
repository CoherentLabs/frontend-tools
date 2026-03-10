import type { StarlightPlugin } from '@astrojs/starlight/types';
import { overrideComponents } from './internal/overrideComponents';
import fs from 'fs';
import path from 'path';
import starlightHeadingBadges from 'starlight-heading-badges';
import generateChangelogMultiple from './utils/changelogSideBarMultipleDocs';
import generateChangelog from './utils/changelogSideBar';
import type { CoherentThemeOptions } from './internal/themeConfig';
import { fileURLToPath } from 'url';
import { directives } from './remark-directives';
import { getSortedCoherentReleases } from './utils/coherentReleases';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultHeaderLinks = [
  { href: 'https://docs.coherent-labs.com/cpp-gameface', label: 'Gameface' },
  { href: 'https://docs.coherent-labs.com/cpp-prysm', label: 'Prysm' },
  { href: 'https://starter.coherent-labs.com/', label: 'UI Starter Guide' },
  { href: 'https://frontend-tools.coherent-labs.com', label: 'UI Tools' },
  { href: 'https://gameface-ui.coherent-labs.com', label: 'Gameface UI' },
  { href: 'https://coherent-labs.com/Documentation/ExporterLTS/', label: 'Adobe CC Tools' },
];
const defaultMergeIndex = [
  {
    bundlePath: "https://gameface-ui.coherent-labs.com/pagefind",
    indexWeight: 0.5,
    mergeFilter: {
      resource: "Gameface UI"
    }
  },
  {
    bundlePath: "https://frontend-tools.coherent-labs.com/pagefind",
    indexWeight: 0.5,
    mergeFilter: {
      resource: "UI Tools"
    }
  }
]

export default function coherentThemePlugin(options: CoherentThemeOptions = { documentationSearchTag: '' }): StarlightPlugin[] {
  let navLinks = defaultHeaderLinks;
  for (const link of options.navLinks ?? []) {
    navLinks.push(link)
  }

  const {
    showPageProgress = false,
    disableDefaultLogo = false,
  } = options;

  const corePlugin: StarlightPlugin = {
    name: 'coherent-docs-theme',
    hooks: {
      'config:setup'({ config, logger, updateConfig, addIntegration }) {
        logger.info('Initializing Coherent Theme...');

        addIntegration({
          name: 'coherent-docs-theme-integration',
          hooks: {
            'astro:config:setup': ({ updateConfig }) => {
              updateConfig({
                markdown: {
                  remarkPlugins: [...directives],
                },
              });
            }
          }
        });

        process.env.COHERENT_THEME_CONFIG = JSON.stringify({ showPageProgress, navLinks, documentationSearchTag: options.documentationSearchTag });

        const configUpdates: any = {
          customCss: [...(config.customCss ?? []), 'coherent-docs-theme/styles'],
          components: overrideComponents(
            config,
            ['Header', 'ThemeSelect', 'Footer', 'Search'],
            logger,
          ),
          head: config.head || [],
        };
        if (!disableDefaultLogo && !config.logo) {
          configUpdates.logo = {
            dark: path.join(__dirname, 'assets/gameface-ui-header-dark.svg'),
            light: path.join(__dirname, 'assets/gameface-ui-header-light.svg'),
            replacesTitle: options.replacesTitle ?? true,
          };
        }

        configUpdates.head.push({
          tag: 'meta',
          attrs: {
            'data-pagefind-filter': 'resource[content]',
            content: options.documentationSearchTag
          }
        })

        configUpdates.pagefind = {
          indexWeight: 2,
          mergeIndex: defaultMergeIndex.filter(merge => {
            const resource = merge.mergeFilter.resource;
            return resource !== options.documentationSearchTag;
          })
        };

        updateConfig(configUpdates);
      },
    },
  };

  const plugins = [
    starlightHeadingBadges(),
    corePlugin,
  ];

  return plugins
}

export function generateVersion(version: string, link?: string) {
  const config: { label: string; link: string; attrs?: { target: string }; badge?: { text: string; variant: "note" | "danger" | "success" | "caution" | "tip" | "default" } } = {
    label: 'Version:',
    link: '/',
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

export async function generateVersionWithPackageJSON(packagePath: string, link?: string) {
  if (!fs.existsSync(packagePath)) throw new Error(`Version not found in ${packagePath}`);
  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageContent);
  const version = packageJson?.version;
  if (!version) throw new Error(`Version not defined in ${packagePath}`);

  return generateVersion(version, link);
}

export const generateMultipleDocsChangelog = generateChangelogMultiple;
export const generateDocsChangelog = generateChangelog;
export const getCoherentReleases = getSortedCoherentReleases;