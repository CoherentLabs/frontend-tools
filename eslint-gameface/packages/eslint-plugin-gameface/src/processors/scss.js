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
 * 1:1 back to the original source.
 */

/** `&` at the start of a compound selector, directly followed by an identifier-like suffix. */
const AMPERSAND_SUFFIX_RE = /(^|[\s,{};>+~(])&(?=-?[_a-zA-Z]|--)/g;

/** @type {Map<string, number[]>} rewritten `&` offsets per file, consumed by postprocess */
const rewrittenOffsets = new Map();

/**
 * @param {string} text
 * @returns {{ text: string, offsets: number[] }}
 */
export function rewriteScssAmpersandSuffixes(text) {
  /** @type {number[]} */
  const offsets = [];
  const out = text.replace(AMPERSAND_SUFFIX_RE, (match, before, index) => {
    offsets.push(index + before.length);
    return `${before}.`;
  });
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
    return messages.flat().map((message) => {
      // A fix spanning a rewritten `&` would write the `.` back into the user's source.
      const fix = message.fix;
      if (fix && offsets.some((o) => o >= fix.range[0] && o < fix.range[1])) {
        const { fix: _dropped, ...rest } = message;
        return rest;
      }
      return message;
    });
  },
  supportsAutofix: true,
};
