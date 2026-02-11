import type { StarlightPlugin } from '@astrojs/starlight/types';
import { overrideComponents } from './internal/overrideComponents';
import fs from 'fs';
import path from 'path';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightLinksValidator from 'starlight-links-validator';
import generateChangelogMultiple from './utils/changelogSideBarMultipleDocs';
import generateChangelog from './utils/changelogSideBar';
import type { CoherentThemeOptions } from './internal/themeConfig';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function coherentTheme(options: CoherentThemeOptions = {}): StarlightPlugin[] {
  const {
    showPageProgress = false,
    navLinks = [],
    disableDefaultLogo = false,
  } = options;

  const corePlugin: StarlightPlugin = {
    name: 'coherent-docs-theme',
    hooks: {
      'config:setup'({ config, logger, updateConfig }) {
        logger.info('Initializing Coherent Theme...');

        process.env.COHERENT_THEME_CONFIG = JSON.stringify({ showPageProgress, navLinks });

        const configUpdates: any = {
          customCss: [...(config.customCss ?? []), 'coherent-docs-theme/styles'],
          components: overrideComponents(
            config,
            ['Header', 'ThemeSelect', 'Footer', 'Sidebar'],
            logger,
          ),
          head: config.head || [],
        };

        if (!disableDefaultLogo && !config.logo) {
          configUpdates.logo = {
            dark: path.join(__dirname, 'assets/gameface-ui-header-dark.svg'),
            light: path.join(__dirname, 'assets/gameface-ui-header-light.svg'),
          };
        }

        updateConfig(configUpdates);
      },
    },
  };

  const plugins = [
    starlightHeadingBadges(),
    starlightLinksValidator(),
    corePlugin,
  ];

  return plugins
}

export function generateVersion(version: string, link?: string) {
  const config: { label: string; link: string; attrs?: { target: string }; badge?: { text: string; variant: "note" | "danger" | "success" | "caution" | "tip" | "default" } } = {
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