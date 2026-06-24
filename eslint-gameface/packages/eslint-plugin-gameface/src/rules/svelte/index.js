import svelteParsedNoImpl from "./svelte-parsed-no-impl.js";
import sveltePartialFeatures from "./svelte-partial-features.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "svelte-parsed-no-impl": svelteParsedNoImpl,
  "svelte-partial-features": sveltePartialFeatures,
};

export const catalog = "html";
