import { walkEmbeddedCss } from "../../utils/html-embedded-css-walk.js";
import { reportPartialValueIdentifiers } from "../../utils/gameface-css-checks.js";

function valueChildrenIterable(value) {
  if (!value || !value.children) {
    return [];
  }
  const ch = value.children;
  return Array.isArray(ch) ? ch : [...ch];
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inside HTML `<style>` blocks, disallow partial CSS keyword values per gameface-features/css/partial.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
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
  create(context) {
    return {
      StyleTag(node) {
        const ss = node.value?.stylesheet;
        if (!ss) {
          return;
        }
        walkEmbeddedCss(ss, (n) => {
          if (n.type !== "CssDeclaration" || typeof n.property !== "string" || !n.value) {
            return;
          }
          const kids = valueChildrenIterable(n.value);
          const normalized = kids.map((c) =>
            c.type === "CssIdentifier"
              ? { type: "Identifier", name: c.name, loc: c.loc }
              : c,
          );
          const prop = n.property;
          const propLoc =
            n.loc &&
            ({
              start: n.loc.start,
              end: {
                line: n.loc.start.line,
                column: n.loc.start.column + prop.length,
              },
            });
          reportPartialValueIdentifiers(
            context,
            {
              long: "unsupportedValue",
              short: "unsupportedValueShort",
              declaration: "partialPropertyCatalog",
            },
            n.property,
            normalized,
            propLoc,
          );
        });
      },
    };
  },
};
