import htmlDatabindBindFor from "./html-databind-bind-for.js";
import htmlDatabindClassToggle from "./html-databind-class-toggle.js";
import htmlDatabindCurlyBrackets from "./html-databind-curly-brackets.js";
import htmlDatabindModelProperties from "./html-databind-model-properties.js";
import htmlDatabindPropertyAccessors from "./html-databind-property-accessors.js";
import htmlDatabindSpelling from "./html-databind-spelling.js";
import jsxDatabindBindFor from "./jsx-databind-bind-for.js";
import jsxDatabindClassToggle from "./jsx-databind-class-toggle.js";
import jsxDatabindCurlyBrackets from "./jsx-databind-curly-brackets.js";
import jsxDatabindModelProperties from "./jsx-databind-model-properties.js";
import jsxDatabindPropertyAccessors from "./jsx-databind-property-accessors.js";
import jsxDatabindSpelling from "./jsx-databind-spelling.js";
import vueDatabindBindFor from "./vue-databind-bind-for.js";
import vueDatabindClassToggle from "./vue-databind-class-toggle.js";
import vueDatabindCurlyBrackets from "./vue-databind-curly-brackets.js";
import vueDatabindModelProperties from "./vue-databind-model-properties.js";
import vueDatabindPropertyAccessors from "./vue-databind-property-accessors.js";
import vueDatabindSpelling from "./vue-databind-spelling.js";
import svelteDatabindBindFor from "./svelte-databind-bind-for.js";
import svelteDatabindClassToggle from "./svelte-databind-class-toggle.js";
import svelteDatabindCurlyBrackets from "./svelte-databind-curly-brackets.js";
import svelteDatabindModelProperties from "./svelte-databind-model-properties.js";
import svelteDatabindPropertyAccessors from "./svelte-databind-property-accessors.js";
import svelteDatabindSpelling from "./svelte-databind-spelling.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "html-databind-spelling": htmlDatabindSpelling,
  "html-databind-curly-brackets": htmlDatabindCurlyBrackets,
  "html-databind-property-accessors": htmlDatabindPropertyAccessors,
  "html-databind-bind-for": htmlDatabindBindFor,
  "html-databind-class-toggle": htmlDatabindClassToggle,
  "html-databind-model-properties": htmlDatabindModelProperties,
  "jsx-databind-spelling": jsxDatabindSpelling,
  "jsx-databind-curly-brackets": jsxDatabindCurlyBrackets,
  "jsx-databind-property-accessors": jsxDatabindPropertyAccessors,
  "jsx-databind-bind-for": jsxDatabindBindFor,
  "jsx-databind-class-toggle": jsxDatabindClassToggle,
  "jsx-databind-model-properties": jsxDatabindModelProperties,
  "vue-databind-spelling": vueDatabindSpelling,
  "vue-databind-curly-brackets": vueDatabindCurlyBrackets,
  "vue-databind-property-accessors": vueDatabindPropertyAccessors,
  "vue-databind-bind-for": vueDatabindBindFor,
  "vue-databind-class-toggle": vueDatabindClassToggle,
  "vue-databind-model-properties": vueDatabindModelProperties,
  "svelte-databind-spelling": svelteDatabindSpelling,
  "svelte-databind-curly-brackets": svelteDatabindCurlyBrackets,
  "svelte-databind-property-accessors": svelteDatabindPropertyAccessors,
  "svelte-databind-bind-for": svelteDatabindBindFor,
  "svelte-databind-class-toggle": svelteDatabindClassToggle,
  "svelte-databind-model-properties": svelteDatabindModelProperties,
};

/** HTMLLint parity; not tied to a single features JSON file. */
export const catalog = "databind";
