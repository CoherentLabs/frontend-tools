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
import { version } from './package.json';
import { remarkFixAbsoluteLinks } from './remark-directives/fixAbsoluteLinks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultHeaderLinks = [
  { href: 'https://docs.coherent-labs.com/cpp-gameface', label: 'Gameface', subDocumentations: ['Custom Engine', 'Unreal', 'Unity'] },
  { href: 'https://docs.coherent-labs.com/cpp-prysm', label: 'Prysm', subDocumentations: ['Custom Engine', 'Unreal', 'Unity'] },
  { href: 'https://starter.coherent-labs.com/', label: 'UI Starter Guide' },
  { href: 'https://frontend-tools.coherent-labs.com', label: 'UI Tools' },
  { href: 'https://gameface-ui.coherent-labs.com', label: 'Gameface UI' },
  { href: 'https://coherent-labs.com/Documentation/ExporterLTS/', label: 'Adobe CC Tools' },
];

const defaultMergeIndex = [
  {
    bundlePath: "https://gameface-ui.coherent-labs.com/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Gameface UI" }
  },
  {
    bundlePath: "https://frontend-tools.coherent-labs.com/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "UI Tools" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/cpp-gameface/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Gameface Custom Engine" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/cpp-prysm/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Prysm Custom Engine" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/unreal-gameface/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Gameface Unreal" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/unreal-prysm/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Prysm Unreal" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/unity-gameface/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Gameface Unity" }
  },
  {
    bundlePath: "https://docs.coherent-labs.com/unity-prysm/pagefind",
    indexWeight: 0.5,
    mergeFilter: { resource: "Prysm Unity" }
  }
];

async function isPagefindIndexAvailable(bundlePath: string): Promise<boolean> {
  try {
    const metaUrl = `${bundlePath.replace(/\/$/, '')}/pagefind-entry.json`;
    const response = await fetch(metaUrl, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

export default function coherentThemePlugin(options: CoherentThemeOptions = { documentationSearchTag: '' }): StarlightPlugin[] {
  if (!options?.documentationSearchTag) {
    throw new Error('Coherent docs theme plugin requires "documentationSearchTag"!')
  }

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
      async 'config:setup'({ config, astroConfig, logger, updateConfig, addIntegration, command }) {
        logger.info(`Initializing Coherent Theme v${version}...`);

        addIntegration({
          name: 'coherent-docs-theme-integration',
          hooks: {
            'astro:config:setup': ({ updateConfig }) => {
              updateConfig({
                markdown: {
                  remarkPlugins: [...directives, [remarkFixAbsoluteLinks, { basePath: astroConfig.base }]],
                },
              });
            }
          }
        });

        process.env.COHERENT_THEME_CONFIG = JSON.stringify({
          showPageProgress,
          navLinks,
          documentationSearchTag: options.documentationSearchTag,
          tagManagerId: options.tagManagerId,
          breadcrumbs: options.breadcrumbs,
          topicsConfig: options.topicsConfig,
          currentTopicId: options.currentTopicId,
          version: options.version
        });

        const configUpdates: any = {
          customCss: [...(config.customCss ?? []), 'coherent-docs-theme/styles'],
          components: overrideComponents(
            config,
            ['Header', 'ThemeSelect', 'Footer', 'Search', 'PageTitle', 'MarkdownContent', 'Head'],
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
        });

        if (command === 'build') {
          const otherIndexes = defaultMergeIndex.filter(merge =>
            merge.mergeFilter.resource !== options.documentationSearchTag
          );

          logger.info('Validating external Pagefind indexes for production build...');
          const validMergeIndexes = [];

          for (const mergeConfig of otherIndexes) {
            const isAvailable = await isPagefindIndexAvailable(mergeConfig.bundlePath);
            if (isAvailable) {
              validMergeIndexes.push(mergeConfig);
              logger.info(`✅ Found index: ${mergeConfig.mergeFilter.resource}`);
            } else {
              logger.warn(`⚠️ Skipping index (not found): ${mergeConfig.mergeFilter.resource} at ${mergeConfig.bundlePath}`);
            }
          }

          configUpdates.pagefind = {
            indexWeight: 2,
            mergeIndex: validMergeIndexes
          };
        } else {
          logger.info('Dev mode detected. Skipping external Pagefind index validation.');
          configUpdates.pagefind = {
            indexWeight: 2,
            mergeIndex: []
          };
        }

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