import {
  getStyleAttributeInnerRange,
  walkDeclarationValueIdentifiers,
  walkInlineDeclarations,
} from "../../utils/html-inline-style-css.js";
import { reportPartialValueIdentifiers } from "../../utils/gameface-css-checks.js";

function findStyleAttribute(node) {
  for (const attr of node.attributes || []) {
    const k = attr.key?.value;
    if (typeof k === "string" && k.toLowerCase() === "style" && attr.value) {
      return attr;
    }
  }
  return null;
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On HTML `style=\"...\"` attributes, disallow partial CSS keyword values per gameface-features/css/partial.json.",
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
    const sc = context.sourceCode || context.getSourceCode();

    return {
      /** @param {import("@html-eslint/types").Tag} node */
      Tag(node) {
        const attr = findStyleAttribute(node);
        if (!attr?.value) {
          return;
        }
        const range = getStyleAttributeInnerRange(sc, attr.value);
        if (!range || !range.inner.trim()) {
          return;
        }
        walkInlineDeclarations(sc, range.baseIndex, range.inner, (decl, declarationLoc) => {
          /** @type {{ type: string, name: string, loc: import("eslint").AST.SourceLocation }[]} */
          const idents = [];
          walkDeclarationValueIdentifiers(sc, range.baseIndex, decl, (ident, loc) => {
            idents.push({ type: "Identifier", name: ident.name, loc });
          });
          const propLoc =
            declarationLoc &&
            ({
              start: declarationLoc.start,
              end: {
                line: declarationLoc.start.line,
                column: declarationLoc.start.column + decl.property.length,
              },
            });
          reportPartialValueIdentifiers(
            context,
            {
              long: "unsupportedValue",
              short: "unsupportedValueShort",
              declaration: "partialPropertyCatalog",
            },
            decl.property,
            idents,
            propLoc,
          );
        });
      },
    };
  },
};
