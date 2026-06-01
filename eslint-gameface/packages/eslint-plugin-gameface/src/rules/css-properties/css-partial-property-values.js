import { reportPartialValueIdentifiers } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Flags partial CSS from gameface-features/css/partial.json: (1) disallowed keyword values, and (2) optional declaration-level notes for partial rows with probes/notes except probes suppressed as accepted-by-engine (e.g. value-accepted-but-not-computed).",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"

    },
    messages: {
      unsupportedValue:
        "Gameface does not support value '{{value}}' for property '{{property}}'. Catalog unsupported/rejected keywords include: {{unsupportedList}}. Supported keywords include: {{supportedList}}.",
      unsupportedValueShort:
        "Gameface does not support value '{{value}}' for property '{{property}}'.",
      partialPropertyCatalog:
        "CSS property '{{property}}' is only partially supported in Gameface. {{detail}}",
    },
    schema: [],
  },
  create(context) {
    return {
      "Rule > Block > Declaration"(node) {
        const raw = node.property;
        if (typeof raw !== "string" || !node.value?.children) {
          return;
        }
        const propLoc =
          node.loc &&
          ({
            start: node.loc.start,
            end: {
              line: node.loc.start.line,
              column: node.loc.start.column + raw.length,
            },
          });
        reportPartialValueIdentifiers(
          context,
          {
            long: "unsupportedValue",
            short: "unsupportedValueShort",
            declaration: "partialPropertyCatalog",
          },
          raw,
          node.value.children,
          propLoc,
        );
      },
    };
  },
};
