import {
  getJsFeatureIndex,
  isBindingIdentifier,
  isMemberOrPropertyKey,
  isTypePositionIdentifier,
  isUnboundGlobalReference,
  isUnsupportedGlobal,
} from "../../utils/gameface-js-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow references to JavaScript globals/types listed as missing in gameface-features/js/unsupported.json.",
    },
    messages: {
      unsupportedGlobal:
        "JavaScript global '{{name}}' is not available in Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();
    const index = getJsFeatureIndex(context);

    /** @type {WeakSet<import("estree").Node>} */
    const reported = new WeakSet();

    /**
     * @param {import("estree").Identifier} node
     */
    function checkIdentifier(node) {
      if (reported.has(node)) {
        return;
      }
      if (!node.name || !isUnsupportedGlobal(node.name, index)) {
        return;
      }
      if (isBindingIdentifier(sc, node) || isMemberOrPropertyKey(node)) {
        return;
      }
      if (isTypePositionIdentifier(node)) {
        return;
      }
      if (!isUnboundGlobalReference(sc, node)) {
        return;
      }
      reported.add(node);
      context.report({
        node,
        messageId: "unsupportedGlobal",
        data: { name: node.name },
      });
    }

    return {
      Identifier(node) {
        checkIdentifier(node);
      },
      JSXIdentifier() {
        // JSX component names are markup tags handled by HTML/JSX rules; skip.
      },
    };
  },
};
