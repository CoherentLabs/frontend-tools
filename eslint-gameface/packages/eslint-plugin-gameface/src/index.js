import { allRules } from "./rules/index.js";
import { createFlatRecommended } from "./configs/flat-recommended.js";

const plugin = {
  meta: {
    name: "eslint-plugin-gameface",
    version: "1.0.0",
  },
  rules: allRules,
  configs: {},
};

plugin.configs["flat/recommended"] = createFlatRecommended(plugin);

export default plugin;
export { createFlatRecommended };
export { allRules } from "./rules/index.js";
export * from "./rules/index.js";
export {
  clearFeatureIndexCache,
  getFeatureIndex,
  getFeatureIndexForContext,
  isCssPropertyAllowedForDataBindStyle,
  resolveGamefaceFeaturesRoot,
} from "./gameface-features/index.js";
export {
  DEFAULT_GAMEFACE_VERSION,
  getGamefaceVersionFromContext,
  normalizeGamefaceVersionSetting,
} from "./utils/eslint-gameface-settings.js";
