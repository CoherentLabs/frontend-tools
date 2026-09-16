export interface OverlayConfig {
    attrs: { mark: string; mode: string; states: string; id: string; scale: string; live: string };
    /** Build-time bake scale, so the overlay reports the same number the build would. */
    bakeScale: number;
    /** Key that shows and hides the overlay. */
    toggleKey: string;
    /** Draw the overlay as soon as the page loads, rather than waiting for the toggle. */
    startVisible: boolean;
}

type Verdict = 'shared' | 'own' | 'unmatched' | 'nothing';

/**
 * The dev-mode overlay: what the build would decide, drawn on the page you are already looking at.
 *
 * It runs the same rules as the planner and the runtime matcher, in the page, with no Player
 * launch and no bake - so the answer to "will this share a texture, and will it match at runtime"
 * arrives while you are editing the CSS instead of two minutes later.
 *
 * What it cannot see is the declared cascade: auto-mode's flat/slice choice and media-query
 * detection need the rules themselves, which only CDP can enumerate on this engine. Those are
 * approximated and the legend says so.
 */
export function rzOverlay(config: OverlayConfig): void {
    var w = window as any;
    if (w.__rzOverlay) return;

    var A = config.attrs;
    var COLOURS = {
        shared: '#3ec98a',
        own: '#e2a33c',
        unmatched: '#e8556d',
        nothing: '#8a93a3',
    };

    var visible = config.startVisible;
    var root: HTMLElement | null = null;
    var boxes: { el: Element; frame: HTMLElement }[] = [];

    function classesOf(el: Element): string[] {
        var raw = el.getAttribute('class');
        return raw ? raw.split(/\s+/).filter(Boolean) : [];
    }

    function num(value: string): number {
        var parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Everything the bake key is derived from, as this page can see it. Two elements with the
     * same signature bake to the same texture; two that differ get one each.
     */
    function signatureOf(el: Element): string {
        var cs = getComputedStyle(el);
        var box = el as HTMLElement;

        return [
            el.getAttribute(A.mode) || 'auto',
            el.getAttribute(A.states) || '',
            el.getAttribute(A.scale) || String(config.bakeScale),
            // Layout units, matching what the build hashes - a transform above the element does
            // not change these, which is exactly why the build uses them too.
            box.offsetWidth + 'x' + box.offsetHeight,
            cs.boxShadow,
            cs.backgroundImage,
            cs.backgroundColor,
            cs.borderRadius,
            cs.filter,
            (cs as any).maskImage || '',
            cs.borderImageSource,
            cs.borderTopWidth + ' ' + cs.borderRightWidth + ' ' + cs.borderBottomWidth + ' ' + cs.borderLeftWidth,
            cs.borderTopColor + ' ' + cs.borderRightColor + ' ' + cs.borderBottomColor + ' ' + cs.borderLeftColor,
        ].join('|');
    }

    function keyOf(el: Element): string {
        return el.tagName.toLowerCase() + '|' + classesOf(el).slice().sort().join('.');
    }

    function isPainted(colour: string): boolean {
        if (!colour || colour === 'transparent' || colour === 'none') return false;
        var m = colour.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            var parts = m[1].split(',');
            if (parts.length === 4 && parseFloat(parts[3]) === 0) return false;
        }
        return true;
    }

    /** The planner's bakeability test, minus the parts that need the declared cascade. */
    function bakeable(el: Element): { ok: boolean; why: string } {
        var cs = getComputedStyle(el);

        var blend = (cs as any).mixBlendMode;
        if (blend && blend !== 'normal') return { ok: false, why: 'mix-blend-mode cannot be baked' };

        var backdrop = (cs as any).backdropFilter || (cs as any).webkitBackdropFilter;
        if (backdrop && backdrop !== 'none') return { ok: false, why: 'backdrop-filter cannot be baked' };

        var expensive =
            (cs.boxShadow && cs.boxShadow !== 'none') ||
            (cs.backgroundImage && cs.backgroundImage !== 'none') ||
            (cs.filter && cs.filter !== 'none') ||
            ((cs as any).maskImage && (cs as any).maskImage !== 'none') ||
            (cs.borderImageSource && cs.borderImageSource !== 'none');

        if (expensive) return { ok: true, why: '' };

        var radius =
            num(cs.borderTopLeftRadius) + num(cs.borderTopRightRadius) + num(cs.borderBottomRightRadius) + num(cs.borderBottomLeftRadius);
        var painted = isPainted(cs.backgroundColor) || (num(cs.borderTopWidth) > 0 && isPainted(cs.borderTopColor));

        if (radius > 0 && painted) return { ok: true, why: '' };
        if (el.getAttribute(A.mode) === 'element') return { ok: true, why: '' };

        return { ok: false, why: 'nothing here costs more than a plain fill' };
    }

    function ancestorClasses(el: Element): string[] {
        var tokens: string[] = [];
        var node = el.parentElement;
        var depth = 0;
        while (node && depth < 12) {
            tokens = tokens.concat(classesOf(node));
            node = node.parentElement;
            depth++;
        }
        return tokens;
    }

    /** Names what differs between two signatures, which is the question "why not shared" asks. */
    function differenceBetween(a: string, b: string): string {
        var labels = [
            'mode', 'states', 'scale', 'measured size', 'box-shadow', 'background-image', 'background-color',
            'border-radius', 'filter', 'mask', 'border-image', 'border widths', 'border colours',
        ];
        var left = a.split('|');
        var right = b.split('|');
        var differing: string[] = [];

        for (var i = 0; i < labels.length; i++) {
            if (left[i] !== right[i]) differing.push(labels[i]);
        }

        return differing.length ? differing.join(', ') : 'nothing detectable';
    }

    interface Classified {
        el: Element;
        verdict: Verdict;
        label: string;
        detail: string;
    }

    function classify(): Classified[] {
        var marked = Array.prototype.slice.call(document.querySelectorAll('[' + A.mark + ']')) as Element[];
        var bySignature: Record<string, Element[]> = {};
        var byKey: Record<string, Element[]> = {};
        var signatures: string[] = [];

        for (var i = 0; i < marked.length; i++) {
            var signature = signatureOf(marked[i]);
            signatures.push(signature);
            (bySignature[signature] = bySignature[signature] || []).push(marked[i]);
            var key = keyOf(marked[i]);
            (byKey[key] = byKey[key] || []).push(marked[i]);
        }

        var out: Classified[] = [];

        for (var j = 0; j < marked.length; j++) {
            var el = marked[j];
            var can = bakeable(el);

            if (!can.ok) {
                out.push({ el: el, verdict: 'nothing', label: 'not baked', detail: can.why });
                continue;
            }

            // Would the runtime find this element's texture? It matches on the element's own tag
            // and classes; a variant selected through an ancestor makes several bakes share one
            // key, and then only a distinguishing ancestor class can tell them apart.
            var siblings = byKey[keyOf(el)];
            var mySignature = signatures[j];
            var rivals: Element[] = [];

            for (var s = 0; s < siblings.length; s++) {
                if (signatureOf(siblings[s]) !== mySignature) rivals.push(siblings[s]);
            }

            if (!classesOf(el).length && !el.getAttribute(A.id)) {
                out.push({
                    el: el,
                    verdict: 'unmatched',
                    label: 'will not match',
                    detail: 'no classes and no data-rasterize-id, so there is no key to match on',
                });
                continue;
            }

            if (rivals.length) {
                var mine = ancestorClasses(el);
                var theirs: Record<string, boolean> = {};
                for (var r = 0; r < rivals.length; r++) {
                    var tokens = ancestorClasses(rivals[r]);
                    for (var t = 0; t < tokens.length; t++) theirs[tokens[t]] = true;
                }

                var separator = '';
                for (var m = 0; m < mine.length; m++) {
                    if (!theirs[mine[m]]) {
                        separator = mine[m];
                        break;
                    }
                }

                if (!separator) {
                    out.push({
                        el: el,
                        verdict: 'unmatched',
                        label: 'will not match',
                        detail:
                            rivals.length +
                            ' element(s) share its tag and classes but bake differently (' +
                            differenceBetween(mySignature, signatureOf(rivals[0])) +
                            '), and no ancestor class separates them',
                    });
                    continue;
                }
            }

            var shared = bySignature[mySignature];
            if (shared.length > 1) {
                out.push({
                    el: el,
                    verdict: 'shared',
                    label: 'shares a texture',
                    detail: shared.length + ' elements bake to this one texture',
                });
                continue;
            }

            // Its own texture. The useful part is why it is not sharing with its lookalikes.
            var detail = 'nothing else on the page bakes to this';
            for (var k = 0; k < marked.length; k++) {
                if (marked[k] === el) continue;
                if (keyOf(marked[k]) !== keyOf(el)) continue;
                detail = 'same tag and classes as ' + (siblings.length - 1) + ' other element(s), but ' +
                    differenceBetween(mySignature, signatures[k]) + ' differ';
                break;
            }

            out.push({ el: el, verdict: 'own', label: 'own texture', detail: detail });
        }

        return out;
    }

    function style(el: HTMLElement, css: Record<string, string>): void {
        for (var key in css) (el.style as any)[key] = css[key];
    }

    function build(): void {
        destroy();

        root = document.createElement('div');
        style(root, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '2147483000',
        });

        var results = classify();
        var counts = { shared: 0, own: 0, unmatched: 0, nothing: 0 };

        for (var i = 0; i < results.length; i++) {
            var item = results[i];
            counts[item.verdict]++;

            var frame = document.createElement('div');
            style(frame, {
                position: 'absolute',
                border: '2px solid ' + COLOURS[item.verdict],
                boxSizing: 'border-box',
                pointerEvents: 'none',
            });

            var chip = document.createElement('div');
            chip.textContent = item.label + ' - ' + item.detail;
            style(chip, {
                position: 'absolute',
                left: '0',
                top: '-18px',
                padding: '1px 5px',
                background: COLOURS[item.verdict],
                color: '#10131a',
                font: '11px monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '520px',
            });

            frame.appendChild(chip);
            root.appendChild(frame);
            boxes.push({ el: item.el, frame: frame });
        }

        root.appendChild(legend(counts, results.length));
        document.body.appendChild(root);
        position();
    }

    function legend(counts: Record<Verdict, number>, total: number): HTMLElement {
        var panel = document.createElement('div');
        style(panel, {
            position: 'absolute',
            right: '12px',
            bottom: '12px',
            padding: '10px 12px',
            background: 'rgba(12, 15, 20, 0.92)',
            border: '1px solid #2b3440',
            color: '#e6eaf0',
            font: '12px monospace',
            lineHeight: '1.6',
        });

        var rows = [
            ['shared', counts.shared + ' share a texture'],
            ['own', counts.own + ' get their own'],
            ['unmatched', counts.unmatched + " won't match at runtime"],
            ['nothing', counts.nothing + ' have nothing to bake'],
        ];

        var title = document.createElement('div');
        title.textContent = 'rasterize - ' + total + ' marked';
        style(title, { marginBottom: '4px', fontWeight: 'bold' });
        panel.appendChild(title);

        for (var i = 0; i < rows.length; i++) {
            var row = document.createElement('div');
            var swatch = document.createElement('span');
            style(swatch, {
                display: 'inline-block',
                width: '8px',
                height: '8px',
                marginRight: '6px',
                background: COLOURS[rows[i][0] as Verdict],
            });
            var text = document.createElement('span');
            text.textContent = rows[i][1];
            row.appendChild(swatch);
            row.appendChild(text);
            panel.appendChild(row);
        }

        var note = document.createElement('div');
        note.textContent = config.toggleKey + ' toggles - auto mode and media queries are approximated here';
        style(note, { marginTop: '6px', color: '#79838f' });
        panel.appendChild(note);

        return panel;
    }

    function position(): void {
        for (var i = 0; i < boxes.length; i++) {
            var rect = boxes[i].el.getBoundingClientRect();
            var frame = boxes[i].frame;

            style(frame, {
                left: rect.left + 'px',
                top: rect.top + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px',
            });

            // Keep each label over its own element: a chip that sprawls across its neighbours
            // makes a crowded HUD unreadable, which is the case this is most needed in.
            var chip = frame.firstChild as HTMLElement;
            if (chip) style(chip, { maxWidth: Math.max(rect.width, 120) + 'px' });
        }
    }

    function destroy(): void {
        if (root && root.parentNode) root.parentNode.removeChild(root);
        root = null;
        boxes = [];
    }

    function refresh(): void {
        if (visible) build();
    }

    var pending = 0;

    function isOurs(node: Node | null): boolean {
        var current: Node | null = node;
        while (current) {
            if (current === root) return true;
            current = current.parentNode;
        }
        return false;
    }

    function scheduleRefresh(records: MutationRecord[]): void {
        // Drawing the overlay mutates the document, which would schedule another refresh and
        // reset the debounce every time - the timer would never fire and the overlay would sit
        // on whatever it computed before the stylesheets arrived.
        var external = false;
        for (var i = 0; i < records.length; i++) {
            if (!isOurs(records[i].target)) {
                external = true;
                break;
            }
        }

        if (!external) return;
        if (pending) clearTimeout(pending);
        pending = setTimeout(refresh, 250) as unknown as number;
    }

    document.addEventListener('keydown', function (event) {
        if (event.key !== config.toggleKey) return;
        visible = !visible;
        if (visible) build();
        else destroy();
    });

    // The page keeps moving - lists scroll, panels animate - so the frames follow their elements.
    setInterval(function () {
        if (visible && boxes.length) position();
    }, 200);

    new MutationObserver(scheduleRefresh).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', A.mark, A.mode, A.states],
    });

    w.__rzOverlay = {
        toggle: function () {
            visible = !visible;
            if (visible) build();
            else destroy();
        },
        refresh: refresh,
        report: classify,
    };

    /**
     * Styles arrive after the document does - a dev server delivers CSS as a module that injects
     * it, and cohtml applies that on its own schedule rather than synchronously. Classifying at
     * DOMContentLoaded would judge an unstyled page and report that nothing is worth baking, so
     * the first pass waits for frames to pass and then settles.
     */
    function buildWhenStyled(): void {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                build();
                setTimeout(refresh, 400);
            });
        });
    }

    if (visible) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildWhenStyled);
        else buildWhenStyled();
    }
}
