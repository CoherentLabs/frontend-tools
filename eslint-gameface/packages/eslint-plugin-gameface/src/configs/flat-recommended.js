import html from "@html-eslint/eslint-plugin";
import css from "@eslint/css";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import { cssRestrictionsFlatRecommended, svgFlatRecommended } from "../rules/index.js";

const jsApiRules = {
  "gameface/js-no-unsupported-globals": "error",
  "gameface/js-partial-member-access": "warn",
};

const cssRestrictionRules = cssRestrictionsFlatRecommended();
const svgRules = svgFlatRecommended();

const vueInlineCssRestrictionRules = Object.fromEntries(
  Object.entries(cssRestrictionRules).filter(([id]) => id.includes("vue-inline-css")),
);

const vueSfcCssRules = {
  "gameface/vue-sfc-css-no-unsupported-properties": "error",
  "gameface/vue-sfc-css-no-unsupported-functions": "error",
  "gameface/vue-sfc-css-no-var-in-keyframes": "error",
  "gameface/vue-sfc-css-no-calc-in-keyframes": "error",
  "gameface/vue-sfc-css-var-no-fallback": "error",
  "gameface/vue-sfc-css-calc-no-mixed-percent-units": "error",
  "gameface/vue-sfc-css-partial-property-values": "error",
  "gameface/vue-sfc-css-no-unsupported-selectors": "error",
  "gameface/vue-sfc-css-partial-selectors": "warn",
  "gameface/vue-sfc-css-svg-keyframes-sizing-units": "error",
  "gameface/vue-sfc-css-svg-keyframes-path-arc-animation": "warn",
  "gameface/vue-sfc-css-svg-stroke-dash-non-path": "error",
  "gameface/vue-sfc-css-svg-keyframes-stroke-dash-path-only": "warn",
};

const vueTemplateRules = {
  "gameface/vue-parsed-no-impl": [
    "error",
    { scope: "curated", ignoreTags: ["meta", "link", "base", "br", "hr", "noscript"] },
  ],
  "gameface/vue-partial-features": [
    "warn",
    { mode: "attribute-checks", warnAllowlist: false },
  ],
  "gameface/vue-inline-css-no-unsupported-properties": "error",
  "gameface/vue-inline-css-no-unsupported-functions": "error",
  ...vueInlineCssRestrictionRules,
  "gameface/vue-inline-css-partial-property-values": "error",
  "gameface/vue-databind-spelling": "error",
  "gameface/vue-databind-curly-brackets": "error",
  "gameface/vue-databind-property-accessors": "error",
  "gameface/vue-databind-bind-for": "error",
  "gameface/vue-databind-class-toggle": "error",
  "gameface/vue-databind-model-properties": "warn",
  ...jsApiRules,
  "gameface/vue-svg-no-unsupported-elements": "error",
  "gameface/vue-svg-mask-clip-path-conflict": "warn",
  "gameface/vue-inline-css-svg-keyframes-sizing-units": "error",
  "gameface/vue-inline-css-svg-keyframes-path-arc-animation": "warn",
  "gameface/vue-svg-stroke-dash-non-path": "error",
  "gameface/vue-inline-css-svg-keyframes-stroke-dash-path-only": "warn",
  ...vueSfcCssRules,
};

/**
 * Flat config blocks: HTML via @html-eslint, CSS via @eslint/css, JSX inline styles, plus gameface rules.
 * @param {import("eslint").ESLint.Plugin} gamefacePlugin
 * @returns {import("eslint").Linter.Config[]}
 */
export function createFlatRecommended(gamefacePlugin) {
  const htmlBase = html.configs["flat/recommended"];

  return [
    {
      files: ["**/*.html"],
      ...htmlBase,
      plugins: {
        ...htmlBase.plugins,
        gameface: gamefacePlugin,
      },
      rules: {
        // ...htmlBase.rules,
        "gameface/html-embedded-css-no-unsupported-properties": "error",
        "gameface/html-embedded-css-no-unsupported-functions": "error",
        ...cssRestrictionRules,
        "gameface/html-embedded-css-partial-property-values": "error",
        "gameface/html-embedded-css-no-unsupported-selectors": "error",
        "gameface/html-embedded-css-partial-selectors": "warn",
        "gameface/html-inline-css-no-unsupported-properties": "error",
        "gameface/html-inline-css-no-unsupported-functions": "error",
        ...cssRestrictionRules,
        "gameface/html-inline-css-partial-property-values": "error",
        "gameface/html-parsed-no-impl": [
          "error",
          { scope: "curated", ignoreTags: ["meta", "link", "base", "br", "hr", "noscript"] },
        ],
        "gameface/html-partial-features": [
          "warn",
          { mode: "attribute-checks", warnAllowlist: false },
        ],
        "gameface/html-databind-spelling": "error",
        "gameface/html-databind-curly-brackets": "error",
        "gameface/html-databind-property-accessors": "error",
        "gameface/html-databind-bind-for": "error",
        "gameface/html-databind-class-toggle": "error",
        "gameface/html-databind-model-properties": "warn",
        ...svgRules,
      },
      settings: {
        gameface: {
          modelsDir: "Gameface-models",
        },
      },
    },
    {
      files: ["**/*.css"],
      language: "css/css",
      plugins: {
        css,
        gameface: gamefacePlugin,
      },
      rules: {
        // ...css.configs.recommended.rules,
        "gameface/css-no-unsupported-properties": "error",
        "gameface/css-no-unsupported-functions": "error",
        ...cssRestrictionRules,
        "gameface/css-partial-property-values": "error",
        "gameface/css-no-unsupported-selectors": "error",
        "gameface/css-partial-selectors": "warn",
        "gameface/css-svg-keyframes-sizing-units": "error",
        "gameface/css-svg-keyframes-path-arc-animation": "warn",
        "gameface/css-svg-stroke-dash-non-path": "error",
        "gameface/css-svg-keyframes-stroke-dash-path-only": "warn",
      },
    },
    {
      files: ["**/*.scss"],
      language: "css/css",
      languageOptions: {
        // SCSS ($variables, &, nesting) is not valid CSS; tolerant mode lets @eslint/css
        // recover and still run gameface/* rules on parsed declarations.
        tolerant: true,
      },
      plugins: {
        css,
        gameface: gamefacePlugin,
      },
      rules: {
        "gameface/css-no-unsupported-properties": "error",
        "gameface/css-no-unsupported-functions": "error",
        ...cssRestrictionRules,
        "gameface/css-partial-property-values": "error",
        "gameface/css-no-unsupported-selectors": "error",
        "gameface/css-partial-selectors": "warn",
        "gameface/css-svg-keyframes-sizing-units": "error",
        "gameface/css-svg-keyframes-path-arc-animation": "warn",
        "gameface/css-svg-stroke-dash-non-path": "error",
        "gameface/css-svg-keyframes-stroke-dash-path-only": "warn",
      },
    },
    {
      files: ["**/*.{js,jsx,mjs,cjs}"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: {
        gameface: gamefacePlugin,
      },
      rules: {
        ...jsApiRules,
      },
    },
    {
      files: ["**/*.{jsx,tsx}"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: {
        gameface: gamefacePlugin,
      },
      rules: {
        "gameface/jsx-inline-css-no-unsupported-properties": "error",
        "gameface/jsx-inline-css-no-unsupported-functions": "error",
        ...cssRestrictionRules,
        "gameface/jsx-inline-css-partial-property-values": "error",
        "gameface/jsx-databind-spelling": "error",
        "gameface/jsx-databind-curly-brackets": "error",
        "gameface/jsx-databind-property-accessors": "error",
        "gameface/jsx-databind-bind-for": "error",
        "gameface/jsx-databind-class-toggle": "error",
        "gameface/jsx-databind-model-properties": "warn",
        ...jsApiRules,
        "gameface/jsx-svg-no-unsupported-elements": "error",
        "gameface/jsx-svg-mask-clip-path-conflict": "warn",
        "gameface/jsx-inline-css-svg-keyframes-sizing-units": "error",
        "gameface/jsx-inline-css-svg-keyframes-path-arc-animation": "warn",
        "gameface/jsx-svg-stroke-dash-non-path": "error",
        "gameface/jsx-inline-css-svg-keyframes-stroke-dash-path-only": "warn",
      },
      settings: {
        gameface: {
          modelsDir: "Gameface-models",
        },
      },
    },
    {
      files: ["**/*.{ts,tsx}"],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: {
        gameface: gamefacePlugin,
      },
      rules: {
        ...jsApiRules,
        "gameface/jsx-svg-no-unsupported-elements": "error",
        "gameface/jsx-svg-mask-clip-path-conflict": "warn",
        "gameface/jsx-inline-css-svg-keyframes-sizing-units": "error",
        "gameface/jsx-inline-css-svg-keyframes-path-arc-animation": "warn",
        "gameface/jsx-svg-stroke-dash-non-path": "error",
        "gameface/jsx-inline-css-svg-keyframes-stroke-dash-path-only": "warn",
      },
    },
    {
      files: ["**/*.vue"],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: {
            js: "espree",
            ts: tsParser,
            jsx: "espree",
          },
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: {
        vue: vuePlugin,
        gameface: gamefacePlugin,
      },
      processor: vuePlugin.processors?.vue,
      rules: vueTemplateRules,
      settings: {
        gameface: {
          modelsDir: "Gameface-models",
        },
      },
    },
  ];
}
