/**
 * @typedef {Object} CatalogWhitelists
 * @property {string[]} cssPropertiesUnsupported
 * @property {string[]} cssPropertiesPartial
 * @property {Record<string, string[]>} cssPartialKeywords
 * @property {string[]} cssFunctionsUnsupported
 * @property {string[]} selectorsUnsupported
 * @property {string[]} selectorsPartial
 * @property {string[]} htmlParsedNoImpl
 * @property {string[]} htmlPartial
 * @property {string[]} jsApisUnsupported
 * @property {Record<string, string[]>} jsPartialMembers
 */

/**
 * @param {import("../gameface-features/index.js").GamefaceFeatureIndex} index
 * @param {CatalogWhitelists} whitelists
 * @returns {import("../gameface-features/index.js").GamefaceFeatureIndex}
 */
export function applyCatalogWhitelists(index, whitelists) {
  for (const name of whitelists.cssPropertiesUnsupported) {
    index.cssPropertiesUnsupported.delete(name.toLowerCase());
  }

  for (const name of whitelists.cssPropertiesPartial) {
    index.cssPropertiesPartial.delete(name.toLowerCase());
  }

  for (const [prop, keywords] of Object.entries(whitelists.cssPartialKeywords)) {
    const key = prop.toLowerCase();
    const evidence = index.cssPropertiesPartial.get(key);
    if (!evidence || keywords.length === 0) {
      continue;
    }
    const allow = new Set(keywords.map((k) => k.toLowerCase()));
    /** @type {Record<string, unknown>} */
    const next = { ...evidence };
    for (const field of ["unsupportedValues", "logRejectedValues"]) {
      const raw = evidence[field];
      if (!Array.isArray(raw)) {
        continue;
      }
      next[field] = raw.filter(
        (v) => typeof v !== "string" || !allow.has(v.toLowerCase()),
      );
    }
    index.cssPropertiesPartial.set(key, next);
  }

  for (const name of whitelists.cssFunctionsUnsupported) {
    index.cssFunctionsUnsupported.delete(name.toLowerCase());
  }

  for (const name of whitelists.selectorsUnsupported) {
    index.selectorNamesUnsupported.delete(name);
  }

  for (const name of whitelists.selectorsPartial) {
    index.selectorNamesPartial.delete(name);
  }

  for (const name of whitelists.htmlParsedNoImpl) {
    index.htmlTagsParsedNoImpl.delete(name.toLowerCase());
  }

  for (const name of whitelists.htmlPartial) {
    index.htmlTagsPartial.delete(name.toLowerCase());
  }

  for (const name of whitelists.jsApisUnsupported) {
    index.jsApisUnsupported.delete(name);
  }

  for (const [typeName, members] of Object.entries(whitelists.jsPartialMembers)) {
    const set = index.jsTypesPartial.get(typeName);
    if (!set) {
      continue;
    }
    for (const member of members) {
      set.delete(member);
    }
    if (set.size === 0) {
      index.jsTypesPartial.delete(typeName);
    }
  }

  return index;
}
