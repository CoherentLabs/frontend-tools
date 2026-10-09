/**
 * SCSS pre-processor for `@eslint/css` (tolerant mode).
 *
 * The CSS parser used by `@eslint/css` follows native CSS nesting, where `&` must not be
 * directly followed by an identifier. SCSS suffix selectors such as `&-option`, `&__item`
 * or `&--active` therefore fail to parse, and tolerant mode turns the rest of the enclosing
 * block into a single `Raw` node — every declaration inside it (and in later siblings) is
 * silently skipped by the gameface rules.
 *
 * `preprocess` rewrites those `&` characters to `.` (e.g. `&-option` → `.-option`), which is a
 * valid nested class selector of identical length, so all reported line/column positions map
 * 1:1 back to the original source. Strings and comments are left untouched.
 */

/**
 * Identifier-like suffix right after `&`: a name-start char (ASCII letter, `_`, non-ASCII or an
 * escape), optionally after a single `-`, or `--`. Numeric suffixes (`&-2xl`) already parse.
 */
const SUFFIX_START_RE = /-?[_a-zA-Z\u0080-\uFFFF\\]|--/y;

/** Characters after which `&` starts a new compound selector. */
const BOUNDARY_CHARS = new Set([" ", "\t", "\n", "\r", "\f", ",", "{", "}", ";", ">", "+", "~", "("]);

/** @type {Map<string, number[]>} rewritten `&` offsets per file, consumed by postprocess */
const rewrittenOffsets = new Map();

/**
 * @param {string} text
 * @param {number} start index of the opening quote
 * @returns {number} index of the closing quote (or of the last char scanned)
 */
function skipString(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") i += 2;
    else if (ch === quote || ch === "\n") return i;
    else i++;
  }
  return text.length - 1;
}

/**
 * @param {string} text
 * @returns {{ text: string, offsets: number[] }}
 */
export function rewriteScssAmpersandSuffixes(text) {
  /** @type {number[]} */
  const offsets = [];
  let atBoundary = true;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      atBoundary = false;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 1;
      atBoundary = true;
      continue;
    }
    // SCSS line comment; requiring a boundary keeps `url(http://…)` from matching.
    if (ch === "/" && text[i + 1] === "/" && atBoundary) {
      const end = text.indexOf("\n", i);
      i = end === -1 ? text.length : end - 1;
      continue;
    }
    if (ch === "\\") {
      i++;
      atBoundary = false;
      continue;
    }
    if (ch === "&" && atBoundary) {
      SUFFIX_START_RE.lastIndex = i + 1;
      if (SUFFIX_START_RE.test(text)) offsets.push(i);
    }
    atBoundary = BOUNDARY_CHARS.has(ch);
  }

  let out = "";
  let last = 0;
  for (const offset of offsets) {
    out += `${text.slice(last, offset)}.`;
    last = offset + 1;
  }
  out += text.slice(last);
  return { text: out, offsets };
}

export default {
  meta: {
    name: "gameface/scss",
  },
  /**
   * @param {string} text
   * @param {string} filename
   */
  preprocess(text, filename) {
    const { text: out, offsets } = rewriteScssAmpersandSuffixes(text);
    rewrittenOffsets.set(filename, offsets);
    return [out];
  },
  /**
   * @param {import("eslint").Linter.LintMessage[][]} messages
   * @param {string} filename
   */
  postprocess(messages, filename) {
    const offsets = rewrittenOffsets.get(filename) ?? [];
    rewrittenOffsets.delete(filename);
    /** @param {import("eslint").Rule.Fix | undefined} fix */
    const touchesRewrite = (fix) =>
      !!fix && offsets.some((o) => o >= fix.range[0] && o < fix.range[1]);

    return messages.flat().map((message) => {
      // A fix or suggestion spanning a rewritten `&` would write the `.` back into the user's source.
      let result = message;
      if (touchesRewrite(message.fix)) {
        const { fix: _dropped, ...rest } = result;
        result = rest;
      }
      if (message.suggestions?.some((s) => touchesRewrite(s.fix))) {
        const suggestions = message.suggestions.filter((s) => !touchesRewrite(s.fix));
        const { suggestions: _dropped, ...rest } = result;
        result = suggestions.length > 0 ? { ...rest, suggestions } : rest;
      }
      return result;
    });
  },
  supportsAutofix: true,
};
