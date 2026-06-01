import jsNoUnsupportedGlobals from "./js-no-unsupported-globals.js";
import jsPartialMemberAccess from "./js-partial-member-access.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "js-no-unsupported-globals": jsNoUnsupportedGlobals,
  "js-partial-member-access": jsPartialMemberAccess,
};

/** Catalog: gameface-features/js/ */
export const catalog = "js";
