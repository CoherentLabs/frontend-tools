import { clearFeatureIndexCache, getFeatureIndex } from "../src/gameface-features/index.js";

clearFeatureIndexCache();

const raw = getFeatureIndex(undefined, { rawCatalog: true });
if (!raw.jsTypesPartial.get("CSS")?.has("px")) {
  throw new Error("raw index should include CSS.px in partial members");
}

const withInternal = getFeatureIndex();
if (withInternal.jsTypesPartial.get("CSS")?.has("px")) {
  throw new Error("internal whitelist should drop CSS.px");
}

console.log("catalog-whitelist: ok");
