import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const src = join(root, "src");
const rulesRoot = join(src, "rules");

const replacements = [
  [/vue-/g, "svelte-"],
  [/Vue /g, "Svelte "],
  [/Vue`/g, "Svelte`"],
  [/Vue</g, "Svelte<"],
  [/defineVueTemplateVisitor/g, "defineSvelteMarkupVisitor"],
  [/defineVueDocumentVisitor/g, "defineSvelteMarkupVisitor"],
  [/isVueTemplateElement/g, "isSvelteMarkupElement"],
  [/vueElementTagName/g, "svelteElementTagName"],
  [/vueStartTagAttributeNamesLower/g, "svelteStartTagAttributeNamesLower"],
  [/walkVueDataBindAttributes/g, "walkSvelteDataBindAttributes"],
  [/walkVueStyleAttributes/g, "walkSvelteStyleAttributes"],
  [/walkVueStyleStringValues/g, "walkSvelteStyleStringValues"],
  [/walkVueStyleObjectProperties/g, "walkSvelteStyleObjectProperties"],
  [/walkVueStyleAttributeDeclarations/g, "walkSvelteStyleAttributeDeclarations"],
  [/walkVueStartTagAttributes/g, "walkSvelteStartTagAttributes"],
  [/vueAttributeValueText/g, "svelteAttributeValueText"],
  [/vueAttributeValueLoc/g, "svelteAttributeValueLoc"],
  [/vueAttributeName/g, "svelteAttributeName"],
  [/vueOpeningAttributeMap/g, "svelteOpeningAttributeMap"],
  [/isInsideVueSvgSubtree/g, "isInsideSvelteSvgSubtree"],
  [/vueHasMaskAndClipPathUrlConflict/g, "svelteHasMaskAndClipPathUrlConflict"],
  [/createVueInlineStyleRule/g, "createSvelteInlineStyleRule"],
  [/createVueSfcStyleRule/g, "createSvelteSfcStyleRule"],
  [/withVueStyleBlockText/g, "withSvelteStyleBlockText"],
  [/walkVueSfcStyleDeclarations/g, "walkSvelteSfcStyleDeclarations"],
  [/walkVueSfcStyleNodes/g, "walkSvelteSfcStyleNodes"],
  [/walkVueSfcInlineCssContent/g, "walkSvelteSfcInlineCssContent"],
  [/getVueStyleBlockTextRange/g, "getSvelteStyleBlockTextRange"],
  [/VElement/g, "SvelteElement"],
  [/node\.startTag/g, "node.startTag"],
];

function transform(content) {
  let out = content;
  for (const [from, to] of replacements) {
    out = out.replace(from, to);
  }
  return out;
}

/** @type {string[]} */
const vueFiles = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (name.startsWith("vue-") && name.endsWith(".js")) {
      vueFiles.push(p);
    }
  }
}

import { readdirSync, statSync } from "node:fs";

walk(rulesRoot);

for (const vuePath of vueFiles) {
  const rel = vuePath.slice(rulesRoot.length + 1);
  if (rel.startsWith(`vue${sep}`) && (basename(rel).startsWith("vue-parsed") || basename(rel).startsWith("vue-partial"))) {
    const base = basename(rel).replace(/vue-/g, "svelte-");
    const sveltePath = join(rulesRoot, "svelte", base);
    writeFileSync(sveltePath, transform(readFileSync(vuePath, "utf8")));
    console.log("wrote", sveltePath.slice(root.length));
    continue;
  }
  const sveltePath = join(rulesRoot, rel.replace(/vue-/g, "svelte-"));
  const dir = dirname(sveltePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (basename(sveltePath).includes("vue-")) {
    continue;
  }
  const content = transform(readFileSync(vuePath, "utf8"));
  writeFileSync(sveltePath, content);
  console.log("wrote", sveltePath.replace(root, ""));
}

// svelte/index.js from vue/index.js
mkdirSync(join(rulesRoot, "svelte"), { recursive: true });
const vueIndex = readFileSync(join(rulesRoot, "vue", "index.js"), "utf8");
writeFileSync(
  join(rulesRoot, "svelte", "index.js"),
  vueIndex.replace(/vue-/g, "svelte-"),
);
console.log("wrote /rules/svelte/index.js");
