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
