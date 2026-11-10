# Coherent Docs Theme

A specialized [Starlight](https://starlight.astro.build/) theme designed for **Coherent Labs** documentation. It implements the **Gameface Design System**, offering a custom UI with distinct Dark/Light modes, sharp geometry, and integrated tooling for documentation management.

## ✨ Features

* **Gameface Design System:**
  * **Dark Mode:** "Deep Teal" (`#0F2123`) backgrounds for content, Coherent Black (`#0A0A0A`) for navigation.
  * **Light Mode:** Clean white and light grey palette.
  * **Typography:** Pre-configured `Barlow Semi Condensed` (Headings) and `Karla` (Body).
  * **Geometry:** Strictly sharp corners (`0px` border-radius) on all UI elements.
* **Smart Navigation:**
  * **Desktop:** Integrated header links alongside the logo.
  * **Mobile:** Touch-friendly, horizontally scrollable navigation bar.
  * **Sidebar:** Custom sidebar that prioritizes navigation links on mobile devices.
* **Asset Injection:** Automatically injects the Coherent Gameface logo on the left side of the header unless explicitly disabled.
* **Enhanced Components:**
  * **Footer:** Automatic copyright year updating and legal links.
  * **Progress Bar:** Optional reading progress indicator at the top of the page.
* **Bundled Tools:**
  * `starlight-heading-badges`: Adds badges to headings.
  * `starlight-sidebar-topics`: Support for multi-instance documentation.

## 📦 Installation

Install the theme as a dependency in your documentation project:

```bash
npm install coherent-docs-theme
```

**Peer Dependencies**: Ensure your project meets the following requirements:

* `astro: ^5.0.0`
* `@astrojs/starlight: >=0.37.0`

## 🚀 Usage

Add the theme to your `astro.config.mjs`.

⚠️ Important: The `coherentTheme` function returns an array of plugins. **You must use the spread operator (...) when adding it to the plugins list in Starlight.**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import coherentTheme from 'coherent-docs-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Gameface Documentation',
      // Disable default credits to keep the footer clean
      credits: false,

      plugins: [
        // ✅ CORRECT USAGE: Spread the array
        ...coherentTheme({
          documentation: 'docs', // Top-level product this site belongs to; scopes/pre-selects search filters
          // engine: 'Custom Engine', // Set only if this site documents a specific engine variant (e.g. Gameface/Prysm)
          showPageProgress: true,
          // navLinks: [
          //   { label: 'Roadmap', href: '/roadmap' },
          //   { label: 'API', href: '/api' },
          //   { label: 'Showcase', href: 'https://coherent-labs.com' }
          // ], // Aditional links to display in the header if needed
          // disableDefaultLogo: false, // Set true if you want to use your own logo
          // replacesTitle: false, // Set true if you want to show the documentation title next to the logo in the header. Useful when using a custom logo that doesn't include the title in it.
        }),
      ],
      
      sidebar: [
        {
            label: 'Getting Started',
            link: '/guides/getting-started'
        }
      ]
    }),
  ],
});
```

## ⚙️ Configuration Options

| Option                 | Type                   | Default     | Description                                                                                                                                                                                |
| ---------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **documentation**      | `string`               | `''`        | (Required) The top-level product this site belongs to (e.g. `'Gameface'`, `'Prysm'`, `'UI Tools'`). Scopes the search index and pre-selects the matching documentation filter in search.   |
| **engine**             | `string`               | -           | The engine variant this site documents, if any (e.g. `'Custom Engine'`, `'Unreal'`, `'Unity'`). Only set for Gameface/Prysm engine-specific sites; pre-selects the matching engine filter. |
| **navLinks**           | Array<{ label, href }> | `[]`        | Links displayed in the header (desktop) and top-bar in the mobile menu (mobile).                                                                                                           |
| **showPageProgress**   | `boolean`              | `false`     | Shows a reading progress bar at the top of the page.                                                                                                                                       |
| **disableDefaultLogo** | `boolean`              | `false`     | If false, injects the Gameface UI logo automatically if such is not defined in the Starlight config of the documentation. Set to true if you want to remove the logo entirely.             |
| **replacesTitle**      | `boolean`              | `true`      | If true, the logo will replace the title in the header. Set to false if you want to show the title next to the logo. Useful when using a custom logo that doesn't include the title in it. |

| **llms**               | `boolean \| object`    | `true`      | On `astro build`, writes `llms.txt`, `llms-full.txt`, `gameface-mcp-docs.json` (read by the Gameface MCP server) and each page's `index.html.md` into the build output. Needs `site` in the Astro config. `false` turns it off; an object is passed to the LLM docs integration (see below). |
| **robots**             | `boolean \| object`    | `true`      | On `astro build`, writes `robots.txt` (rules for all crawlers and named AI crawlers, Content Signals, the sitemap URL), unless `public/robots.txt` exists. Skipped for sites built under a sub-path. `false` turns it off; an object is passed to the robots.txt integration (see below). |

To override the default logo, simply provide your own in the Starlight configuration:

```js
starlight({
    logo: {
        dark: './path/to/dark-logo.svg',
        light: './path/to/light-logo.svg',
        // If your logo already includes the title, set this to true to avoid duplication.
        replacesTitle: false,
    },
})
```

## 🔍 Search Content-Type Filter

Search results can be scoped by a "Content type" filter (e.g. Documentation, API Reference, Changelog). By default, this is inferred from the page's URL path, but any page can override it explicitly via a `contentType` frontmatter field:

```mdx
---
title: My Page
contentType: Tutorial
---
```

Whatever string you use becomes a selectable option in the search filter's "Content type" tier automatically — no code changes needed. To use this field, first add it to your project's own `content.config.ts` schema (the theme can't inject fields into your content collection schema for you):

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        contentType: z.string().optional(),
      }),
    }),
  }),
};
```

## 🤖 LLM Docs Integration

Every documentation that uses the theme gets the LLM files on `astro build`, with nothing to configure beyond `site`. Any other Astro site, including one that isn't built with Starlight, can add the same export as a standalone Astro integration:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import llmsDocs from 'coherent-docs-theme/llms';

export default defineConfig({
  site: 'https://coherent-labs.com',
  integrations: [
    llmsDocs({
      // Where each page's content and title are (defaults: Starlight's `.sl-markdown-content` and `h1#_top`)
      contentSelector: 'main article',
      titleSelector: 'h1',
      include: ['blog/'],
    }),
  ],
});
```

| Option              | Type       | Default                          | Description                                                                 |
| ------------------- | ---------- | -------------------------------- | --------------------------------------------------------------------------- |
| **base**            | `string`   | `site` + `base`                  | Public URL of the build output's root.                                      |
| **contentSelector** | `string`   | `.sl-markdown-content`           | CSS selector of a page's content. Pages without it are skipped.             |
| **titleSelector**   | `string`   | `h1#_top`                        | CSS selector of a page's title; falls back to `<title>`.                    |
| **include**         | `string[]` | all pages                        | Path prefixes to export.                                                    |
| **exclude**         | `RegExp[]` | -                                | Path patterns to leave out.                                                 |
| **optional**        | `RegExp[]` | reference pages                  | Path patterns listed under llms.txt's "Optional" section (default: API reference, release notes, changelogs). |

## 🤖 robots.txt Integration

Every documentation that uses the theme gets a `robots.txt` on `astro build`. It allows all crawlers, gives the AI search and training crawlers (GPTBot, ClaudeBot, PerplexityBot, ...) their own group, declares [Content Signals](https://contentsignals.org/) (`search=yes, ai-input=yes, ai-train=yes` by default) and links the sitemap. A `public/robots.txt` takes precedence. Crawlers only read `robots.txt` at a host's root, so sites built under a sub-path get none.

Other Astro sites can add it as a standalone integration:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import robotsTxt from 'coherent-docs-theme/robots';

export default defineConfig({
  site: 'https://coherent-labs.com',
  integrations: [robotsTxt({ disallow: ['/internal/'] })],
});
```

| Option             | Type                                  | Default                    | Description                                                    |
| ------------------ | ------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| **contentSignals** | `{ search, aiInput, aiTrain }`, `false` | all `true`               | How AI may use the content; `false` leaves the line out.       |
| **disallow**       | `string[]`                            | `[]`                       | Paths no crawler should fetch.                                 |
| **aiCrawlers**     | `string[]`                            | `DEFAULT_AI_CRAWLERS`      | AI crawlers listed in their own group.                         |
| **sitemaps**       | `string[]`                            | the build's sitemap        | Sitemap URLs.                                                  |

## 🛠️ Exported Utilities

The theme exports helper functions to streamline sidebar configuration and versioning.

* **generateVersionWithPackageJSON**

Reads a `package.json` file and generates a sidebar item with a version badge.

Usage:

```js
import { generateVersionWithPackageJSON } from 'coherent-docs-theme';

// Inside astro.config.mjs -> starlight -> sidebar
sidebar: [
  {
    label: 'Core Package',
    items: [
      // Note: This is async, ensure your config supports top-level await
      await generateVersionWithPackageJSON(
        '../packages/core/package.json', // Path to package.json
        'https://www.npmjs.com/package/core' // (Optional) Link for the badge. If not provided, clicking the version will lead to the main documentation page.
      ),
      { label: 'Installation', link: '/core/install' }
    ]
  }
]
```

**Note: Provide the absolute path to the package.json file using the `path` module to ensure it works correctly regardless of the current working directory.**

* **generateDocsChangelog**

Generates a standard changelog link object for the sidebar. In the documentation it will create link to the provided changelog file and it will automatically extract all the versions from the file to display it as separate versions in the sidebar and will add a badge with the latest version next to the label.

```js
import { generateDocsChangelog } from 'coherent-docs-theme';

sidebar: [
  // ...
  generateDocsChangelog(path.join(__dirname, `./src/content/docs/changelog/index.mdx`))
  // Output: { label: 'Changelog', link: '/changelog' }
]
```

**Note: Provide the absolute path to the changelog file using the `path` module to ensure it works correctly regardless of the current working directory.**
**Note: Use this method if you have a single documentation section. If you are using sidebar topics for multiple documentation sections, use `generateMultipleDocsChangelog` instead to ensure the changelog is correctly associated with the corresponding topic.**

* **generateMultipleDocsChangelog**

Generates a changelog page link for multiple documentation sections. Use this method to generate changelog when documentation is generated using sidebar topics plugin. In the documentation it will create link to the provided changelog file and it will automatically extract all the versions from the file to display it as separate versions in the sidebar and will add a badge with the latest version next to the label.

```js
import { generateDocsChangelog } from 'coherent-docs-theme';

sidebar: [
  // ...
  generateMultipleDocsChangelog('my-docs-name', path.join(__dirname, `./src/content/docs/my-docs-name/changelog/index.mdx`)),
  // Output: { label: 'Changelog', link: '/my-docs-name/changelog' }
]
```

**Note: Provide the absolute path to the changelog file using the `path` module to ensure it works correctly regardless of the current working directory.**

## 🎨 Styling & Customization

The theme comes with a pre-configured styles.

**Fonts**
The theme automatically imports and applies:

* **Headings**: `Barlow Semi Condensed`
* **Body**: `Karla`

Colors (CSS Variables)
You can use these variables in your custom components to match the theme:

```css
/* Example Usage */
.my-component {
  background-color: var(--gameface-bg-panel); /* Adapts to Dark/Light mode */
  color: var(--gameface-cyan); /* The primary accent color */
  border: 1px solid var(--gameface-border);
}
```

To override or add the default styles, create a CSS file and add it to the `customCss` array in your Starlight configuration:

```js
starlight({
    // ...
    customCss: [
        './src/styles/custom.css', // Your custom styles
    ],
    // ...
})
```

The variables and classes available can be found in the `styles.css` of the theme package. You can also inspect the generated CSS in the browser to see all available variables.

## 📚 Multi-Instance Documentation (Sidebar Topics)

To organize multiple distinct documentation sections (e.g., "E2E", "Vite Plugin") within a single site, use the starlight-sidebar-topics plugin.

* **Define Topics:** Create an array of objects describing each section (`id`, `label`, `link`, `icon`, and `items`).
* **Register Plugin:** Add it to the plugins array in your Starlight config.

```js
// astro.config.mjs
import starlightSidebarTopics from 'starlight-sidebar-topics';

const sideBarTopics = [
  {
    id: 'e2e',
    label: 'Gameface E2E',
    link: '/e2e/getting-started',
    icon: 'rocket',
    items: [
       // Standard Starlight sidebar items (links, autogenerate, etc.)
       { label: 'Getting Started', autogenerate: { directory: 'e2e/getting-started' } }
    ]
  },
  // ... other topics
];

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightSidebarTopics(sideBarTopics, {
          // Optional: Map specific pages (like changelogs) to a topic manually
          topics: { 
            'e2e': ['/e2e/changelog'] 
          }
        })
      ]
    })
  ]
});
```

* 🔽 Sidebar Context Switcher (Dropdown)

To display a dropdown menu at the top of the sidebar that allows users to switch between the defined topics, you must override the default Starlight Sidebar component with the specific component provided by the theme.

Configuration:

```js
// astro.config.mjs
import coherentTheme from 'coherent-docs-theme';

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        ...coherentTheme(),
      ],
      // ...
      components: {
        // Point to the custom component exported by the theme
        Sidebar: 'coherent-docs-theme/components/SidebarWithDropdown.astro',
      },
    }),
  ],
});
```

* Add redirects for each topic in `astro.config.mjs` to ensure the correct topic is highlighted when visiting the main page of each section (e.g., `/e2e` should redirect to `/e2e/getting-started`).

```js
export default defineConfig({
    integrations: [
        starlight({
            // ...
            redirects: {
                '/e2e': '/e2e/getting-started',
                // Add more redirects for other topics as needed
            }
        })
    ]
});
```

* Generate changelog links for sidebar topics

To generate changelog links for each documentation section when using sidebar topics, use the `generateMultipleDocsChangelog` utility function provided by the theme. This function allows you to create a changelog link for each topic based on the corresponding changelog file.

```js
import { generateMultipleDocsChangelog } from 'coherent-docs-theme';


const sideBarTopics = [
  {
    id: 'e2e',
    label: 'Gameface E2E',
    link: '/e2e/getting-started',
    icon: 'rocket',
    items: [
       // Standard Starlight sidebar items (links, autogenerate, etc.)
       { label: 'Getting Started', autogenerate: { directory: 'e2e/getting-started' } },
       generateMultipleDocsChangelog('e2e', path.join(__dirname, `./src/content/docs/e2e/changelog/index.mdx`)),
    ]
  },
  // ... other topics
];
```

## 📝 License

MIT © Coherent Labs
