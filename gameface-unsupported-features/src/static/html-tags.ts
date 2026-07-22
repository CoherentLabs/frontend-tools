/**
 * Tags that are NOT in the BCD database but should still be probed.
 *
 * The main HTML tag candidate list comes from BCD (see bcd-source.ts).
 * This file only holds non-standard or custom tags that BCD will never include
 * but that Gameface may or may not handle (expected result: HTMLUnknownElement).
 *
 * Add any game-UI-specific custom elements here.
 */
export const CUSTOM_HTML_TAGS: string[] = [];
