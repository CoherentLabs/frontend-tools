#!/usr/bin/env node
/**
 * Writes the A/B pages for the cases whose variable IS a large block of CSS.
 *
 *   node tools/make-rule-heavy-cases.js
 *
 * These pages carry hundreds or thousands of literal rules. They have to be
 * literal: runtime CSS-in-JS is prohibited in Gameface and CSSStyleSheet rule
 * access is unavailable, so a case cannot build its stylesheet at load time
 * without changing what it measures.
 *
 * This is not a scaffold generator for new cases (an explicit non-goal). It is
 * the reproducible source for these specific committed pages, the same way
 * make-baked-images.js is the source for the committed textures - so a reviewer
 * can see what the rules are rather than scrolling 5000 lines of them.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LAB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CASES = join(LAB_ROOT, "cases");

// Built by concatenation so no layer of escaping can eat the backslash - it did
// exactly that once, silently pinning a case to its default count.
const BACKSLASH = String.fromCharCode(92);
const COUNT_REGEX = "/[?&]count=(" + BACKSLASH + "d+)/";
const CLOSE_SCRIPT = "<" + "/script>";

/** Deterministic, visibly distinct colours. No randomness anywhere. */
function colour(n) {
  const h = (n * 137) % 360;
  const channel = (deg) => {
    const k = (((deg / 60) % 6) + 6) % 6;
    return Math.round(60 + 120 * Math.max(0, Math.min(1, 2 - Math.abs(k - 3))));
  };
  return "#" + [channel(h), channel(h + 240), channel(h + 120)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {object} spec
 * @param {string} spec.rules      the stylesheet block that differs between variants
 * @param {string} spec.tileClass  expression producing each tile's class attribute
 * @param {string} spec.churn      the per-frame body
 * @param {string} [spec.extraCss]
 * @param {string} [spec.markup]
 */
function page({ rules, tileClass, churn, extraCss = "", markup = '<div id="root"></div>', host = "root" }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  html, body { margin: 0; width: 100%; height: 100%; background: #101014; overflow: hidden; }
  #root { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  .tile { position: absolute; width: 88px; height: 64px; border-radius: 6px; background: #2a4a6a; }
${extraCss}
${rules}
</style>
</head>
<body>
  ${markup}
  <script>
    var match = ${COUNT_REGEX}.exec(location.search);
    var COUNT = match ? parseInt(match[1], 10) : 100;

    var COLS = 20, CELL_W = 92, CELL_H = 68;

    var host = document.getElementById('${host}');
    var tiles = [];
    for (var i = 0; i < COUNT; i++) {
      var el = document.createElement('div');
      el.className = ${tileClass};
      el.style.left = (16 + (i % COLS) * CELL_W) + 'px';
      el.style.top = (16 + Math.floor(i / COLS) * CELL_H) + 'px';
      host.appendChild(el);
      tiles.push(el);
    }

    var t = 0;
    function frame() {
      t += 1;
${churn}
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  ${CLOSE_SCRIPT}
</body>
</html>
`;
}

function write(caseId, variant, html) {
  const dir = join(CASES, caseId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${variant}.html`), html);
}

const CLASS_CHURN = `      var on = (t % 2) === 0;
      for (var j = 0; j < tiles.length; j++) {
        if (on) tiles[j].classList.add('hot');
        else tiles[j].classList.remove('hot');
      }`;

const NUDGE = `      host.style.transform = 'translateX(' + (t % 3) + 'px)';`;

// ---------------------------------------------------- #24 universal/attribute

{
  const N = 200;
  const flat = [];
  const universal = [];
  for (let n = 0; n < N; n++) {
    flat.push(`  .k${n} { background: ${colour(n)}; }`);
    // No class in the subject position: the engine cannot bucket these by class
    // and must consider them for every candidate element.
    universal.push(`  * [data-k="${n}"] { background: ${colour(n)}; }`);
  }
  const opts = {
    tileClass: "'tile k' + (i % 200)",
    churn: CLASS_CHURN,
    extraCss: "  .tile.hot { opacity: 0.65; }",
  };
  write("selector-universal-vs-class", "A", page({ ...opts, rules: flat.join("\n") }));
  write(
    "selector-universal-vs-class",
    "B",
    page({
      ...opts,
      rules: universal.join("\n"),
      // Same elements, same count, but matched through an attribute the rules
      // key on instead of a class.
      tileClass: "'tile k' + (i % 200)",
      churn: CLASS_CHURN,
    }).replace(
      "el.style.left = (16 + (i % COLS) * CELL_W) + 'px';",
      "el.setAttribute('data-k', String(i % 200));\n      el.style.left = (16 + (i % COLS) * CELL_W) + 'px';"
    )
  );
}

// -------------------------------------------------------- #27 stylesheet size

{
  const small = [];
  const large = [];
  for (let n = 0; n < 200; n++) small.push(`  .s${n} { background: ${colour(n)}; }`);
  for (let n = 0; n < 5000; n++) large.push(`  .s${n} { background: ${colour(n)}; }`);
  const opts = {
    tileClass: "'tile s' + (i % 200)",
    churn: CLASS_CHURN,
    extraCss: "  .tile.hot { opacity: 0.65; }",
  };
  write("stylesheet-size-200-vs-5000", "A", page({ ...opts, rules: small.join("\n") }));
  write("stylesheet-size-200-vs-5000", "B", page({ ...opts, rules: large.join("\n") }));
}

// ------------------------------------------------------ #30 !important wars

{
  const N = 200;
  const plain = [];
  const wars = [];
  for (let n = 0; n < N; n++) {
    plain.push(`  .w${n} { background: ${colour(n)}; }`);
    // Three rules that all match the same element and all have to be resolved,
    // with the last one winning on !important rather than on order.
    wars.push(`  .w${n} { background: ${colour(n + 7)}; }`);
    wars.push(`  div.tile.w${n} { background: ${colour(n + 13)} !important; }`);
    wars.push(`  #root .tile.w${n} { background: ${colour(n)} !important; }`);
  }
  const opts = {
    tileClass: "'tile w' + (i % 200)",
    churn: CLASS_CHURN,
    extraCss: "  .tile.hot { opacity: 0.65; }",
  };
  write("important-specificity", "A", page({ ...opts, rules: plain.join("\n") }));
  write("important-specificity", "B", page({ ...opts, rules: wars.join("\n") }));
}

// ------------------------------------------------------------- #28 :hover

{
  const N = 200;
  const none = [];
  const hovers = [];
  for (let n = 0; n < N; n++) {
    none.push(`  .h${n} { background: ${colour(n)}; }`);
    hovers.push(`  .h${n} { background: ${colour(n)}; }`);
    // The expensive shape the antipattern names: a hover rule whose effect
    // reaches into descendants, so a pointer move invalidates a subtree.
    hovers.push(`  .h${n}:hover .inner { opacity: 0.4; }`);
  }
  const opts = {
    tileClass: "'tile h' + (i % 200)",
    churn: NUDGE,
    extraCss: "  .inner { position: absolute; left: 8px; top: 8px; width: 72px; height: 48px; background: #d8a03a; }",
  };
  const addInner =
    "el.appendChild(document.createElement('div'));\n      el.firstChild.className = 'inner';\n      el.style.left = (16 + (i % COLS) * CELL_W) + 'px';";
  write(
    "hover-rules-many-vs-none",
    "A",
    page({ ...opts, rules: none.join("\n") }).replace("el.style.left = (16 + (i % COLS) * CELL_W) + 'px';", addInner)
  );
  write(
    "hover-rules-many-vs-none",
    "B",
    page({ ...opts, rules: hovers.join("\n") }).replace("el.style.left = (16 + (i % COLS) * CELL_W) + 'px';", addInner)
  );
}

console.log("wrote rule-heavy pages for 4 cases");
