import { reportUnsupportedProperty } from "../../utils/gameface-css-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow CSS properties that Gameface marks as unsupported/missing in gameface-features/css/unsupported.json.",
      url: "https://docs.coherent-labs.com/cpp-gameface/content_development/supported_features_tables/cssproperties/"
    },
    messages: {
      unsupported:
        "CSS property '{{property}}' is not supported by Gameface.",
    },
    schema: [],
  },
  create(context) {
    return {
      "Rule > Block > Declaration"(node) {
        const raw = node.property;
        if (typeof raw !== "string" || !node.loc) {
          return;
        }
        reportUnsupportedProperty(context, "unsupported", raw, {
          start: node.loc.start,
          end: {
            line: node.loc.start.line,
            column: node.loc.start.column + raw.length,
          },
        });
      },
    };
  },
};
