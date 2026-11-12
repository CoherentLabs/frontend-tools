/**
 * Schema.org structured data (JSON-LD) for a docs page, rendered by the Head override.
 *
 * Every docs page: a TechArticle (title, description, URL, last update, sidebar section,
 * publisher) and a BreadcrumbList (Home -> page). The homepage: a WebSite and the publishing
 * Organization instead. Search engines use it for rich results; AI crawlers and agents read it
 * to know what a page is without guessing from its layout.
 */

export interface Publisher {
    name: string;
    url: string;
    /** Absolute URL of the publisher's logo. */
    logo?: string;
}

export interface StructuredDataOptions {
    /** Who publishes the docs. Default: Coherent Labs. */
    publisher?: Partial<Publisher>;
}

export const DEFAULT_PUBLISHER: Publisher = { name: "Coherent Labs", url: "https://coherent-labs.com" };

interface SidebarEntry {
    type: "link" | "group";
    label: string;
    isCurrent?: boolean;
    entries?: SidebarEntry[];
}

/** The labels of the sidebar groups holding the current page, outermost first. */
function sectionsOf(entries: SidebarEntry[] | undefined, trail: string[] = []): string[] | null {
    for (const item of entries ?? []) {
        if (item.type === "link" && item.isCurrent) return trail;
        if (item.type === "group") {
            const found = sectionsOf(item.entries, [...trail, item.label]);
            if (found) return found;
        }
    }
    return null;
}

export interface PageInfo {
    /** The page's absolute URL. */
    url: string;
    /** The site's absolute root URL (site + base, ending in /). */
    root: string;
    siteTitle: string;
    title: string;
    description?: string | undefined;
    lang?: string | undefined;
    lastUpdated?: Date | undefined;
    sidebar?: SidebarEntry[] | undefined;
    /** Applied to sidebar labels (e.g. the <ProductName> placeholder). */
    formatLabel?: (label: string) => string;
}

export function buildStructuredData(page: PageInfo, options: StructuredDataOptions = {}): object {
    const publisher = { ...DEFAULT_PUBLISHER, ...options.publisher };
    const organization = {
        "@type": "Organization",
        "@id": `${publisher.url.replace(/\/?$/, "/")}#organization`,
        name: publisher.name,
        url: publisher.url,
        ...(publisher.logo ? { logo: { "@type": "ImageObject", url: publisher.logo } } : {}),
    };
    const website = {
        "@type": "WebSite",
        "@id": `${page.root}#website`,
        name: page.siteTitle,
        url: page.root,
        ...(page.lang ? { inLanguage: page.lang } : {}),
        publisher: { "@id": organization["@id"] },
    };

    if (page.url === page.root) {
        return {
            "@context": "https://schema.org",
            "@graph": [{ ...website, ...(page.description ? { description: page.description } : {}) }, organization],
        };
    }

    const format = page.formatLabel ?? ((label: string) => label);
    const sections = (sectionsOf(page.sidebar) ?? []).map(format).filter(Boolean);
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "TechArticle",
                "@id": `${page.url}#article`,
                headline: page.title,
                name: page.title,
                url: page.url,
                mainEntityOfPage: page.url,
                ...(page.description ? { description: page.description } : {}),
                ...(page.lang ? { inLanguage: page.lang } : {}),
                ...(page.lastUpdated ? { dateModified: page.lastUpdated.toISOString() } : {}),
                ...(sections.length ? { articleSection: sections.join(" / ") } : {}),
                isPartOf: { "@id": website["@id"] },
                publisher: { "@id": organization["@id"] },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: page.siteTitle, item: page.root },
                    { "@type": "ListItem", position: 2, name: page.title, item: page.url },
                ],
            },
            website,
            organization,
        ],
    };
}

/** JSON for inside a <script> element: `<` escaped so content can't close the element. */
export const toScriptJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
