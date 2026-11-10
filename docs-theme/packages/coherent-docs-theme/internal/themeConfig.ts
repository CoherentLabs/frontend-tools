import type { AgentDocsOptions } from '../integrations/agentDocs';
import type { RobotsTxtOptions } from '../integrations/robotsTxt';

interface Topic {
    label?: string
    href?: string
    icon?: string
}

export interface CoherentThemeOptions {
    /** Top-level product this site belongs to. Used to scope/pre-select search filters and nav highlighting. */
    documentation:
    'Gameface' | 'Prysm' |
    'UI Workflow Guide' |
    'UI Tools' |
    'Gameface UI' | string
    /** Which engine variant this site documents, if any. Only Gameface/Prysm sites have one. */
    engine?: 'Custom Engine' | 'Unreal' | 'Unity' | string
    topicsConfig?: {
        native?: Topic
        unreal?: Topic
        unity?: Topic
    }
    version?: string
    currentTopicId?: string
    showPageProgress?: boolean;
    navLinks?: Array<{ label: string; href: string, subDocumentations?: string[] }>;
    disableDefaultLogo?: boolean;
    replacesTitle?: boolean
    tagManagerId?: string
    breadcrumbs?: boolean
    /**
     * Enables live Pagefind search in `astro dev` by crawling the dev server's own rendered pages
     * at startup instead of requiring a prior `astro build`. Opt-in and off by default.
     */
    devSearch?: boolean
    /**
     * On `astro build`, makes the docs readable by AI agents: writes llms.txt, llms-full.txt, the
     * Gameface MCP manifest, each page's index.html.md and, for a site at its host's root, an agent
     * skill and AI catalog in .well-known/. On by default (needs `site` in the Astro config);
     * `false` turns it off, an object passes options to the integration.
     */
    agentDocs?: boolean | AgentDocsOptions
    /**
     * Registers WebMCP tools (search_docs, get_page, list_pages) on every page, for AI agents in
     * browsers that support WebMCP. On by default; `false` turns it off.
     */
    webMcp?: boolean
    /**
     * On `astro build`, writes robots.txt (AI crawler rules, Content Signals, sitemap) unless public/ has one.
     * On by default; skipped for sites built under a sub-path. `false` turns it off, an object passes options.
     */
    robots?: boolean | RobotsTxtOptions
}

export default function getThemeConfig(): CoherentThemeOptions {
    let themeConfig = {
        documentation: '',
        showPageProgress: false,
        navLinks: [],
        disableDefaultLogo: false,
        tagManagerId: '',
        breadcrumbs: true,
        topicsConfig: {},
        currentTopicId: 'native',
        version: '0.0.0.0'
    } as CoherentThemeOptions;

    if (process.env.COHERENT_THEME_CONFIG) {
        try {
            themeConfig = { ...themeConfig, ...JSON.parse(process.env.COHERENT_THEME_CONFIG) };
        } catch (e) {
            console.error("Failed to parse Coherent Theme config");
        }
    }

    return themeConfig;
}
