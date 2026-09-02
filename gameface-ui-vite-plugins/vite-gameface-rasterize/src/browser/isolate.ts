import type { IsolateRequest, IsolateResult, PlaceRequest } from './types.js';

/**
 * Isolates a marked element in the running page so a capture contains its decoration and
 * nothing else, then puts everything back.
 *
 * This is in-situ capture rather than a synthesized harness: the element keeps its real
 * cascade, fonts and engine state, so the bake is the engine's own output for that element
 * rather than a reconstruction of it. What has to be neutralised is everything around it -
 * the page background, siblings, and any ancestor that clips, tints or transforms.
 *
 * Two cohtml behaviours shape how this is done:
 *  - `getBoundingClientRect` does not account for transforms, so the placed rectangle is
 *    computed from the pre-transform box rather than measured afterwards.
 *  - a `visibility: hidden` ancestor takes its whole subtree out of hit-testing, which would
 *    stop `:hover` from applying to the target. Ancestors are therefore left visible and
 *    stripped of everything they would otherwise paint.
 */
export function rzBeginIsolation(req: IsolateRequest): { warnings: string[]; wasHidden: boolean } {
    const w = window as any;
    const el: HTMLElement = w.__rzTargets[req.uid];
    const warnings: string[] = [];

    const saved: [HTMLElement, string | null][] = [];
    w.__rzRestore = saved;

    const save = (node: HTMLElement) => {
        saved.push([node, node.getAttribute('style')]);
    };

    const num = (value: string) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    /** Strips everything an element would paint, without removing it from the layout. */
    const unpaint = (node: HTMLElement) => {
        save(node);
        node.style.background = 'transparent';
        node.style.backgroundColor = 'transparent';
        node.style.backgroundImage = 'none';
        node.style.boxShadow = 'none';
        node.style.borderColor = 'transparent';
        node.style.color = 'transparent';
        node.style.textShadow = 'none';
        node.style.filter = 'none';
        node.style.opacity = '1';
        (node.style as any).mixBlendMode = 'normal';
        (node.style as any).maskImage = 'none';
        (node.style as any).clipPath = 'none';
        node.style.overflow = 'visible';
        node.style.transform = 'none';
        // An animation on an ancestor would keep overriding the transform we just cleared.
        node.style.animation = 'none';
        node.style.transition = 'none';
    };

    const html = document.documentElement as HTMLElement;
    const body = document.body as HTMLElement;

    // The page's own background propagates to the viewport canvas, which visibility never
    // touches, so it has to be cleared explicitly or every bake gets an opaque backdrop.
    unpaint(html);
    unpaint(body);

    // Walk up from the target, hiding each ancestor's other children and stripping the
    // ancestor itself. The chain stays visible so hit-testing still reaches the target.
    let child: HTMLElement = el;
    let ancestor = el.parentElement;

    while (ancestor) {
        for (let i = 0; i < ancestor.children.length; i++) {
            const sibling = ancestor.children[i] as HTMLElement;
            if (sibling === child) continue;
            save(sibling);
            sibling.style.visibility = 'hidden';
        }

        if (ancestor !== html && ancestor !== body) unpaint(ancestor);

        child = ancestor;
        ancestor = ancestor.parentElement;
    }

    const scroller = (document.scrollingElement || html) as HTMLElement;
    w.__rzSavedScroll = { top: scroller.scrollTop, left: scroller.scrollLeft };
    scroller.scrollTop = 0;
    scroller.scrollLeft = 0;

    save(el);
    el.style.visibility = 'visible';

    // The target's own opacity is not something ancestors' neutralisation reaches, and an
    // element that is `opacity: 0` until the game shows it captures as a fully transparent
    // texture that then replaces its live CSS - the decoration disappears entirely rather than
    // falling back. Same for `display`/`visibility` set on the element itself.
    el.style.opacity = '1';

    let wasHidden = false;
    if (getComputedStyle(el).display === 'none') {
        wasHidden = true;
        el.style.display = 'block';
    }

    // A running animation or in-flight transition overrides the inline transform that places
    // the element for capture, so a spinning frame is photographed wherever the animation had
    // it rather than where the pipeline believes it is.
    el.style.animation = 'none';
    el.style.transition = 'none';

    if (req.hideContent) {
        const descendants = el.querySelectorAll('*');
        for (let i = 0; i < descendants.length; i++) {
            const node = descendants[i] as HTMLElement;
            if (req.keepUnderlays && isInsideUnderlay(node, el)) continue;
            save(node);
            node.style.visibility = 'hidden';
        }
        // Text nodes are painted by the element itself, so hiding children is not enough.
        el.style.color = 'transparent';
        el.style.textShadow = 'none';
    }

    for (let i = 0; i < req.hidePaths.length; i++) {
        const node = resolvePath(el, req.hidePaths[i]);
        if (node) {
            save(node);
            node.style.visibility = 'hidden';
        } else {
            warnings.push('live part at path [' + req.hidePaths[i].join(',') + '] could not be resolved');
        }
    }

    for (let i = 0; i < req.neutralize.length; i++) {
        (el.style as any)[req.neutralize[i]] = 'none';
    }

    if (req.sizeOverride) {
        el.style.minWidth = '0';
        el.style.maxWidth = 'none';
        el.style.minHeight = '0';
        el.style.maxHeight = 'none';
        el.style.flex = 'none';

        const sizing = getComputedStyle(el);
        let width = req.sizeOverride.w;
        let height = req.sizeOverride.h;

        // The requested size is a border box; content-box elements need the borders and
        // padding subtracted or the element comes out too big by exactly that much.
        if (sizing.boxSizing !== 'border-box') {
            width -= num(sizing.borderLeftWidth) + num(sizing.borderRightWidth) + num(sizing.paddingLeft) + num(sizing.paddingRight);
            height -= num(sizing.borderTopWidth) + num(sizing.borderBottomWidth) + num(sizing.paddingTop) + num(sizing.paddingBottom);
        }

        el.style.width = Math.max(0, width) + 'px';
        el.style.height = Math.max(0, height) + 'px';
    }

    return { warnings, wasHidden };

    function isInsideUnderlay(node: Element, stopAt: Element): boolean {
        let current: Element | null = node;
        while (current && current !== stopAt) {
            if (current.hasAttribute('data-rz-underlay')) return true;
            current = current.parentElement;
        }
        return false;
    }

    function resolvePath(root: Element, path: number[]): HTMLElement | null {
        let node: Element | undefined = root;
        for (let i = 0; i < path.length; i++) {
            node = node?.children[path[i]];
            if (!node) return null;
        }
        return (node as HTMLElement) ?? null;
    }
}

/**
 * Moves the isolated element to a known spot and supersamples it, in one transform.
 *
 * This is deliberately a separate call from `rzBeginIsolation`: cohtml does not force a
 * synchronous reflow when layout properties are read after a style change, so measuring in
 * the same call would read the element's pre-isolation size. The caller waits for a frame
 * between the two, and by the time this runs the numbers are real.
 *
 * The placed rectangle is computed rather than measured for the opposite reason - transforms
 * never show up in `getBoundingClientRect` on this engine.
 */
export function rzPlaceTarget(req: PlaceRequest): IsolateResult {
    const el: HTMLElement = (window as any).__rzTargets[req.uid];
    const warnings: string[] = [];

    const num = (value: string) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const laidOut = el.getBoundingClientRect();

    // Element mode pins its live parts at the geometry measured here rather than during
    // introspection: by now the ancestors have been stripped of the transforms and clipping
    // that would otherwise be folded into every child's rectangle, and the placement transform
    // below has not been applied yet.
    const liveParts = (req.measurePaths ?? []).map((path) => {
        let node: Element | undefined = el;
        for (let i = 0; i < path.length && node; i++) node = node.children[path[i]];

        if (!node) return { path, box: { x: 0, y: 0, w: 0, h: 0 }, resolved: false };

        const box = node.getBoundingClientRect();
        return {
            path,
            box: {
                x: +(box.left - laidOut.left).toFixed(2),
                y: +(box.top - laidOut.top).toFixed(2),
                w: +box.width.toFixed(2),
                h: +box.height.toFixed(2),
            },
            resolved: true,
        };
    });

    const tx = req.pad - laidOut.left;
    const ty = req.pad - laidOut.top;

    el.style.transformOrigin = '0 0';
    el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + req.scale + ')';

    const cs = getComputedStyle(el);
    const cssWidth = el.offsetWidth || laidOut.width;
    const cssHeight = el.offsetHeight || laidOut.height;

    if (cssWidth <= 0 || cssHeight <= 0) {
        warnings.push('the element has no box to capture (' + cssWidth + 'x' + cssHeight + ')');
    }

    return {
        liveParts,
        rect: {
            x: req.pad,
            y: req.pad,
            w: +(cssWidth * req.scale).toFixed(2),
            h: +(cssHeight * req.scale).toFixed(2),
        },
        hitRect: {
            x: +laidOut.left.toFixed(2),
            y: +laidOut.top.toFixed(2),
            w: +laidOut.width.toFixed(2),
            h: +laidOut.height.toFixed(2),
        },
        cssSize: { w: +cssWidth.toFixed(2), h: +cssHeight.toFixed(2) },
        borderWidths: {
            top: num(cs.borderTopWidth),
            right: num(cs.borderRightWidth),
            bottom: num(cs.borderBottomWidth),
            left: num(cs.borderLeftWidth),
        },
        warnings,
    };
}

/** Restores every inline style the isolation touched, in reverse order. */
export function rzEndIsolation(): void {
    const w = window as any;
    const saved: [HTMLElement, string | null][] = w.__rzRestore || [];

    for (let i = saved.length - 1; i >= 0; i--) {
        const [node, style] = saved[i];
        if (style === null) node.removeAttribute('style');
        else node.setAttribute('style', style);
    }

    w.__rzRestore = [];

    const scroll = w.__rzSavedScroll;
    if (scroll) {
        const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
        scroller.scrollTop = scroll.top;
        scroller.scrollLeft = scroll.left;
    }
}

export interface StateArg {
    uid: number;
    /** "hover" | "active" | "focus" | "disabled" | "class:<name>" */
    state: string;
}

/**
 * Applies the non-pointer half of a state variant. hover and active are driven by real
 * mouse events from the Node side instead, because `CSS.forcePseudoState` reports success
 * on this engine and then changes nothing.
 */
export function rzApplyState(arg: StateArg): { handled: boolean } {
    const el: HTMLElement = (window as any).__rzTargets[arg.uid];

    if (arg.state.indexOf('class:') === 0) {
        el.classList.add(arg.state.slice(6));
        return { handled: true };
    }

    if (arg.state === 'focus') {
        el.focus();
        return { handled: true };
    }

    if (arg.state === 'disabled') {
        el.setAttribute('disabled', '');
        return { handled: true };
    }

    return { handled: false };
}

export function rzClearState(arg: StateArg): void {
    const el: HTMLElement = (window as any).__rzTargets[arg.uid];

    if (arg.state.indexOf('class:') === 0) {
        el.classList.remove(arg.state.slice(6));
        return;
    }

    if (arg.state === 'focus') el.blur();
    if (arg.state === 'disabled') el.removeAttribute('disabled');
}

/**
 * The decoration values as they stand right now. Comparing a state's snapshot against the
 * base one is how a state variant that changes nothing visible gets reported (RZ016).
 */
export function rzDecorationSnapshot(uid: number): string {
    const el: HTMLElement = (window as any).__rzTargets[uid];
    const cs = getComputedStyle(el);

    return [
        cs.boxShadow,
        cs.backgroundImage,
        cs.backgroundColor,
        cs.borderRadius,
        cs.filter,
        (cs as any).maskImage,
        cs.borderTopColor,
        cs.borderRightColor,
        cs.borderBottomColor,
        cs.borderLeftColor,
        cs.borderTopWidth,
        cs.opacity,
    ].join('|');
}

/** Removes the bookkeeping attributes the introspection pass stamped onto the document. */
export function rzCleanup(): void {
    const marked = document.querySelectorAll('[data-rz-uid]');
    for (let i = 0; i < marked.length; i++) marked[i].removeAttribute('data-rz-uid');
    (window as any).__rzTargets = [];
}
