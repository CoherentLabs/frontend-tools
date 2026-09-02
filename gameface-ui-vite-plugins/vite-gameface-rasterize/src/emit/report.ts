import type { RasterizeManifest } from '../contract.js';
import { CODES, type DiagnosticBag } from '../diagnostics.js';
import type { AdvisorHit } from '../browser/types.js';
import type { RouteAudit } from '../audit.js';

const ESCAPE = String.fromCharCode(27);
const RESET = `${ESCAPE}[0m`;
const DIM = `${ESCAPE}[2m`;
const BOLD = `${ESCAPE}[1m`;
const RED = `${ESCAPE}[31m`;
const YELLOW = `${ESCAPE}[33m`;
const CYAN = `${ESCAPE}[36m`;
const GREEN = `${ESCAPE}[32m`;

export interface ReportInput {
    manifest: RasterizeManifest;
    bag: DiagnosticBag;
    advisor: AdvisorHit[];
    cacheHits: number;
    durationMs: number;
    patchedHtml: string[];
    audits?: RouteAudit[];
    /** How many bakes the planner produced, before any of them were refused. */
    planned: number;
    /** Where the full diagnostics were written. */
    diagnosticsPath?: string;
}

/**
 * The build summary. It reports the trade the pipeline just made - per-frame work removed in
 * exchange for VRAM spent - because that trade is the whole point and should never be
 * implicit.
 */
export function formatReport(input: ReportInput): string {
    const { manifest, bag, advisor } = input;
    const lines: string[] = [];

    lines.push('');
    lines.push(`${BOLD}rasterize${RESET} ${DIM}cohtml ${manifest.engineVersion} - scale ${manifest.bakeScale}x${RESET}`);

    const assets = Object.entries(manifest.assets);

    if (!assets.length) {
        lines.push(`  ${DIM}no bakeable elements found${RESET}`);
    } else {
        const idWidth = Math.max(...assets.map(([id]) => id.length));

        for (const [id, asset] of assets) {
            const states = Object.entries(asset.states);
            const bytes = states.reduce((sum, [, s]) => sum + s.bytes, 0);
            const vram = states.reduce((sum, [, s]) => sum + s.vramEstBytes, 0);
            const base = asset.states.base;
            const variants = states.length > 1 ? ` ${DIM}+${states.length - 1} state${states.length > 2 ? 's' : ''}${RESET}` : '';

            lines.push(
                `  ${id.padEnd(idWidth)}  ${CYAN}${asset.mode.padEnd(7)}${RESET}` +
                    `${String(base.w).padStart(5)}x${String(base.h).padEnd(5)}` +
                    ` ${size(bytes).padStart(9)} on disk  ${size(vram).padStart(9)} vram${variants}`
            );

            if (asset.mode === 'element' && asset.removedNodes) {
                const live = asset.liveParts?.length ?? 0;
                lines.push(
                    `  ${' '.repeat(idWidth)}  ${DIM}flattened ${asset.removedNodes} node${asset.removedNodes === 1 ? '' : 's'}` +
                        `, kept ${live} live${RESET}`
                );
            }
        }

        const total = manifest.totals;
        const overBudget = total.vramEstBytes > total.budgetBytes;

        lines.push('');
        lines.push(
            `  ${BOLD}${assets.length} asset${assets.length === 1 ? '' : 's'}${RESET}` +
                `  ${overBudget ? YELLOW : GREEN}${size(total.vramEstBytes)} vram${RESET}` +
                ` ${DIM}of ${size(total.budgetBytes)} budget${RESET}` +
                (total.removedNodes ? `  ${DIM}${total.removedNodes} nodes flattened away${RESET}` : '') +
                `  ${DIM}${input.cacheHits} cached, ${(input.durationMs / 1000).toFixed(1)}s${RESET}`
        );
    }

    // Coverage and the diff go directly under the asset table, above the diagnostics: they are
    // the two questions a green build could not previously answer.
    for (const audit of input.audits ?? []) {
        const covered = audit.marked ? audit.resolved / audit.marked : 1;
        const coverageColour = covered === 1 ? GREEN : audit.resolved === 0 ? RED : YELLOW;
        const attributable = Math.max(0, audit.difference - audit.baseline);
        const diffColour = attributable > 0.005 ? YELLOW : GREEN;

        lines.push(
            `  ${audit.route}  ${coverageColour}${audit.resolved}/${audit.marked} textured${RESET}` +
                `  ${diffColour}${(attributable * 100).toFixed(2)}% of pixels differ${RESET}` +
                `${audit.baseline > 0.0005 ? ` ${DIM}(page differs from itself by ${(audit.baseline * 100).toFixed(2)}%)${RESET}` : ''}` +
                `  ${DIM}${audit.diff}${RESET}`
        );
    }

    const errors = bag.items.filter((d) => d.level === 'error');
    const warnings = bag.items.filter((d) => d.level === 'warn');

    if (errors.length || warnings.length) lines.push('');

    for (const diagnostic of [...errors, ...warnings]) {
        const colour = diagnostic.level === 'error' ? RED : YELLOW;
        const label = diagnostic.level === 'error' ? 'error' : 'warn ';
        lines.push(`  ${colour}${label}${RESET} ${bag.format(diagnostic).replace(/\n\s+/g, `\n         ${DIM}`)}${RESET}`);
    }

    const grouped = groupAdvisor(advisor);

    if (grouped.length) {
        lines.push('');
        lines.push(`  ${DIM}${CODES.RZ015.message}${RESET}`);

        // Class list first and a count, because that is what identifies a component. A selector
        // path like body>div>div:nth-of-type(3) names nothing you can open in a CSS-modules app,
        // and the count is half the information - it says which one component is worth eight
        // elements on a single texture.
        for (const group of grouped) {
            const selector = `${group.tag}${group.classes.map((c) => `.${c}`).join('')}`;
            const count = group.count > 1 ? ` x${group.count}` : '';
            lines.push(`  ${DIM}info  ${selector}${count} - ${group.properties.join(', ')}${RESET}`);
        }
    }

    // The last thing on screen is what was lost, because that is what a green build hides. Both
    // counts are here because assets and elements go missing for different reasons: a bake can be
    // refused, and a bake that succeeded can fail to reach the elements that needed it.
    const emitted = assets.length;
    const dropped = Math.max(0, input.planned - emitted);
    const marked = (input.audits ?? []).reduce((sum, a) => sum + a.marked, 0);
    const textured = (input.audits ?? []).reduce((sum, a) => sum + a.resolved, 0);
    const unmatched = marked - textured;

    lines.push('');
    lines.push(
        `  ${BOLD}${input.planned} planned, ${emitted} emitted${RESET}` +
            (dropped ? `, ${YELLOW}${dropped} dropped${RESET} ${DIM}- see RZ019${RESET}` : '')
    );

    if (marked) {
        lines.push(
            `  ${BOLD}${marked} marked, ${textured} textured${RESET}` +
                (unmatched ? `, ${YELLOW}${unmatched} unmatched${RESET} ${DIM}- see RZ022${RESET}` : '')
        );
    }

    if (input.diagnosticsPath) {
        lines.push(`  ${DIM}every diagnostic in full: ${input.diagnosticsPath}${RESET}`);
    }

    lines.push('');
    return lines.join('\n');
}

const size = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

export interface AdvisorGroup {
    tag: string;
    classes: string[];
    properties: string[];
    count: number;
    examples: string[];
}

/** Collapses the advisory hits into one row per component, most instances first. */
export function groupAdvisor(hits: AdvisorHit[]): AdvisorGroup[] {
    const groups = new Map<string, AdvisorGroup>();

    for (const hit of hits) {
        const key = `${hit.tag}|${[...hit.classes].sort().join('.')}|${[...hit.properties].sort().join(',')}`;
        const existing = groups.get(key);

        if (existing) {
            existing.count++;
            if (existing.examples.length < 5) existing.examples.push(hit.selectorPath);
        } else {
            groups.set(key, {
                tag: hit.tag,
                classes: hit.classes,
                properties: hit.properties,
                count: 1,
                examples: [hit.selectorPath],
            });
        }
    }

    return [...groups.values()].sort((a, b) => b.count - a.count);
}
