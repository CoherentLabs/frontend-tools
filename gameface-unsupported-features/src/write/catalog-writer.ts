import * as fs from 'node:fs';

/**
 * Sorts a catalog array (supported.json / partial.json / unsupported.json rows)
 * by (surface, name), so row order tracks the two things that actually identify
 * a feature rather than @mdn/browser-compat-data / lib.dom.d.ts iteration order
 * (which shifts whenever those dependencies are bumped).
 *
 * Deliberately does NOT touch anything inside a row otherwise — every row, and
 * every evidence field except `logRejectedValues`, is built from object-literal
 * shorthand and `.filter()`/`.push()` over an already-fixed source order
 * throughout reconciler.ts and the probes, so it's already 100% deterministic.
 * `logRejectedValues` is the one field genuinely built from a Set in async
 * log-arrival order; it's sorted at its construction site in reconciler.ts
 * instead of here, so the fix lives next to the actual cause. Reordering
 * anything else here would only add diff noise (or, for fields like
 * `supportedValues`, destroy a meaningful order) for zero determinism benefit.
 */
export function canonicalizeCatalogRows<T extends { surface?: unknown; name?: unknown }>(rows: T[]): T[] {
    return [...rows].sort((a, b) => {
        const sa = String((a as Record<string, unknown>).surface ?? '');
        const sb = String((b as Record<string, unknown>).surface ?? '');
        if (sa !== sb) return sa.localeCompare(sb);
        return String((a as Record<string, unknown>).name ?? '').localeCompare(
            String((b as Record<string, unknown>).name ?? ''),
        );
    });
}

/** Writes JSON with a stable trailing newline (the previous writer omitted one). */
export function writeJsonFile(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
