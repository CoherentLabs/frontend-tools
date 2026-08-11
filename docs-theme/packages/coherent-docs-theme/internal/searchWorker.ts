// ============================================================================
// SEARCH WORKER
// ============================================================================
// Runs Pagefind entirely off the main thread: searching, loading each result's data, and building
// the final HTML for every result. searchClient.ts (the main thread) never touches Pagefind
// directly — it only sends requests here and renders whatever comes back.
//
// Why this needs to be a worker: fetching a result's full data (result.data()) decompresses it
// with a synchronous, hand-rolled pure-JS gzip implementation — real CPU work, not something a
// WASM/native call absorbs for free. Doing that for many results on the main thread required a lot
// of care (a small cap, one result at a time, small yields between each) purely to avoid freezing
// the page. None of that care is needed here, since this thread never paints anything — so this
// file can classify far more candidates, in parallel, and only report back once the final order is
// already known, instead of the main thread showing something and reshuffling it moments later.
//
// File layout: HTML building -> reading page content -> exact-match scoring -> result ranking ->
// building what the main thread renders -> the message protocol -> talking to Pagefind -> handling
// messages from the main thread.

// ---- HTML building ---------------------------------------------------------

const HTML_ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

/** Escapes text for safe insertion into result HTML. */
function escapeHtml(str: unknown): string {
    if (str == null) return "";
    return String(str).replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c] ?? c);
}

/**
 * Wraps every occurrence of `term` in `text` with <mark>, escaping everything else. Used for
 * excerpts in "Exact match" mode, so only the literal matched text gets highlighted — not every
 * word a fuzzy/split query happened to touch (the default-mode highlighting below).
 */
function highlightExactMatches(text: string, term: string): string {
    if (!term) return escapeHtml(text);
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let result = "";
    let cursor = 0;
    let idx = lowerText.indexOf(lowerTerm, cursor);
    if (idx === -1) return escapeHtml(text);
    while (idx !== -1) {
        result += escapeHtml(text.slice(cursor, idx));
        result += `<mark>${escapeHtml(text.slice(idx, idx + term.length))}</mark>`;
        cursor = idx + term.length;
        idx = lowerText.indexOf(lowerTerm, cursor);
    }
    result += escapeHtml(text.slice(cursor));
    return result;
}

// ---- Reading a page's indexed content --------------------------------------

/**
 * Splits a page's indexed content back into words, the same way Pagefind itself does, so the word
 * positions in a result's weighted_locations line up with this array correctly.
 */
function getContentWords(content: string): string[] {
    if (!content) return [];
    return content.includes("​") ? content.split("​") : content.split(/[\r\n\s]+/g);
}

/**
 * Builds a heading-anchored link (page URL + #heading-id), matching how Pagefind links to a
 * section internally — works for both relative and fully-qualified (merged external site) URLs.
 */
function buildAnchoredUrl(url: string, anchorId: string): string {
    try {
        if (/^((https?:)?\/\/)/.test(url)) {
            const u = new URL(url);
            u.hash = anchorId;
            return u.toString();
        }
        const p = /^\//.test(url) ? url : `/${url}`;
        const u = new URL(`https://coherent-labs.com${p}`);
        u.hash = anchorId;
        return u.toString().replace(/^https:\/\/coherent-labs\.com/, "");
    } catch (e) {
        return url;
    }
}

/**
 * Finds which word index the literal term starts at, by re-joining the words with spaces (the
 * same way excerpt windows are joined later) and searching that joined string directly —
 * independent of Pagefind's own weighted_locations, which only reflect whatever its own
 * (sometimes fused/garbled by punctuation stripping) split-query matching found, and can miss a
 * long, punctuation-heavy literal phrase entirely. Returns null if the term doesn't appear
 * anywhere in this page's words at all.
 */
function findLiteralTermWordIndex(words: string[], term: string): number | null {
    if (!term) return null;
    const joined = words.join(" ");
    const charIndex = joined.toLowerCase().indexOf(term.toLowerCase());
    if (charIndex === -1) return null;
    return joined.slice(0, charIndex).split(" ").length - 1;
}

/**
 * Groups a page's search-term matches under their nearest preceding heading and builds a short
 * excerpt for each section — our own replacement for Pagefind's built-in sub-results/excerpt,
 * which picks the section with the highest *summed* weight and so favors sections with many plain
 * words over one with a single code identifier (each syntax-highlighted token is its own
 * low-weight fragment), even when that identifier is the literal searched term.
 */
function buildCustomSubResults(data: any, term: string, exactOnly: boolean) {
    const anchors = (data.anchors || [])
        .filter((a: any) => /^h\d$/i.test(a.element) && a.text?.trim())
        .sort((a: any, b: any) => a.location - b.location);
    if (anchors.length === 0) return [];

    const words = getContentWords(data.content);
    const lowerTerm = (term || "").toLowerCase();

    const findOwner = (location: number) => {
        let owner = null;
        for (const a of anchors) {
            if (a.location <= location) owner = a;
            else break;
        }
        return owner;
    };

    const groups = new Map<any, { items: any[]; literalMatchLocation: number | null }>();
    (data.weighted_locations || []).forEach((wl: any) => {
        const owner = findOwner(wl.location);
        if (!owner) return;
        if (!groups.has(owner)) groups.set(owner, { items: [], literalMatchLocation: null });
        groups.get(owner)!.items.push(wl);
    });

    const literalMatchLocation = findLiteralTermWordIndex(words, term);
    if (literalMatchLocation !== null) {
        const owner = findOwner(literalMatchLocation);
        if (owner) {
            if (!groups.has(owner)) groups.set(owner, { items: [], literalMatchLocation: null });
            groups.get(owner)!.literalMatchLocation = literalMatchLocation;
        }
    }

    const WINDOW = 24;
    return Array.from(groups.entries()).map(([anchor, group]) => {
        const { items, literalMatchLocation } = group;
        // A confirmed literal-phrase position always wins over Pagefind's own best-scored guess —
        // it's not a guess, it's where the term actually is.
        const target: { location: number; balanced_score?: number } =
            literalMatchLocation !== null
                ? { location: literalMatchLocation }
                : items.reduce((best, it) => (!best || it.balanced_score > best.balanced_score ? it : best));

        const start = Math.max(0, target.location - Math.floor(WINDOW / 2));
        const end = Math.min(words.length, start + WINDOW);
        const windowWords = words.slice(start, end);
        const matchLocations = new Set(items.map((it: any) => it.location));
        // Pagefind's own weighted_locations can legitimately omit the exact occurrence
        // findLiteralTermWordIndex confirmed and centered the window on — confirmed empirically:
        // a case mismatch between the query and how Pagefind fused/indexed the token (e.g. querying
        // "virtualallocate" against indexed "VirtualAllocate") can make Pagefind attribute a
        // location elsewhere on the page instead, leaving the visible, centered word unmarked. Add
        // every word position the literal match actually spans, not just what Pagefind reported.
        if (literalMatchLocation !== null) {
            const termWordCount = term.trim().split(/\s+/).filter(Boolean).length || 1;
            for (let i = 0; i < termWordCount; i++) {
                matchLocations.add(literalMatchLocation + i);
            }
        }

        const windowText = windowWords.join(" ");
        const isExactMatch = Boolean(lowerTerm) && windowText.toLowerCase().includes(lowerTerm);

        const excerptHtml = exactOnly
            ? highlightExactMatches(windowText, term)
            : windowWords
                .map((w, i) => {
                    const idx = start + i;
                    const escaped = escapeHtml(w);
                    return matchLocations.has(idx) ? `<mark>${escaped}</mark>` : escaped;
                })
                .join(" ");

        return {
            title: anchor.text,
            url: buildAnchoredUrl(data.url, anchor.id),
            weighted_locations: items,
            excerptHtml,
            isExactMatch,
        };
    });
}

// ---- Deciding what counts as an exact match, and how good a match it is ----

/**
 * True if the search term is in the page title, or in at least one section with real, displayable
 * content — never true just because the term appears somewhere in the page's raw text with
 * nothing visible on screen to point to.
 */
function pageQualifiesAsExactOnly(data: any, term: string): boolean {
    if ((data.meta?.title || "").toLowerCase().includes(term.toLowerCase())) return true;
    return buildCustomSubResults(data, term, true).some((s: any) => s.isExactMatch);
}

/**
 * Scores how precisely a title matches the search term: 3 = title is exactly the term, 2 = title
 * starts with the term, 1 = term appears somewhere in the title, 0 = no title match at all.
 * pageQualifiesAsExactOnly can't tell "Data Binding" apart from "Extending the Data Binding
 * System" — both simply "contain the term" — so this is what breaks the tie between multiple
 * exact matches and puts the more precise one first.
 */
function titleMatchScore(title: string | undefined, term: string): number {
    const lowerTitle = (title || "").toLowerCase();
    const lowerTerm = term.toLowerCase();
    if (lowerTitle === lowerTerm) return 3;
    if (lowerTitle.startsWith(lowerTerm)) return 2;
    if (lowerTitle.includes(lowerTerm)) return 1;
    return 0;
}

interface ClassifiedResult {
    result: any; // the raw Pagefind result object
    data: any; // its resolved fragment: title, content, anchors, weighted_locations, url, ...
    isExact: boolean;
    titleScore: number;
}

/** Fetches one result's full data and classifies it — is it an exact match, and how good a one. */
async function classifyResult(result: any, term: string): Promise<ClassifiedResult> {
    const data = await result.data();
    return {
        result,
        data,
        isExact: pageQualifiesAsExactOnly(data, term),
        titleScore: titleMatchScore(data.meta?.title, term),
    };
}

// ---- Ranking results --------------------------------------------------------

// Changelog/release-notes/API-reference pages are useful but rarely what someone searching by
// topic wants to land on first. The theme already gives them a low Pagefind index weight, but a
// low weight only nudges Pagefind's own score — it doesn't guarantee they lose to every other
// match, so this is enforced explicitly here instead.
const DEPRIORITIZED_PATH_SEGMENTS = ["/changelog", "/releases", "/api_reference"];
function isDeprioritized(url: string): boolean {
    const lower = url.toLowerCase();
    return DEPRIORITIZED_PATH_SEGMENTS.some((segment) => lower.includes(segment));
}

function filterAndSeparate(arr: any[], predicate: (item: any, index: number, array: any[]) => boolean): [any[], any[]] {
    const matched = [];
    const notMatched = [];

    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i], i, arr)) {
            matched.push(arr[i]);
        } else {
            notMatched.push(arr[i]);
        }
    }

    return [matched, notMatched];
};

/**
 * Orders one group of same-exactness results (all exact, or all non-exact): deprioritized pages
 * (see isDeprioritized) sink to the bottom of the group. Exact-match groups are additionally
 * sorted by titleScore, so the most precise title wins; non-exact groups otherwise keep the order
 * they arrived in (Pagefind's own relevance ranking, already reordered by the exact-search hint —
 * see fetchExactSearchHint).
 */
function rankGroup(group: ClassifiedResult[], isExactGroup: boolean): ClassifiedResult[] {
    const [primary, deprioritized] = filterAndSeparate(group, (c) => !isDeprioritized(c.data.url));
    const sortByTitle = (a: ClassifiedResult, b: ClassifiedResult) => (isExactGroup ? b.titleScore - a.titleScore : 0);

    return [...primary.sort(sortByTitle), ...deprioritized.sort(sortByTitle)];
}

/**
 * Full display order: every exact match (best-ranked first, deprioritized pages last within that
 * group), then — unless `onlyExact` is filtering them out entirely — every non-exact match, with
 * the same deprioritization rule applied to that group separately. A changelog entry never
 * outranks a real doc page, exact or not, but can still outrank an unrelated changelog entry.
 */
function rankResults(exact: ClassifiedResult[], nonExact: ClassifiedResult[], onlyExact: boolean): ClassifiedResult[] {
    const rankedExact = rankGroup(exact, true);
    if (onlyExact) return rankedExact;
    return [...rankedExact, ...rankGroup(nonExact, false)];
}

// ---- Building what the main thread renders ---------------------------------

const NESTED_SUBRESULT_LIMIT = 5; // max sub-results to show per page result

// Cosmetic-only badge overrides for things that aren't real Pagefind filter values today (e.g.
// UI Tools' individual sub-projects). Real documentation/engine values drive the default badge
// for everything else.
const badgesConfig: Record<string, { text: string; color: string }> = {
    "frontend-tools.coherent-labs.com/e2e": { text: "UI Tools | Gameface E2E", color: "#007aaa" },
    "frontend-tools.coherent-labs.com/interaction-manager": { text: "UI Tools | Interaction Manager", color: "#007abb" },
    "frontend-tools.coherent-labs.com/gameface-vite-plugin": { text: "UI Tools | Gameface Vite Plugin", color: "#007acc" },
    "frontend-tools.coherent-labs.com/vite-solid-style-to-css-plugin": { text: "UI Tools | Solid Style to CSS Plugin", color: "#007add" },
    "frontend-tools.coherent-labs.com/vite-gameface-style-transformer": { text: "UI Tools | Vite Style Transformer", color: "#007add" },
    "frontend-tools.coherent-labs.com/eslint-plugin-gameface": { text: "UI Tools | ESLint Plugin", color: "#007add" },
    "frontend-tools.coherent-labs.com/data-binding-autocomplete": { text: "UI Tools | Data Binding Autocomplete", color: "#007aee" },
    "frontend-tools.coherent-labs.com": { text: "UI Tools", color: "#007aff" },
    "gameface-ui.coherent-labs.com": { text: "Gameface UI", color: "#e24a4a" },
    "guide.coherent-labs.com": { text: "UI Workflow Guide", color: "#2a8500" },
    "docs.coherent-labs.com/cpp-gameface": { text: "Gameface Custom Engine", color: "#C35A1C" },
    "docs.coherent-labs.com/cpp-prysm": { text: "Prysm Custom Engine", color: "#00897B" },
    "docs.coherent-labs.com/unity-gameface": { text: "Gameface Unity", color: "#C35A1C" },
    "docs.coherent-labs.com/unity-prysm": { text: "Prysm Unity", color: "#00897B" },
    "docs.coherent-labs.com/unreal-gameface": { text: "Gameface Unreal", color: "#C35A1C" },
    "docs.coherent-labs.com/unreal-prysm": { text: "Prysm Unreal", color: "#00897B" },
};

function getBadge(data: any) {
    for (const key in badgesConfig) {
        if (data.url.includes(key)) return badgesConfig[key];
    }
    const doc = data.filters?.documentation?.[0];
    const eng = data.filters?.engine?.[0];
    if (doc) return { text: eng ? `${doc} ${eng}` : doc, color: "#883aea" };
    return null;
}

/**
 * Turns one classified result into the plain object the main thread renders directly — HTML
 * already escaped, sub-results already picked and sorted — so nothing Pagefind-specific is left
 * for the main thread to compute.
 */
function buildRenderableResult(data: any, term: string, onlyExact: boolean, isExact: boolean): RenderableResult {
    let nested = buildCustomSubResults(data, term, onlyExact);
    if (onlyExact) nested = nested.filter((s) => s.isExactMatch);

    // Within one page's own sections: exact ones first, then by strongest single match (one
    // strong hit beats many weak ones, so this takes the max score rather than summing).
    const sectionScore = (s: any) =>
        (s.weighted_locations || []).reduce((max: number, l: any) => Math.max(max, l.balanced_score || 0), 0);
    nested = [...nested]
        .sort((a, b) => {
            const exactDiff = Number(b.isExactMatch) - Number(a.isExactMatch);
            if (exactDiff !== 0) return exactDiff;
            return sectionScore(b) - sectionScore(a);
        })
        .slice(0, NESTED_SUBRESULT_LIMIT);

    const badge = getBadge(data);
    const badgeHtml = badge
        ? `<span class="coh-result-badge" style="background-color:${badge.color}">${escapeHtml(badge.text)}</span>`
        : "";

    return {
        id: data.url,
        url: data.url,
        titleText: data.meta?.title || data.url,
        titleHtml: escapeHtml(data.meta?.title || data.url),
        badgeHtml,
        subResults: nested.map((s: any) => ({
            url: s.url,
            titleHtml: escapeHtml(s.title),
            excerptHtml: s.excerptHtml,
        })),
        isExact,
    };
}

// ============================================================================
// MESSAGE PROTOCOL
// ============================================================================
// Imported as type-only by searchClient.ts — erased at compile time, so this doesn't pull any
// worker code onto the main thread, just the shapes below.

export interface MergeIndexConfig {
    bundlePath: string;
    indexWeight: number;
    mergeFilter: Record<string, string>;
}

export interface RenderableResult {
    id: string;
    url: string;
    titleText: string;
    titleHtml: string;
    badgeHtml: string;
    subResults: Array<{ url: string; titleHtml: string; excerptHtml: string }>;
    isExact: boolean;
}

export interface ExactMatchStatus {
    count: number;
    fullyScanned: boolean;
}

export type MainToWorkerMessage =
    | { type: "init"; baseUrl: string; mergeIndexes: MergeIndexConfig[] }
    | { type: "facetCounts"; requestId: number; query: string; documentation: string | null; engineValues: string[] }
    | {
        type: "search";
        requestId: number;
        query: string;
        exactMatchTerm: string;
        documentation: string | null;
        engine: string | null;
        types: string[];
        typeValues: string[];
        onlyExact: boolean;
    }
    | { type: "loadMore"; requestId: number; count: number };

export type WorkerToMainMessage =
    | { type: "ready"; typeValues: string[] }
    | { type: "initError"; message: string }
    | { type: "mergeComplete"; typeValues: string[] }
    | { type: "facetCountsResult"; requestId: number; documentationCounts: Record<string, number>; engineCounts: Record<string, number> }
    | {
        type: "searchResult";
        requestId: number;
        typeCounts: Record<string, number>;
        results: RenderableResult[];
        tailCount: number;
        exactMatchStatus: ExactMatchStatus;
    }
    | {
        type: "loadMoreResult";
        requestId: number;
        results: RenderableResult[];
        tailCount: number;
        exactMatchStatus: ExactMatchStatus;
    }
    | { type: "warn"; message: string };

// ============================================================================
// WORKER STATE
// ============================================================================

let pagefind: any;
let TYPE_VALUES: string[] = [];
// Bumped to the requestId of the most recent message the worker has seen — lets a long-running
// classification (classifyPrefix) notice it's been superseded and stop early instead of finishing
// pointless work for a query the user has already moved on from.
let latestRequestId = 0;
// The current request's *unclassified* Pagefind result objects, held onto so a later `loadMore`
// for the same requestId can classify further into the same set without re-querying Pagefind.
// These objects hold un-clonable .data() closures and can never themselves cross postMessage —
// that's the whole reason this needs to be retained worker-side rather than sent to the main
// thread and back. Replaced (not merged) on every new `search` — only ever one request's worth.
let retainedTail: { requestId: number; term: string; onlyExact: boolean; stubs: any[] } | null = null;

// ============================================================================
// TALKING TO PAGEFIND
// ============================================================================

async function getTypeValues(): Promise<string[]> {
    try {
        const filters = await pagefind.filters();
        return Object.keys(filters.type || {}).sort();
    } catch (e) {
        postMessage({ type: "warn", message: `Failed to fetch Pagefind type filters: ${e}` } satisfies WorkerToMainMessage);
        return [];
    }
}

async function mergeExternalIndexes(mergeIndexes: MergeIndexConfig[]) {
    if (!mergeIndexes || mergeIndexes.length === 0) return;

    const results = await Promise.all(
        mergeIndexes.map(async (idx) => {
            try {
                const url = `${idx.bundlePath.replace(/\/$/, "")}/pagefind-entry.json`;
                const res = await fetch(url, { method: "HEAD" });
                return res.ok;
            } catch (e) {
                console.warn(`Failed to get external index - ${idx.bundlePath}: ${e}`);
                return false;
            }
        }),
    );

    const validIndexes = mergeIndexes.filter((_, i) => results[i]);

    await Promise.all(
        validIndexes.map((idx) =>
            pagefind
                .mergeIndex(idx.bundlePath, { mergeFilter: idx.mergeFilter, indexWeight: idx.indexWeight })
                .catch((err: unknown) => {
                    postMessage({ type: "warn", message: `Failed to merge index ${idx.bundlePath}: ${err}` } satisfies WorkerToMainMessage);
                }),
        ),
    );
}

/**
 * Runs the main results query. Pagefind ANDs multiple values of the same filter key (verified
 * directly), so when more than one content type is selected a single query would always return
 * zero results — this runs one query per selected type instead and merges/de-dupes by result id,
 * keeping whichever copy scored higher.
 */
async function fetchCandidates(query: string, baseFilters: Record<string, string[]>, types: string[]): Promise<any[]> {
    if (types.length <= 1) {
        const filters = types.length === 1 ? { ...baseFilters, type: types } : baseFilters;
        const res = await pagefind.search(query, { filters });
        return res.results;
    }
    const perType = await Promise.all(types.map((t) => pagefind.search(query, { filters: { ...baseFilters, type: [t] } })));
    const byId = new Map<string, any>();
    perType.forEach((res: any) => {
        res.results.forEach((r: any) => {
            const existing = byId.get(r.id);
            if (!existing || r.score > existing.score) byId.set(r.id, r);
        });
    });
    return Array.from(byId.values()).sort((a: any, b: any) => b.score - a.score);
}

/**
 * Pagefind treats a quoted query as a phrase/exact search internally and re-ranks accordingly
 * (verified directly in its source: `exact_search = /^\s*".+"\s*$/.test(term)`, passed into its
 * WASM ranking — and empirically: searching the unquoted "getting started" ranked "Getting
 * Started 2" above the page literally titled "Getting Started"; the quoted form got that right).
 * Only ever used as an ordering hint for classifyPrefix, never as a source of truth — on a large,
 * real index this alone still wasn't reliable enough (see titleMatchScore/isDeprioritized for the
 * checks that actually decide the final order). Returns null rather than throwing on failure, so a
 * hint outage never breaks the main search.
 */
async function fetchExactSearchHint(query: string, baseFilters: Record<string, string[]>): Promise<any[] | null> {
    try {
        const res = await pagefind.search(`"${query}"`, { filters: baseFilters });
        return res.results;
    } catch (e) {
        return null;
    }
}

/** Reorders `results` to match the exact-search hint's order where a result appears in both. */
function reorderByExactSearchHint(results: any[], hintResults: any[]): any[] {
    const byId = new Map(results.map((r) => [r.id, r]));
    const prioritized: any[] = [];
    const seen = new Set<string>();
    hintResults.forEach((hint) => {
        const match = byId.get(hint.id);
        if (match && !seen.has(match.id)) {
            prioritized.push(match);
            seen.add(match.id);
        }
    });
    results.forEach((r) => {
        if (!seen.has(r.id)) {
            prioritized.push(r);
            seen.add(r.id);
        }
    });
    return prioritized;
}

/** One search per known content-type value, purely to show a count on each type filter button. */
async function fetchTypeCounts(
    query: string,
    baseFilters: Record<string, string[]>,
    documentation: string | null,
    typeValues: string[],
): Promise<Record<string, number>> {
    if (!documentation) return {};
    const results = await Promise.all(typeValues.map((t) => pagefind.search(query, { filters: { ...baseFilters, type: [t] } })));
    const counts: Record<string, number> = {};
    typeValues.forEach((t, i) => {
        counts[t] = results[i].results.length;
    });
    return counts;
}

function buildBaseFilters(documentation: string | null, engine: string | null): Record<string, string[]> {
    const filters: Record<string, string[]> = {};
    if (documentation) filters.documentation = [documentation];
    if (engine) filters.engine = [engine];
    return filters;
}

// ============================================================================
// HANDLING MESSAGES FROM THE MAIN THREAD
// ============================================================================

async function handleInit(msg: Extract<MainToWorkerMessage, { type: "init" }>) {
    try {
        // A worker is exactly as window-less as plain Node — confirmed against
        // docs-theme/docs/pagefind-test.mjs, which already runs pagefind.js successfully there.
        // Pagefind's isBrowser-gated basePath auto-derivation never fires in either context, so it
        // must be set explicitly instead of relying on it.
        pagefind = await import(/* @vite-ignore */ `${msg.baseUrl}/pagefind/pagefind.js`);
        await pagefind.options({ basePath: `${msg.baseUrl}/pagefind/` });
        await pagefind.init();
        TYPE_VALUES = await getTypeValues();
        postMessage({ type: "ready", typeValues: TYPE_VALUES } satisfies WorkerToMainMessage);
    } catch (err) {
        postMessage({ type: "initError", message: String(err) } satisfies WorkerToMainMessage);
        return;
    }

    // Runs after `ready` rather than blocking it, so the UI becomes interactive immediately; a
    // query typed before merging finishes just runs against a partial index, and mergeComplete
    // (below) tells the main thread to re-run the active query once the rest has arrived.
    mergeExternalIndexes(msg.mergeIndexes)
        .catch((err) => {
            postMessage({ type: "warn", message: `Failed to merge external Pagefind indexes: ${err}` } satisfies WorkerToMainMessage);
        })
        .finally(async () => {
            TYPE_VALUES = await getTypeValues();
            postMessage({ type: "mergeComplete", typeValues: TYPE_VALUES } satisfies WorkerToMainMessage);
        });
}

/**
 * Documentation + per-engine result counts, for the top two filter tiers. Always replies, even for
 * a since-superseded requestId: these are plain facet lookups with no .data() fetching, so there's
 * no real cost worth aborting for — and the main thread's postAndWait for this requestId needs an
 * answer regardless, or it would hang forever waiting for a reply that never comes.
 */
async function handleFacetCounts(msg: Extract<MainToWorkerMessage, { type: "facetCounts" }>) {
    const [docRes, engineResults] = await Promise.all([
        pagefind.search(msg.query, {}),
        msg.documentation
            ? Promise.all(
                msg.engineValues.map((eng) =>
                    pagefind.search(msg.query, { filters: { documentation: [msg.documentation], engine: [eng] } }),
                ),
            )
            : Promise.resolve(null),
    ]);

    const documentationCounts = docRes.filters?.documentation || {};
    const engineCounts: Record<string, number> = {};
    if (engineResults) {
        msg.engineValues.forEach((eng, i) => {
            engineCounts[eng] = engineResults[i].results.length;
        });
    }
    postMessage({
        type: "facetCountsResult",
        requestId: msg.requestId,
        documentationCounts,
        engineCounts,
    } satisfies WorkerToMainMessage);
}

// How many candidates get fully classified (fetched + checked) before handleSearch replies at
// all, and how many of those run at once.
const SCAN_CONFIDENCE_CAP = 100;
const CLASSIFY_CONCURRENCY = 16;
// In "Exact match" mode, handleLoadMore keeps classifying batches from the tail until it finds
// enough exact matches to satisfy the request — bounded by this, so a query with few or none left
// can't turn a single "Load more" click into scanning the whole remaining tail.
const LOAD_MORE_SCAN_CAP = 150;

/**
 * Classifies up to SCAN_CONFIDENCE_CAP candidates, CLASSIFY_CONCURRENCY at a time, checking after
 * each wave whether a newer request has since arrived and bailing out (returning null) if so.
 * Whatever's left past the cap comes back as `tailStubs`, picked up later only if "Load more"
 * actually reaches that far (see handleLoadMore) — not scanned proactively in the background.
 */
async function classifyPrefix(candidates: any[], term: string, requestId: number) {
    const toScan = candidates.slice(0, SCAN_CONFIDENCE_CAP);
    const exact: ClassifiedResult[] = [];
    const nonExact: ClassifiedResult[] = [];

    for (let i = 0; i < toScan.length; i += CLASSIFY_CONCURRENCY) {
        if (requestId !== latestRequestId) return null;
        const wave = toScan.slice(i, i + CLASSIFY_CONCURRENCY);
        const classified = await Promise.all(wave.map((r) => classifyResult(r, term)));

        classified.forEach((c) => (c.isExact ? exact : nonExact).push(c));
    }
    return { exact, nonExact, tailStubs: candidates.slice(toScan.length) };
}

/**
 * The main search: runs the results query, the exact-search hint, and the per-type counts in
 * parallel, then classifies and ranks a confidence-prefix of candidates before replying — see
 * classifyPrefix and rankResults for why the reply only ever happens once, already in final order.
 */
async function handleSearch(msg: Extract<MainToWorkerMessage, { type: "search" }>) {
    const baseFilters = buildBaseFilters(msg.documentation, msg.engine);

    const [candidates, exactSearchHint, typeCounts] = await Promise.all([
        fetchCandidates(msg.query, baseFilters, msg.types),
        fetchExactSearchHint(msg.query, baseFilters),
        fetchTypeCounts(msg.query, baseFilters, msg.documentation, msg.typeValues),
    ]);

    const orderedCandidates = exactSearchHint ? reorderByExactSearchHint(candidates, exactSearchHint) : candidates;

    const classified = await classifyPrefix(orderedCandidates, msg.exactMatchTerm, msg.requestId);
    if (!classified) {
        // Superseded mid-classification — still reply (with nothing), or the main thread's
        // postAndWait for this requestId hangs forever; its own requestId check discards this
        // immediately anyway.
        postMessage({
            type: "searchResult",
            requestId: msg.requestId,
            typeCounts,
            results: [],
            tailCount: 0,
            exactMatchStatus: { count: 0, fullyScanned: true },
        } satisfies WorkerToMainMessage);
        return;
    }

    retainedTail = {
        requestId: msg.requestId,
        term: msg.exactMatchTerm,
        onlyExact: msg.onlyExact,
        stubs: classified.tailStubs,
    };

    const ranked = rankResults(classified.exact, classified.nonExact, msg.onlyExact);
    const results = ranked.map((c) => buildRenderableResult(c.data, msg.exactMatchTerm, msg.onlyExact, c.isExact));

    postMessage({
        type: "searchResult",
        requestId: msg.requestId,
        typeCounts,
        results,
        tailCount: classified.tailStubs.length,
        exactMatchStatus: { count: classified.exact.length, fullyScanned: classified.tailStubs.length === 0 },
    } satisfies WorkerToMainMessage);
}

/**
 * Classifies further into the tail left over from handleSearch (past SCAN_CONFIDENCE_CAP), on
 * demand only — when the user pages deep enough to exhaust what's already been classified. Not a
 * proactive background scan: a genuine match ranked beyond the (already generous) 200-item
 * confidence prefix is treated as a rare case reachable via "Load more" rather than one that needs
 * unprompted, indefinite background work.
 */
async function handleLoadMore(msg: Extract<MainToWorkerMessage, { type: "loadMore" }>) {
    if (!retainedTail || retainedTail.requestId !== msg.requestId) {
        postMessage({
            type: "loadMoreResult",
            requestId: msg.requestId,
            results: [],
            tailCount: 0,
            exactMatchStatus: { count: 0, fullyScanned: true },
        } satisfies WorkerToMainMessage);
        return;
    }

    const { term, onlyExact, stubs } = retainedTail;
    const exact: ClassifiedResult[] = [];
    const nonExact: ClassifiedResult[] = [];
    let consumed = 0;

    // In "Exact match" mode, a single fixed-size batch of stubs can easily come back with zero
    // exact matches (they're comparatively rare among random candidates) — classifying just
    // msg.count and stopping there would silently consume tail stubs without ever showing the
    // user anything new, reported directly as needing several clicks before results appeared.
    // Keep classifying further batches until msg.count *exact* matches have been found, capped at
    // LOAD_MORE_SCAN_CAP so a query with few or no exact matches left in the tail can't turn one
    // click into scanning the entire remainder. Default (non-exact) mode needs none of this —
    // every classified stub counts toward msg.count regardless of isExact, so a fixed single batch
    // was never at risk of coming back empty.
    const scanCap = onlyExact ? Math.min(stubs.length, LOAD_MORE_SCAN_CAP) : Math.min(stubs.length, msg.count);
    while (consumed < scanCap) {
        if (onlyExact ? exact.length >= msg.count : consumed >= msg.count) break;
        const batchSize = Math.min(CLASSIFY_CONCURRENCY, scanCap - consumed);
        const batch = stubs.slice(consumed, consumed + batchSize);
        const classified = await Promise.all(batch.map((r) => classifyResult(r, term)));
        classified.forEach((c) => (c.isExact ? exact : nonExact).push(c));
        consumed += batch.length;
    }

    const remainingStubs = stubs.slice(consumed);
    retainedTail = { ...retainedTail, stubs: remainingStubs };

    const ranked = rankResults(exact, nonExact, onlyExact);
    const results = ranked.map((c) => buildRenderableResult(c.data, term, onlyExact, c.isExact));

    postMessage({
        type: "loadMoreResult",
        requestId: msg.requestId,
        results,
        tailCount: remainingStubs.length,
        exactMatchStatus: { count: exact.length, fullyScanned: remainingStubs.length === 0 },
    } satisfies WorkerToMainMessage);
}

onmessage = (e: MessageEvent<MainToWorkerMessage>) => {
    const msg = e.data;
    if (msg.type !== "init") latestRequestId = Math.max(latestRequestId, "requestId" in msg ? msg.requestId : 0);
    switch (msg.type) {
        case "init":
            handleInit(msg);
            break;
        case "facetCounts":
            handleFacetCounts(msg);
            break;
        case "search":
            handleSearch(msg);
            break;
        case "loadMore":
            handleLoadMore(msg);
            break;
    }
};
