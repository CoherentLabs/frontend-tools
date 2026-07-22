/* eslint-disable */
// Generator — converts scraper outputs in results/ into negative-ruleset files
// in prompts/. Re-run whenever results/ changes (`node gen-rules.js`).

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const RES = path.join(ROOT, 'results');
const OUT = path.join(ROOT, 'prompts');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));

const css = {
  supported: read(path.join(RES, 'css', 'supported.json')),
  partial: read(path.join(RES, 'css', 'partial.json')),
  unsupported: read(path.join(RES, 'css', 'unsupported.json')),
};
const html = {
  supported: read(path.join(RES, 'html', 'supported.json')),
  partial: read(path.join(RES, 'html', 'partial.json')),
  unsupported: read(path.join(RES, 'html', 'unsupported.json')),
};
const js = {
  supported: read(path.join(RES, 'js', 'supported.json')),
  partial: read(path.join(RES, 'js', 'partial.json')),
  unsupported: read(path.join(RES, 'js', 'unsupported.json')),
};
const sel = {
  supported: read(path.join(RES, 'selectors', 'supported.json')),
  partial: read(path.join(RES, 'selectors', 'partial.json')),
  unsupported: read(path.join(RES, 'selectors', 'unsupported.json')),
};
const funcs = {
  supported: read(path.join(RES, 'functions', 'supported.json')),
  partial: read(path.join(RES, 'functions', 'partial.json')),
  unsupported: read(path.join(RES, 'functions', 'unsupported.json')),
};

// ---------- helpers ----------
const SHORTHANDS = new Set([
  'all', 'animation', 'background', 'border', 'border-bottom', 'border-color',
  'border-image', 'border-left', 'border-radius', 'border-right', 'border-style',
  'border-top', 'border-width', 'box-shadow', 'flex', 'font', 'gap', 'margin',
  'mask', 'padding', 'text-decoration', 'text-shadow', 'text-stroke', 'transition',
]);

const SHORTHAND_LONGHANDS = {
  'border': ['border-width', 'border-style', 'border-color'],
  'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
  'border-left': ['border-left-width', 'border-left-style', 'border-left-color'],
  'border-right': ['border-right-width', 'border-right-style', 'border-right-color'],
  'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
  'border-color': ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
  'border-style': ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
  'border-width': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
  'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
  'border-image': ['border-image-source', 'border-image-slice', 'border-image-width', 'border-image-outset', 'border-image-repeat'],
  'animation': ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'],
  'transition': ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
  'background': ['background-color', 'background-image', 'background-position', 'background-size', 'background-repeat'],
  'font': ['font-family', 'font-size', 'font-style', 'font-weight', 'line-height'],
  'flex': ['flex-grow', 'flex-shrink', 'flex-basis'],
  'gap': ['row-gap', 'column-gap'],
  'margin': ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  'padding': ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  'mask': ['mask-image', 'mask-position', 'mask-size', 'mask-repeat', 'mask-clip', 'mask-mode'],
  'text-decoration': ['text-decoration-line', 'text-decoration-color', 'text-decoration-style', 'text-decoration-thickness'],
  'text-stroke': ['text-stroke-width', 'text-stroke-color'],
};

// canonical safe CSS values per property (drawn from supportedValues / supported.json)
const SAFE_VALUES = {
  'align-content': 'center',
  'align-items': 'center',
  'align-self': 'center',
  'animation-direction': 'normal',
  'animation-fill-mode': 'forwards',
  'animation-play-state': 'running',
  'animation-timing-function': 'ease-in-out',
  'animation-iteration-count': '1',
  'animation-duration': '300ms',
  'animation-delay': '0s',
  'background-color': 'rgba(0, 0, 0, 0.5)',
  'background-image': 'none',
  'background-repeat': 'no-repeat',
  'border-bottom-style': 'solid',
  'border-left-style': 'solid',
  'border-right-style': 'solid',
  'border-top-style': 'solid',
  'border-style': 'solid',
  'border-image-repeat': 'stretch',
  'box-sizing': 'border-box',
  'clip-path': 'inset(10px)',
  'contain': 'layout',
  'content': 'normal',
  'display': 'flex',
  'flex-direction': 'row',
  'flex-wrap': 'nowrap',
  'flex-basis': '100px',
  'font-style': 'italic',
  'font-size': '16px',
  'font-weight': 'bold',
  'font-variant-east-asian': 'normal',
  'image-rendering': 'pixelated',
  'justify-content': 'space-between',
  'mask-mode': 'alpha',
  'mix-blend-mode': 'multiply',
  'overflow-x': 'hidden',
  'overflow-y': 'auto',
  'pointer-events': 'auto',
  'position': 'absolute',
  'text-align': 'center',
  'text-decoration-line': 'underline',
  'text-decoration-style': 'solid',
  'text-decoration-thickness': 'auto',
  'text-overflow': 'ellipsis',
  'text-transform': 'uppercase',
  'text-underline-offset': 'auto',
  'text-underline-position': 'under',
  'transition-timing-function': 'ease-in-out',
  'user-select': 'none',
  'vertical-align': 'middle',
  'visibility': 'hidden',
  'white-space': 'pre-wrap',
  'opacity': '0.5',
  'flex-grow': '1',
  'flex-shrink': '0',
};

const UNSAFE_VALUE_SAMPLE = (name, ev) => {
  if (ev.unsupportedValues && ev.unsupportedValues.length) return ev.unsupportedValues[0];
  if (ev.logRejectedValues && ev.logRejectedValues.length) return ev.logRejectedValues[0];
  return null;
};

// ---------- rule builders ----------

let rules = [];
let needsReview = [];

function pushRule(r) {
  rules.push(r);
}

// Severity heuristics
function cssSeverity(name, status, evidence) {
  if (status === 'partial-shorthand') {
    // Layout-critical shorthands are critical, others high
    if (['border', 'background', 'animation', 'transition', 'flex', 'font'].includes(name)) return 'critical';
    return 'high';
  }
  if (status === 'partial-values') {
    if (['display', 'position', 'align-content', 'align-items', 'align-self', 'justify-content', 'flex-basis'].includes(name)) return 'critical';
    if (['border-bottom-style', 'border-left-style', 'border-right-style', 'border-top-style', 'border-style', 'pointer-events', 'visibility', 'white-space', 'overflow-x', 'overflow-y', 'image-rendering', 'mix-blend-mode', 'background-image', 'background-repeat', 'border-image-repeat', 'mask-mode', 'mask-clip', 'text-align', 'text-decoration-line', 'text-decoration-style', 'text-decoration-thickness', 'text-overflow', 'text-transform', 'text-underline-position', 'text-underline-offset', 'font-style', 'font-weight', 'font-variant-east-asian', 'font-size'].includes(name)) return 'high';
    return 'medium';
  }
  if (status === 'parser-only') {
    if (['cursor', 'aspect-ratio', 'overflow', 'overflow-wrap', 'isolation', 'background-position', 'background-size', 'mask-image', 'mask-position', 'mask-size', 'transform', 'transform-origin', 'transition-property'].includes(name)) return 'high';
    return 'medium';
  }
  if (status === 'missing') {
    // Layout / sizing / scroll critical features
    if (/^(grid|grid-|gap|columns|column-)/.test(name)) return 'critical';
    if (/^(inset|inset-|float|clear|float|object-fit|object-position|writing-mode|direction|unicode-bidi|float|clip$|appearance|resize|table-layout|caption-side|empty-cells|border-collapse|border-spacing|list-style|list-style-type|list-style-image|list-style-position)/.test(name)) return 'high';
    if (/^(scroll-|overscroll-|scrollbar-|view-timeline|scroll-timeline|animation-timeline|animation-range|view-transition-|hyphens|hyphenate-|tab-size|word-spacing|word-break|line-break|text-wrap|text-justify|text-indent|text-align-last|text-emphasis|text-orientation|text-size-adjust|text-spacing-trim|text-autospace|text-box|text-combine|font-variant|font-feature|font-kerning|font-language|font-optical|font-palette|font-size-adjust|font-stretch|font-synthesis|font-variation|font-width|font-smooth|font-language-override|paint-order|will-change|widows|orphans|orphans|page-break|page$|color-scheme|color-adjust|color-interpolation|print-color-adjust|forced-color|dynamic-range|content-visibility|contain-intrinsic|container|container-type|container-name|anchor-|position-|reading-flow|baseline-|alignment-baseline|dominant-baseline|initial-letter|interactivity|interpolate-size|line-clamp|line-height-step|hanging-punctuation|image-orientation|ime-mode|math-|ruby-|alt$|speak|speak-as|stroke-color|tab-size|outline|overlay|float|object-view-box|offset-|color-adjust|text-decoration-skip|text-decoration-skip-ink|background-attachment|background-blend-mode|background-clip|background-origin|baseline-source|block-size|inline-size|max-block-size|min-block-size|max-inline-size|min-inline-size|margin-trim|marker|marker-end|marker-mid|marker-start|mask-border|mask-composite|mask-origin|color-interpolation-filters|flood-color|flood-opacity|lighting-color|alignment-baseline|baseline-shift|dominant-baseline|glyph-orientation|paint-order|shape-image|shape-margin|shape-outside|stroke-color|vector-effect|justify-items|justify-self|place-content|place-items|place-self|order|appearance|accent-color|caret-color|field-sizing|zoom|translate|rotate|scale|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|column-fill|column-count|columns|break-after|break-before|break-inside|page-break|counter-|coh-)/.test(name)) return 'medium';
    return 'low';
  }
  return 'medium';
}

function htmlSeverity(name, status) {
  if (status === 'silently-coerced') return 'critical';
  if (status === 'parsed-no-impl') {
    if (['form', 'select', 'option', 'optgroup', 'progress', 'meter', 'iframe', 'audio', 'video', 'a', 'label', 'fieldset', 'legend', 'details', 'summary', 'datalist', 'dialog', 'output', 'embed', 'object', 'map', 'area', 'track'].includes(name)) return 'critical';
    if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'col', 'colgroup', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu'].includes(name)) return 'high';
    return 'medium';
  }
  if (status === 'unknown') return 'critical';
  if (status === 'partial') return 'high';
  return 'medium';
}

function jsSeverity(name, status, evidence) {
  if (status === 'stub') {
    if (['Animation', 'MutationObserver', 'ResizeObserver', 'CanvasRenderingContext2D', 'XMLHttpRequest', 'WebSocket', 'CustomElementRegistry', 'CustomEvent', 'CSSStyleDeclaration', 'CSSStyleSheet', 'Element', 'Document', 'Node', 'EventTarget', 'Event', 'KeyboardEvent', 'MouseEvent', 'Storage', 'History', 'Selection', 'Navigator', 'URL', 'Performance'].includes(name)) return 'critical';
    return 'high';
  }
  if (status === 'missing') {
    const critical = /^(fetch|Worker|SharedWorker|ServiceWorker|indexedDB|IDBDatabase|IDBObjectStore|IDBTransaction|IDBKeyRange|Request|Response|Headers|FormData|Blob$|File$|FileReader|crypto|TextEncoder|TextDecoder|WebGLRenderingContext|WebGL2RenderingContext|AudioContext|RTCPeerConnection|MediaStream|getUserMedia|customElements|EventSource|MessageChannel|MessagePort|BroadcastChannel|atob|btoa|fetch|requestIdleCallback|matchMedia|alert|confirm|prompt|localStorage|sessionStorage|IntersectionObserver|PerformanceObserver|Notification|geolocation|FontFace|FontFaceSet|Range|TreeWalker)$/.test(name);
    if (critical) return 'critical';
    return 'low';
  }
  return 'medium';
}

// ----- CSS supported/partial/missing classification -----
function classifyCssPartial(entry) {
  const ev = entry.evidence || {};
  const isShorthand = SHORTHANDS.has(entry.name);
  const probe = ev.probe;
  const sv = ev.supportedValues || [];
  const uv = ev.unsupportedValues || [];
  const lr = ev.logRejectedValues || [];
  const lw = ev.logWarning;
  // Custom -coh properties accepted-but-not-computed: keep as parser-only (engine-specific behavior)
  if (entry.name.startsWith('coh-')) return 'parser-only';
  if (isShorthand) {
    if (probe === 'value-accepted-but-not-computed' || lw) return 'partial-shorthand';
    // border-style is technically a shorthand but here logRejectedValues includes 'dashed'/'dotted' — value rejection at shorthand level
    return 'partial-values';
  }
  if (uv.length || (sv.length > 0 && lr.length > 0)) return 'partial-values';
  if (lr.length) return 'partial-values';
  if (probe === 'value-accepted-but-not-computed') return 'parser-only';
  return 'parser-only';
}

// CSS rules
let cssId = 0;
const nextCssId = () => `CSS-${String(++cssId).padStart(3, '0')}`;

// Sort partial CSS by name for deterministic IDs (sorted by severity later)
const cssPartialSorted = [...css.partial].sort((a, b) => a.name.localeCompare(b.name));
for (const e of cssPartialSorted) {
  const status = classifyCssPartial(e);
  const ev = e.evidence || {};
  const lr = (ev.logRejectedValues || []).slice();
  const sv = ev.supportedValues || [];
  const uv = ev.unsupportedValues || [];
  const probe = ev.probe;
  const lw = ev.logWarning;
  const supportedUnits = ev.supportedUnits || [];

  let badExample, goodExample, ruleSentence, why;
  const unsafeVal = UNSAFE_VALUE_SAMPLE(e.name, ev) || (probe === 'value-accepted-but-not-computed' ? 'var(--x)' : 'initial');

  if (status === 'partial-shorthand') {
    const longhands = SHORTHAND_LONGHANDS[e.name] || [];
    badExample = `.foo { ${e.name}: ${shorthandSample(e.name)}; }`;
    if (longhands.length) {
      goodExample = `.foo {\n  ${longhands.slice(0, 4).map(lh => `${lh}: ${SAFE_VALUES[lh] || sampleLonghand(lh)};`).join('\n  ')}\n}`;
    } else {
      goodExample = `// No direct Gameface equivalent — implement via supported longhands or omit.`;
    }
    ruleSentence = `Never use the \`${e.name}\` shorthand; assign the longhands explicitly.`;
    if (lw) why = `scraper logWarning: "${lw}"; shorthand parses but does not propagate to longhands.`;
    else why = `scraper probe: "value-accepted-but-not-computed"; shorthand parses but is not honored at compute time.`;
  } else if (status === 'partial-values') {
    const safeVal = SAFE_VALUES[e.name] || (sv[0]) || 'auto';
    badExample = `.foo { ${e.name}: ${unsafeVal}; }`;
    goodExample = `.foo { ${e.name}: ${safeVal}; }`;
    const rejectedList = [...new Set([...uv, ...lr])].slice(0, 6).join(', ');
    ruleSentence = rejectedList
      ? `Never assign \`${rejectedList}\` to \`${e.name}\`; only the documented Gameface subset is honored.`
      : `Never assume the full spec value-set works for \`${e.name}\`.`;
    if (lr.length) why = `scraper logRejectedValues: ${JSON.stringify(lr)}; the renderer rejects these tokens.`;
    else if (uv.length) why = `scraper unsupportedValues: ${JSON.stringify(uv)}.`;
    else why = `scraper evidence shows a partial value-set is honored.`;
  } else { // parser-only
    badExample = `.foo { ${e.name}: ${unsafeVal}; }`;
    if (e.name.startsWith('coh-')) {
      goodExample = `// Gameface-internal property — only set when explicitly required by Coherent docs.`;
      ruleSentence = `Never set \`${e.name}\` unless following an explicit Gameface integration recipe.`;
    } else {
      goodExample = SAFE_VALUES[e.name] ? `.foo { ${e.name}: ${SAFE_VALUES[e.name]}; }` : `// No direct Gameface equivalent — omit or implement custom.`;
      ruleSentence = `Never rely on \`${e.name}\`; the parser accepts it but the renderer ignores the value.`;
    }
    if (probe) why = `scraper probe: "${probe}"; value is accepted by the parser but does not appear in computed style.`;
    else if (lr.length) why = `scraper logRejectedValues: ${JSON.stringify(lr)}.`;
    else why = `scraper marked partial without computed-style propagation.`;
  }

  const supportedUnitsSnippet = supportedUnits.length ? ` Supported units: ${supportedUnits.join(', ')}.` : '';
  if (supportedUnitsSnippet) why += supportedUnitsSnippet;

  const surface = SHORTHANDS.has(e.name) ? 'css-shorthand' : (status === 'partial-values' ? 'css-value' : 'css-property');

  pushRule({
    id: nextCssId(),
    surface,
    status,
    severity: cssSeverity(e.name, status, ev),
    name: e.name,
    summary: ruleSummary(e.name, status, ev),
    badExample,
    badLang: 'css',
    goodExample,
    goodLang: 'css',
    ruleSentence,
    why,
    sourceFile: 'results/css/partial.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'css',
  });
}

function shorthandSample(name) {
  switch (name) {
    case 'border': return '1px solid red';
    case 'border-bottom':
    case 'border-left':
    case 'border-right':
    case 'border-top': return '1px solid red';
    case 'border-color': return 'red';
    case 'border-image': return 'url(border.png) 30 round';
    case 'border-radius': return '4px';
    case 'border-style': return 'solid';
    case 'border-width': return '1px';
    case 'animation': return 'fadeIn 300ms ease-in-out';
    case 'background': return 'red url(bg.png) no-repeat';
    case 'box-shadow': return '0 0 4px rgba(0,0,0,.5)';
    case 'flex': return '1 1 auto';
    case 'font': return 'bold 16px/1.2 sans-serif';
    case 'gap': return '8px 16px';
    case 'margin': return '4px 8px';
    case 'mask': return 'url(m.png) no-repeat';
    case 'padding': return '4px 8px';
    case 'text-decoration': return 'underline solid red';
    case 'text-shadow': return '1px 1px 2px black';
    case 'text-stroke': return '1px black';
    case 'transition': return 'opacity 200ms ease-in-out';
    case 'all': return 'unset';
    default: return 'value';
  }
}

function sampleLonghand(lh) {
  switch (lh) {
    case 'border-image-source': return 'url(border.png)';
    case 'border-image-slice': return '30';
    case 'border-image-width': return '1';
    case 'border-image-outset': return '0';
    case 'border-image-repeat': return 'round';
    case 'background-color': return 'red';
    case 'background-image': return 'url(bg.png)';
    case 'background-position': return 'center';
    case 'background-size': return 'cover';
    case 'background-repeat': return 'no-repeat';
    case 'animation-name': return 'fadeIn';
    case 'animation-duration': return '300ms';
    case 'animation-timing-function': return 'ease-in-out';
    case 'animation-delay': return '0ms';
    case 'animation-iteration-count': return '1';
    case 'animation-direction': return 'normal';
    case 'animation-fill-mode': return 'forwards';
    case 'animation-play-state': return 'running';
    case 'transition-property': return 'opacity';
    case 'transition-duration': return '200ms';
    case 'transition-timing-function': return 'ease-in-out';
    case 'transition-delay': return '0ms';
    case 'border-top-color': case 'border-right-color': case 'border-bottom-color': case 'border-left-color': return 'red';
    case 'border-top-style': case 'border-right-style': case 'border-bottom-style': case 'border-left-style': return 'solid';
    case 'border-top-width': case 'border-right-width': case 'border-bottom-width': case 'border-left-width': return '1px';
    case 'border-top-left-radius': case 'border-top-right-radius': case 'border-bottom-right-radius': case 'border-bottom-left-radius': return '4px';
    case 'flex-grow': return '1';
    case 'flex-shrink': return '1';
    case 'flex-basis': return 'auto';
    case 'font-family': return 'sans-serif';
    case 'font-size': return '16px';
    case 'font-style': return 'normal';
    case 'font-weight': return 'bold';
    case 'line-height': return '1.2';
    case 'row-gap': case 'column-gap': return '8px';
    case 'mask-image': return 'url(m.png)';
    case 'mask-position': return 'center';
    case 'mask-size': return 'contain';
    case 'mask-repeat': return 'no-repeat';
    case 'mask-clip': return 'none';
    case 'mask-mode': return 'alpha';
    case 'text-decoration-line': return 'underline';
    case 'text-decoration-color': return 'red';
    case 'text-decoration-style': return 'solid';
    case 'text-decoration-thickness': return 'auto';
    case 'text-stroke-width': return '1px';
    case 'text-stroke-color': return 'black';
    default:
      if (/-top$|-right$|-bottom$|-left$/.test(lh)) return '4px';
      return 'auto';
  }
}

function ruleSummary(name, status, ev) {
  if (status === 'partial-shorthand') return `${name} shorthand parses but does not propagate to longhands`;
  if (status === 'partial-values') {
    const lr = ev.logRejectedValues || [];
    const uv = ev.unsupportedValues || [];
    const rejected = [...new Set([...uv, ...lr])];
    return rejected.length ? `${name} rejects values: ${rejected.slice(0, 5).join(', ')}` : `${name} honors only a subset of spec values`;
  }
  if (status === 'parser-only') return `${name} parses but is not applied at render time`;
  if (status === 'missing') return `${name} is not present at runtime`;
  return `${name} ${status}`;
}

// ----- CSS missing -----
// Group "missing" CSS into family rules to avoid 341 duplicate rule entries.
// Each family-rule lists all members in its summary/why.
const cssMissing = css.unsupported;

const cssFamilies = [
  {
    name: 'legacy-box-flex',
    label: 'Legacy `box-*` flexbox model',
    severity: 'low',
    test: n => /^(box-align|box-decoration-break|box-direction|box-flex|box-flex-group|box-lines|box-ordinal-group|box-orient|box-pack)$/.test(n),
    rule: 'Never use the legacy `box-*` flexbox model (`box-align`, `box-flex`, `box-orient`, `box-pack`, …); use the modern flexbox longhands (`align-items`, `flex-grow`, `flex-direction`, `justify-content`).',
    why: 'Scraper logWarning: "Unsupported CSS property detected (stylesheet parser)" for every legacy `box-*` property.',
    bad: '.foo { box-align: center; box-flex: 1; box-orient: horizontal; }',
    good: '.foo { align-items: center; flex-grow: 1; flex-direction: row; }',
  },
  {
    name: 'logical-physical-properties',
    label: 'Logical and physical-mapped CSS properties',
    severity: 'high',
    test: n => /^(block-size|inline-size|min-block-size|max-block-size|min-inline-size|max-inline-size|inset|inset-(block|inline)|border-(block|inline)(-|$)|margin-(block|inline)(-|$)|padding-(block|inline)(-|$)|border-(start|end)-(start|end)-radius|border-(end-end|end-start|start-end|start-start)-radius|scroll-(margin|padding)-(block|inline)(-|$))/.test(n),
    rule: 'Never use logical / writing-mode-relative properties (`*-block`, `*-inline`, `inset-*`, etc.); they are not implemented. Use the physical-axis properties (`top/right/bottom/left`, `margin-top/right/bottom/left`, etc.).',
    why: 'Scraper marked every logical-property as `missing`; Gameface only implements the physical-axis equivalents.',
    bad: '.foo { margin-block: 8px; inset-inline: 0; }',
    good: '.foo { margin-top: 8px; margin-bottom: 8px; left: 0; right: 0; }',
  },
  {
    name: 'css-grid',
    label: 'CSS Grid layout',
    severity: 'critical',
    test: n => /^grid(-|$)/.test(n) || n === 'gap-grid',
    rule: 'Never use CSS Grid (`grid`, `grid-template-*`, `grid-area`, `grid-auto-*`, `grid-column*`, `grid-row*`, `grid-gap`); Gameface has no grid layout. Use Flexbox (`display: flex` with the supported subset) instead.',
    why: 'Scraper marked every `grid-*` property as `missing`; Gameface does not implement grid layout.',
    bad: '.layout { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; }',
    good: '.layout { display: flex; flex-direction: row; }\n.layout > .col-a { flex: 1; } .layout > .col-b { flex: 2; margin-left: 8px; }',
  },
  {
    name: 'multi-column',
    label: 'Multi-column layout',
    severity: 'medium',
    test: n => /^(columns?|column-)/.test(n) && !/^column-(gap)$/.test(n),
    rule: 'Never use CSS multi-column layout (`columns`, `column-count`, `column-width`, `column-rule*`, `column-span`, `column-fill`); they are not implemented. Use multiple flex containers if you need column-like layout.',
    why: 'Scraper marked every multi-column property as `missing`.',
    bad: '.text { columns: 3 200px; column-gap: 16px; }',
    good: '.text { display: flex; flex-direction: row; }\n.text > .col { flex: 1; }',
  },
  {
    name: 'container-queries',
    label: 'Container queries',
    severity: 'medium',
    test: n => /^container(-|$)/.test(n),
    rule: 'Never use container queries (`container`, `container-name`, `container-type`); use static breakpoint logic in JS or fixed sizes.',
    why: 'Scraper marked every container-query property as `missing`.',
    bad: '.parent { container-type: inline-size; }\n@container (min-width: 200px) { .child { ... } }',
    good: '// Compute parent size in JS and apply class names; or use absolute sizing.',
  },
  {
    name: 'anchor-positioning',
    label: 'Anchor positioning',
    severity: 'medium',
    test: n => /^(anchor-|position-(anchor|area|try|try-fallbacks|try-order|visibility))/.test(n),
    rule: 'Never use the anchor-positioning module (`anchor-name`, `position-anchor`, `position-area`, `position-try*`); use script-driven positioning instead.',
    why: 'Scraper marked every anchor-* and position-* (modern) property as `missing`.',
    bad: '.tooltip { position-anchor: --button; position-area: top right; }',
    good: '// Compute position in JS using getBoundingClientRect() and set top/left manually.',
  },
  {
    name: 'scroll-snap-margin-padding',
    label: 'Scroll snap, scroll margin / padding, scrollbar customization',
    severity: 'medium',
    test: n => /^(scroll-snap|scroll-margin|scroll-padding|scroll-marker|scroll-behavior|scroll-initial-target|scroll-timeline|scrollbar-)/.test(n) || /^overscroll-/.test(n),
    rule: 'Never use scroll-snap, scroll-margin/padding, scrollbar-* customization, scroll-timeline, or overscroll-behavior; none of them are implemented.',
    why: 'Scraper marked every scroll-* / overscroll-* / scrollbar-* property as `missing`.',
    bad: '.list { scroll-snap-type: y mandatory; scrollbar-width: thin; }',
    good: '// No Gameface equivalent — implement via JS scroll handlers, or omit.',
  },
  {
    name: 'view-transitions-animations-modern',
    label: 'View transitions, animation timeline, scroll timeline',
    severity: 'medium',
    test: n => /^(view-transition|view-timeline|animation-(timeline|range|range-end|range-start|composition)|timeline-scope)/.test(n),
    rule: 'Never use view transitions, view-timeline, scroll-timeline, animation-timeline, or animation-range; only the classic CSS animation longhands are implemented.',
    why: 'Scraper marked every view-transition-* / view-timeline-* / animation-timeline / animation-range / animation-composition / timeline-scope property as `missing`.',
    bad: '.page { view-transition-name: hero; }',
    good: '// Use classic @keyframes + animation-name/duration/timing-function/delay/iteration-count/direction/fill-mode/play-state.',
  },
  {
    name: 'modern-typography',
    label: 'Modern typography (font-variant, hyphens, text-wrap, font-feature-settings, etc.)',
    severity: 'medium',
    test: n => /^(font-variant|font-feature-settings|font-kerning|font-language-override|font-optical-sizing|font-palette|font-size-adjust|font-smooth|font-stretch|font-synthesis|font-variation-settings|font-width|hyphens|hyphenate-|tab-size|word-spacing|word-break|line-break|text-wrap|text-justify|text-indent|text-align-last|text-emphasis|text-orientation|text-size-adjust|text-spacing-trim|text-autospace|text-box|text-combine-upright|text-decoration-skip|text-decoration-skip-ink|hanging-punctuation|line-clamp|line-height-step|initial-letter|white-space-collapse)/.test(n),
    rule: 'Never use modern typography properties (`font-variant-*`, `font-feature-settings`, `hyphens`, `text-wrap`, `text-justify`, `text-indent`, `text-emphasis-*`, `tab-size`, `word-break`, `word-spacing`, `line-clamp`, `text-decoration-skip*`, etc.); use only the supported font/text properties.',
    why: 'Scraper marked every modern typography property as `missing`. Supported text-related properties: see partial entries for `font-size`, `font-style`, `font-weight`, `line-height`, `text-align`, `text-overflow`, `text-transform`, `text-decoration-*`, `text-underline-position`, `text-underline-offset`, `text-shadow`, `text-stroke-*`, `letter-spacing`, `vertical-align`, `white-space`.',
    bad: '.title { font-variant-numeric: tabular-nums; hyphens: auto; word-break: break-word; tab-size: 4; }',
    good: '.title { font-size: 16px; font-weight: bold; text-align: center; text-overflow: ellipsis; }',
  },
  {
    name: 'page-layout-print',
    label: 'Page / print layout',
    severity: 'low',
    test: n => /^(page$|page-break|break-(after|before|inside)|orphans|widows|print-color-adjust|color-adjust|color-interpolation|color-interpolation-filters|color-scheme|forced-color-adjust|dynamic-range-limit)/.test(n),
    rule: 'Never use page-layout / print properties (`page`, `page-break-*`, `break-after/before/inside`, `orphans`, `widows`, `color-scheme`, `print-color-adjust`); not relevant in a game UI runtime.',
    why: 'Scraper marked every page/print/color-scheme property as `missing`.',
    bad: '.foo { page-break-after: always; color-scheme: dark; }',
    good: '// Omit; not applicable to Gameface.',
  },
  {
    name: 'list-table-form-legacy',
    label: 'List, table, form-control native styling',
    severity: 'high',
    test: n => /^(list-style|list-style-type|list-style-image|list-style-position|table-layout|caption-side|empty-cells|border-collapse|border-spacing|appearance|field-sizing|accent-color|resize|ime-mode|user-modify|interactivity|interpolate-size|reading-flow)/.test(n),
    rule: 'Never use list / table / form-control native styling (`list-style*`, `table-layout`, `caption-side`, `border-collapse`, `border-spacing`, `appearance`, `accent-color`, `resize`, `field-sizing`, `ime-mode`, `interpolate-size`); none are implemented. Build list bullets and tables manually with flex.',
    why: 'Scraper marked every list-style-*, table-layout, caption-side, border-collapse/spacing, appearance, accent-color, resize, field-sizing as `missing`.',
    bad: 'ul { list-style-type: disc; }\ntable { border-collapse: collapse; }',
    good: '/* render bullets manually inside .li::pseudo, lay out tables with display:flex */',
  },
  {
    name: 'svg-presentation',
    label: 'SVG-only presentation properties',
    severity: 'medium',
    test: n => /^(alignment-baseline|baseline-shift|baseline-source|dominant-baseline|color-interpolation|color-interpolation-filters|flood-color|flood-opacity|lighting-color|paint-order|stroke-color|vector-effect|glyph-orientation-vertical|marker$|marker-end|marker-mid|marker-start|alt$|speak|speak-as)/.test(n),
    rule: 'Never use these SVG presentation properties (`alignment-baseline`, `baseline-shift`, `dominant-baseline`, `color-interpolation*`, `flood-*`, `lighting-color`, `paint-order`, `marker-*`, `vector-effect`, `glyph-orientation-vertical`, `alt`, `speak*`); not implemented.',
    why: 'Scraper marked these SVG presentation properties as `missing`.',
    bad: '.svg-text { alignment-baseline: middle; paint-order: stroke fill; }',
    good: '/* No Gameface equivalent — restructure SVG geometry instead. */',
  },
  {
    name: 'modern-positioning-misc',
    label: 'Misc modern positioning / sizing helpers',
    severity: 'high',
    test: n => /^(float|clear|clip$|object-fit|object-position|object-view-box|overflow-anchor|overflow-block|overflow-clip-margin|overflow-inline|overlay|writing-mode|direction|unicode-bidi|zoom|translate|rotate|scale|transform-box|transform-style|will-change|content-visibility|contain-intrinsic|order|justify-items|justify-self|place-content|place-items|place-self|caret-color|outline|outline-color|outline-offset|outline-style|outline-width|tab-size|touch-action|math-)/.test(n),
    rule: 'Never use these layout/positioning helpers (`float`, `clear`, `clip`, `object-fit`, `object-position`, `overflow-anchor`, `writing-mode`, `direction`, `zoom`, `translate`/`rotate`/`scale` standalone, `transform-style`, `will-change`, `content-visibility`, `order`, `place-*`, `justify-items/self`, `outline*`, `caret-color`, `tab-size`, `touch-action`, `math-*`); not implemented.',
    why: 'Scraper marked these layout/positioning helpers as `missing`. For 3D-style transforms keep using the 2D-only `transform` property.',
    bad: '.thumb { object-fit: cover; transform-style: preserve-3d; }',
    good: '.thumb { /* size via width/height + background-size */ }',
  },
  {
    name: 'ruby-hanja-bidi-cjk',
    label: 'Ruby, BIDI, CJK, math, hanja',
    severity: 'low',
    test: n => /^(ruby-|math-|unicode-bidi|writing-mode|direction|tab-size$|font-variant-east-asian|font-language-override)/.test(n),
    rule: 'Never use ruby/CJK/math properties (`ruby-*`, `math-*`); not implemented.',
    why: 'Scraper marked ruby/math properties as `missing`.',
    bad: 'rt { ruby-position: under; }',
    good: '/* Omit. */',
  },
  {
    name: 'background-modern',
    label: 'Modern background properties',
    severity: 'medium',
    test: n => /^(background-attachment|background-blend-mode|background-clip|background-origin)/.test(n),
    rule: 'Never use `background-attachment`, `background-blend-mode`, `background-clip`, or `background-origin`; only `background-color`, `background-image: none|url(...)`, `background-position`, `background-repeat`, and `background-size` are honored.',
    why: 'Scraper marked these background longhands as `missing`.',
    bad: '.foo { background-attachment: fixed; background-clip: text; background-blend-mode: multiply; }',
    good: '.foo { background-color: red; background-image: url(bg.png); background-repeat: no-repeat; background-size: cover; }',
  },
  {
    name: 'mask-modern',
    label: 'Modern mask longhands',
    severity: 'medium',
    test: n => /^(mask-border|mask-composite|mask-origin)/.test(n),
    rule: 'Never use `mask-border*`, `mask-composite`, or `mask-origin`; only `mask-image`, `mask-position`, `mask-size`, `mask-repeat`, `mask-clip`, `mask-mode` are honored.',
    why: 'Scraper marked these mask longhands as `missing`.',
    bad: '.foo { mask-border: url(b.png) 30; mask-composite: subtract; }',
    good: '.foo { mask-image: url(m.png); mask-mode: alpha; }',
  },
  {
    name: 'offset-motion-path',
    label: 'CSS Motion-path / offset-*',
    severity: 'medium',
    test: n => /^offset-(anchor|distance|path|position|rotate)/.test(n),
    rule: 'Never use the CSS motion-path module (`offset-anchor`, `offset-distance`, `offset-path`, `offset-position`, `offset-rotate`); animate position via @keyframes on `transform`/`top`/`left` instead.',
    why: 'Scraper marked offset-* (modern) properties as `missing`.',
    bad: '.particle { offset-path: path("M0,0 L100,0"); offset-distance: 50%; }',
    good: '@keyframes move { from { transform: translateX(0) } to { transform: translateX(100px) } }\n.particle { animation: move 1s linear infinite; }',
  },
  {
    name: 'counter-style',
    label: 'CSS counters',
    severity: 'low',
    test: n => /^counter-(increment|reset|set)/.test(n),
    rule: 'Never use CSS counters (`counter-increment`, `counter-reset`, `counter-set`); inject numbering from JS instead.',
    why: 'Scraper marked all counter-* properties as `missing`.',
    bad: 'ol { counter-reset: section; }',
    good: '// Render number labels manually from data.',
  },
  {
    name: 'misc-cosmetic',
    label: 'Other unsupported CSS properties',
    severity: 'low',
    test: () => true,
    rule: 'Never use these CSS properties; the engine logs "Unsupported CSS property detected (stylesheet parser)" for each. Members listed in the index JSON.',
    why: 'Scraper logWarning: "Unsupported CSS property detected (stylesheet parser)" for every member.',
    bad: '/* Property names listed in index.json under this family\'s `members`. */',
    good: '/* Omit; pick a supported property from `results/css/supported.json` or `results/css/partial.json`. */',
  },
];

const cssMissingNames = cssMissing.map(e => e.name);
const familyAssignments = new Map(); // name -> family
for (const f of cssFamilies) {
  for (const n of cssMissingNames) {
    if (familyAssignments.has(n)) continue;
    if (f.test(n)) familyAssignments.set(n, f.name);
  }
}
// Anything unmatched goes to misc-cosmetic
for (const n of cssMissingNames) {
  if (!familyAssignments.has(n)) familyAssignments.set(n, 'misc-cosmetic');
}

// Build family rules
for (const f of cssFamilies) {
  const members = cssMissingNames.filter(n => familyAssignments.get(n) === f.name).sort();
  if (!members.length) continue;
  pushRule({
    id: nextCssId(),
    surface: 'css-property',
    status: 'missing',
    severity: f.severity,
    name: f.label,
    summary: `${members.length} CSS properties in this family are not implemented`,
    badExample: f.bad,
    badLang: 'css',
    goodExample: f.good,
    goodLang: 'css',
    ruleSentence: f.rule,
    why: `${f.why} Members: ${members.join(', ')}.`,
    sourceFile: 'results/css/unsupported.json',
    sourcePath: `$[?(family=="${f.name}")]`,
    bucket: 'css',
    members,
  });
}

// ----- CSS selectors -----
const BASIC_SELECTORS_TO_SKIP = new Set(['div', '*', '.foo', '#foo', 'div > p', 'div p', 'div + p', 'div ~ p', 'div || td', '[attr]', '& .nested', '@supports (display: flex)', '@media (max-width: 600px)', '@layer base', '@container (min-width: 300px)', '@scope (.foo)', '@starting-style', '[attr=\"val\"]', '[attr i]', '[attr~=\"val\"]', '[attr|=\"val\"]', '[attr^=\"val\"]', '[attr$=\"val\"]', '[attr*=\"val\"]']);

const skippedBasicSelectors = [];
const selPartialSorted = [...sel.partial].sort((a, b) => a.name.localeCompare(b.name));
for (const e of selPartialSorted) {
  pushRule({
    id: nextCssId(),
    surface: 'css-selector',
    status: 'partial-values',
    severity: 'medium',
    name: e.name,
    summary: `${e.name}: ${e.evidence.note || 'partial selector support'}`,
    badExample: `${e.name} { color: red; }`,
    badLang: 'css',
    goodExample: `// Toggle classes from JS instead of relying on this selector.`,
    goodLang: 'css',
    ruleSentence: `Never rely on \`${e.name}\` for styling that depends on the dynamic state described in the spec; only the basic form is partially supported.`,
    why: `scraper note: "${e.evidence.note}". Group: ${e.evidence.group}.`,
    sourceFile: 'results/selectors/partial.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'css',
  });
}

const selUnsupportedSorted = [...sel.unsupported].sort((a, b) => a.name.localeCompare(b.name));
for (const e of selUnsupportedSorted) {
  if (BASIC_SELECTORS_TO_SKIP.has(e.name)) {
    skippedBasicSelectors.push(e.name);
    continue;
  }
  pushRule({
    id: nextCssId(),
    surface: 'css-selector',
    status: 'parser-only',
    severity: selectorSeverity(e.name, e.evidence.group),
    name: e.name,
    summary: `${e.name} (${e.evidence.group}) parses but is not honored`,
    badExample: `${e.name} { color: red; }`,
    badLang: 'css',
    goodExample: `// Toggle classes from JS based on application state.`,
    goodLang: 'css',
    ruleSentence: `Never use the \`${e.name}\` selector; the renderer parses it but does not apply matching rules.`,
    why: `scraper probeA=false, probeB=false${e.evidence.logWarning ? `; logWarning: "${e.evidence.logWarning}"` : ''}.`,
    sourceFile: 'results/selectors/unsupported.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'css',
  });
}

function selectorSeverity(name, group) {
  if ([':hover', ':focus', ':focus-visible', ':focus-within', ':active', ':disabled', ':enabled', ':checked', ':not(.foo)', ':not(.foo, .bar)', ':is(.foo, .bar)', ':is(:hover, :focus)', ':first-child', ':last-child', ':nth-child(2)', ':nth-child(2n+1)', ':nth-child(odd)', ':nth-child(even)', ':first-of-type', ':last-of-type', ':nth-of-type(2)', ':nth-last-child(2)', ':nth-last-of-type(2)'].includes(name)) return 'critical';
  if (group === 'pseudo-element') return 'high';
  if (group === 'pseudo-class') return 'high';
  if (group === 'at-rule') return 'high';
  return 'medium';
}

// ----- CSS functions (results/functions/) -----
// Group missing functions by their evidence.category. Each category becomes one family rule.
const funcCategories = {
  math: {
    label: 'CSS modern math functions',
    severity: 'critical',
    rule: 'Never use the missing CSS math functions (`clamp`, `min`, `max`, `mod`, `rem`, `round`, `abs`, `asin`, `acos`, `atan`, `atan2`); precompute the value in JS or use `calc()` with arithmetic that resolves to a constant. `calc`, `sign`, `pow`, `sqrt`, `hypot`, `log`, `exp`, `sin`, `cos`, `tan` are honored.',
    safe: 'calc(12px + 4px)',
  },
  color: {
    label: 'CSS modern color functions',
    severity: 'critical',
    rule: 'Never use the modern color functions (`hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `color-mix`); pre-convert to `rgb()`/`rgba()`/`color(srgb …)` (all of which are honored).',
    safe: 'rgba(255, 0, 0, 0.5)',
  },
  image: {
    label: 'CSS image functions',
    severity: 'high',
    rule: '`url(...)`, `image-set(...)`, and `cross-fade(...)` are unverified (resolving them at parse time stalls Gameface); use `url()` only with cached engine-side assets and treat `image-set`/`cross-fade` as missing. `linear-gradient()`, `radial-gradient()`, `conic-gradient()`, `repeating-linear-gradient()`, and `repeating-radial-gradient()` are all honored — see the partial-support rule for their two-position color-stop limitation.',
    safe: 'linear-gradient(red, blue)',
  },
  transform: {
    label: 'CSS transform functions',
    severity: 'high',
    rule: 'Never use the missing transform functions (`skew()` combined form, `perspective()`); use `skewX()` + `skewY()` and apply 3D effects via the engine-side camera. `translate*`, `scale*`, `rotate*`, `matrix`, `matrix3d` are honored.',
    safe: 'skewX(10deg) skewY(5deg)',
  },
  timing: {
    label: 'CSS timing functions',
    severity: 'medium',
    rule: 'Never use the `linear(...)` easing function (the multi-stop variant); use `cubic-bezier(...)` or `steps(...)` instead — both are honored.',
    safe: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  shape: {
    label: 'CSS shape functions',
    severity: 'medium',
    rule: 'Never use `rect()` or `xywh()` shape functions in `clip-path`; the engine does not parse them. Use `inset()`, `circle()`, `ellipse()`, `polygon()`, or `path()`.',
    safe: 'inset(10px)',
  },
  counter: {
    label: 'CSS counter functions',
    severity: 'low',
    rule: 'Never use `counter()` or `counters()` in `content`; the engine does not implement CSS counters. Inject the number from JS or pre-render the text.',
    safe: '"1."',
  },
  reference: {
    label: 'CSS reference functions',
    severity: 'high',
    rule: 'Never use `env()` (no environment variables) or `attr()` (only the most basic spec form is shipped in browsers and Gameface does not parse it); inline the literal value, or write it via element.style/JS. `var(--name, fallback)` is supported.',
    safe: 'var(--gf-width, 100px)',
  },
};

const funcByCategory = {};
for (const f of funcs.unsupported) {
  const cat = (f.evidence && f.evidence.category) || 'other';
  if (!funcByCategory[cat]) funcByCategory[cat] = { missing: [], unknown: [] };
  if (f.status === 'unknown') funcByCategory[cat].unknown.push(f);
  else funcByCategory[cat].missing.push(f);
}

for (const cat of Object.keys(funcByCategory).sort()) {
  const meta = funcCategories[cat] || { label: `CSS ${cat} functions`, severity: 'medium', rule: `Never use these missing CSS ${cat} functions.`, safe: '' };
  const { missing, unknown } = funcByCategory[cat];

  if (missing.length) {
    const sample = missing[0];
    const badVal = sample.evidence?.canonicalValue || `${sample.name}(...)`;
    const goodVal = meta.safe || `/* No Gameface equivalent — omit */`;
    pushRule({
      id: nextCssId(),
      surface: 'css-function',
      status: 'missing',
      severity: meta.severity,
      name: meta.label,
      summary: `${missing.length} CSS function(s) in this category are not parsed by Gameface`,
      badExample: `.foo { ${sample.evidence?.testProperty || 'width'}: ${badVal}; }`,
      badLang: 'css',
      goodExample: `.foo { ${sample.evidence?.testProperty || 'width'}: ${goodVal}; }`,
      goodLang: 'css',
      ruleSentence: meta.rule,
      why: `Scraper logged "Unable to parse declaration: …" for every member. Missing functions: ${missing.map(m => m.name + '()').join(', ')}.`,
      sourceFile: 'results/functions/unsupported.json',
      sourcePath: `$[?(@.evidence.category=="${cat}" && @.status=="missing")]`,
      bucket: 'css',
      members: missing.map(m => m.name),
    });
  }

  if (unknown.length) {
    needsReview.push(`CSS functions in category "${cat}" with status=unknown: ${unknown.map(u => u.name + '()').join(', ')} — scraper skipped them (would stall the renderer at parse time). Verify support against Gameface docs and update prompts accordingly.`);
    pushRule({
      id: nextCssId(),
      surface: 'css-function',
      status: 'unknown',
      severity: 'medium',
      name: `${meta.label} — unverified (NEEDS REVIEW)`,
      summary: `${unknown.length} CSS function(s) skipped by the scraper; verify against Gameface docs`,
      badExample: `.foo { ${unknown[0].evidence?.testProperty || 'background-image'}: ${unknown[0].evidence?.canonicalValue || unknown[0].name + '(...)'}; }`,
      badLang: 'css',
      goodExample: `// [NEEDS REVIEW: scraper skipped this function because it stalls the renderer at parse time; confirm with Gameface docs whether it is supported]`,
      goodLang: 'css',
      ruleSentence: `Treat \`${unknown.map(u => u.name + '()').join('`, `')}\` as unverified — the scraper could not safely probe them; do not emit unless an integrator confirms support against the Gameface CSS reference.`,
      why: `Scraper skipReason: "${unknown[0].evidence?.skipReason || 'function stalls the renderer at parse time'}".`,
      sourceFile: 'results/functions/unsupported.json',
      sourcePath: `$[?(@.evidence.category=="${cat}" && @.status=="unknown")]`,
      bucket: 'css',
      members: unknown.map(u => u.name),
    });
  }
}

// ----- CSS functions: partial (canonical form honored, a known secondary
// form is rejected — e.g. gradients' two-position color-stop shorthand). -----
function downgradeSeverity(sev) {
  if (sev === 'critical') return 'high';
  if (sev === 'high') return 'medium';
  return 'low';
}

const funcPartialByCategory = {};
for (const f of funcs.partial) {
  const cat = (f.evidence && f.evidence.category) || 'other';
  if (!funcPartialByCategory[cat]) funcPartialByCategory[cat] = [];
  funcPartialByCategory[cat].push(f);
}

for (const cat of Object.keys(funcPartialByCategory).sort()) {
  const meta = funcCategories[cat] || { label: `CSS ${cat} functions` };
  const members = funcPartialByCategory[cat];
  const sample = members[0];
  const ev = sample.evidence || {};
  const note = ev.note || `${sample.name}() is honored in its canonical form but rejects at least one known variant.`;
  const unverifiedMembers = members.filter(m => m.evidence && m.evidence.verified === false).map(m => m.name);
  const unverifiedNote = unverifiedMembers.length
    ? ` Not independently verified in-engine for: ${unverifiedMembers.join(', ')} — assumed by analogy with the confirmed members.`
    : '';

  pushRule({
    id: nextCssId(),
    surface: 'css-function',
    status: 'partial',
    severity: downgradeSeverity(meta.severity || 'medium'),
    name: `${meta.label} — partial support`,
    summary: `${members.length} CSS function(s) in this category work in their canonical form but reject a known variant`,
    badExample: ev.mixedUnitsValue
      ? `.foo { ${ev.testProperty || 'background-image'}: ${ev.mixedUnitsValue}; }`
      : `.foo { ${ev.testProperty || 'background-image'}: /* known-rejected variant */; }`,
    badLang: 'css',
    goodExample: `.foo { ${ev.testProperty || 'background-image'}: ${ev.canonicalValue || sample.name + '(...)'}; }`,
    goodLang: 'css',
    ruleSentence: `${note}${unverifiedNote}`,
    why: `Scraper logged "${ev.logWarning || 'Unable to parse declaration'}" for the secondary form while the canonical form (\`${ev.canonicalValue}\`) rendered cleanly. Affected functions: ${members.map(m => m.name + '()').join(', ')}.`,
    sourceFile: 'results/functions/partial.json',
    sourcePath: `$[?(@.evidence.category=="${cat}" && @.status=="partial")]`,
    bucket: 'css',
    members: members.map(m => m.name),
  });
}

// ----- HTML rules -----
let htmlId = 0;
const nextHtmlId = () => `HTML-${String(++htmlId).padStart(3, '0')}`;

// Partial html elements
const htmlPartialSorted = [...html.partial].sort((a, b) => a.name.localeCompare(b.name));
for (const e of htmlPartialSorted) {
  if (e.surface === 'input-type') continue; // handled below
  const checks = e.evidence?.checks || {};
  const missingChecks = Object.entries(checks).filter(([_, v]) => v === false).map(([k]) => k);
  pushRule({
    id: nextHtmlId(),
    surface: 'html-tag',
    status: 'partial-values',
    severity: htmlSeverity(e.name, 'partial'),
    name: e.name,
    summary: `<${e.name}> exists but ${missingChecks.length ? `missing: ${missingChecks.join(', ')}` : 'has incomplete API'}`,
    badExample: htmlPartialBadExample(e.name, missingChecks),
    badLang: 'html',
    goodExample: htmlPartialGoodExample(e.name, missingChecks),
    goodLang: 'html',
    ruleSentence: `Never depend on the missing parts of \`<${e.name}>\` (${missingChecks.join(', ') || 'see evidence'}); the constructor exists but those APIs return falsy/no-op.`,
    why: `scraper checks set false: ${missingChecks.join(', ') || '(see evidence)'}.`,
    sourceFile: 'results/html/partial.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'html',
  });
}

function htmlPartialBadExample(name, missing) {
  if (name === 'canvas') return `<canvas id="c"></canvas>\n<script>\n  const c = document.getElementById('c');\n  const data = c.toDataURL(); // returns no-op / undefined\n</script>`;
  if (name === 'img') return `<img id="i" src="x.png">\n<script>\n  const i = document.getElementById('i');\n  if (i.complete && i.naturalWidth > 0) { /* never true */ }\n  console.log(i.alt); // undefined\n</script>`;
  if (name === 'input') return `<input id="x" required>\n<script>\n  if (!document.getElementById('x').checkValidity()) { /* not callable */ }\n</script>`;
  if (name === 'link') return `<link rel="stylesheet" href="a.css">\n<script>\n  document.querySelector('link').sheet.cssRules; // sheet is null\n</script>`;
  return `<${name}></${name}>`;
}
function htmlPartialGoodExample(name, missing) {
  if (name === 'canvas') return `<canvas id="c"></canvas>\n<script>\n  const c = document.getElementById('c');\n  const ctx = c.getContext('2d'); // 2D context only; toDataURL is missing.\n</script>`;
  if (name === 'img') return `<img id="i" src="x.png">\n<script>\n  // No alt / complete / naturalWidth — measure size with getBoundingClientRect on a parent.\n</script>`;
  if (name === 'input') return `<input id="x">\n<script>\n  // Validate manually: const v = document.getElementById('x').value; if (!v) showError();\n</script>`;
  if (name === 'link') return `<link rel="stylesheet" href="a.css"> <!-- href/rel work; .sheet is null. Inspect rules with a fetched copy if needed. -->`;
  return `<${name}></${name}>`;
}

// silently-coerced input types
const htmlSilentSorted = [...html.partial.filter(e => e.surface === 'input-type')].sort((a, b) => a.name.localeCompare(b.name));
for (const e of htmlSilentSorted) {
  const m = e.name.match(/input\[type="([^"]+)"\]/);
  const t = m[1];
  pushRule({
    id: nextHtmlId(),
    surface: 'html-input-type',
    status: 'silently-coerced',
    severity: 'critical',
    name: e.name,
    summary: `<input type="${t}"> is silently coerced to type="text"`,
    badExample: `<input type="${t}" name="x">`,
    badLang: 'html',
    goodExample: `<input type="text" name="x"> <!-- + JS-side validation / custom widget for ${t} semantics -->`,
    goodLang: 'html',
    ruleSentence: `Never use \`<input type="${t}">\`; Gameface coerces the type to \`text\`. Use \`type="text"\` plus a custom widget or manual validation.`,
    why: `scraper roundTripType: "text"; the engine reset \`input.type\` to \`text\` after assignment.`,
    sourceFile: 'results/html/partial.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'html',
  });
}

// parsed-no-impl + unknown
const htmlUnsupportedSorted = [...html.unsupported].sort((a, b) => a.status.localeCompare(b.status) || a.name.localeCompare(b.name));
for (const e of htmlUnsupportedSorted) {
  const isUnknown = e.status === 'unknown';
  pushRule({
    id: nextHtmlId(),
    surface: 'html-tag',
    status: isUnknown ? 'unknown' : 'parsed-no-impl',
    severity: htmlSeverity(e.name, e.status),
    name: e.name,
    summary: isUnknown
      ? `<${e.name}> resolves to HTMLUnknownElement`
      : `<${e.name}> parses to a generic HTMLElement with no specialized behavior`,
    badExample: htmlNoImplBadExample(e.name),
    badLang: 'html',
    goodExample: htmlNoImplGoodExample(e.name),
    goodLang: 'html',
    ruleSentence: htmlNoImplRule(e.name, isUnknown),
    why: isUnknown
      ? `scraper constructorName: "HTMLUnknownElement" — the tag is not recognized by the engine.`
      : `scraper constructorName: "HTMLElement"; ${e.evidence.note || 'no specialised constructor'}.`,
    sourceFile: 'results/html/unsupported.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'html',
  });
}
function htmlNoImplBadExample(n) {
  if (n === 'a') return `<a href="page.html">click</a>`;
  if (n === 'select') return `<select>\n  <option>One</option>\n  <option>Two</option>\n</select>`;
  if (n === 'option') return `<option value="1">One</option>`;
  if (n === 'form') return `<form action="/submit"><input name="q"><button>Go</button></form>`;
  if (n === 'iframe') return `<iframe src="other.html"></iframe>`;
  if (n === 'audio') return `<audio src="snd.ogg" controls></audio>`;
  if (n === 'label') return `<label for="x">Name</label><input id="x">`;
  if (n === 'progress') return `<progress value="0.5"></progress>`;
  if (n === 'meter') return `<meter value="0.7"></meter>`;
  if (n === 'details') return `<details><summary>More</summary>...</details>`;
  if (n === 'dialog') return `<dialog open>Hello</dialog>`;
  if (n === 'datalist') return `<datalist id="d"><option>A</option></datalist>`;
  if (n === 'fieldset') return `<fieldset><legend>X</legend><input></fieldset>`;
  if (n === 'table') return `<table><tr><td>1</td></tr></table>`;
  if (n === 'ul') return `<ul><li>a</li></ul>`;
  if (n === 'ol') return `<ol><li>a</li></ol>`;
  if (n === 'h1') return `<h1>Title</h1>`;
  if (['h1','h2','h3','h4','h5','h6'].includes(n)) return `<${n}>Title</${n}>`;
  if (n === 'br') return `Line A<br>Line B`;
  if (n === 'hr') return `<hr>`;
  if (n === 'b' || n === 'strong') return `<${n}>bold</${n}>`;
  if (n === 'i' || n === 'em') return `<${n}>emphasis</${n}>`;
  if (n === 'picture') return `<picture><source srcset="img@2x.png 2x"><img src="img.png"></picture>`;
  return `<${n}></${n}>`;
}
function htmlNoImplGoodExample(n) {
  if (n === 'a') return `<div role="link" tabindex="0" data-href="page.html" class="link"></div>`;
  if (n === 'select') return `<!-- Build a custom dropdown with <div> elements; toggle visibility from JS. -->\n<div class="dropdown">\n  <div class="dropdown__trigger">Choose…</div>\n  <div class="dropdown__menu">\n    <div class="dropdown__item">One</div>\n    <div class="dropdown__item">Two</div>\n  </div>\n</div>`;
  if (n === 'option' || n === 'optgroup') return `<div class="dropdown__item" data-value="1">One</div>`;
  if (n === 'form') return `<!-- No form lifecycle; collect values from inputs and submit via XMLHttpRequest stub or game-engine hook. -->`;
  if (n === 'iframe') return `<!-- No iframe support. Embed via separate Gameface page or engine-side composition. -->`;
  if (n === 'audio') return `<!-- Use the engine's audio APIs from the host runtime; no <audio> playback. -->`;
  if (n === 'label') return `<div class="row">\n  <span class="row__label">Name</span>\n  <input class="row__input" id="x">\n</div>`;
  if (n === 'progress') return `<div class="progress"><div class="progress__bar" style="width: 50%;"></div></div>`;
  if (n === 'meter') return `<div class="meter"><div class="meter__bar" style="width: 70%;"></div></div>`;
  if (n === 'details') return `<div class="disclosure">\n  <div class="disclosure__head" data-toggle="open">More</div>\n  <div class="disclosure__body">…</div>\n</div>`;
  if (n === 'dialog') return `<!-- Build a custom modal: a <div class="modal"> overlay toggled with .modal--open. No native showModal(). -->`;
  if (n === 'datalist') return `<!-- Implement an autocomplete with <div> menu rendered from JS. -->`;
  if (n === 'fieldset') return `<div role="group">\n  <div class="legend">X</div>\n  <input>\n</div>`;
  if (n === 'table') return `<div class="table">\n  <div class="table__row"><div class="table__cell">1</div></div>\n</div>`;
  if (n === 'ul' || n === 'ol') return `<div class="list">\n  <div class="list__item"><span class="list__bullet">•</span><span>a</span></div>\n</div>`;
  if (['h1','h2','h3','h4','h5','h6'].includes(n)) return `<div class="heading heading--${n}">Title</div>`;
  if (n === 'br') return `<div>Line A</div><div>Line B</div>`;
  if (n === 'hr') return `<div class="rule"></div>`;
  if (n === 'b' || n === 'strong') return `<span style="font-weight: bold;">bold</span>`;
  if (n === 'i' || n === 'em') return `<span style="font-style: italic;">emphasis</span>`;
  if (n === 'picture') return `<img src="img.png"> <!-- No <picture> resolution; pick the right asset in JS. -->`;
  return `<div></div> <!-- replace with <div> or <span>; preserve semantic styling via class -->`;
}
function htmlNoImplRule(n, isUnknown) {
  if (isUnknown) return `Never use \`<${n}>\`; the engine treats it as HTMLUnknownElement and gives it no behavior.`;
  if (['select', 'option', 'optgroup', 'datalist'].includes(n)) return `Never use \`<${n}>\`; it parses but has no widget behavior. Build a custom dropdown / autocomplete with \`<div>\`/\`<span>\` and JS state.`;
  if (n === 'form') return `Never use \`<form>\`; submit / reset / validation are not implemented. Read input values from JS and post via the engine bridge.`;
  if (n === 'a') return `Never use \`<a href>\`; click / navigation is not implemented. Use \`<div role="link">\` plus a JS click handler that calls into the engine.`;
  if (n === 'iframe') return `Never use \`<iframe>\`; framing is not implemented. Compose multiple Gameface views host-side.`;
  if (n === 'audio') return `Never use \`<audio>\`; element exists but has no playback. Use the host engine's audio APIs.`;
  if (n === 'label') return `Never use \`<label>\` for click-forwarding to inputs; the for/click association is not implemented. Wire focus from JS.`;
  if (n === 'progress' || n === 'meter') return `Never use \`<${n}>\`; build a custom bar with \`<div>\` and width-animation.`;
  if (n === 'details') return `Never use \`<details>\`/\`<summary>\` toggling; emulate disclosure with class toggling in JS.`;
  if (n === 'fieldset' || n === 'legend') return `Never use \`<${n}>\` for grouping behavior; use \`<div role="group">\`.`;
  if (['table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'caption', 'col', 'colgroup'].includes(n)) return `Never use \`<${n}>\` for layout; Gameface has no table layout. Use \`display: flex\` containers.`;
  if (['ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu'].includes(n)) return `Never rely on \`<${n}>\` list semantics or markers; render bullets manually with styled \`<div>\`s.`;
  if (['h1','h2','h3','h4','h5','h6'].includes(n)) return `Never use \`<${n}>\` expecting browser default styling; use \`<div>\` with an explicit heading class.`;
  if (n === 'br') return `Never use \`<br>\`; insert breaks with separate block-level \`<div>\`s or \`white-space: pre-wrap\`.`;
  if (n === 'hr') return `Never use \`<hr>\`; render a divider with a styled \`<div>\`.`;
  if (n === 'b' || n === 'strong' || n === 'i' || n === 'em' || n === 'u' || n === 's' || n === 'mark' || n === 'small' || n === 'sub' || n === 'sup' || n === 'code' || n === 'kbd' || n === 'samp' || n === 'var' || n === 'cite' || n === 'q' || n === 'dfn' || n === 'abbr' || n === 'time' || n === 'data') return `Never rely on \`<${n}>\` styling defaults; wrap with \`<span>\` and apply explicit CSS.`;
  if (n === 'picture' || n === 'source') return `Never use \`<picture>\` / responsive \`<source>\` resolution; pick assets in JS and set \`<img src>\` directly.`;
  if (n === 'embed' || n === 'object') return `Never use \`<${n}>\`; no plugin / object embedding is implemented.`;
  if (n === 'noscript' || n === 'noembed' || n === 'noframes') return `Never use \`<${n}>\`; the engine has no fallback semantics.`;
  return `Never use \`<${n}>\`; it parses but has no specialized behavior — Gameface returns a generic \`HTMLElement\`. Replace with \`<div>\` or \`<span>\` and apply styling.`;
}

// ----- JS rules -----
let jsId = 0;
const nextJsId = () => `JS-${String(++jsId).padStart(3, '0')}`;

// JS partial → status: stub (matches user vocabulary mapping). Build rule text from
// evidence.missing (the new scraper shape), not from old `stubs`/`present` fields.
const jsStubLike = [...js.partial].sort((a, b) => a.name.localeCompare(b.name));
for (const e of jsStubLike) {
  const ev = e.evidence || {};
  const missing = ev.missing || [];
  pushRule({
    id: nextJsId(),
    surface: 'js-stub',
    status: 'stub',
    severity: jsPartialSeverity(e.name, missing),
    name: e.name,
    summary: jsPartialSummary(e.name, missing),
    badExample: jsPartialBadExample(e.name, missing),
    badLang: 'js',
    goodExample: jsPartialGoodExample(e.name, missing),
    goodLang: 'js',
    ruleSentence: jsPartialRule(e.name, missing),
    why: `scraper missing: ${JSON.stringify(missing.slice(0, 12))}${missing.length > 12 ? ` …+${missing.length - 12} more` : ''}.`,
    sourceFile: 'results/js/partial.json',
    sourcePath: `$[?(@.name=="${e.name}")]`,
    bucket: 'js',
  });
}

function jsPartialSeverity(name, missing) {
  const ctorOnly = missing.length === 1 && missing[0] === name;
  const constructorFamilies = ['MutationObserver', 'ResizeObserver', 'WebSocket', 'XMLHttpRequest', 'EventTarget', 'URL', 'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'FocusEvent', 'TouchEvent', 'UIEvent', 'AnimationEvent', 'TransitionEvent', 'PopStateEvent', 'ProgressEvent', 'PromiseRejectionEvent', 'MessageEvent', 'ErrorEvent', 'GamepadEvent', 'CSSStyleSheet', 'DocumentFragment', 'Comment', 'Text', 'DOMMatrix', 'DOMRect', 'DOMRectReadOnly', 'DOMStringMap', 'Blob'];
  if (ctorOnly && constructorFamilies.includes(name)) return 'critical';
  if (['CSSStyleDeclaration', 'CSSStyleSheet', 'Document', 'Element', 'Window', 'Navigator', 'CanvasRenderingContext2D', 'Animation', 'HTMLInputElement', 'HTMLImageElement', 'HTMLLinkElement', 'HTMLCanvasElement', 'HTMLMediaElement', 'HTMLVideoElement', 'HTMLIFrameElement', 'HTMLTextAreaElement', 'CSS', 'Console', 'Performance', 'CustomElementRegistry', 'MutationObserver', 'ResizeObserver', 'XMLHttpRequest', 'WebSocket', 'URL', 'EventTarget', 'Selection', 'History', 'ShadowRoot'].includes(name)) return 'critical';
  if (/^(HTML|SVG|CSS)/.test(name)) return 'high';
  if (/Event$/.test(name)) return 'high';
  return 'high';
}

function jsPartialSummary(name, missing) {
  const ctorMissing = missing.includes(name);
  const rest = missing.filter(m => m !== name);
  if (ctorMissing && rest.length === 0) return `${name}: constructor missing — API not constructible in Gameface`;
  if (ctorMissing) return `${name}: constructor missing + ${rest.length} other member(s) missing`;
  return `${name}: ${rest.length} member(s) missing`;
}

function jsPartialBadExample(name, missing) {
  const ctorMissing = missing.includes(name);
  if (ctorMissing) return `const x = new ${name}(/* ... */); // TypeError: ${name} is not a constructor`;
  const sample = missing[0] || 'member';
  return `instance.${sample}; // ${name}.${sample} is undefined / not implemented in Gameface`;
}

function jsPartialGoodExample(name, missing) {
  if (name === 'Animation' || name === 'CSSAnimation' || name === 'AnimationEvent') return `// Drive animation through CSS @keyframes + the animation-* longhands (all supported):\nel.style.animationName = 'fadeIn';\nel.style.animationDuration = '300ms';`;
  if (name === 'CanvasRenderingContext2D' || name === 'CanvasPattern') return `// Canvas drawing is not functional. Render via DOM elements or the host engine.`;
  if (name === 'CustomElementRegistry') return `// customElements.define() exists but get/getName/upgrade/whenDefined are missing — no upgrade lifecycle. Prefer plain factory functions that return DOM trees.`;
  if (name === 'XMLHttpRequest' || name === 'WebSocket') return `// Communicate with the host via the Gameface bridge (engine.call, coh-* APIs). No HTTP/WS from page JS.`;
  if (name === 'MutationObserver' || name === 'ResizeObserver') return `// No reactive observation — the constructor is missing. Recompute on requestAnimationFrame or apply changes synchronously when you cause them.`;
  if (name === 'URL') return `// new URL() is missing. Concatenate path strings manually:\nconst path = base + '/' + segment + '?' + new URLSearchParams /* also missing */;`;
  if (name === 'Performance') return `// Only performance.now() is supported. Don't call mark/measure/getEntries*/timing/navigation.`;
  if (name === 'Console') return `// Use console.log/info/warn/error/debug/assert/time/timeEnd — they are present. Avoid dir/group*/table/count*/dirxml/timeLog/timeStamp/trace.`;
  if (name === 'Document') return `// Use the documented Document API only: getElementById, querySelector(All), createElement(NS), createTextNode/Comment, body/head/documentElement, addEventListener/removeEventListener, defaultView, readyState.`;
  if (name === 'Element') return `// Use the documented Element subset: querySelector(All), getBoundingClientRect, getAttribute/setAttribute/removeAttribute, classList (DOMTokenList is fully supported), className, id, addEventListener, dispatchEvent, children, parent/firstChild/lastChild, scrollTop/scrollLeft, getElementsByClassName/TagName.`;
  if (name === 'Navigator') return `// Don't use navigator.clipboard/credentials/mediaDevices/geolocation/permissions/serviceWorker/storage/vibrate/share/userAgentData/locks/connection — missing. Engine bridge for host integrations.`;
  if (name === 'History') return `// history.scrollRestoration is missing. pushState/replaceState/back/forward/length/state are present in the partial surface but do not perform navigation; treat as no-ops.`;
  if (name === 'CSSStyleDeclaration') return `// Use el.style.<longhand> for the supported longhands only (see results/css/{supported,partial}.json). Avoid setProperty for custom CSS vars (var() is supported, but the CSSOM setter has 350 missing members).`;
  if (name === 'CSSStyleSheet') return `// Don't construct CSSStyleSheet (missing). Toggle classes or set inline style to mutate visuals.`;
  if (name === 'CSS') return `// CSS.escape works in browsers but unit helpers (CSS.px/em/vw/%, etc.) are missing here. Build raw strings: el.style.width = (n + 'px').`;
  if (name === 'EventTarget' || /Event$/.test(name)) return `// Never construct ${name}; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.`;
  if (name === 'Selection') return `// No text-selection workflow. Avoid features that depend on Selection/Range.`;
  if (name === 'ShadowRoot') return `// element.attachShadow may exist on Element but adoptedStyleSheets/getAnimations/getSelection/setHTMLUnsafe are missing. Avoid Shadow DOM-dependent designs.`;
  if (name === 'HTMLInputElement') return `// Use input.value, input.type ("text"/"password"/"button" only), focus(), blur(), select(), setRangeText, setSelectionRange, placeholder (writeable). Avoid checked/files/validity/required/min/max/pattern/list/labels.`;
  if (name === 'HTMLImageElement') return `// Use img.src only. Avoid alt/complete/naturalWidth/Height/currentSrc/crossOrigin/decoding/fetchPriority/loading/referrerPolicy/sizes/srcset.`;
  if (name === 'HTMLLinkElement') return `// Use link.href, link.rel. Avoid sheet/relList/media/crossOrigin/integrity/fetchPriority/hreflang/imageSizes/imageSrcset/referrerPolicy/sizes/disabled/as.`;
  if (name === 'HTMLCanvasElement') return `// Use canvas.width, canvas.height, canvas.getContext('2d'). Avoid toDataURL/toBlob/captureStream/transferControlToOffscreen.`;
  if (name === 'HTMLMediaElement' || name === 'HTMLVideoElement') return `// No real media playback. Bridge to the host engine for audio/video.`;
  if (name === 'HTMLIFrameElement') return `// <iframe> is parsed-no-impl. Don't depend on contentDocument/contentWindow/src/srcdoc/allow/sandbox/loading.`;
  if (name === 'HTMLTextAreaElement') return `// Use textarea.value, rows, cols, focus(), blur(), select(), setRangeText, setSelectionRange. Avoid form/labels/validity/required/disabled/readOnly/autocomplete.`;
  if (name === 'HTMLElement') return `// Avoid hidden/inert/innerText/outerText/title/lang/dir/spellcheck/tabIndex/draggable/accessKey/translate/contentEditable/enterKeyHint/inputMode/popover* — missing. Use plain DOM (className, getAttribute, addEventListener).`;
  if (name === 'Window') return `// Avoid alert/confirm/prompt/open/postMessage/print/matchMedia/requestIdleCallback/structuredClone — missing. setTimeout/clearTimeout/setInterval/clearInterval/queueMicrotask are supported.`;
  if (name === 'Attr' || name === 'NamedNodeMap') return `// Read/write attributes via element.getAttribute/setAttribute/removeAttribute. Don't poke ${name} directly.`;
  if (name === 'Comment' || name === 'Text') return `// document.createTextNode(...) / createComment(...) work. Avoid \`new ${name}()\` — constructor missing.`;
  if (name === 'Blob') return `// Don't construct Blob or call text/arrayBuffer/stream/bytes; bridge binary data through the engine.`;
  if (/^(DOMMatrix|DOMRect|DOMRectReadOnly|DOMStringMap)$/.test(name)) return `// Don't construct ${name}; read existing instances returned by DOM APIs (getBoundingClientRect, etc.).`;
  if (/^(CSSKeywordValue|CSSMatrixComponent|CSSNumericValue|CSSRotate|CSSScale|CSSSkewX|CSSSkewY|CSSTransformValue|CSSTranslate|CSSUnitValue|CSSStyleValue|StylePropertyMap|StylePropertyMapReadOnly)$/.test(name)) return `// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').`;
  if (/^SVG/.test(name)) return `// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, ${name}-specific methods) is partial.`;
  return `// ${name} is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.`;
}

function jsPartialRule(name, missing) {
  const ctorMissing = missing.includes(name);
  const rest = missing.filter(m => m !== name);
  const formatList = (arr, max = 10) => {
    if (!arr.length) return '';
    if (arr.length <= max) return arr.map(m => '`' + m + '`').join(', ');
    return arr.slice(0, max).map(m => '`' + m + '`').join(', ') + `, …+${arr.length - max} more`;
  };
  if (ctorMissing && rest.length === 0) {
    return `Never \`new ${name}(...)\`; the constructor is missing in Gameface, so this API cannot be instantiated.`;
  }
  if (ctorMissing && rest.length > 0) {
    return `Never \`new ${name}(...)\` (constructor missing) and do not read/write ${formatList(rest)} on existing \`${name}\` instances; all missing in Gameface.`;
  }
  return `Never read/write ${formatList(rest)} on \`${name}\` instances; missing in Gameface.`;
}

// (jsStub* helpers below are no longer used — superseded by jsPartial* above.)
function jsStubSummary(name, stubs, missing, present) {
  if (stubs.length && missing.length) return `${name}: ${stubs.length} methods are stubs; ${missing.length} members missing`;
  if (stubs.length) return `${name}: ${stubs.length} methods are stubs (no-ops)`;
  if (missing.length) return `${name}: ${missing.length} members missing`;
  return `${name}: partial implementation`;
}

function jsStubBadExample(name, stubs, missing) {
  if (name === 'Animation') return `const a = el.animate([{ opacity: 0 }, { opacity: 1 }], 300);\na.play(); a.pause(); a.finish(); // all no-op stubs`;
  if (name === 'CanvasRenderingContext2D') return `const ctx = canvas.getContext('2d');\nctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); // all no-op`;
  if (name === 'CustomElementRegistry') return `customElements.define('my-thing', class extends HTMLElement {}); // stub: registration is recorded but no upgrade lifecycle`;
  if (name === 'XMLHttpRequest') return `const x = new XMLHttpRequest();\nx.open('GET','/api'); x.send(); // open/send are stubs`;
  if (name === 'WebSocket') return `const s = new WebSocket('ws://x');\ns.send('hi'); // send is a no-op stub`;
  if (name === 'CSSStyleSheet') return `const s = new CSSStyleSheet(); // constructor missing\ndoc.styleSheets[0].insertRule('.x{}', 0); // insertRule is a stub`;
  if (name === 'CSSStyleDeclaration') return `el.style.borderInline = '1px solid red'; // missing\nel.style.setProperty('--x', '1'); // stub`;
  if (name === 'Document') return `document.createElement('div'); // stub: returns an element but lifecycle hooks are no-ops`;
  if (name === 'Element') return `el.attachShadow({ mode: 'open' }); // stub\nel.scrollIntoView(); // missing`;
  if (name === 'MutationObserver') return `const o = new MutationObserver(cb);\no.observe(el, { childList: true }); // stub: callback never fires`;
  if (name === 'ResizeObserver') return `const o = new ResizeObserver(cb);\no.observe(el); // stub: cb never fires`;
  if (name === 'Selection' || name === 'Storage' || name === 'History') return `${name === 'Storage' ? 'localStorage.setItem("k","v");' : name === 'History' ? 'history.pushState({}, "", "/x");' : 'getSelection().toString();'} // method exists but is a no-op`;
  if (name === 'Performance') return `performance.mark('x'); performance.measure('y'); // missing`;
  if (name === 'Console') return `console.dir(obj); console.group(); // missing`;
  if (name === 'Event') return `const e = new Event('x'); // constructor missing\nev.stopPropagation(); // stub`;
  if (name === 'CustomEvent') return `const e = new CustomEvent('x', { detail: {} }); // constructor missing`;
  if (name === 'KeyboardEvent') return `const e = new KeyboardEvent('keydown'); // constructor missing\nev.isComposing; // missing`;
  if (name === 'Node') return `node.appendChild(child); node.cloneNode(); // both stubs`;
  if (name === 'EventTarget') return `target.addEventListener('x', cb); target.dispatchEvent(ev); // stubs`;
  if (name === 'NodeList') return `nodeList.forEach(fn); // stub iterator`;
  if (name === 'DOMTokenList') return `el.classList.add('x'); el.classList.toggle('y'); // both stubs`;
  if (name === 'URL') return `new URL('https://x'); // constructor missing`;
  if (name === 'Navigator') return `navigator.clipboard.writeText('hi'); // missing\nnavigator.getGamepads(); // stub`;
  return `// ${stubs.length ? `${stubs[0]} is a stub` : `${missing[0] || 'API'} is missing`} on ${name}`;
}

function jsStubGoodExample(name, stubs, missing, present) {
  if (name === 'Animation' || name === 'CSSAnimation') return `// Use CSS @keyframes + animation longhands instead. Listen with element.style.animationName / events:\nel.style.animation = 'fade 300ms ease-in-out forwards';`;
  if (name === 'CanvasRenderingContext2D') return `// Canvas is a no-op for drawing. Render in the host engine or via DOM elements.`;
  if (name === 'CustomElementRegistry') return `// Limit to component frameworks that don't depend on connectedCallback / lifecycle. Or build factory functions that return DOM trees.`;
  if (name === 'XMLHttpRequest' || name === 'WebSocket') return `// Communicate with the host engine via the Gameface bridge (engine.call, coh-* APIs). Don't make HTTP/WS calls from page JS.`;
  if (name === 'CSSStyleSheet') return `// Mutate styles by toggling class names or by writing inline style on the element.\nel.classList.add('active');`;
  if (name === 'CSSStyleDeclaration') return `// Set only documented physical-axis properties; don't expect setProperty to round-trip through getPropertyValue.\nel.style.color = 'red';`;
  if (name === 'Document') return `// Use the supported DOM ops only: getElementById, querySelector, querySelectorAll, createElement, addEventListener.`;
  if (name === 'Element') return `// Restrict to documented APIs (classList add/remove via the supported subset, getBoundingClientRect, querySelector).\nel.querySelector('.x').getBoundingClientRect();`;
  if (name === 'MutationObserver' || name === 'ResizeObserver') return `// No reactive observation. Poll on requestAnimationFrame or apply changes immediately when you cause them.`;
  if (name === 'Storage') return `// No localStorage / sessionStorage. Persist via the engine bridge.`;
  if (name === 'History') return `// No history navigation. Use in-page state and class toggling.`;
  if (name === 'Selection') return `// No text selection API. Avoid features that depend on selection.`;
  if (name === 'Performance') return `// Only performance.now() is supported. Don't call mark/measure/getEntries.`;
  if (name === 'Console') return `// Only console.log/info/debug/warn/error/assert/time/timeEnd are stubbed. Don't call .group/.dir/.table.`;
  if (name === 'Event' || name === 'CustomEvent' || name === 'KeyboardEvent' || name === 'MouseEvent' || name === 'UIEvent') return `// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.`;
  if (name === 'Node') return `// Use parent.appendChild(child) only when both nodes were created via the supported document.createElement path.`;
  if (name === 'DOMTokenList') return `// Use el.className = '...' assignment for guaranteed effect; classList methods exist but are stubs.\nel.className = 'panel panel--active';`;
  if (name === 'URL') return `// Don't construct URL. Use string operations.\nconst path = base + '/' + segment;`;
  if (name === 'Navigator') return `// No clipboard / credentials / mediaDevices / geolocation. getGamepads is a stub. Use the engine bridge.`;
  if (name === 'NodeList') return `// Iterate manually with a for-loop:\nfor (let i = 0; i < list.length; i++) { handle(list[i]); }`;
  return `// Avoid this API on Gameface; use the engine bridge or the supported subset only.`;
}

function jsStubRule(name, stubs, missing) {
  if (name === 'Animation' || name === 'CSSAnimation') return `Never call \`element.animate()\` or \`Animation\` methods (\`play\`, \`pause\`, \`finish\`, \`reverse\`, \`cancel\`); they are no-op stubs. Drive animation through CSS \`@keyframes\` only.`;
  if (name === 'CanvasRenderingContext2D') return `Never call any \`CanvasRenderingContext2D\` drawing method (\`arc\`, \`fill\`, \`stroke\`, \`drawImage\`, \`fillText\`, etc.); all are no-op stubs. Render via DOM or the host engine.`;
  if (name === 'CustomElementRegistry') return `Never rely on \`customElements.define\` for lifecycle (connected/disconnected/attributeChanged); only \`define\` exists, and it does not run the upgrade machinery. \`get\`, \`whenDefined\`, \`upgrade\` are missing.`;
  if (name === 'CSSStyleSheet') return `Never use \`new CSSStyleSheet()\` (constructor missing); never call \`insertRule\`/\`deleteRule\` (stubs). Mutate styles via class toggling or inline \`style\`.`;
  if (name === 'CSSStyleDeclaration') return `Never read/write the long list of missing CSS DOM properties on \`element.style\`; \`setProperty\`/\`getPropertyValue\`/\`removeProperty\` are stubs and \`-webkit-*\`/logical-axis properties are missing entirely.`;
  if (name === 'XMLHttpRequest') return `Never call \`XMLHttpRequest\` methods (\`open\`, \`send\`, \`abort\`, \`setRequestHeader\` …); they are stubs. Use the Gameface engine bridge.`;
  if (name === 'WebSocket') return `Never call \`WebSocket\` (\`new WebSocket\` constructor missing; \`close\`/\`send\` are stubs). Communicate via the engine bridge.`;
  if (name === 'MutationObserver') return `Never use \`MutationObserver\`; \`observe\`/\`disconnect\`/\`takeRecords\` are no-op stubs and the callback never fires.`;
  if (name === 'ResizeObserver') return `Never use \`ResizeObserver\`; \`observe\`/\`unobserve\`/\`disconnect\` are no-op stubs and the callback never fires.`;
  if (name === 'Storage') return `Never use \`localStorage\`/\`sessionStorage\` for persistence; \`setItem\`/\`getItem\`/\`removeItem\`/\`clear\`/\`key\` are stubs.`;
  if (name === 'History') return `Never use \`history.pushState\`/\`replaceState\`/\`back\`/\`forward\`/\`go\`; all are stubs and there is no real navigation.`;
  if (name === 'Selection') return `Never depend on \`getSelection()\` for ranges; methods (\`removeAllRanges\`, \`setBaseAndExtent\`, \`empty\`, \`toString\`) are stubs and most range APIs are missing.`;
  if (name === 'Performance') return `Never call \`performance.mark\`/\`measure\`/\`getEntries\`/\`getEntriesByName\`/\`getEntriesByType\`/\`clearMarks\`/\`clearMeasures\`/\`navigation\`/\`timing\`; only \`performance.now()\` is supported.`;
  if (name === 'Console') return `Never call \`console.dir\`, \`console.group\`/\`groupEnd\`/\`groupCollapsed\`, \`console.table\`, \`console.count\`/\`countReset\`, \`console.dirxml\`, \`console.timeLog\`/\`timeStamp\`, or \`console.trace\`; only \`log\`/\`info\`/\`debug\`/\`warn\`/\`error\`/\`assert\`/\`time\`/\`timeEnd\` are present.`;
  if (name === 'Event' || name === 'CustomEvent' || name === 'KeyboardEvent' || name === 'MouseEvent' || name === 'UIEvent') return `Never construct \`new ${name}(...)\`; the constructor is missing. \`preventDefault\`/\`stopPropagation\` exist as no-op stubs on incoming events.`;
  if (name === 'Document') return `Never assume a full \`Document\` API; methods like \`createElement\`/\`querySelector\`/\`getElementById\` exist as stubs that work for basic cases, but \`adoptNode\`, \`createRange\`, \`createTreeWalker\`, \`evaluate\`, \`getAnimations\`, \`exitFullscreen\`, \`startViewTransition\`, \`fonts\`, \`adoptedStyleSheets\`, etc. are missing.`;
  if (name === 'Element') return `Never call \`element.attachShadow\`, \`scrollIntoView\`, \`scroll\`/\`scrollTo\`/\`scrollBy\`, \`requestFullscreen\`, \`requestPointerLock\`, \`getHTML\`/\`setHTMLUnsafe\`, \`computedStyleMap\`, \`animate\`, \`toggleAttribute\`, or any of the \`aria*Element\`/role properties; they are missing or stubbed.`;
  if (name === 'Node') return `Never assume \`Node\` traversal/mutation methods compose across all node types; \`appendChild\`, \`cloneNode\`, \`compareDocumentPosition\`, \`contains\`, \`insertBefore\`, \`removeChild\`, \`replaceChild\` are all stubs (basic usage works, edge cases may not).`;
  if (name === 'EventTarget') return `Never \`new EventTarget()\`; constructor is missing. \`addEventListener\`/\`removeEventListener\`/\`dispatchEvent\` exist as stubs only on supported host objects.`;
  if (name === 'NodeList') return `Never call \`NodeList.forEach\`/\`entries\`/\`keys\`/\`values\` — they are stubs; iterate with a numeric \`for\` loop using \`length\`.`;
  if (name === 'DOMTokenList') return `Never call \`classList\` methods (\`add\`, \`remove\`, \`toggle\`, \`replace\`, \`contains\`, \`supports\`, \`item\`); they are stubs. Assign \`element.className\` directly.`;
  if (name === 'URL') return `Never \`new URL(...)\`; the constructor is missing. Use string operations.`;
  if (name === 'Navigator') return `Never use \`navigator.clipboard\`/\`credentials\`/\`mediaDevices\`/\`geolocation\`/\`permissions\`/\`serviceWorker\`/\`storage\`/\`vibrate\`/\`share\`/\`userAgentData\`; missing. \`getGamepads\` is a stub.`;
  if (name === 'CanvasGradient' || name === 'CanvasPattern') return `Never use ${name}; \`addColorStop\`/\`setTransform\` are stubs and the canvas pipeline is non-functional.`;
  if (name === 'NamedNodeMap') return `Never call \`NamedNodeMap.setNamedItem\`/\`removeNamedItem\`/\`getNamedItemNS\`; missing. \`item\`/\`getNamedItem\` are stubs. Use \`element.getAttribute\`/\`setAttribute\` instead.`;
  if (name === 'Window') return `Never call \`alert\`/\`confirm\`/\`prompt\`, \`open\`, \`postMessage\`, \`print\`, \`matchMedia\`, \`requestIdleCallback\`, or \`structuredClone\`; missing. \`addEventListener\`/\`removeEventListener\`/\`getComputedStyle\`/\`getSelection\`/\`requestAnimationFrame\`/\`cancelAnimationFrame\`/\`setTimeout\`/\`clearTimeout\`/\`setInterval\`/\`clearInterval\`/\`queueMicrotask\`/\`scrollBy\`/\`scrollTo\` exist as stubs only.`;
  if (name === 'NodeIterator') return `Never use \`NodeIterator\`; \`nextNode\`/\`previousNode\` are stubs and \`createNodeIterator\` returns a non-functional traverser.`;
  if (name === 'ShadowRoot') return `Never depend on Shadow DOM (\`element.attachShadow\` is a stub on Element); \`ShadowRoot\` exists but \`getHTML\`/\`setHTMLUnsafe\`/\`adoptedStyleSheets\`/\`getAnimations\`/\`getSelection\` are missing.`;
  if (name === 'StylePropertyMap' || name === 'StylePropertyMapReadOnly' || name === 'CSSStyleValue' || name === 'CSSTransformValue' || name === 'CSSTransformComponent' || name === 'CSSNumericValue') return `Never use the Typed-CSSOM (${name}); \`get\`/\`set\`/\`has\`/\`clear\`/\`delete\` are stubs and the constructors are missing.`;
  if (name === 'TimeRanges' || name === 'TouchList' || name === 'StyleSheetList' || name === 'DOMRectList') return `Never call \`${name}.item\` or iteration methods; they are stubs. Use \`length\` + index access only.`;
  if (name === 'HTMLBodyElement' || name === 'HTMLDivElement' || name === 'HTMLDocument' || name === 'HTMLHeadElement' || name === 'HTMLHtmlElement' || name === 'HTMLParagraphElement' || name === 'HTMLPreElement' || name === 'HTMLSpanElement' || name === 'HTMLTitleElement' || name === 'HTMLUnknownElement') return `Never expect ${name}-specific properties beyond Element; \`addEventListener\`/\`removeEventListener\` are stubs and there are no element-typed extras.`;
  if (name === 'HTMLButtonElement') return `Never use \`HTMLButtonElement\` form/validation properties (\`form\`, \`validity\`, \`labels\`, \`formAction\`, \`checkValidity\`, \`reportValidity\`, \`setCustomValidity\`, \`disabled\`, \`type\`, \`value\`, \`name\`, \`willValidate\`, \`command\`/\`commandFor*\`, \`popoverTarget*\`); all missing.`;
  if (name === 'HTMLCanvasElement') return `Never call \`canvas.toDataURL\`, \`toBlob\`, \`captureStream\`, \`transferControlToOffscreen\`; missing. \`getContext\`/\`addEventListener\` are stubs.`;
  if (name === 'HTMLImageElement') return `Never read \`img.alt\`, \`complete\`, \`naturalWidth\`/\`Height\`, \`currentSrc\`, \`crossOrigin\`, \`decoding\`, \`fetchPriority\`, \`loading\`, \`referrerPolicy\`, \`sizes\`, \`srcset\`, \`useMap\`, \`x\`, \`y\`; all missing. \`src\` works.`;
  if (name === 'HTMLInputElement') return `Never use \`input.checked\`, \`files\`, \`form\`, \`labels\`, \`list\`, \`max\`/\`min\`/\`step\`, \`multiple\`, \`pattern\`, \`placeholder\`, \`readOnly\`, \`required\`, \`validity\`, \`valueAsDate\`/\`valueAsNumber\`, \`stepUp\`/\`stepDown\`, \`checkValidity\`/\`reportValidity\`/\`setCustomValidity\`, \`showPicker\`, \`indeterminate\`, \`autocomplete\`, \`accept\`, \`alt\`, \`disabled\`, \`name\`; all missing. \`value\`, \`type\`, \`focus\`, \`blur\`, \`select\`, \`setRangeText\`, \`setSelectionRange\` are stubs/supported.`;
  if (name === 'HTMLMediaElement') return `Never call \`addTextTrack\`, \`fastSeek\`, \`setMediaKeys\`, \`setSinkId\`; missing. \`canPlayType\`/\`load\`/\`pause\`/\`play\`/\`coh*\` are stubs.`;
  if (name === 'HTMLLinkElement') return `Never use \`link.sheet\`, \`relList\`, \`media\`, \`crossOrigin\`, \`integrity\`, \`fetchPriority\`, \`hreflang\`, \`imageSizes\`/\`imageSrcset\`, \`referrerPolicy\`, \`sizes\`, \`disabled\`, \`as\`; all missing. \`href\`/\`rel\` work.`;
  if (name === 'HTMLIFrameElement') return `Never use \`iframe.contentDocument\`/\`contentWindow\`, \`src\`/\`srcdoc\`, \`allow\`, \`allowFullscreen\`, \`sandbox\`, \`loading\`, \`name\`, \`height\`/\`width\`; iframe is parsed-no-impl. All missing.`;
  if (name === 'HTMLTextAreaElement') return `Never use \`textarea.form\`, \`labels\`, \`name\`, \`disabled\`, \`readOnly\`, \`required\`, \`placeholder\`, \`autocomplete\`, \`validity\`/\`willValidate\`/\`checkValidity\`/\`reportValidity\`/\`setCustomValidity\`; missing. \`value\`, \`rows\`, \`cols\`, \`select\`, \`setRangeText\`, \`setSelectionRange\` work.`;
  if (name === 'HTMLStyleElement') return `Never use \`style.sheet\`, \`disabled\`, \`media\`, \`type\`; missing.`;
  if (name === 'HTMLScriptElement') return `Never use \`script.crossOrigin\`, \`integrity\`, \`fetchPriority\`, \`referrerPolicy\`, \`noModule\`, \`htmlFor\`, \`event\`, \`charset\`; missing.`;
  if (name === 'HTMLSourceElement') return `Never use \`source.height\`, \`width\`, \`sizes\`, \`srcset\`; missing.`;
  if (name === 'HTMLVideoElement') return `Never use \`video.requestPictureInPicture\`, \`getVideoPlaybackQuality\`, \`requestVideoFrameCallback\`/\`cancelVideoFrameCallback\`, \`disablePictureInPicture\`, \`playsInline\`; missing.`;
  if (name === 'HTMLTemplateElement') return `Never use \`template.shadowRootMode\`/\`shadowRootClonable\`/\`shadowRootDelegatesFocus\`/\`shadowRootSerializable\`; missing. \`content\` works.`;
  if (name === 'HTMLElement') return `Never use \`hidden\`, \`inert\`, \`innerText\`/\`outerText\`, \`title\`, \`lang\`, \`dir\`, \`autocapitalize\`, \`autocorrect\`, \`spellcheck\`, \`tabIndex\`, \`accessKey\`, \`draggable\`, \`translate\`, \`isContentEditable\`/\`contentEditable\`, \`enterKeyHint\`, \`inputMode\`, \`virtualKeyboardPolicy\`, \`popover\`/\`showPopover\`/\`hidePopover\`/\`togglePopover\`, \`click()\`, \`attachInternals\`, \`autofocus\`; all missing.`;
  if (name === 'SVGElement' || name === 'SVGGraphicsElement' || name === 'SVGSVGElement' || name === 'SVGTextElement' || name === 'SVGTransformList' || name === 'SVGTransform' || name === 'SVGLength' || name === 'SVGAnimatedLength' || name === 'SVGAnimatedRect' || name === 'SVGAnimatedTransformList') return `Never use full ${name} interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.`;
  if (name === 'Screen') return `Never use \`screen.orientation\`, \`availLeft\`/\`availTop\`, \`isExtended\`, \`left\`/\`top\`, \`lockOrientation\`/\`unlockOrientation\`, \`mozBrightness\`/\`mozEnabled\`; missing.`;
  if (name === 'TextMetrics') return `Never use \`alphabeticBaseline\`, \`emHeightAscent\`/\`emHeightDescent\`, \`fontBoundingBoxAscent\`/\`fontBoundingBoxDescent\`, \`hangingBaseline\`, \`ideographicBaseline\` from \`measureText\`; missing.`;
  if (name === 'CharacterData') return `Never call \`appendData\`/\`deleteData\`/\`insertData\`/\`replaceData\`/\`substringData\`/\`after\`/\`before\`/\`remove\`; all stubs. Mutate Text via \`textContent\`.`;
  if (name === 'Comment' || name === 'Text') return `Never \`new ${name}()\`; constructor missing. Create comments/text via \`document.createComment\`/\`document.createTextNode\` (stubs).`;
  if (name === 'TouchEvent' || name === 'Touch' || name === 'TouchList') return `Never \`new ${name}()\`; constructor missing. Touch APIs are partial — see scraper for missing fields.`;
  if (name === 'AnimationEvent' || name === 'TransitionEvent' || name === 'PopStateEvent' || name === 'ProgressEvent' || name === 'PromiseRejectionEvent' || name === 'MessageEvent' || name === 'ErrorEvent' || name === 'FocusEvent' || name === 'GamepadEvent') return `Never \`new ${name}(...)\`; constructor missing. Receive instances from listeners.`;
  if (name === 'XMLHttpRequestEventTarget') return `Never expect \`XMLHttpRequestEventTarget.onload\`/\`onerror\`/\`onabort\`/\`onloadstart\`/\`onloadend\`/\`onprogress\`/\`ontimeout\`; missing.`;
  if (name === 'CSS') return `Never call \`CSS.px\`/\`em\`/\`%\`/\`rem\`/\`vw\`/\`vh\`/\`vmin\`/\`vmax\`/\`s\`/\`ms\`/\`deg\`/\`number\`/\`pt\`/\`in\`/\`percent\`; the unit factories are missing.`;
  if (name === 'CSSRuleList') return `Never call \`CSSRuleList.item\`; missing. Use index access only.`;
  if (name === 'CSSRotate' || name === 'CSSScale' || name === 'CSSSkewX' || name === 'CSSSkewY' || name === 'CSSTranslate' || name === 'CSSMatrixComponent' || name === 'CSSKeywordValue' || name === 'CSSUnitValue') return `Never \`new ${name}(...)\`; constructor missing in Typed CSSOM.`;
  if (name === 'Attr') return `Never read \`Attr.ownerElement\` or \`Attr.specified\`; missing. Use \`element.getAttribute\`/\`setAttribute\` directly.`;
  if (name === 'BlobPropertyBag' || name === 'GetAnimationsOptions' || name === 'ResizeObserverOptions') return `Never set the missing dictionary fields on \`${name}\` (per scraper evidence); they are silently ignored.`;
  if (name === 'Blob') return `Never call \`Blob.text()\`/\`arrayBuffer()\`/\`stream()\`/\`bytes()\` or \`new Blob()\`; missing. \`slice\` is a no-op stub.`;
  if (name === 'CaretPosition') return `Never call \`CaretPosition.getClientRect()\`; missing.`;
  if (name === 'CoherentDebug') return `Never rely on \`CoherentDebug.triggerPageCapture\`; it is a stub.`;
  if (name === 'DocumentFragment') return `Never \`new DocumentFragment()\`; constructor missing. \`getElementById\`/\`querySelector\`/\`querySelectorAll\`/\`append\` are stubs.`;
  if (name === 'DocumentType') return `Never call \`DocumentType.replaceWith\`; missing. \`after\`/\`before\`/\`remove\` are stubs.`;
  if (name === 'DOMMatrix' || name === 'DOMRect' || name === 'DOMRectReadOnly' || name === 'DOMStringMap') return `Never \`new ${name}(...)\`; constructor missing. ${name === 'DOMMatrix' ? 'Mutating self-* methods (\`invertSelf\`, \`multiplySelf\`, \`rotateSelf\`, etc.) are missing.' : ''}`;
  return `Never assume the full standard surface of \`${name}\`; multiple methods/properties are stubs or missing per the scraper.`;
}

function jsStubWhy(stubs, missing, present) {
  const parts = [];
  if (stubs.length) parts.push(`scraper stubs: ${JSON.stringify(stubs.slice(0, 12))}${stubs.length > 12 ? ' …' : ''}`);
  if (missing.length) parts.push(`scraper missing: ${JSON.stringify(missing.slice(0, 12))}${missing.length > 12 ? ` …+${missing.length - 12} more` : ''}`);
  if (present.length) parts.push(`only present: ${JSON.stringify(present)}`);
  return parts.join('; ') || 'see scraper evidence.';
}

// JS missing-from-window: family-grouped rules
const jsMissingNames = js.unsupported.map(e => e.name);
const jsFamilies = [
  { name: 'fetch-network', label: 'Fetch / network APIs', severity: 'critical',
    test: n => /^(fetch|Request|Response|Headers|FormData|EventSource|WebSocket|BroadcastChannel|MessageChannel|MessagePort|XMLHttpRequest)$/.test(n) || /^Worker$|^SharedWorker$|^ServiceWorker/.test(n),
    rule: 'Never use network/IPC APIs (`fetch`, `Request`, `Response`, `Headers`, `FormData`, `EventSource`, `WebSocket` (constructor), `BroadcastChannel`, `MessageChannel`, `Worker`, `SharedWorker`); communicate with the host engine via the Gameface bridge.' },
  { name: 'storage-database', label: 'Storage and database APIs', severity: 'critical',
    test: n => /^(localStorage|sessionStorage|indexedDB|IDB|FileReader|File|FileList|FileSystem|caches|cookieStore|StorageManager)/.test(n),
    rule: 'Never use browser storage APIs (`localStorage`, `sessionStorage`, `indexedDB`, `IDB*`, `FileReader`, `File`, `FileList`, `FileSystem*`, `caches`, `cookieStore`); none are available. Persist via the engine bridge.' },
  { name: 'crypto-encoding', label: 'Crypto, encoding, structured-clone', severity: 'critical',
    test: n => /^(crypto|SubtleCrypto|TextEncoder|TextDecoder|TextEncoderStream|TextDecoderStream|atob|btoa|structuredClone)$/.test(n),
    rule: 'Never use `crypto`, `SubtleCrypto`, `TextEncoder`/`TextDecoder`/`TextEncoderStream`/`TextDecoderStream`, `atob`/`btoa`, or `structuredClone`; missing. Implement what you need by hand or pull the data through the engine bridge.' },
  { name: 'webgl-webgpu', label: 'WebGL and WebGPU', severity: 'high',
    test: n => /^(WebGL|WebGL2|GPU|WebGPU)/.test(n),
    rule: 'Never use WebGL / WebGPU directly; rendering happens through the host engine. Don\'t call `canvas.getContext("webgl"|"webgl2"|"webgpu")`.' },
  { name: 'media-stream-rtc-audio', label: 'Media, WebRTC, Web Audio', severity: 'high',
    test: n => /^(MediaStream|MediaRecorder|MediaDevices|MediaSession|MediaSource$|MediaSourceHandle|RTC|getUserMedia|AudioContext|OfflineAudioContext|AudioBuffer|AudioWorklet|AudioNode|GainNode|OscillatorNode|AnalyserNode|BiquadFilterNode|ConvolverNode|DelayNode|DynamicsCompressorNode|PannerNode|StereoPannerNode|WaveShaperNode|ChannelSplitterNode|ChannelMergerNode|ConstantSourceNode|IIRFilterNode|MediaElementAudioSourceNode|MediaStreamAudioSourceNode|MediaStreamAudioDestinationNode|ScriptProcessorNode|AudioWorkletNode|AudioParam|PeriodicWave|AudioListener|AudioDestinationNode|AudioWorkletGlobalScope|SpeechSynthesis|SpeechRecognition|SpeechGrammar|SpeechSynthesisUtterance)/.test(n),
    rule: 'Never use Web Audio (`AudioContext`, `*Node`, `AudioParam`), Media Streams (`MediaStream*`), Media Recording (`MediaRecorder`), Media Source Extensions, Media Capabilities, WebRTC (`RTC*`), Picture-in-Picture, or Speech APIs; missing. Use host-engine audio/video.' },
  { name: 'observers-modern', label: 'Modern observer APIs', severity: 'high',
    test: n => /^(IntersectionObserver|PerformanceObserver|ReportingObserver|VisualViewport|FontFace|FontFaceSet|FontFaceSetLoadEvent)/.test(n),
    rule: 'Never use `IntersectionObserver`, `PerformanceObserver`, `ReportingObserver`, `VisualViewport`, `FontFace`/`FontFaceSet`; missing. Poll on `requestAnimationFrame` (a Window stub) or compute manually.' },
  { name: 'dom-traversal-range', label: 'DOM traversal / Range / Selection helpers', severity: 'high',
    test: n => /^(Range|StaticRange|TreeWalker|AbortController|AbortSignal|DOMParser|XPathEvaluator|XPathExpression|XPathResult|Highlight|HighlightRegistry)/.test(n),
    rule: 'Never use `Range`, `StaticRange`, `TreeWalker`, `AbortController`/`AbortSignal`, `DOMParser`, `XPath*`, `Highlight*`; missing.' },
  { name: 'navigation-history-modern', label: 'Modern navigation', severity: 'high',
    test: n => /^(Navigation|NavigationHistoryEntry|NavigationDestination|navigation$|navigateEvent)/.test(n) || n === 'NavigateEvent',
    rule: 'Never use the modern Navigation API (`navigation`, `NavigationHistoryEntry`, `NavigateEvent`); missing.' },
  { name: 'auth-credentials', label: 'Auth / credentials / payment', severity: 'medium',
    test: n => /^(Credential|PasswordCredential|FederatedCredential|CredentialsContainer|PublicKeyCredential|PaymentRequest|PaymentResponse|PaymentMethodChangeEvent|AuthenticatorAssertionResponse|AuthenticatorAttestationResponse|AuthenticatorResponse)/.test(n),
    rule: 'Never use Web Authentication / Credential Management / Payment Request APIs; missing.' },
  { name: 'sensors-device', label: 'Sensors, device APIs', severity: 'medium',
    test: n => /^(Sensor|Accelerometer|Gyroscope|Magnetometer|LinearAcceleration|GravitySensor|OrientationSensor|AbsoluteOrientationSensor|RelativeOrientationSensor|AmbientLightSensor|Geolocation|GeolocationCoordinates|GeolocationPosition|GeolocationPositionError|DeviceMotionEvent|DeviceOrientationEvent|DeviceOrientationEventInit|Bluetooth|USB|HID|Serial|Wakelock|WakeLock|XRSystem|XR|VR)/.test(n),
    rule: 'Never use device sensors, geolocation, Bluetooth, USB, HID, Serial, WakeLock, or WebXR; missing.' },
  { name: 'permissions', label: 'Permissions / quotas / clipboard', severity: 'medium',
    test: n => /^(Permission|Permissions|Clipboard|ClipboardItem|StorageAccess|Quota|Persistent)/.test(n),
    rule: 'Never use `Permissions`, `Clipboard`, `ClipboardItem`, `StorageAccess` APIs; missing.' },
  { name: 'streams-encoding', label: 'Streams API', severity: 'medium',
    test: n => /^(ReadableStream|WritableStream|TransformStream|ByteLengthQueuingStrategy|CountQueuingStrategy|ReadableStreamDefault|WritableStreamDefault|TransformStreamDefault|ReadableByteStreamController|ReadableStreamBYOBReader|ReadableStreamBYOBRequest|ReadableStreamDefaultController|ReadableStreamDefaultReader|WritableStreamDefaultController|WritableStreamDefaultWriter|TransformStreamDefaultController|CompressionStream|DecompressionStream)/.test(n),
    rule: 'Never use the Streams API (`ReadableStream`, `WritableStream`, `TransformStream`, `CompressionStream`, etc.); missing.' },
  { name: 'workers-async', label: 'Workers, scheduler, idle/animation/microtask', severity: 'high',
    test: n => /^(Worker|SharedWorker|Worklet|PaintWorklet|AudioWorklet|LayoutWorklet|AnimationWorklet|scheduler|TaskController|TaskSignal|TaskPriorityChangeEvent|RequestIdleCallback|IdleDeadline|requestIdleCallback|cancelIdleCallback|setImmediate|clearImmediate)/.test(n),
    rule: 'Never use Workers, Worklets, the Prioritized Task Scheduler, `requestIdleCallback`, or `setImmediate`; missing.' },
  { name: 'geometry-typed-cssom-extras', label: 'Geometry / Typed CSSOM extras', severity: 'low',
    test: n => /^(DOMPoint|DOMPointReadOnly|DOMQuad|DOMMatrixReadOnly|CSSPositionValue|CSSImageValue|CSSConditionRule|CSSFontFaceRule|CSSFontFeatureValuesRule|CSSGroupingRule|CSSImportRule|CSSKeyframeRule|CSSKeyframesRule|CSSMediaRule|CSSNamespaceRule|CSSPageRule|CSSStyleRule|CSSSupportsRule|CSSPositionTryRule|CSSCounterStyleRule|CSSContainerRule|CSSLayerBlockRule|CSSLayerStatementRule|CSSPropertyRule|CSSScopeRule|CSSStartingStyleRule)/.test(n),
    rule: 'Never use these geometry / typed-CSSOM rule wrappers (`DOMPoint*`, `DOMQuad`, `DOMMatrixReadOnly`, `CSS*Rule`, `CSSPositionValue`, `CSSImageValue`); missing.' },
  { name: 'editing-input-modern', label: 'Modern editing / input APIs', severity: 'medium',
    test: n => /^(EditContext|InputDeviceCapabilities|InputDeviceInfo|VirtualKeyboard|TextEvent|InputEvent|CompositionEvent|FormDataEvent|SubmitEvent|InvalidEvent|PopStateEvent$|HashChangeEvent)/.test(n),
    rule: 'Never use modern editing / form-event APIs (`EditContext`, `InputEvent`, `CompositionEvent`, `FormDataEvent`, `SubmitEvent`, `InvalidEvent`, `HashChangeEvent`, etc.); missing or partial.' },
  { name: 'shared-memory-atomics', label: 'Concurrency primitives (browser-side)', severity: 'low',
    test: n => /^(SharedArrayBuffer|Atomics|WeakRef|FinalizationRegistry|TaskAttributionTiming)/.test(n),
    rule: 'Never use `SharedArrayBuffer`, `Atomics`, `WeakRef`, `FinalizationRegistry`; missing in this Gameface JS host.' },
  { name: 'gpu-compute', label: 'GPU compute / WebCodecs / Web Codec helpers', severity: 'medium',
    test: n => /^(WebCodecs|VideoEncoder|VideoDecoder|AudioEncoder|AudioDecoder|VideoFrame|AudioData|EncodedVideoChunk|EncodedAudioChunk|ImageDecoder|ImageEncoder|ImageBitmap|ImageBitmapRenderingContext|createImageBitmap|OffscreenCanvas|OffscreenCanvasRenderingContext2D)/.test(n),
    rule: 'Never use WebCodecs, OffscreenCanvas, or `createImageBitmap`; missing.' },
  { name: 'misc-vendor-misc', label: 'Misc and vendor-specific globals', severity: 'low',
    test: n => /^(Chrome|moz|webkit|opera|external|chrome|menuitem|interestGroup|Topics|Fence|Sanitizer|TrustedTypePolicy|TrustedTypePolicyFactory|TrustedHTML|TrustedScript|TrustedScriptURL|trustedTypes|onmessageerror|onsecuritypolicyviolation|reportError|launchQueue)/.test(n),
    rule: 'Never use vendor-prefixed (`moz*`, `webkit*`, `Chrome*`, `chrome`), Trusted Types (`trustedTypes`, `TrustedHTML`, …), Topics, Fenced Frames, Interest Groups, Sanitizer, or `launchQueue`; missing.' },
  { name: 'misc-rest', label: 'Other missing globals', severity: 'low',
    test: () => true,
    rule: 'Never use these missing global symbols; they are not defined on `window` in Gameface.' },
];

// Assign each missing-from-window name to a family
const jsFamilyAssignments = new Map();
for (const f of jsFamilies) {
  for (const n of jsMissingNames) {
    if (jsFamilyAssignments.has(n)) continue;
    if (f.test(n)) jsFamilyAssignments.set(n, f.name);
  }
}

for (const f of jsFamilies) {
  const members = jsMissingNames.filter(n => jsFamilyAssignments.get(n) === f.name).sort();
  if (!members.length) continue;
  // For misc-rest (catch-all), break further into chunks of 100 to keep rule entries readable
  if (f.name === 'misc-rest') {
    const CHUNK = 200;
    for (let i = 0; i < members.length; i += CHUNK) {
      const slice = members.slice(i, i + CHUNK);
      pushRule({
        id: nextJsId(),
        surface: 'js-api',
        status: 'missing',
        severity: f.severity,
        name: `${f.label} (#${Math.floor(i / CHUNK) + 1})`,
        summary: `${slice.length} missing globals (rest, batch ${Math.floor(i / CHUNK) + 1})`,
        badExample: `${slice[0]}; // ReferenceError or undefined on window`,
        badLang: 'js',
        goodExample: `// Avoid this symbol; either omit the feature or implement via the engine bridge.`,
        goodLang: 'js',
        ruleSentence: f.rule,
        why: `scraper status: missing-from-window. Members: ${slice.join(', ')}.`,
        sourceFile: 'results/js/unsupported.json',
        sourcePath: `$[?(family=="${f.name}" && batch==${Math.floor(i / CHUNK) + 1})]`,
        bucket: 'js',
        members: slice,
      });
    }
  } else {
    pushRule({
      id: nextJsId(),
      surface: 'js-api',
      status: 'missing',
      severity: f.severity,
      name: f.label,
      summary: `${members.length} missing globals in this family`,
      badExample: `${members[0]}; // ReferenceError or undefined on window`,
      badLang: 'js',
      goodExample: `// Communicate via the Gameface engine bridge or omit the feature.`,
      goodLang: 'js',
      ruleSentence: f.rule,
      why: `scraper status: missing-from-window. Members: ${members.join(', ')}.`,
      sourceFile: 'results/js/unsupported.json',
      sourcePath: `$[?(family=="${f.name}")]`,
      bucket: 'js',
      members,
    });
  }
}

// ---------- sort rules per bucket by severity then alphabetically and re-id ----------
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function sortAndReid(prefix, bucket) {
  const list = rules.filter(r => r.bucket === bucket);
  list.sort((a, b) => {
    const s = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
    if (s !== 0) return s;
    return String(a.name).localeCompare(String(b.name));
  });
  list.forEach((r, i) => {
    r.id = `${prefix}-${String(i + 1).padStart(3, '0')}`;
  });
}
sortAndReid('CSS', 'css');
sortAndReid('HTML', 'html');
sortAndReid('JS', 'js');

// ---------- write index JSON ----------
const indexJson = rules.map(r => ({
  id: r.id,
  surface: r.surface,
  status: r.status,
  severity: r.severity,
  summary: r.summary,
  source_file: r.sourceFile,
  source_path: r.sourcePath,
  ...(r.members ? { members: r.members } : {}),
  name: r.name,
}));

fs.writeFileSync(path.join(OUT, 'negative-rules-index.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  generator: 'gen-rules.js',
  surfaces: ['css-property', 'css-shorthand', 'css-value', 'css-function', 'css-selector', 'html-tag', 'html-input-type', 'js-stub', 'js-api'],
  vocabulary: ['supported', 'partial-shorthand', 'partial-values', 'parser-only', 'stub', 'parsed-no-impl', 'silently-coerced', 'unknown', 'missing'],
  vocabularyMapping: {
    'CSS partial → partial-shorthand': 'shorthand property with probe=value-accepted-but-not-computed',
    'CSS partial → partial-values': 'property whose evidence lists explicit supportedValues / unsupportedValues / logRejectedValues',
    'CSS partial → parser-only': 'non-shorthand whose evidence is only probe=value-accepted-but-not-computed',
    'CSS missing': `${css.unsupported.length} unsupported properties, each with logWarning "Unsupported CSS property detected (stylesheet parser)"`,
    'CSS-function missing': `${funcs.unsupported.filter(f => f.status === 'missing').length} functions that fail to parse with "Unable to parse declaration: …"`,
    'CSS-function unknown': `${funcs.unsupported.filter(f => f.status === 'unknown').length} functions the scraper skipped because they stall the renderer at parse time (NEEDS REVIEW)`,
    'Selector parser-only': `${sel.unsupported.length} pseudo-class/element/at-rule names the engine logs as "unsupported pseudo: …"`,
    'Selector partial': `${sel.partial.length} structural pseudos that match only the simplest form`,
    'HTML partial → silently-coerced (input-type)': `${html.partial.filter(e => e.surface === 'input-type').length} input types reset to "text" after assignment`,
    'HTML partial → partial-values (tag)': `${html.partial.filter(e => e.surface === 'html').length} tags (canvas/img/input/link) where the constructor exists but a documented subset of properties is missing`,
    'HTML parsed-no-impl': `${html.unsupported.filter(e => e.status === 'parsed-no-impl').length} tags that parse to a generic HTMLElement with no specialised behavior`,
    'HTML unknown': `${html.unsupported.filter(e => e.status === 'unknown').length} tags that resolve to HTMLUnknownElement`,
    'JS partial → stub': `${js.partial.length} window-visible classes whose constructor and/or a subset of members are absent`,
    'JS missing-from-window → missing': `${js.unsupported.length} window-scoped globals not defined`,
  },
  skippedBasicSelectors,
  needsReview,
  rules: indexJson,
}, null, 2));

// ---------- write Markdown bucket files ----------
function rulesFor(bucket) {
  return rules.filter(r => r.bucket === bucket);
}

function renderRule(r) {
  return [
    `### [${r.id}] — ${r.name}`,
    `**Status:** ${r.status}`,
    `**Surface:** ${r.surface}`,
    `**Severity:** ${r.severity}`,
    ``,
    `**❌ Never generate:**`,
    '```' + r.badLang,
    r.badExample,
    '```',
    ``,
    `**✅ Generate instead:**`,
    '```' + r.goodLang,
    r.goodExample,
    '```',
    ``,
    `**Rule for AI agents:** ${r.ruleSentence}`,
    ``,
    `**Why:** ${r.why}`,
  ].join('\n');
}

function renderBucket(title, intro, bucket) {
  const list = rulesFor(bucket);
  const bySev = { critical: [], high: [], medium: [], low: [] };
  for (const r of list) bySev[r.severity].push(r);
  const lines = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(intro);
  lines.push('');
  lines.push(`Total rules in this file: **${list.length}** (critical: ${bySev.critical.length}, high: ${bySev.high.length}, medium: ${bySev.medium.length}, low: ${bySev.low.length}).`);
  lines.push('');
  for (const sev of ['critical', 'high', 'medium', 'low']) {
    if (!bySev[sev].length) continue;
    lines.push(`## ${sev.toUpperCase()} (${bySev[sev].length})`);
    lines.push('');
    for (const r of bySev[sev]) {
      lines.push('---');
      lines.push(renderRule(r));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

fs.writeFileSync(path.join(OUT, 'negative-rules-css.md'), renderBucket(
  'Negative Rules — CSS',
  'Generated from `results/css/{partial,unsupported}.json` and `results/selectors/{partial,unsupported}.json`. Each rule maps to the cited scraper file via `source_path` in `negative-rules-index.json`. Examples and "why" fields are derived directly from the scraper evidence.',
  'css',
));

fs.writeFileSync(path.join(OUT, 'negative-rules-html.md'), renderBucket(
  'Negative Rules — HTML',
  'Generated from `results/html/{partial,unsupported}.json`. The most dangerous statuses (`silently-coerced`, `parsed-no-impl`, `unknown`) appear under CRITICAL.',
  'html',
));

fs.writeFileSync(path.join(OUT, 'negative-rules-js.md'), renderBucket(
  'Negative Rules — JS',
  'Generated from `results/js/{partial,unsupported}.json`. Stubbed APIs (`stub`, `stub-heavy`, `partial`) are collapsed into the `stub` status; `missing-from-window` becomes `missing`. Missing globals are grouped into family rules to keep the file scannable.',
  'js',
));

// ---------- injection block (dense, categorical, ~3000-3500 cl100k tokens) ----------
//
// Designed to be injected verbatim into LLM system prompts. Grouped by surface
// and prefixed with a small "supported" cheat-sheet so the model doesn't avoid
// features that actually work. The full rationale per rule lives in
// `negative-rules-{css,html,js}.md` and `negative-rules-index.json`.
const inject = [];
inject.push('## GAMEFACE CONSTRAINTS — DO NOT VIOLATE');
inject.push('');
inject.push('Gameface is a game-UI middleware that ships a subset of web standards. Emit only what the engine actually parses and renders. Lists below come from the feature-detection scraper under `results/`; see `negative-rules-{css,html,js}.md` for per-feature evidence.');
inject.push('');

// --- SUPPORTED cheat sheet (compact) ---
inject.push('### Supported (use freely)');
inject.push('- CSS shorthands propagate (`border`, `background`, `flex`, `font`, `gap`, `margin`, `padding`, `animation`, `transition`, `mask`, `text-decoration`, `text-shadow`, `text-stroke`, `border-radius`, etc.).');
inject.push('- `var(--name, fallback)`, `calc`, `sign`/`pow`/`sqrt`/`hypot`/`log`/`exp`/`sin`/`cos`/`tan`, `rgb`/`rgba`/`color(srgb …)`, `linear-gradient`/`radial-gradient`/`conic-gradient`, `translate*`/`scale*`/`rotate*`/`matrix`/`matrix3d`/`skewX`/`skewY`, `blur`/`brightness`/`contrast`/`drop-shadow`/`grayscale`/`hue-rotate`/`invert`/`opacity`/`saturate`/`sepia`, `cubic-bezier`/`steps`, `circle`/`ellipse`/`polygon`/`inset`/`path`, `repeat`/`minmax`/`fit-content`.');
inject.push('- At-rules `@media`/`@supports`/`@layer`/`@container`/`@scope`/`@starting-style`/`@keyframes`; CSS nesting (`& .child`).');
inject.push('- Selectors: type / `.class` / `#id` / `*` / all `[attr…]` / all combinators / `:hover`/`:focus`/`:active`/`:first-child`/`:last-child`/`:is`/`:not`/`:where`/`:lang`/`:root`/`:scope`/`:link`/`:visited`/`:target`, all form-state and media-state pseudos, `::before`/`::after`/`::placeholder`/`::marker`/`::part`/`::highlight`/`::slotted`/`::view-transition*`.');
inject.push('- JS: `console.{log,info,warn,error,debug,assert,time,timeEnd}`, `setTimeout`/`setInterval`/`clearTimeout`/`clearInterval`/`queueMicrotask`, `performance.now()`, `Node`/`NodeList`/`NodeFilter`/`HTMLCollection`, `DOMTokenList` (so `element.classList` works), `Storage`, `Location`.');

// --- CSS forbidden ---
inject.push('');
inject.push('### CSS — forbidden property families');
const cssFamilyRules = rulesFor('css').filter(r => r.surface === 'css-property' && r.status === 'missing');
for (const r of cssFamilyRules) inject.push(`- ${r.ruleSentence}`);

inject.push('');
inject.push('### CSS — forbidden functions');
const cssFnRules = rulesFor('css').filter(r => r.surface === 'css-function');
for (const r of cssFnRules) inject.push(`- ${r.ruleSentence}`);

// CSS partial-value restrictions — collapse into compact, scannable lines.
// Drop noise: CSS-wide keywords (`initial`/`inherit`/`unset`/`revert`),
// function calls already covered by the dedicated functions section,
// anchor-positioning tokens already covered by their family rule.
inject.push('');
inject.push('### CSS — partial-value restrictions (only the listed tokens are rejected)');
const partialValueRules = rulesFor('css').filter(r => ['css-value', 'css-shorthand'].includes(r.surface));
const FN_NOISE = new Set([
  'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color-mix',
  'clamp', 'min', 'max', 'mod', 'rem', 'round', 'abs', 'asin', 'acos', 'atan', 'atan2',
  'env', 'attr', 'counter', 'counters', 'rect', 'xywh',
  'image-set', 'cross-fade', 'repeating-linear-gradient', 'repeating-radial-gradient',
  'skew', 'perspective', 'linear',
]);
const KW_NOISE = new Set(['initial', 'inherit', 'unset', 'revert', 'revert-layer']);
const ANCHOR_NOISE = new Set(['anchor', 'anchor-size', 'anchor-center']);
function isFnCall(tok) {
  const m = tok.match(/^([\w-]+)\s*\(/);
  if (m && FN_NOISE.has(m[1].toLowerCase())) return true;
  // also drop tokens containing a noisy function name as a nested call
  for (const fn of FN_NOISE) {
    if (new RegExp(`\\b${fn}\\s*\\(`).test(tok)) return true;
  }
  return false;
}
function rejectedTokensFor(propName) {
  const e = (css.partial.find(x => x.name === propName) || {}).evidence || {};
  const raw = [...new Set([...(e.unsupportedValues || []), ...(e.logRejectedValues || [])])];
  return raw.filter(t => {
    const low = t.toLowerCase();
    if (KW_NOISE.has(low)) return false;
    if (ANCHOR_NOISE.has(low)) return false;
    if (FN_NOISE.has(low)) return false;
    if (isFnCall(low)) return false;
    return true;
  });
}
const compactedRules = [];
for (const r of partialValueRules) {
  const rejected = rejectedTokensFor(r.name);
  if (!rejected.length) continue; // skip noise-only rejections
  compactedRules.push({ name: r.name, rejected });
}
for (const { name, rejected } of compactedRules) {
  inject.push(`- \`${name}\`: never assign ${rejected.map(v => '`' + v + '`').join(', ')}.`);
}

// CSS selectors
inject.push('');
inject.push('### CSS — selector restrictions');
const selRules = rulesFor('css').filter(r => r.surface === 'css-selector');
const selUnsupp = selRules.filter(r => r.status === 'parser-only').map(r => r.name).sort();
const selPartial = selRules.filter(r => r.status === 'partial-values').map(r => r.name).sort();
if (selUnsupp.length) inject.push(`- Never use (parses, never matches): ${selUnsupp.map(n => '`' + n + '`').join(', ')}.`);
if (selPartial.length) inject.push(`- Partial — only the simplest forms work, avoid the \`An+B\` / \`of S\` variants: ${selPartial.map(n => '`' + n + '`').join(', ')}.`);

// --- HTML forbidden ---
inject.push('');
inject.push('### HTML — forbidden tags and attributes');
const silentInputs = rulesFor('html').filter(r => r.surface === 'html-input-type').map(r => r.name.match(/"([^"]+)"/)[1]).sort();
if (silentInputs.length) {
  inject.push(`- \`<input type="${silentInputs.join('|')}">\` is silently coerced to \`type="text"\` — only \`type="text"\`, \`type="password"\`, \`type="button"\` are honored. Implement other behavior in JS or with custom widgets.`);
}
const noImpl = rulesFor('html').filter(r => r.status === 'parsed-no-impl').map(r => r.name);
const widgets = noImpl.filter(n => ['select', 'option', 'optgroup', 'datalist'].includes(n));
const forms = noImpl.filter(n => ['form', 'fieldset', 'legend', 'label', 'output', 'progress', 'meter'].includes(n));
const media = noImpl.filter(n => ['audio', 'video', 'source', 'track', 'picture', 'embed', 'object', 'iframe', 'map', 'area'].includes(n));
const tables = noImpl.filter(n => ['table', 'caption', 'col', 'colgroup', 'tbody', 'tfoot', 'thead', 'tr', 'td', 'th'].includes(n));
const lists = noImpl.filter(n => ['ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu'].includes(n));
const text = noImpl.filter(n => /^(h[1-6]|b|strong|i|em|u|s|mark|small|sub|sup|abbr|address|cite|code|kbd|samp|var|q|dfn|time|data|big|tt|font|center|blockquote|figure|figcaption|pre|br|hr|wbr|ruby|rt|rp|bdi|bdo|ins|del|noscript|noembed|noframes)$/.test(n));
const dis = noImpl.filter(n => ['details', 'summary', 'dialog'].includes(n));
const accountedFor = new Set([...widgets, ...forms, ...media, ...tables, ...lists, ...text, ...dis, 'a']);
const otherNoImpl = noImpl.filter(n => !accountedFor.has(n));
inject.push('- `<a href>` has no navigation — replace with `<div role="link">` + JS click handler that calls into the engine.');
if (widgets.length) inject.push(`- \`<${widgets.join('>`/`<')}>\` — no widget behavior. Build custom dropdowns / autocomplete from \`<div>\` + class toggles.`);
if (forms.length) inject.push(`- \`<${forms.join('>`/`<')}>\` — no form lifecycle / validation / labeling. Read input values from JS and POST via the engine bridge.`);
if (media.length) inject.push(`- \`<${media.join('>`/`<')}>\` — no media / framing pipeline. Route through the host engine.`);
if (tables.length) inject.push(`- \`<${tables.join('>`/`<')}>\` — no table layout. Use \`display: flex\` rows/cells.`);
if (lists.length) inject.push(`- \`<${lists.join('>`/`<')}>\` — no list markers/numbering. Render bullets manually with styled \`<div>\`.`);
if (text.length) inject.push(`- Headings + inline-text tags (\`<h1..h6>\`, \`<b>\`/\`<strong>\`/\`<i>\`/\`<em>\`/\`<u>\`/\`<s>\`/\`<mark>\`/\`<sub>\`/\`<sup>\`/\`<abbr>\`/\`<cite>\`/\`<code>\`/\`<kbd>\`/\`<samp>\`/\`<var>\`/\`<time>\`/\`<data>\`/\`<q>\`/\`<dfn>\`/\`<address>\`/\`<blockquote>\`/\`<figure>\`/\`<figcaption>\`/\`<pre>\`/\`<br>\`/\`<hr>\`/\`<wbr>\`/\`<ruby>\`/\`<bdi>\`/\`<bdo>\`/\`<ins>\`/\`<del>\`/legacy presentational) parse but have no default styling — wrap with \`<span>\`/\`<div>\` + explicit CSS classes.`);
if (dis.length) inject.push(`- \`<${dis.join('>`/`<')}>\` — no disclosure/modal behavior. Build with class toggling + a \`<div class="modal">\` overlay.`);
if (otherNoImpl.length) inject.push(`- Other tags parsed as generic \`HTMLElement\` (no specialised behavior): \`<${otherNoImpl.slice(0, 25).join('>`/`<')}>\`${otherNoImpl.length > 25 ? `, …+${otherNoImpl.length - 25} more` : ''}.`);
const unknownTags = rulesFor('html').filter(r => r.status === 'unknown').map(r => r.name).sort();
if (unknownTags.length) inject.push(`- \`<${unknownTags.join('>`/`<')}>\` resolve to \`HTMLUnknownElement\` — the engine doesn't recognize the tag at all.`);
inject.push('- Partial tags — `<canvas>` is 2D-only, no `toDataURL`/`toBlob`; `<img>` exposes only `src` (no `alt`/`complete`/`naturalWidth/Height`); `<input>` lacks `checked`/`validity`/`files`/`required`/`min`/`max`/`pattern`/`list`/`labels`; `<link>` has no `.sheet`. Full per-tag list in `negative-rules-html.md`.');

// --- JS forbidden ---
inject.push('');
inject.push('### JS — missing or stubbed APIs');
const jsFamilyRules = rulesFor('js').filter(r => r.surface === 'js-api');
const miscRestRules = jsFamilyRules.filter(r => /missing globals \(rest|missing global symbols/i.test(r.name + ' ' + r.ruleSentence) && /\(rest|#\d+\)/.test(r.name + r.summary));
const nonRestFamilies = jsFamilyRules.filter(r => !miscRestRules.includes(r));
for (const r of nonRestFamilies) inject.push(`- ${r.ruleSentence}`);
if (miscRestRules.length) {
  const total = miscRestRules.reduce((n, r) => n + (r.members ? r.members.length : 0), 0);
  inject.push(`- ${total} other window-scoped globals are absent (vendor-prefixed, experimental, trial APIs). Assume any standard symbol not listed under "Supported" is unavailable.`);
}

// JS partial — compact format
const jsPartialAll = rulesFor('js').filter(r => r.surface === 'js-stub');
function missingOf(name) {
  const ev = (js.partial.find(e => e.name === name) || {}).evidence || {};
  return ev.missing || [];
}
const ctorOnlyMissing = jsPartialAll.filter(r => {
  const m = missingOf(r.name);
  return m.length === 1 && m[0] === r.name;
});
if (ctorOnlyMissing.length) {
  inject.push(`- Constructor-only-missing (receive instances from listeners / DOM APIs only, never \`new\` them): ${ctorOnlyMissing.map(r => '`' + r.name + '`').sort().join(', ')}.`);
}

// Group HTML element interfaces, SVG, Typed CSSOM into one bullet each (no inline name list).
const partialWithMembers = jsPartialAll.filter(r => !ctorOnlyMissing.includes(r));
const htmlElementInterfaces = partialWithMembers.filter(r => /^HTML/.test(r.name));
if (htmlElementInterfaces.length) {
  inject.push(`- All \`HTML*Element\` interfaces (${htmlElementInterfaces.length} classes) ship only a small subset of their standard surface — assume \`id\`/\`className\`/\`classList\`/\`getAttribute\`/\`setAttribute\`/\`addEventListener\`/\`removeEventListener\`/\`getBoundingClientRect\`/\`querySelector\`/parent-traversal exist; consult \`negative-rules-js.md\` before touching tag-specific properties.`);
}
const svgInterfaces = partialWithMembers.filter(r => /^SVG/.test(r.name));
if (svgInterfaces.length) {
  inject.push(`- SVG DOM (${svgInterfaces.length} \`SVG*\` interfaces) is partial — keep SVG configuration in markup; avoid \`getBBox\`/\`animVal\`/\`createSVG*\`/transform-list mutation.`);
}
const typedCssom = partialWithMembers.filter(r => /^CSS/.test(r.name) && !['CSSStyleDeclaration', 'CSSStyleSheet'].includes(r.name));
if (typedCssom.length) {
  inject.push(`- Typed CSSOM (${typedCssom.length} \`CSS*Value\`/\`CSS*Component\` classes) is not constructible — assemble plain CSS strings instead.`);
}
const groupedNames = new Set([...htmlElementInterfaces, ...svgInterfaces, ...typedCssom].map(r => r.name));

// For high-value globals (the most-used DOM/Web APIs), emit one compact bullet each with ≤6 example missing members.
const highValuePartial = ['Document', 'Element', 'Window', 'Navigator', 'CSSStyleDeclaration', 'CSSStyleSheet', 'Console', 'Performance', 'Selection', 'History', 'CSS', 'CanvasRenderingContext2D', 'Animation', 'CustomElementRegistry'];
for (const n of highValuePartial) {
  if (groupedNames.has(n)) continue;
  const r = partialWithMembers.find(x => x.name === n);
  if (!r) continue;
  const m = missingOf(n).filter(x => x !== n);
  const ctor = missingOf(n).includes(n);
  const preview = m.slice(0, 6).map(x => '`' + x + '`').join(', ');
  const more = m.length > 6 ? `, …+${m.length - 6} more` : '';
  const note = ' (full list in `negative-rules-js.md`)';
  if (ctor) {
    inject.push(`- \`${n}\` — \`new ${n}()\` missing; instances also lack ${preview}${more}${note}.`);
  } else {
    inject.push(`- \`${n}\` instances lack ${preview}${more}${note}.`);
  }
  groupedNames.add(n);
}

// Remaining partial classes: lump together with a single pointer-bullet (no detail).
const remaining = partialWithMembers.filter(r => !groupedNames.has(r.name));
if (remaining.length) {
  inject.push(`- Other partial classes (${remaining.length} more — see \`negative-rules-js.md\`): \`Attr\`, \`Blob\`, \`CharacterData\`, \`DocumentFragment\`, \`DocumentType\`, \`DOMMatrix\`/\`DOMRect*\`, \`Event\`/\`KeyboardEvent\`/\`MouseEvent\`/\`UIEvent\`/\`MessageEvent\`/\`PopStateEvent\`/\`TouchEvent\`/\`Touch\`, \`Gamepad\`, \`NamedNodeMap\`, \`NodeIterator\`, \`Screen\`, \`ShadowRoot\`, \`StylePropertyMap*\`, \`StyleSheet\`, \`Text\`, \`TextMetrics\`, \`XMLHttpRequestEventTarget\`, etc. — constructors typically missing, only a few properties exposed.`);
}

let injectStr = inject.join('\n');

fs.writeFileSync(path.join(OUT, 'negative-rules-injection.md'), injectStr + '\n');

// summary log
const counts = { css: rulesFor('css').length, html: rulesFor('html').length, js: rulesFor('js').length };
const sevCounts = (b) => {
  const c = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const r of rulesFor(b)) c[r.severity]++;
  return c;
};
console.log('==== summary ====');
console.log('css rules:', counts.css, sevCounts('css'));
console.log('html rules:', counts.html, sevCounts('html'));
console.log('js rules:', counts.js, sevCounts('js'));
console.log('total:', counts.css + counts.html + counts.js);
console.log('skipped basic selectors:', skippedBasicSelectors.length, skippedBasicSelectors);
console.log('injection block estimated tokens:', Math.ceil(injectStr.length / 4));
console.log('NEEDS REVIEW count:', needsReview.length);
