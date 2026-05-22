import { walkDeclarationValueIdentifiers, walkInlineDeclarations } from "../../utils/html-inline-style-css.js";
import {
  walkJsxStyleObjectProperties,
  walkJsxStyleStringValues,
} from "../../utils/jsx-inline-style-css.js";
import { reportPartialValueIdentifiers } from "../../utils/gameface-css-checks.js";

const MESSAGE_IDS = {
  long: "unsupportedValue",
  short: "unsupportedValueShort",
  declaration: "partialPropertyCatalog",
};

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On JSX `style` props (string or object), disallow partial CSS keyword values per gameface-features/css/partial.json.",
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
      /** @param {import("estree").JSXAttribute} node */
      JSXAttribute(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "style") {
          return;
        }
        walkJsxStyleStringValues(sc, node, (inner, baseIndex) => {
          walkInlineDeclarations(sc, baseIndex, inner, (decl, declarationLoc) => {
            /** @type {{ type: string, name: string, loc: import("eslint").AST.SourceLocation }[]} */
            const idents = [];
            walkDeclarationValueIdentifiers(sc, baseIndex, decl, (ident, loc) => {
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
            reportPartialValueIdentifiers(context, MESSAGE_IDS, decl.property, idents, propLoc);
          });
        });
        walkJsxStyleObjectProperties(sc, node, (property, propLoc, valueChildren) => {
          reportPartialValueIdentifiers(context, MESSAGE_IDS, property, valueChildren, propLoc);
        });
      },
    };
  },
};
