import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const matchEndPattern = new RegExp(` |"|}}`, "g");

/**
 * @param {string} root absolute path to models directory
 * @returns {Array<{ name: string, content: unknown }>}
 */
export function readModelDefinitions(root) {
  /** @type {Array<{ name: string, content: unknown }>} */
  const out = [];
  let files;
  try {
    files = readdirSync(root, { encoding: "utf8" });
  } catch {
    return out;
  }
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const full = join(root, file);
    try {
      const content = JSON.parse(readFileSync(full, "utf8"));
      out.push({ name: file.replace(/\.json$/i, ""), content });
    } catch {
      /* skip invalid JSON */
    }
  }
  return out;
}

/**
 * @param {unknown} model
 * @param {string} current
 * @param {string[]} [relations]
 * @returns {string[]}
 */
export function generateRelations(model, current, relations = [current]) {
  let walk = model;
  if (Array.isArray(walk)) {
    walk = walk[0];
  }
  if (walk === undefined || walk === null || typeof walk !== "object") {
    return relations.map((relation) => `^(?<!\\.)${relation}$`);
  }
  for (const prop of Object.keys(/** @type {object} */ (walk))) {
    const currentProperty = /** @type {Record<string, unknown>} */ (walk)[prop];
    let relationStr = "";
    if (Array.isArray(model)) {
      relationStr = `${current}\\['?\\d+'?\\]`;
    } else {
      relationStr = `(${current}\\.${prop}|${current}\\['?${prop}'?\\]|{{${current}}}.{{${prop}}})`;
    }
    relationStr = relationStr || current;
    relations.push(relationStr);
    if (typeof currentProperty === "object" && currentProperty !== null) {
      generateRelations(currentProperty, relationStr, relations);
    }
  }
  return relations.map((relation) => `^(?<!\\.)${relation}$`);
}

/**
 * @param {string} root absolute path to models directory
 * @returns {Array<{ name: string, regexp: RegExp, rules: string[] }>}
 */
export function buildModelRelations(root) {
  const modelDefinitions = readModelDefinitions(root);
  /** @type {Array<{ name: string, regexp: RegExp, rules: string[] }>} */
  const relations = [];
  for (const def of modelDefinitions) {
    relations.push({
      name: def.name,
      regexp: new RegExp(def.name, "g"),
      rules: generateRelations(def.content, def.name),
    });
  }
  return relations;
}

/**
 * @param {string} root
 * @returns {number | null} directory mtime ms for cache busting
 */
export function modelsDirMtime(root) {
  try {
    return statSync(root).mtimeMs;
  } catch {
    return null;
  }
}

/**
 * @param {string} rawOpeningTag
 * @param {Array<{ name: string, regexp: RegExp, rules: string[] }>} relations
 * @returns {null | { model: string, path: string }}
 */
export function findModelPropertyViolation(rawOpeningTag, relations) {
  for (const relation of relations) {
    relation.regexp.lastIndex = 0;
    if (!relation.regexp.test(rawOpeningTag)) {
      continue;
    }
    relation.regexp.lastIndex = 0;

    let searchFrom = 0;
    while (true) {
      const startIdx = rawOpeningTag.indexOf(relation.name, searchFrom);
      if (startIdx === -1) {
        break;
      }

      const stringFromStart = rawOpeningTag.slice(startIdx);
      matchEndPattern.lastIndex = 0;
      const m = matchEndPattern.exec(stringFromStart);
      if (!m || m.index === undefined) {
        searchFrom = startIdx + relation.name.length;
        continue;
      }
      const endIdx = m.index;
      const propertyAccession = rawOpeningTag.slice(startIdx, startIdx + endIdx);

      let matched = false;
      for (const rule of relation.rules) {
        const r = new RegExp(rule);
        if (propertyAccession.match(r)) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return { model: relation.name, path: propertyAccession };
      }
      searchFrom = startIdx + relation.name.length;
    }
  }
  return null;
}
