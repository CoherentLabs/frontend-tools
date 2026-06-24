import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportPartialValueIdentifiers } from "../../utils/gameface-css-checks.js";
import { walkDeclarationValueIdentifiers } from "../../utils/html-inline-style-css.js";
import { walkSvelteSfcStyleDeclarations, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "problem",
    docs: {
      description:
        "Inside Svelte `<style>` blocks, disallow partial CSS keyword values per gameface-features.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/",
    },
    messages: {
      unsupportedValue:
        "Gameface does not support value '{{value}}' for property '{{property}}'. Catalog unsupported/rejected keywords include: {{unsupportedList}}. Supported keywords include: {{supportedList}}.",
      unsupportedValueShort:
        "Gameface does not support value '{{value}}' for property '{{property}}'.",
      partialPropertyCatalog:
        "CSS property '{{property}}' is only partially supported in Gameface ({{detail}}).",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcStyleDeclarations(sc, cssText, baseIndex, (decl, loc) => {
        if (!decl.value) {
          return;
        }
        /** @type {{ type: string, name: string, loc: import("eslint").AST.SourceLocation }[]} */
        const kids = [];
        walkDeclarationValueIdentifiers(sc, baseIndex, decl, (ident, identLoc) => {
          kids.push({ type: "Identifier", name: ident.name, loc: identLoc });
        });
        const propLoc = {
          start: loc.start,
          end: {
            line: loc.start.line,
            column: loc.start.column + String(decl.property).length,
          },
        };
        reportPartialValueIdentifiers(
          context,
          {
            long: "unsupportedValue",
            short: "unsupportedValueShort",
            declaration: "partialPropertyCatalog",
          },
          decl.property,
          kids,
          propLoc,
        );
      });
    });
  },
);
