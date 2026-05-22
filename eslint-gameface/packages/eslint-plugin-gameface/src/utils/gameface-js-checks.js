import { getFeatureIndexForContext } from "../gameface-features/index.js";

/**
 * @param {string} name
 * @param {import("../gameface-features/index.js").GamefaceFeatureIndex} index
 * @returns {boolean}
 */
export function isUnsupportedGlobal(name, index) {
  return typeof name === "string" && name.length > 0 && index.jsApisUnsupported.has(name);
}

/**
 * @param {string} typeName
 * @param {import("../gameface-features/index.js").GamefaceFeatureIndex} index
 * @returns {ReadonlySet<string> | null}
 */
export function getPartialMissingMembers(typeName, index) {
  if (typeof typeName !== "string" || typeName.length === 0) {
    return null;
  }
  return index.jsTypesPartial.get(typeName) || null;
}

/**
 * Conservative check for whether an `Identifier` node refers to an unbound global.
 * Returns true when no `Variable` with that name is defined in any enclosing scope
 * (i.e. ESLint's scope analysis treats it as a reference to a global / undeclared name).
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").Identifier} node
 * @returns {boolean}
 */
export function isUnboundGlobalReference(sourceCode, node) {
  if (!node || node.type !== "Identifier") {
    return false;
  }
  const scope = sourceCode.getScope ? sourceCode.getScope(node) : null;
  if (!scope) {
    return true;
  }
  for (let current = scope; current; current = current.upper) {
    for (const variable of current.variables) {
      if (variable.name === node.name) {
        return false;
      }
    }
  }
  return true;
}

/**
 * True when `node` appears in a position that is a *binding* / definition rather than
 * a value reference (e.g. `function MediaSource() {}`, `import { Chrome } from ...`,
 * `class Animation {}`, parameter / catch names). Such identifiers must not be flagged.
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").Identifier} node
 * @returns {boolean}
 */
export function isBindingIdentifier(sourceCode, node) {
  const parent = /** @type {{ parent?: import("estree").Node } & import("estree").Node} */ (
    node
  ).parent;
  if (!parent) {
    return false;
  }
  switch (parent.type) {
    case "VariableDeclarator":
      return parent.id === node;
    case "FunctionDeclaration":
    case "FunctionExpression":
    case "ArrowFunctionExpression":
    case "ClassDeclaration":
    case "ClassExpression":
      return /** @type {{ id?: import("estree").Identifier | null }} */ (parent).id === node;
    case "AssignmentPattern":
      return parent.left === node;
    case "RestElement":
      return parent.argument === node;
    case "ArrayPattern":
      return true;
    case "ObjectPattern":
      return true;
    case "Property":
      return (
        /** @type {{ shorthand?: boolean }} */ (parent).shorthand === true &&
        parent.value === node &&
        isInsideObjectPattern(parent)
      );
    case "CatchClause":
      return parent.param === node;
    case "ImportSpecifier":
    case "ImportDefaultSpecifier":
    case "ImportNamespaceSpecifier":
    case "ExportSpecifier":
      return true;
    case "LabeledStatement":
      return parent.label === node;
    case "BreakStatement":
    case "ContinueStatement":
      return parent.label === node;
    default:
      return false;
  }
}

/**
 * @param {import("estree").Node | undefined | null} node
 * @returns {boolean}
 */
function isInsideObjectPattern(node) {
  let cur = /** @type {{ parent?: import("estree").Node } & import("estree").Node | null} */ (
    node
  );
  while (cur) {
    if (cur.type === "ObjectPattern" || cur.type === "ArrayPattern") {
      return true;
    }
    cur = /** @type {{ parent?: import("estree").Node }} */ (cur).parent || null;
  }
  return false;
}

/**
 * True when the identifier sits inside a TypeScript type-only position parsed by
 * `@typescript-eslint/parser` (e.g. `let x: AbortController`, `extends Foo<T>` in
 * an `implements` clause). Such identifiers do not produce runtime references and
 * must not be flagged by JS API rules.
 * @param {import("estree").Identifier} node
 * @returns {boolean}
 */
export function isTypePositionIdentifier(node) {
  let cur = /** @type {{ parent?: import("estree").Node } & import("estree").Node | null} */ (
    node
  );
  while (cur) {
    const t = cur.type;
    if (
      typeof t === "string" &&
      (t.startsWith("TSType") ||
        t === "TSInterfaceHeritage" ||
        t === "TSClassImplements" ||
        t === "TSTypeQuery" ||
        t === "TSExpressionWithTypeArguments" ||
        t === "TSTypeReference" ||
        t === "TSQualifiedName" ||
        t === "TSTypeAnnotation" ||
        t === "TSInterfaceDeclaration" ||
        t === "TSTypeAliasDeclaration")
    ) {
      return true;
    }
    cur = /** @type {{ parent?: import("estree").Node }} */ (cur).parent || null;
  }
  return false;
}

/**
 * True when the identifier is the (non-computed) property part of a MemberExpression
 * (e.g. `obj.foo` — `foo` is not a value reference) or the key of a non-computed
 * object/class property definition. Such positions must not be checked as globals.
 * @param {import("estree").Identifier} node
 * @returns {boolean}
 */
export function isMemberOrPropertyKey(node) {
  const parent = /** @type {{ parent?: import("estree").Node } & import("estree").Node} */ (
    node
  ).parent;
  if (!parent) {
    return false;
  }
  if (parent.type === "MemberExpression") {
    return /** @type {{ computed?: boolean, property?: unknown }} */ (parent).computed === false &&
      /** @type {{ property?: unknown }} */ (parent).property === node;
  }
  if (parent.type === "Property" || parent.type === "MethodDefinition" ||
      parent.type === "PropertyDefinition") {
    return /** @type {{ computed?: boolean, key?: unknown }} */ (parent).computed === false &&
      /** @type {{ key?: unknown }} */ (parent).key === node;
  }
  return false;
}

/**
 * Returns the static type name when `node` is a `MemberExpression` whose `object`
 * is a plain `Identifier` (e.g. `Animation.effect`); otherwise null.
 * @param {import("estree").MemberExpression} node
 * @returns {{ typeName: string, member: string, memberNode: import("estree").Identifier } | null}
 */
export function staticMemberPair(node) {
  if (!node || node.type !== "MemberExpression" || node.computed) {
    return null;
  }
  if (node.object.type !== "Identifier") {
    return null;
  }
  if (node.property.type !== "Identifier") {
    return null;
  }
  return {
    typeName: node.object.name,
    member: node.property.name,
    memberNode: node.property,
  };
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @returns {import("../gameface-features/index.js").GamefaceFeatureIndex}
 */
export function getJsFeatureIndex(context) {
  return getFeatureIndexForContext(context);
}
