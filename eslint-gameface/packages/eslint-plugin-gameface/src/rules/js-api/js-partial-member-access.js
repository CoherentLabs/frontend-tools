import {
  getJsFeatureIndex,
  getPartialMissingMembers,
  isBindingIdentifier,
  isTypePositionIdentifier,
  isUnboundGlobalReference,
  staticMemberPair,
} from "../../utils/gameface-js-checks.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Warn on static `Type.member` access where the member is listed as missing for the type in gameface-features/js/partial.json (or in `evidence.missing` on unsupported rows).",
    },
    messages: {
      partialMember:
        "Member '{{type}}.{{member}}' is missing in Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();
    const index = getJsFeatureIndex(context);

    return {
      /** @param {import("estree").MemberExpression} node */
      MemberExpression(node) {
        const pair = staticMemberPair(node);
        if (!pair) {
          return;
        }
        const missing = getPartialMissingMembers(pair.typeName, index);
        if (!missing || !missing.has(pair.member)) {
          return;
        }
        const baseId = /** @type {import("estree").Identifier} */ (node.object);
        if (isBindingIdentifier(sc, baseId)) {
          return;
        }
        if (isTypePositionIdentifier(baseId)) {
          return;
        }
        if (!isUnboundGlobalReference(sc, baseId)) {
          return;
        }
        context.report({
          node: pair.memberNode,
          messageId: "partialMember",
          data: { type: pair.typeName, member: pair.member },
        });
      },
    };
  },
};
