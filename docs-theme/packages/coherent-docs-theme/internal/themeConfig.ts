export interface CoherentThemeOptions {
    documentationSearchTag: string
    showPageProgress?: boolean;
    navLinks?: Array<{ label: string; href: string }>;
    disableDefaultLogo?: boolean;
    replacesTitle?: boolean
}

export default function getThemeConfig(): CoherentThemeOptions {
    let themeConfig = { documentationSearchTag: '', showPageProgress: false, navLinks: [], disableDefaultLogo: false } as CoherentThemeOptions;

    if (process.env.COHERENT_THEME_CONFIG) {
        try {
            themeConfig = JSON.parse(process.env.COHERENT_THEME_CONFIG);
        } catch (e) {
            console.error("Failed to parse Coherent Theme config");
        }
    }

    return themeConfig;
}
