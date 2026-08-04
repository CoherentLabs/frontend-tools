import type {
    ExactMatchStatus,
    MainToWorkerMessage,
    MergeIndexConfig,
    RenderableResult,
    WorkerToMainMessage,
} from "./searchWorker";

const RESULTS_PAGE_SIZE = 8;
// Don't show the loading bar at all if a query resolves within this window, so fast local
// Pagefind lookups never flicker it on/off. If a query does run longer, show it for at
// least MIN_VISIBLE_MS so it doesn't itself flash too briefly to register.
const LOADING_DELAY_MS = 200;
const MIN_VISIBLE_MS = 300;
const MIN_SPLIT_TOKEN_LENGTH = 3;
const INPUT_DEBOUNCE_MS = 250;
// How far down .dialog-frame the user needs to have scrolled before "back to top" is worth
// showing — roughly one modal's worth of results, so it doesn't appear for a list short enough
// that scrolling back up is already trivial.
const BACK_TO_TOP_THRESHOLD_PX = 400;

let TYPE_VALUES: string[] = [];

/**
 * Splits a single-token query into searchable words by separating common compound formats.
 *
 * Handles separators (`.`, `_`, `-`) and casing boundaries (camelCase, PascalCase, acronym + word),
 * then drops fragments shorter than `MIN_SPLIT_TOKEN_LENGTH` to avoid noisy matches.
 * If every fragment is short, the unfiltered split is returned to keep the query non-empty.
 */
function splitCompoundQuery(term: string): string {
    if (/\s/.test(term)) return term;
    const split = term
        .replace(/[._-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1 $2")
        .trim();
    if (split === term) return term;

    const filtered = split.split(/\s+/).filter((word) => word.length >= MIN_SPLIT_TOKEN_LENGTH);
    return filtered.length > 0 ? filtered.join(" ") : split;
}

interface SearchConfig {
    documentation: string | null;
    engine: string | null;
    tagManagerId: string | null;
    baseUrl: string;
    isDev: boolean;
    mergeIndexes: MergeIndexConfig[];
    documentationValues: string[];
    engineValues: string[];
    documentationEngines: Record<string, string[]>;
}

// ---- SiteSearch: modal chrome, forked from Starlight's own Search.astro. Always active
// (even in dev, where only the Pagefind-specific init below is skipped), so open/close/Ctrl+K
// and the dev-mode notice keep working regardless.
class SiteSearch extends HTMLElement {
    constructor() {
        super();
        const openBtn = this.querySelector("button[data-open-modal]") as HTMLButtonElement | null;
        const closeBtn = this.querySelector("button[data-close-modal]");
        const dialog = this.querySelector("dialog");
        const dialogFrame = this.querySelector(".dialog-frame");
        const backToTopBtn = this.querySelector(".coh-back-to-top");
        if (!openBtn || !dialog || !dialogFrame) return;

        let mouseDownOutside = false;
        const isMouseOutsideModal = (target: Node) => {
            return (
                document.body.contains(target) &&
                !dialogFrame.contains(target) &&
                !backToTopBtn?.contains(target)
            );
        };

        const onMouseDown = (event: MouseEvent) => {
            mouseDownOutside = isMouseOutsideModal(event.target as Node);
        };

        const onClick = (event: MouseEvent) => {
            const isLink = "href" in (event.target || ({} as any));
            if (isLink || (mouseDownOutside && isMouseOutsideModal(event.target as Node))) {
                closeModal();
            }
        };

        const openModal = (event?: Event) => {
            dialog.showModal();
            document.body.toggleAttribute("data-search-modal-open", true);
            this.querySelector("input")?.focus();
            event?.stopPropagation();
            window.addEventListener("mousedown", onMouseDown);
            window.addEventListener("click", onClick);
        };

        const closeModal = () => dialog.close();

        openBtn.addEventListener("click", openModal);
        openBtn.disabled = false;
        closeBtn?.addEventListener("click", closeModal);

        dialog.addEventListener("close", () => {
            document.body.toggleAttribute("data-search-modal-open", false);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("click", onClick);
        });

        window.addEventListener("keydown", (e) => {
            if ((e.metaKey === true || e.ctrlKey === true) && e.key === "k") {
                dialog.open ? closeModal() : openModal();
                e.preventDefault();
            }
        });

        let translations: Record<string, string> = {};
        try {
            translations = JSON.parse(this.dataset.translations || "{}");
        } catch { }

        let config: SearchConfig;
        try {
            config = JSON.parse(this.dataset.config || "{}");
        } catch {
            console.warn("Failed to parse search config");
            return;
        }

        const shouldStrip = this.dataset.stripTrailingSlash !== undefined;
        const stripTrailingSlash = (path: string) => path.replace(/(.)\/(#.*)?$/, "$1$2");
        const formatURL = shouldStrip ? stripTrailingSlash : (path: string) => path;

        window.addEventListener("DOMContentLoaded", () => {
            if (config.isDev) return;
            const onIdle =
                (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));
            onIdle(() => initSearch(this, dialog, translations, formatURL, config));
        });
    }
}
customElements.define("site-search", SiteSearch);

let initialized = false;
const WORKER_INIT_TIMEOUT_MS = 8000;

async function initSearch(
    rootEl: HTMLElement,
    dialog: HTMLDialogElement,
    translations: Record<string, string>,
    formatURL: (path: string) => string,
    config: SearchConfig,
) {
    if (initialized) return;
    initialized = true;

    const container = rootEl.querySelector("#coherent-search") as HTMLElement | null;
    if (!container || !dialog) return;

    const worker = new Worker(new URL("./searchWorker.ts", import.meta.url), { type: "module" });

    const readyResult = await new Promise<{ ok: true; typeValues: string[] } | { ok: false }>((resolve) => {
        const timeout = setTimeout(() => resolve({ ok: false }), WORKER_INIT_TIMEOUT_MS);

        worker.onmessage = (e: MessageEvent<WorkerToMainMessage>) => {
            if (e.data.type === "ready") {
                clearTimeout(timeout);
                resolve({ ok: true, typeValues: e.data.typeValues });
            } else if (e.data.type === "initError") {
                clearTimeout(timeout);
                console.warn("Failed to load Pagefind", e.data.message);
                resolve({ ok: false });
            }
        };

        worker.postMessage({
            type: "init",
            baseUrl: config.baseUrl,
            mergeIndexes: config.mergeIndexes || [],
        } satisfies MainToWorkerMessage);
    });

    if (!readyResult.ok) {
        worker.terminate();
        return;
    }

    TYPE_VALUES = readyResult.typeValues;
    new CoherentSearchUI(dialog, container, worker, translations, formatURL, config);
}

class CoherentSearchUI {
    worker: Worker;
    translations: Record<string, string>;
    formatURL: (path: string) => string;
    container: HTMLElement;
    dialog: HTMLDialogElement;
    config: SearchConfig;

    input!: HTMLInputElement;
    clearBtn!: HTMLElement;
    messageEl!: HTMLElement;
    refiningIndicatorEl!: HTMLElement;
    resultsEl!: HTMLElement;
    loadMoreBtn!: HTMLButtonElement;
    loadMoreObserver!: IntersectionObserver;
    backToTopBtn!: HTMLButtonElement;
    loadingBar!: HTMLElement;
    exactMatchToggle!: HTMLInputElement;
    tierEls!: { documentation: HTMLElement; engine: HTMLElement; type: HTMLElement };
    tierGroupEls!: { engine: HTMLElement; type: HTMLElement };

    state: any;
    currentResults: RenderableResult[] = [];
    tailCount = 0;
    visibleCount = RESULTS_PAGE_SIZE;
    queryToken = 0;
    debounceTimer: any = null;
    loadingShowTimer: any = null;
    contentCommitted = false;
    loadingStartedAt = 0;
    exactMatchStatus: ExactMatchStatus | null = null;
    pendingReplies: Map<string, (msg: any) => void> = new Map();

    constructor(
        dialog: HTMLDialogElement,
        container: HTMLElement,
        worker: Worker,
        translations: Record<string, string>,
        formatURL: (path: string) => string,
        config: SearchConfig,
    ) {
        this.worker = worker;
        this.worker.onmessage = (e: MessageEvent<WorkerToMainMessage>) => this.handleWorkerMessage(e.data);
        this.translations = translations || {};
        this.formatURL = formatURL;
        this.container = container;
        this.dialog = dialog;
        this.config = config;

        this.input = container.querySelector(".coh-input")!;
        this.clearBtn = container.querySelector(".coh-clear")!;
        this.messageEl = container.querySelector(".coh-message")!;
        this.refiningIndicatorEl = container.querySelector(".coh-refining-indicator")!;
        this.resultsEl = container.querySelector(".coh-results")!;
        this.loadMoreBtn = container.querySelector(".coh-load-more")!;
        this.backToTopBtn = this.dialog.querySelector(".coh-back-to-top")!;
        this.loadingBar = this.dialog.querySelector(".coh-loading-bar")!;
        this.exactMatchToggle = container.querySelector(".coh-exact-match-toggle")!;
        this.tierEls = {
            documentation: container.querySelector('[data-tier="documentation"]')!,
            engine: container.querySelector('[data-tier="engine"]')!,
            type: container.querySelector('[data-tier="type"]')!,
        };
        this.tierGroupEls = {
            engine: container.querySelector('[data-tier-group="engine"]')!,
            type: container.querySelector('[data-tier-group="type"]')!,
        };

        if (this.config.tagManagerId) {
            this.resultsEl.addEventListener("click", (event) => {
                const target = event.target as HTMLElement | null;
                const link = target?.closest(".coh-result-link") as HTMLAnchorElement | null;
                if (!link || !this.resultsEl.contains(link)) return;

                const li = link.closest("li.coh-result") as HTMLElement | null;
                if (!li) return;

                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                    event: "liveSearch",
                    searchTerm: this.input.value,
                    clickedResult: li.dataset.resultTitle || "",
                    clickedUrl: li.dataset.resultUrl || link.getAttribute("href") || "",
                });
            });
        }

        // Pre-selected from this site's own theme config, so opening search from within e.g. the
        // Gameface Custom Engine docs already has "Gameface" + "Custom Engine" active.
        this.state = {
            documentation: config.documentation || null,
            engine: config.engine || null,
            // True only once the user explicitly picks the engine "All" tab, so the
            // Gameface/Prysm -> "Custom Engine" default below doesn't fight that choice.
            engineExplicitlyAll: false,
            types: new Set(),
            // Exact-match reordering itself now always runs (see runQuery) — this only
            // controls whether non-exact results get filtered out of the list entirely.
            exactMatchOnly: false,
        };

        this.input.addEventListener("input", () => {
            this.clearBtn.classList.toggle("coh-clear--visible", Boolean(this.input.value));
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.runQuery(), INPUT_DEBOUNCE_MS);
        });

        this.clearBtn.addEventListener("click", () => {
            this.input.value = "";
            this.clearBtn.classList.remove("coh-clear--visible");
            this.runQuery();
            this.input.focus();
        });

        this.loadMoreBtn.addEventListener("click", () => this.triggerLoadMore());

        const dialogFrame = this.dialog.querySelector(".dialog-frame");
        this.loadMoreObserver = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting) && !this.loadMoreBtn.hidden && !this.loadMoreBtn.disabled) {
                    this.triggerLoadMore();
                }
            },
            { root: dialogFrame, rootMargin: "200px" },
        );
        this.loadMoreObserver.observe(this.loadMoreBtn);

        let scrollCheckQueued = false;
        dialogFrame?.addEventListener(
            "scroll",
            () => {
                if (scrollCheckQueued) return;
                scrollCheckQueued = true;
                requestAnimationFrame(() => {
                    scrollCheckQueued = false;
                    this.backToTopBtn.hidden = dialogFrame.scrollTop < BACK_TO_TOP_THRESHOLD_PX;
                });
            },
            { passive: true },
        );

        this.backToTopBtn.addEventListener("click", () => {
            dialogFrame?.scrollTo({ top: 0, behavior: "smooth" });
        });

        this.exactMatchToggle.addEventListener("click", () => {
            this.state.exactMatchOnly = !this.state.exactMatchOnly;
            this.exactMatchToggle.classList.toggle(
                "coh-filter-btn--active",
                this.state.exactMatchOnly,
            );
            this.exactMatchToggle.setAttribute("aria-pressed", String(this.state.exactMatchOnly));
            this.runQuery();
        });

        this.runQuery();
    }

    refreshAfterMerge() {
        if (this.input.value.trim()) this.runQuery();
    }

    handleWorkerMessage(msg: WorkerToMainMessage) {
        if (msg.type === "mergeComplete") {
            TYPE_VALUES = msg.typeValues;
            this.refreshAfterMerge();
            return;
        }
        if (msg.type === "warn") return console.warn(msg.message);
        if (msg.type === "ready" || msg.type === "initError") return;

        const key = `${msg.requestId}:${msg.type}`;
        const resolve = this.pendingReplies.get(key);
        if (resolve) {
            this.pendingReplies.delete(key);
            resolve(msg);
        }
    }

    postAndWait<T extends WorkerToMainMessage>(message: MainToWorkerMessage, expectType: T["type"]): Promise<T> {
        return new Promise((resolve) => {
            this.pendingReplies.set(`${(message as any).requestId}:${expectType}`, resolve);
            this.worker.postMessage(message);
        });
    }

    isLoadingBarVisible() {
        return this.loadingBar.classList.contains("coh-loading-bar--active");
    }

    beginLoading(myToken: number, onShow?: () => void) {
        clearTimeout(this.loadingShowTimer);
        this.contentCommitted = false;
        this.loadingShowTimer = setTimeout(() => {
            if (myToken !== this.queryToken) return;
            if (!this.isLoadingBarVisible()) this.loadingStartedAt = performance.now();
            this.loadingBar.classList.add("coh-loading-bar--active");
            if (!this.contentCommitted) onShow?.();
        }, LOADING_DELAY_MS);
    }

    // Call once final content is about to be rendered, so a still-pending loading-bar timer
    // knows not to run its content-clearing side-effect anymore (the bar itself may still show).
    markContentCommitted() {
        this.contentCommitted = true;
    }

    // Cancels a not-yet-shown loading bar outright (no flicker), or, if it did become
    // visible, keeps it up for at least MIN_VISIBLE_MS so it doesn't itself flash too briefly
    // to register. Bails out if a newer query/load-more has since superseded this one.
    // `onDone` runs alongside the bar hiding, e.g. to re-enable the "Load more" button.
    endLoading(myToken: number, onDone?: () => void) {
        clearTimeout(this.loadingShowTimer);
        if (!this.isLoadingBarVisible()) return onDone?.();

        const remaining = MIN_VISIBLE_MS - (performance.now() - this.loadingStartedAt);
        const finish = () => {
            if (myToken !== this.queryToken) return;

            this.loadingBar.classList.remove("coh-loading-bar--active");
            onDone?.();
        };

        if (remaining <= 0) return finish();
        setTimeout(finish, remaining);
    }

    async triggerLoadMore() {
        const myToken = this.queryToken;
        this.visibleCount = this.resultsEl.children.length + RESULTS_PAGE_SIZE;
        this.loadMoreBtn.disabled = true;
        this.beginLoading(myToken);
        await this.appendVisibleResults();
        if (myToken !== this.queryToken) return;
        this.endLoading(myToken, () => (this.loadMoreBtn.disabled = false));
    }

    formatCount(count: number, term: string, hasMore = false) {
        const displayCount = hasMore ? `${count}+` : String(count);
        const key = count === 0 ? "zero_results" : count === 1 ? "one_result" : "many_results";
        const fallback =
            count === 0
                ? `No results for ${term}`
                : `${displayCount} result${count === 1 ? "" : "s"} for ${term}`;
        const template = this.translations[key] || fallback;
        return template.replace("[SEARCH_TERM]", term).replace("[COUNT]", displayCount);
    }

    exactMatchNote(term: string): string {
        if (!term || !this.state.exactMatchOnly) return "";
        if (!this.exactMatchStatus?.fullyScanned || this.exactMatchStatus.count > 0) return "";
        return ` — no exact match for "${term}"; try turning off Exact match to see related results`;
    }

    makeFilterButton(
        value: string,
        label: string,
        active: boolean,
        count: number | undefined,
        onClick: (value: string) => void,
    ) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "coh-filter-btn" + (active ? " coh-filter-btn--active" : "");
        btn.setAttribute("aria-pressed", String(active));
        btn.textContent = count === undefined ? label : `${label} (${count})`;
        btn.addEventListener("click", () => onClick(value));
        if ((!count || count <= 0) && value !== 'All' && !active) btn.disabled = true;

        return btn;
    }

    renderDocumentationTier(counts: Record<string, number>, hasTerm: boolean) {
        const el = this.tierEls.documentation;
        el.innerHTML = "";
        el.appendChild(
            this.makeFilterButton("All", "All", this.state.documentation === null, undefined, () => {
                this.state.documentation = null;
                this.state.engine = null;
                this.state.engineExplicitlyAll = false;
                this.runQuery();
            }),
        );
        this.config.documentationValues.forEach((doc) => {
            el.appendChild(
                this.makeFilterButton(
                    doc,
                    doc,
                    this.state.documentation === doc,
                    hasTerm ? counts[doc] || 0 : undefined,
                    (v) => {
                        this.state.documentation = v;
                        this.state.engineExplicitlyAll = false;
                        this.runQuery();
                    },
                ),
            );
        });
    }

    renderEngineTier(counts: Record<string, number>) {
        const el = this.tierEls.engine;
        const applicableEngines = this.config.documentationEngines[this.state.documentation] || [];

        el.innerHTML = "";

        if (applicableEngines.length === 0) {
            this.tierGroupEls.engine.hidden = true;
            return;
        }

        this.tierGroupEls.engine.hidden = false;
        el.appendChild(
            this.makeFilterButton("All", "All", this.state.engine === null, undefined, () => {
                this.state.engine = null;
                this.state.engineExplicitlyAll = true;
                this.runQuery();
            }),
        );
        applicableEngines.forEach((eng) => {
            el.appendChild(
                this.makeFilterButton(eng, eng, this.state.engine === eng, counts[eng] || 0, (v) => {
                    this.state.engine = v;
                    this.state.engineExplicitlyAll = false;
                    this.runQuery();
                }),
            );
        });
    }

    hideEngineTier() {
        this.tierGroupEls.engine.hidden = true;
        this.tierEls.engine.innerHTML = "";
    }

    renderTypeTier(counts: Record<string, number>) {
        const el = this.tierEls.type;
        const relevant = TYPE_VALUES.filter((t) => (counts[t] as number) > 0);

        el.innerHTML = "";

        if (relevant.length === 0) {
            this.tierGroupEls.type.hidden = true;
            return;
        }

        this.tierGroupEls.type.hidden = false;
        relevant.forEach((t) => {
            el.appendChild(
                this.makeFilterButton(t, t, this.state.types.has(t), counts[t], (v) => {
                    if (this.state.types.has(v)) this.state.types.delete(v);
                    else this.state.types.add(v);
                    this.runQuery();
                }),
            );
        });
    }

    hideTypeTier() {
        this.tierGroupEls.type.hidden = true;
        this.tierEls.type.innerHTML = "";
    }

    setRefiningIndicator(isRefining: boolean) {
        this.refiningIndicatorEl.hidden = !isRefining;
    }

    async runQuery() {
        const term = this.input.value.trim();
        const myToken = ++this.queryToken;
        this.setRefiningIndicator(false);

        if (!term) {
            clearTimeout(this.loadingShowTimer);
            this.loadingBar.classList.remove("coh-loading-bar--active");
            this.renderDocumentationTier({}, false);
            this.hideEngineTier();
            this.hideTypeTier();
            this.renderResults([], term);
            return;
        }

        this.beginLoading(myToken, () => {
            this.resultsEl.innerHTML = "";
            this.messageEl.textContent = "";
            this.loadMoreBtn.hidden = true;
            this.loadMoreBtn.disabled = false;
        });

        const query = splitCompoundQuery(term);
        const facetCounts = await this.postAndWait<Extract<WorkerToMainMessage, { type: "facetCountsResult" }>>(
            {
                type: "facetCounts",
                requestId: myToken,
                query,
                documentation: this.state.documentation,
                engineValues: this.config.engineValues,
            },
            "facetCountsResult",
        );
        if (myToken !== this.queryToken) return;

        const documentationCounts = facetCounts.documentationCounts;
        const engineCounts = facetCounts.engineCounts;
        if (this.state.engine && !engineCounts[this.state.engine]) this.state.engine = null;
        if (
            !this.state.engine &&
            !this.state.engineExplicitlyAll &&
            (this.state.documentation === "Gameface" || this.state.documentation === "Prysm") &&
            engineCounts["Custom Engine"] as number > 0
        ) {
            this.state.engine = "Custom Engine";
        }

        this.renderDocumentationTier(documentationCounts, true);
        if (this.state.documentation) {
            this.renderEngineTier(engineCounts);
        } else {
            this.hideEngineTier();
        }

        const searchResult = await this.postAndWait<Extract<WorkerToMainMessage, { type: "searchResult" }>>(
            {
                type: "search",
                requestId: myToken,
                query,
                exactMatchTerm: term,
                documentation: this.state.documentation,
                engine: this.state.engine,
                types: Array.from(this.state.types) as string[],
                typeValues: TYPE_VALUES,
                onlyExact: this.state.exactMatchOnly,
            },
            "searchResult",
        );
        if (myToken !== this.queryToken) return;

        Array.from(this.state.types).forEach((t) => {
            if (!searchResult.typeCounts[t as string]) this.state.types.delete(t);
        });

        if (this.state.documentation) {
            this.renderTypeTier(searchResult.typeCounts);
        } else {
            this.hideTypeTier();
        }

        this.tailCount = searchResult.tailCount;
        this.exactMatchStatus = searchResult.exactMatchStatus;

        // We're about to commit real content, so a still-pending loading-bar timer must not
        // blank it out from under us (e.g. if it fires while renderResults is awaiting
        // appendVisibleResults's on-demand tail fetch) — but the bar itself should stay eligible
        // to show for that phase, since it's often the slowest part of a documentation switch.
        this.markContentCommitted();
        await this.renderResults(searchResult.results, term);
        this.endLoading(myToken);
    }

    async renderResults(results: RenderableResult[], term: string) {
        this.currentResults = results;
        this.visibleCount = RESULTS_PAGE_SIZE;
        this.messageEl.textContent = term
            ? this.formatCount(results.length, term, this.tailCount > 0) + this.exactMatchNote(term)
            : "";
        this.resultsEl.innerHTML = "";
        this.loadMoreBtn.hidden = true;
        this.dialog.querySelector(".dialog-frame")?.scrollTo({ top: 0 });
        this.backToTopBtn.hidden = true;
        if (results.length === 0 && this.tailCount === 0) return;
        await this.appendVisibleResults();
    }

    async appendVisibleResults() {
        const myToken = this.queryToken;

        if (this.currentResults.length <= this.resultsEl.children.length && this.tailCount > 0) {
            const need = Math.max(this.visibleCount - this.currentResults.length, RESULTS_PAGE_SIZE);
            const loadMore = await this.postAndWait<Extract<WorkerToMainMessage, { type: "loadMoreResult" }>>(
                { type: "loadMore", requestId: myToken, count: need },
                "loadMoreResult",
            );
            if (myToken !== this.queryToken) return;
            this.currentResults = [...this.currentResults, ...loadMore.results];
            this.tailCount = loadMore.tailCount;
            this.exactMatchStatus = loadMore.exactMatchStatus;
            const term = this.input.value.trim();
            this.messageEl.textContent =
                this.formatCount(this.currentResults.length, term, this.tailCount > 0) + this.exactMatchNote(term);
        }

        const alreadyRendered = this.resultsEl.children.length;
        const toRender = this.currentResults.slice(alreadyRendered, this.visibleCount);
        if (toRender.length > 0) {
            const fragment = document.createDocumentFragment();
            toRender.forEach((r) => {
                const li = document.createElement("li");
                li.className = "coh-result";
                this.renderResultItem(li, r);
                fragment.appendChild(li);
            });
            this.resultsEl.appendChild(fragment);
        }

        this.loadMoreBtn.hidden =
            this.resultsEl.children.length >= this.currentResults.length && this.tailCount === 0;
        if (this.translations.load_more) this.loadMoreBtn.textContent = this.translations.load_more;
        else this.loadMoreBtn.textContent = "Load more results";
    }

    renderResultItem(li: HTMLElement, r: RenderableResult) {
        const url = this.formatURL(r.url);
        li.dataset.resultTitle = r.titleText;
        li.dataset.resultUrl = url;

        li.innerHTML = `
        <a class="coh-result-link" href="${url}">
          <p class="coh-result-title">
            ${r.badgeHtml}<span class="coh-result-title-text">${r.titleHtml}</span>
          </p>
        </a>
        ${r.subResults
                .map(
                    (s) => `
          <a href="${this.formatURL(s.url)}" class="coh-result-sub">
            <span class="coh-result-sub-link">${s.titleHtml}</span>
            <p class="coh-result-sub-excerpt">${s.excerptHtml}</p>
          </a>
        `,
                )
                .join("")}
      `;
    }
}
