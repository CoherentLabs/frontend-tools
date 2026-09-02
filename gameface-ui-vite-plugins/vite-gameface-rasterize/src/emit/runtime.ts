import type { ResolvedMode } from '../contract.js';

export interface RuntimeAsset {
    mode: ResolvedMode;
    /** "base" first, then any variants. */
    states: string[];
    /** Child-index paths of the nodes that must survive flattening, in emission order. */
    liveParts?: number[][];
    /** Whether the underlay is drawn as one border-image element or nine positioned regions. */
    nineDiv?: boolean;
}

export interface RuntimePayload {
    assets: Record<string, RuntimeAsset>;
    matchers: {
        assetId: string;
        tag: string;
        classes: string[];
        authorId?: string;
        /** A class on some ancestor that separates this bake from others with the same key. */
        ancestorClass?: string;
        selectorPath?: string;
        ambiguous?: boolean;
    }[];
}

/**
 * The runtime shipped with the build. It creates elements and sets attributes - nothing more.
 * All the geometry lives in the generated stylesheet, because a stylesheet the runtime
 * injected would never apply: cohtml only honours stylesheets present when the document is
 * parsed.
 */
function rzRuntime(payload: RuntimePayload): void {
    var MARK = 'data-rasterize';
    var AUTHOR_ID = 'data-rasterize-id';
    var ID = 'data-rz-id';
    var UNDERLAY = 'data-rz-underlay';
    var STATE = 'data-rz-state';
    var ACTIVE = 'data-rz-active';
    var LIVE = 'data-rz-live';

    var byAuthorId: Record<string, string> = {};
    // One key can hold several bakes that differ only by an ancestor class, so every key maps to
    // a list and resolution picks from it rather than assuming the key is unique.
    var byKey: Record<string, RuntimePayload['matchers']> = {};
    var ambiguousMatchers: RuntimePayload['matchers'] = [];

    for (var i = 0; i < payload.matchers.length; i++) {
        var matcher = payload.matchers[i];
        if (matcher.authorId) byAuthorId[matcher.authorId] = matcher.assetId;
        if (matcher.ambiguous) {
            ambiguousMatchers.push(matcher);
            continue;
        }
        var key = matcher.tag + '|' + matcher.classes.slice().sort().join('.');
        if (!byKey[key]) byKey[key] = [];
        byKey[key].push(matcher);
    }

    function classesOf(el: Element): string[] {
        var raw = el.getAttribute('class');
        return raw ? raw.split(/\s+/).filter(Boolean) : [];
    }

    function selectorPath(el: Element): string {
        var parts: string[] = [];
        var node: Element | null = el;

        while (node && node.nodeType === 1 && node !== document.documentElement) {
            var part = node.tagName.toLowerCase();
            var parent: Element | null = node.parentElement;

            if (parent) {
                var same: Element[] = [];
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].tagName === node.tagName) same.push(parent.children[i]);
                }
                if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
            }

            parts.unshift(part);
            node = parent;
        }

        return parts.join('>');
    }

    function hasAncestorClass(el: Element, token: string): boolean {
        var node: Element | null = el.parentElement;
        while (node) {
            if (node.classList && node.classList.contains(token)) return true;
            node = node.parentElement;
        }
        return false;
    }

    function assetIdFor(el: Element): string | null {
        var authorId = el.getAttribute(AUTHOR_ID);
        if (authorId && byAuthorId[authorId]) return byAuthorId[authorId];

        var key = el.tagName.toLowerCase() + '|' + classesOf(el).sort().join('.');
        var candidates = byKey[key];

        if (candidates) {
            if (candidates.length === 1 && !candidates[0].ancestorClass) return candidates[0].assetId;

            // Variants selected through an ancestor: the build recorded which class separates
            // them, so walking up from the element picks the right one.
            for (var c = 0; c < candidates.length; c++) {
                var token = candidates[c].ancestorClass;
                if (token && hasAncestorClass(el, token)) return candidates[c].assetId;
            }

            // An unqualified bake in the group is the default for elements matching none.
            for (var d = 0; d < candidates.length; d++) {
                if (!candidates[d].ancestorClass) return candidates[d].assetId;
            }
        }

        // An exact key miss is usually one extra class the app added at runtime - a state class,
        // a marker with no CSS behind it - which is not a different element and should not cost
        // it its texture. Matching the way CSS does, on the baked classes being present rather
        // than being all of them, fixes that; the longest match wins, so a variant that really
        // was baked with that extra class still beats the shorter one.
        var subset = subsetMatch(el);
        if (subset) return subset;

        // Nothing separates them by class, so position is all that is left - and it identifies
        // exactly one element.
        var path = selectorPath(el);
        for (var i = 0; i < ambiguousMatchers.length; i++) {
            if (ambiguousMatchers[i].selectorPath === path) return ambiguousMatchers[i].assetId;
        }

        return null;
    }

    function subsetMatch(el: Element): string | null {
        var tag = el.tagName.toLowerCase();
        var owned: Record<string, boolean> = {};
        var classes = classesOf(el);
        if (!classes.length) return null;
        for (var c = 0; c < classes.length; c++) owned[classes[c]] = true;

        var best: RuntimePayload['matchers'][number] | null = null;

        for (var i = 0; i < payload.matchers.length; i++) {
            var matcher = payload.matchers[i];
            if (matcher.tag !== tag || !matcher.classes.length) continue;
            // Position-only matchers identify one element; picking one by class would be arbitrary.
            if (matcher.ambiguous) continue;

            var contained = true;
            for (var j = 0; j < matcher.classes.length; j++) {
                if (!owned[matcher.classes[j]]) {
                    contained = false;
                    break;
                }
            }
            if (!contained) continue;
            if (matcher.ancestorClass && !hasAncestorClass(el, matcher.ancestorClass)) continue;

            if (!best || matcher.classes.length > best.classes.length) best = matcher;
        }

        return best ? best.assetId : null;
    }

    function resolvePath(root: Element, path: number[]): Element | null {
        var node: Element | null = root;
        for (var i = 0; i < path.length && node; i++) node = node.children[path[i]] || null;
        return node;
    }

    /**
     * §16: the wrapper hierarchy did its job at build time. Everything static is now in the
     * texture, so the wrappers are removed and the live parts are re-attached directly to the
     * flattened container, where the stylesheet pins them at their captured geometry.
     */
    function flatten(el: Element, assetId: string, asset: RuntimeAsset): void {
        var paths = asset.liveParts || [];
        var live: Element[] = [];

        // Resolve every path before detaching anything: removing a node renumbers its siblings.
        for (var i = 0; i < paths.length; i++) {
            var node = resolvePath(el, paths[i]);
            if (node) live.push(node);
        }

        for (var j = 0; j < live.length; j++) {
            if (live[j].parentNode) live[j].parentNode!.removeChild(live[j]);
        }

        while (el.firstChild) el.removeChild(el.firstChild);

        for (var k = 0; k < live.length; k++) {
            live[k].setAttribute(LIVE, assetId + ':' + k);
            el.appendChild(live[k]);
        }
    }

    function makeUnderlay(assetId: string, state: string, nineDiv: boolean): Element {
        var underlay = document.createElement('i');
        underlay.setAttribute(UNDERLAY, assetId);
        underlay.setAttribute(STATE, state);
        if (state === 'base') underlay.setAttribute(ACTIVE, '');

        if (nineDiv) {
            var regions = ['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'];
            for (var i = 0; i < regions.length; i++) {
                var region = document.createElement('i');
                region.setAttribute('data-rz-slice', assetId + ':' + regions[i]);
                underlay.appendChild(region);
            }
        }

        return underlay;
    }

    function wireStates(el: Element, asset: RuntimeAsset): void {
        var flags: Record<string, boolean> = {};

        function refresh() {
            // Later states win: a pressed button that is also hovered reads as active.
            var chosen = 'base';
            for (var i = 0; i < asset.states.length; i++) {
                if (flags[asset.states[i]]) chosen = asset.states[i];
            }

            var underlays = el.querySelectorAll('[' + UNDERLAY + ']');
            for (var j = 0; j < underlays.length; j++) {
                var underlay = underlays[j];
                if (underlay.parentNode !== el) continue;
                if (underlay.getAttribute(STATE) === chosen) underlay.setAttribute(ACTIVE, '');
                else underlay.removeAttribute(ACTIVE);
            }
        }

        function bind(event: string, state: string, value: boolean) {
            el.addEventListener(event, function () {
                flags[state] = value;
                refresh();
            });
        }

        for (let i = 0; i < asset.states.length; i++) {
            const state = asset.states[i];

            if (state === 'hover') {
                bind('mouseenter', 'hover', true);
                bind('mouseleave', 'hover', false);
                bind('mouseleave', 'active', false);
            } else if (state === 'active') {
                bind('mousedown', 'active', true);
                bind('mouseup', 'active', false);
            } else if (state === 'focus') {
                bind('focus', 'focus', true);
                bind('blur', 'focus', false);
            } else if (state === 'disabled' || state.indexOf('class:') === 0) {
                // Class and disabled variants are driven by whatever the app does to the
                // element, so the element itself is watched rather than an input event.
                const watched = state;
                const observer = new MutationObserver(function () {
                    flags[watched] =
                        watched === 'disabled'
                            ? el.hasAttribute('disabled')
                            : el.classList.contains(watched.slice(6));
                    refresh();
                });
                observer.observe(el, { attributes: true, attributeFilter: ['class', 'disabled'] });
            }
        }

        refresh();
    }

    // Elements that could not be resolved yet. A framework that sets class from a signal mounts
    // the node with class="" and fills it in afterwards, so an element seen once and dropped
    // would never get its texture. These are retried whenever a class changes.
    var pending: Element[] = [];

    function remember(el: Element): void {
        for (var i = 0; i < pending.length; i++) if (pending[i] === el) return;
        if (pending.length < 2000) pending.push(el);
    }

    function retryPending(): void {
        if (!pending.length) return;

        var still: Element[] = [];
        for (var i = 0; i < pending.length; i++) {
            var el = pending[i];
            if (!el.parentNode) continue;
            apply(el);
            if (!el.hasAttribute(ID)) still.push(el);
        }
        pending = still;
    }

    function apply(el: Element): void {
        if (el.hasAttribute(ID)) return;

        var assetId = assetIdFor(el);
        if (!assetId) {
            remember(el);
            return;
        }

        var asset = payload.assets[assetId];
        if (!asset) return;

        el.setAttribute(ID, assetId);

        if (asset.mode === 'element') flatten(el, assetId, asset);

        // Every variant is in the DOM from the start: the textures are resident after the
        // first frame, so the first hover never stalls on a texture upload.
        for (var i = asset.states.length - 1; i >= 0; i--) {
            el.insertBefore(makeUnderlay(assetId, asset.states[i], !!asset.nineDiv), el.firstChild);
        }

        if (asset.states.length > 1) wireStates(el, asset);
    }

    function scan(root: ParentNode): void {
        var marked = root.querySelectorAll('[' + MARK + ']');
        for (var i = 0; i < marked.length; i++) apply(marked[i]);
    }

    function start(): void {
        scan(document);

        // Anything mounted later - a menu, a modal, a list item - is picked up as it appears,
        // and a class arriving after mount gives every unresolved element another chance.
        var observer = new MutationObserver(function (records) {
            var classChanged = false;

            for (var i = 0; i < records.length; i++) {
                if (records[i].type === 'attributes') {
                    classChanged = true;
                    continue;
                }

                var added = records[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType !== 1) continue;
                    var el = node as Element;
                    if (el.hasAttribute(MARK)) apply(el);
                    scan(el);
                }
            }

            if (classChanged) retryPending();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}

/** Serialises the runtime with its payload baked in - no fetch, no manifest request at boot. */
export function buildRuntime(payload: RuntimePayload): string {
    return [
        '/* Generated by vite-gameface-rasterize. Do not edit - it is rewritten on every build. */',
        `;(${rzRuntime.toString()})(${JSON.stringify(payload)});`,
        '',
    ].join('\n');
}
