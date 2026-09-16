import type { AdvisorHit, IntrospectResult, RawDescendant, RawMark } from './types.js';

export interface IntrospectArg {
    /** Attribute names, passed in rather than imported - this function runs stringified. */
    attrs: {
        mark: string;
        mode: string;
        states: string;
        id: string;
        scale: string;
        live: string;
    };
    /** Tags that receive input by nature and therefore can never be baked away. */
    interactiveTags: string[];
    /** Run the advisory pass over unmarked elements. */
    advisor: boolean;
    /** Safety valve for the advisory walk on very large documents. */
    advisorLimit: number;
}

/**
 * Reads every marked element out of the running app: its resolved decoration, its geometry,
 * and - for element mode - which descendants have to stay live DOM.
 *
 * This runs inside cohtml against the real page, so the values are the engine's own used
 * values rather than a re-derivation of the cascade. It stamps `data-rz-uid` on each marked
 * element and parks the elements in `window.__rzTargets` so later calls can address them.
 */
export function rzIntrospect(arg: IntrospectArg): IntrospectResult {
    const { attrs, interactiveTags, advisor, advisorLimit } = arg;
    const w = window as any;

    const targets: Element[] = [];
    w.__rzTargets = targets;

    const marks: RawMark[] = [];
    const marked = Array.prototype.slice.call(document.querySelectorAll('[' + attrs.mark + ']')) as HTMLElement[];

    const num = (value: string): number => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    /** cohtml reports radii as "12px 12px" (x and y); the x radius is what we size slices from. */
    const radius = (value: string): number => num((value || '0').split(/\s+/)[0]);

    const selectorPath = (el: Element): string => {
        const parts: string[] = [];
        let node: Element | null = el;

        while (node && node.nodeType === 1 && node !== document.documentElement) {
            let part = node.tagName.toLowerCase();
            const parent: Element | null = node.parentElement;

            if (parent) {
                const siblings = Array.prototype.filter.call(
                    parent.children,
                    (c: Element) => c.tagName === (node as Element).tagName
                ) as Element[];
                if (siblings.length > 1) part += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
            }

            parts.unshift(part);
            node = parent;
        }

        return parts.join('>');
    };

    const classList = (el: Element): string[] => {
        const raw = el.getAttribute('class');
        return raw ? raw.split(/\s+/).filter(Boolean) : [];
    };

    /** Ancestor tags and classes, nearest first, capped so a deep tree stays cheap to serialise. */
    const ancestryOf = (el: Element): { tag: string; classes: string[] }[] => {
        const chain: { tag: string; classes: string[] }[] = [];
        let node = el.parentElement;

        while (node && node !== document.documentElement && chain.length < 12) {
            chain.push({ tag: node.tagName.toLowerCase(), classes: classList(node) });
            node = node.parentElement;
        }

        return chain;
    };

    const boxOf = (el: Element, origin?: DOMRect) => {
        const r = el.getBoundingClientRect();
        return {
            x: +(r.left - (origin ? origin.left : 0)).toFixed(2),
            y: +(r.top - (origin ? origin.top : 0)).toFixed(2),
            w: +r.width.toFixed(2),
            h: +r.height.toFixed(2),
        };
    };

    const hasDirectText = (el: Element): boolean => {
        for (let i = 0; i < el.childNodes.length; i++) {
            const n = el.childNodes[i];
            if (n.nodeType === 3 && (n.nodeValue || '').trim() !== '') return true;
        }
        return false;
    };

    const bindingAttributes = (el: Element): string[] => {
        const found: string[] = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const name = el.attributes[i].name;
            if (name.indexOf('data-bind-') === 0) found.push(name);
        }
        return found;
    };

    const inlineHandlers = (el: Element): string[] => {
        const found: string[] = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const name = el.attributes[i].name;
            if (name.indexOf('on') === 0 && name.length > 2) found.push(name);
        }
        return found;
    };

    /**
     * Solid compiles onClick to a delegated listener plus a `$$click` property on the node.
     * The property names are probed from a fixed list rather than enumerated: a for-in over a
     * DOM element walks the whole prototype chain, which is both slow and a good way to upset
     * the engine on a large document.
     */
    const DELEGATED = [
        '$$click', '$$dblclick', '$$mousedown', '$$mouseup', '$$mouseover', '$$mouseout',
        '$$mousemove', '$$pointerdown', '$$pointerup', '$$keydown', '$$keyup', '$$keypress',
        '$$input', '$$change', '$$focus', '$$blur', '$$wheel', '$$contextmenu',
    ];

    const delegatedHandlers = (el: Element): string[] => {
        const found: string[] = [];
        for (let i = 0; i < DELEGATED.length; i++) {
            if ((el as any)[DELEGATED[i]] !== undefined) found.push(DELEGATED[i]);
        }
        return found;
    };

    const isAnimated = (cs: CSSStyleDeclaration): string | null => {
        const animation = cs.animationName;
        if (animation && animation !== 'none' && animation !== '') return 'animation: ' + animation;

        const transition = cs.transitionProperty;
        const duration = cs.transitionDuration || '';
        const runs = /[1-9]/.test(duration);
        if (transition && transition !== 'none' && transition !== '' && runs) {
            return 'transition: ' + transition + ' ' + duration;
        }

        return null;
    };

    const decorationOf = (cs: CSSStyleDeclaration) => ({
        boxShadow: cs.boxShadow || 'none',
        backgroundImage: cs.backgroundImage || 'none',
        backgroundColor: cs.backgroundColor || 'transparent',
        borderRadius: cs.borderRadius || '0px',
        corners: {
            tl: radius(cs.borderTopLeftRadius),
            tr: radius(cs.borderTopRightRadius),
            br: radius(cs.borderBottomRightRadius),
            bl: radius(cs.borderBottomLeftRadius),
        },
        filter: cs.filter || 'none',
        maskImage: (cs as any).maskImage || (cs as any).webkitMaskImage || 'none',
        borderImageSource: cs.borderImageSource || 'none',
        borderWidths: {
            top: num(cs.borderTopWidth),
            right: num(cs.borderRightWidth),
            bottom: num(cs.borderBottomWidth),
            left: num(cs.borderLeftWidth),
        },
        borderColors: {
            top: cs.borderTopColor,
            right: cs.borderRightColor,
            bottom: cs.borderBottomColor,
            left: cs.borderLeftColor,
        },
        borderStyles: {
            top: cs.borderTopStyle,
            right: cs.borderRightStyle,
            bottom: cs.borderBottomStyle,
            left: cs.borderLeftStyle,
        },
        boxSizing: cs.boxSizing || 'content-box',
        position: cs.position || 'static',
        display: cs.display || 'block',
        overflow: cs.overflow || 'visible',
    });

    /**
     * Classifies one descendant of an element-mode subtree. Returning a reason means the
     * node stays live DOM and is pinned on top of the bake instead of being baked into it.
     */
    const classify = (el: Element, cs: CSSStyleDeclaration): RawDescendant | null => {
        const base = { tag: el.tagName.toLowerCase(), classes: classList(el) };

        if (el.hasAttribute(attrs.live)) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'declared', detail: attrs.live };
        }

        const bindings = bindingAttributes(el);
        if (bindings.length) {
            // data-bind-for / data-bind-if add and remove nodes, which moves everything after
            // them - that breaks the fixed-box contract rather than merely staying live.
            const structural = bindings.filter((b) => b === 'data-bind-for' || b === 'data-bind-if');
            return {
                ...base,
                path: [],
                box: { x: 0, y: 0, w: 0, h: 0 },
                reason: 'binding',
                detail: bindings.join(', '),
                layoutDynamic: structural.length ? structural.join(', ') : undefined,
            };
        }

        const animated = isAnimated(cs);
        if (animated) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'animation', detail: animated };
        }

        const tag = el.tagName.toLowerCase();
        if (interactiveTags.indexOf(tag) !== -1) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'interactable', detail: '<' + tag + '>' };
        }

        if (el.hasAttribute('tabindex')) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'interactable', detail: 'tabindex' };
        }

        const inline = inlineHandlers(el);
        if (inline.length) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'interactable', detail: inline.join(', ') };
        }

        const delegated = delegatedHandlers(el);
        if (delegated.length) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'interactable', detail: delegated.join(', ') };
        }

        if (w.__rzProbe && w.__rzProbe.hasListener(el)) {
            return { ...base, path: [], box: { x: 0, y: 0, w: 0, h: 0 }, reason: 'interactable', detail: 'addEventListener' };
        }

        return null;
    };

    for (let index = 0; index < marked.length; index++) {
        const el = marked[index];

        // An element-mode subtree subsumes any marker inside it; those are reported as RZ014
        // during the subtree walk rather than baked twice.
        let insideElementMode = false;
        let ancestor = el.parentElement;
        while (ancestor) {
            if (ancestor.hasAttribute(attrs.mark) && ancestor.getAttribute(attrs.mode) === 'element') {
                insideElementMode = true;
                break;
            }
            ancestor = ancestor.parentElement;
        }
        if (insideElementMode) continue;

        const uid = targets.length;
        targets.push(el);
        el.setAttribute('data-rz-uid', String(uid));

        const cs = getComputedStyle(el);
        const scaleAttr = el.getAttribute(attrs.scale);
        const statesAttr = el.getAttribute(attrs.states);

        const mark: RawMark = {
            uid,
            authorId: el.getAttribute(attrs.id),
            mode: el.getAttribute(attrs.mode) || 'auto',
            statesRequested: statesAttr ? statesAttr.split(',').map((s) => s.trim()).filter(Boolean) : [],
            scaleOverride: scaleAttr ? parseFloat(scaleAttr) : null,
            tag: el.tagName.toLowerCase(),
            classes: classList(el),
            selectorPath: selectorPath(el),
            ancestry: ancestryOf(el),
            rect: boxOf(el),
            layoutSize: { w: el.offsetWidth, h: el.offsetHeight },
            style: decorationOf(cs),
            blockers: {
                mixBlendMode: (cs as any).mixBlendMode || 'normal',
                backdropFilter: (cs as any).backdropFilter || (cs as any).webkitBackdropFilter || 'none',
            },
            motion: {
                transitionProperty: cs.transitionProperty || 'none',
                transitionDuration: cs.transitionDuration || '0s',
                animationName: cs.animationName || 'none',
            },
            childElementCount: el.childElementCount,
            hasText: hasDirectText(el),
        };

        if (mark.mode === 'element') {
            const rootRect = el.getBoundingClientRect();
            const live: RawDescendant[] = [];
            const layoutDynamic: RawDescendant[] = [];
            const decorated: { box: { x: number; y: number; w: number; h: number }; boxShadow: string; filter: string }[] = [];
            let nodeCount = 0;

            const walk = (node: Element, path: number[]) => {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childPath = path.concat([i]);
                    nodeCount++;

                    const childStyle = getComputedStyle(child);
                    const verdict = classify(child, childStyle);

                    if (child.hasAttribute(attrs.mark)) {
                        live.push({
                            path: childPath,
                            tag: child.tagName.toLowerCase(),
                            classes: classList(child),
                            box: boxOf(child, rootRect),
                            reason: 'declared',
                            detail: 'nested rasterize marker',
                            nestedMarker: true,
                        });
                    }

                    if (verdict) {
                        const entry: RawDescendant = {
                            ...verdict,
                            path: childPath,
                            box: boxOf(child, rootRect),
                        };
                        live.push(entry);
                        if (entry.layoutDynamic) layoutDynamic.push(entry);
                        // A live node takes its whole subtree with it - no need to look inside.
                        continue;
                    }

                    // This node is baked, so anything it paints outside its own box has to be
                    // accounted for when sizing the capture.
                    const shadow = childStyle.boxShadow || 'none';
                    const filter = childStyle.filter || 'none';
                    if ((shadow !== 'none' && shadow !== '') || (filter !== 'none' && filter !== '')) {
                        decorated.push({ box: boxOf(child, rootRect), boxShadow: shadow, filter });
                    }

                    walk(child, childPath);
                }
            };

            walk(el, []);

            mark.liveParts = live.filter((p) => !p.nestedMarker);
            mark.subtreeNodeCount = nodeCount;
            mark.layoutDynamic = layoutDynamic;
            mark.decorated = decorated;

            const nested = live.filter((p) => p.nestedMarker);
            if (nested.length) mark.liveParts = mark.liveParts.concat(nested);
        }

        marks.push(mark);
    }

    // ---- advisory pass (§9.1): expensive properties on elements nobody marked ----
    const hits: AdvisorHit[] = [];

    if (advisor) {
        const all = document.querySelectorAll('*');
        const limit = Math.min(all.length, advisorLimit);

        for (let i = 0; i < limit; i++) {
            const el = all[i];
            if (el.hasAttribute(attrs.mark)) continue;

            let insideMarked = false;
            let parent = el.parentElement;
            while (parent) {
                if (parent.hasAttribute(attrs.mark)) {
                    insideMarked = true;
                    break;
                }
                parent = parent.parentElement;
            }
            if (insideMarked) continue;

            const cs = getComputedStyle(el);
            const properties: string[] = [];

            if (cs.boxShadow && cs.boxShadow !== 'none') properties.push('box-shadow');
            if (cs.filter && cs.filter !== 'none') properties.push('filter');
            if (cs.backgroundImage && cs.backgroundImage.indexOf('gradient') !== -1) properties.push('background-image (gradient)');
            if ((cs as any).maskImage && (cs as any).maskImage !== 'none') properties.push('mask-image');

            if (properties.length) {
                hits.push({ selectorPath: selectorPath(el), tag: el.tagName.toLowerCase(), classes: classList(el), properties });
            }
        }
    }

    return { marks, advisor: hits, viewport: { width: window.innerWidth, height: window.innerHeight } };
}
