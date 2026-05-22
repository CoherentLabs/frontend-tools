# Rule layout

Rules are grouped by **feature area** (aligned with `gameface-features/` catalogs and docs). Public rule ids are unchanged (`gameface/css-no-unsupported-properties`, etc.).

| Folder | Catalog / source | When Gameface adds support |
| --- | --- | --- |
| [`css-properties/`](./css-properties/) | `gameface-features/css/` | Update JSON; rules auto-pick up catalog changes |
| [`css-selectors/`](./css-selectors/) | `gameface-features/selectors/` | Same |
| [`css-functions/`](./css-functions/) | `gameface-features/functions/` (missing names) | Same |
| [`css-restrictions/`](./css-restrictions/) | Gameface **documentation** (keyframes, var fallback, calc %) | Remove or disable rules in this folder when docs say supported |
| [`html/`](./html/) | `gameface-features/html/` | Same |
| [`databind/`](./databind/) | HTMLLint parity | Independent of feature JSON |
| [`js-api/`](./js-api/) | `gameface-features/js/` | Same |
| [`svg/`](./svg/) | [SVG Support](https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/svgsupport/) doc + engine limits in [`gameface-svg-support.js`](../data/gameface-svg-support.js) | Edit data module until a collector exists; includes path-only `stroke-dasharray` / `stroke-dashoffset` |

Each folder has an `index.js` that exports `rules` (and `css-restrictions` exports `flatRecommendedConfig()`). The plugin merges them in [`index.js`](./index.js).

## Internal catalog whitelist (maintainers)

Collector false positives are overridden in [`src/data/catalog-whitelists.js`](../data/catalog-whitelists.js) (not exposed in ESLint settings). Applied when building the feature index so all catalog-driven rules in a folder share the same corrections.

| Key | Effect |
| --- | --- |
| `cssPropertiesUnsupported` | Treat property as supported |
| `cssPropertiesPartial` | Drop entire partial property row |
| `cssPartialKeywords` | Allow specific keyword values on a partial property |
| `cssFunctionsUnsupported` | Allow function name |
| `selectorsUnsupported` / `selectorsPartial` | Exact pseudo text from catalog |
| `htmlParsedNoImpl` / `htmlPartial` | Tag names |
| `jsApisUnsupported` | Global/type name |
| `jsPartialMembers` | e.g. `{ "CSS": ["px", "vw"] }` for `CSS.px` |

Doc-only rules under `css-restrictions/` are not catalog-driven.

To turn off a whole rule group in a custom config:

```js
// eslint.config.js — example: disable doc restrictions after engine catches up
import gameface from "eslint-plugin-gameface";

export default [
  ...gameface.configs["flat/recommended"],
  {
    rules: Object.fromEntries(
      Object.keys(gameface.cssRestrictionsRules).map((id) => [`gameface/${id}`, "off"]),
    ),
  },
];
```
