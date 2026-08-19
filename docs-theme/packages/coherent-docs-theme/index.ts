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
import remarkCustomHeaderId from 'remark-custom-header-id';
import { getNavLinks } from './internal/siteRegistry';
import devPagefindPlugin from './internal/devPagefindPlugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snippetHMRPlugin: import('vite').Plugin = {
  name: 'starlight-release-snippet-hmr',
  enforce: 'pre',
  handleHotUpdate({ file }) {
    const normalizedPath = file.replace(/\\/g, '/');
    const releaseRootMatch = normalizedPath.match(/^(.*\/Releases\/(?:Release_[^\/]+|Version_[^\/]+|next_release))/i);

    if (releaseRootMatch) {
      const releaseDir = releaseRootMatch[1] as string;
      const mainIndexMdx = `${releaseDir}/index.mdx`;

      if (normalizedPath !== mainIndexMdx) {
        const target = fs.existsSync(mainIndexMdx) ? mainIndexMdx : null;

        if (target) {
          const now = new Date();
          fs.utimesSync(target, now, now);

          const folderName = releaseDir.split('/').pop();
          console.log(`\x1b[36m[Snippet HMR]\x1b[0m Force update \x1b[33m${folderName}/index\x1b[0m`);
        }
      }
    }
  }
}

export default function coherentThemePlugin(options: CoherentThemeOptions = { documentation: '' }): StarlightPlugin[] {
  if (!options?.documentation) {
    throw new Error('Coherent docs theme plugin requires "documentation"!')
  }

  let navLinks = [...getNavLinks()];
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
                  remarkPlugins: [...directives, remarkCustomHeaderId, [remarkFixAbsoluteLinks, { basePath: astroConfig.base }]],
                },
                vite: {
                  server: {
                    fs: { allow: ['..'], },
                  },
                  worker: { format: 'es' },
                  plugins: [snippetHMRPlugin]
                },
              });
            },
          }
        });

        if (options.devSearch && command !== 'build') {
          addIntegration(devPagefindPlugin());
        }

        process.env.COHERENT_THEME_CONFIG = JSON.stringify({
          showPageProgress,
          navLinks,
          documentation: options.documentation,
          engine: options.engine,
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
            'data-pagefind-filter': 'documentation[content]',
            content: options.documentation
          }
        });

        if (options.engine) {
          configUpdates.head.push({
            tag: 'meta',
            attrs: {
              'data-pagefind-filter': 'engine[content]',
              content: options.engine
            }
          });
        }

        configUpdates.pagefind = {
          indexWeight: 2,
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