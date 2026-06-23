import { join } from "node:path";
import {
  buildModelRelations,
  findModelPropertyViolation,
  modelsDirMtime,
} from "../../utils/html-databind-model-relations.js";
import { defineVueTemplateVisitor, isVueTemplateElement } from "../../utils/vue-visitor.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "On Vue template elements, model paths in data-bind attributes must exist under settings.gameface.modelsDir.",
    },
    messages: {
      invalidModelPath:
        'Property "{{path}}" does not exist on model "{{model}}".',
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode?.();
    const cwd = context.cwd || process.cwd();
    let cacheKey = "";
    /** @type {ReturnType<typeof buildModelRelations> | null} */
    let relations = null;

    function getRelations() {
      const modelsDir =
        typeof context.settings?.gameface?.modelsDir === "string"
          ? context.settings.gameface.modelsDir
          : "Gameface-models";
      const root = join(cwd, modelsDir);
      const mtime = modelsDirMtime(root);
      const key = `${root}:${mtime === null ? "missing" : mtime}`;
      if (relations && cacheKey === key) {
        return relations;
      }
      cacheKey = key;
      relations = buildModelRelations(root);
      return relations;
    }

    return defineVueTemplateVisitor(context, {
      VElement(node) {
        if (!isVueTemplateElement(node)) {
          return;
        }
        const rels = getRelations();
        if (rels.length === 0) {
          return;
        }
        const raw = sc.getText(node);
        const violation = findModelPropertyViolation(raw, rels);
        if (violation) {
          context.report({
            loc: node.loc,
            messageId: "invalidModelPath",
            data: {
              path: violation.path,
              model: violation.model,
            },
          });
        }
      },
    });
  },
};
