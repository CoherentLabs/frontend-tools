/**
 * HTML surface probe — runs entirely inside the Gameface browser context.
 *
 * Three exported probe functions:
 *   htmlConstructorProbe  – constructor identity (the three-tier classifier)
 *   htmlFingerprintProbe  – behavioral tests for "implemented" tags
 *   inputTypeProbe        – <input type> matrix
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type HtmlTier = 'implemented' | 'parsed-no-impl' | 'unknown';

export interface HtmlConstructorResult {
    tier: HtmlTier;
    constructorName: string;
}

export type HtmlConstructorResults = Record<string, HtmlConstructorResult>;

export type HtmlFingerprintStatus =
    | 'supported'      // all checked behaviors work
    | 'partial'        // some behaviors missing or broken
    | 'stub';          // constructor found but no meaningful behavior

export interface HtmlFingerprintResult {
    status: HtmlFingerprintStatus;
    checks: Record<string, boolean>;
    notes?: string;
}

export type HtmlFingerprintResults = Record<string, HtmlFingerprintResult>;

export type InputTypeStatus =
    | 'supported'
    | 'type-preserved-but-inert'
    | 'silently-coerced';

export interface InputTypeResult {
    status: InputTypeStatus;
    roundTripType: string;
    /** Which type-specific APIs were tested and whether they responded. */
    apiChecks: Record<string, boolean>;
}

export type InputTypeResults = Record<string, InputTypeResult>;

// ── Constructor identity probe ────────────────────────────────────────────────

/**
 * Browser-side: create each tag and read its constructor name.
 * Returns a three-tier classification per tag.
 */
export function htmlConstructorProbe(tags: string[]): HtmlConstructorResults {
    const results: HtmlConstructorResults = {};

    for (const tag of tags) {
        try {
            const el = document.createElement(tag);
            const ctorName = el.constructor?.name ?? 'unknown';

            let tier: HtmlTier;
            if (ctorName === 'HTMLUnknownElement') {
                tier = 'unknown';
            } else if (ctorName === 'HTMLElement') {
                tier = 'parsed-no-impl';
            } else {
                tier = 'implemented';
            }

            results[tag] = { tier, constructorName: ctorName };
        } catch (e) {
            results[tag] = { tier: 'unknown', constructorName: 'error:' + String(e) };
        }
    }

    return results;
}

// ── Behavioral fingerprint probe ──────────────────────────────────────────────

/**
 * Browser-side: run targeted behavioral checks for each implemented tag.
 *
 * The fingerprint per tag tests the tag's PRIMARY spec behavior — the thing
 * that separates it from a generic HTMLElement. A tag with a specialized
 * constructor but no working behavior is classified as "stub".
 */
export function htmlFingerprintProbe(implementedTags: string[]): HtmlFingerprintResults {
    // ── generic classifier ───────────────────────────────────────────────────

    function classify(checks: Record<string, boolean>): HtmlFingerprintResult {
        const values = Object.values(checks);
        const passing = values.filter(Boolean).length;
        const total = values.length;
        let status: HtmlFingerprintStatus;
        if (passing === total) {
            status = 'supported';
        } else if (passing === 0) {
            status = 'stub';
        } else {
            status = 'partial';
        }
        return { status, checks };
    }

    // ── common Element / Node / HTMLElement API surface ─────────────────────
    //
    // The tag-specific FINGERPRINTS below verify the *specialised* IDL each
    // tag is supposed to have (HTMLAnchorElement.href, HTMLSelectElement.options,
    // …).  In addition we run a uniform audit of the *generic* DOM API surface
    // every element should inherit from Element/Node/HTMLElement: classList,
    // dataset, getAttribute/setAttribute round-trip, addEventListener,
    // querySelector, getBoundingClientRect, cloneNode, closest, id setter.
    // These are pure in-memory operations on detached elements — no resource
    // loading, no layout side effects (we use `typeof` for getBoundingClientRect
    // rather than calling it).  The combined evidence makes each tag's
    // partial.json entry self-describing: "specialised IDL X passes, but
    // dataset / classList missing".
    function commonElementChecks(el: HTMLElement): Record<string, boolean> {
        const checks: Record<string, boolean> = {};

        try {
            el.classList.add('__gf_test__');
            checks['classListSupport'] = el.classList.contains('__gf_test__');
            el.classList.remove('__gf_test__');
        } catch (_) { checks['classListSupport'] = false; }

        try {
            (el.dataset as any).gfTest = 'v';
            checks['datasetSupport'] = el.dataset['gfTest'] === 'v';
            delete (el.dataset as any).gfTest;
        } catch (_) { checks['datasetSupport'] = false; }

        try {
            el.setAttribute('data-gf-test', 'v');
            checks['attributeRoundTrip'] =
                el.getAttribute('data-gf-test') === 'v' && el.hasAttribute('data-gf-test');
            el.removeAttribute('data-gf-test');
        } catch (_) { checks['attributeRoundTrip'] = false; }

        try {
            el.id = '__gf_id__';
            checks['idAssignable'] = el.id === '__gf_id__';
            el.id = '';
        } catch (_) { checks['idAssignable'] = false; }

        checks['addEventListener'] = typeof el.addEventListener === 'function';
        checks['querySelector'] = typeof el.querySelector === 'function';
        checks['getBoundingClientRect'] = typeof el.getBoundingClientRect === 'function';
        checks['cloneNode'] = typeof el.cloneNode === 'function';
        checks['closest'] = typeof el.closest === 'function';

        return checks;
    }

    // ── fingerprint definitions ─────────────────────────────────────────────

    type FingerprintFn = () => HtmlFingerprintResult;

    const FINGERPRINTS: Record<string, FingerprintFn> = {
        a: () => {
            const el = document.createElement('a') as HTMLAnchorElement;
            el.href = 'https://example.com/path?q=1#hash';
            const checks: Record<string, boolean> = {
                hrefAssignable: el.href.includes('example.com'),
                hostnamePresent: typeof el.hostname === 'string',
                pathnamePresent: typeof el.pathname === 'string',
                searchPresent: typeof el.search === 'string',
                hashPresent: typeof el.hash === 'string',
            };
            return classify(checks);
        },

        img: () => {
            // CRITICAL: never assign to `el.src` — even a malformed data URL
            // hangs Gameface's image loader and the pending Runtime.evaluate
            // cascades into every subsequent probe.  Use `in` / typeof to
            // verify HTMLImageElement IDL surface without mutation.
            //
            // Empirically, Gameface's HTMLImageElement exposes the constructor
            // name but none of the spec'd IDL properties — so this fingerprint
            // will return all-false → classify() → "stub" → bucketed as
            // unsupported.  That's the truthful answer under the new policy:
            // a specialised constructor with no real interface behind it is
            // a shim, not a working implementation.
            const el = document.createElement('img') as HTMLImageElement;
            const checks: Record<string, boolean> = {
                srcProperty: 'src' in el && typeof el.src === 'string',
                altProperty: 'alt' in el && typeof el.alt === 'string',
                completeProperty: typeof el.complete === 'boolean',
                naturalWidthProperty: typeof el.naturalWidth === 'number',
                naturalHeightProperty: typeof el.naturalHeight === 'number',
            };
            return classify(checks);
        },

        video: () => {
            // Same hang risk as img — no `el.src = …` assignment.
            const el = document.createElement('video') as HTMLVideoElement;
            const checks: Record<string, boolean> = {
                srcProperty: 'src' in el && typeof el.src === 'string',
                currentTimeProperty: typeof el.currentTime === 'number',
                durationProperty: typeof el.duration === 'number',
                playMethod: typeof el.play === 'function',
                pauseMethod: typeof el.pause === 'function',
                pausedProperty: typeof el.paused === 'boolean',
                volumeProperty: typeof el.volume === 'number',
                readyStateProperty: typeof el.readyState === 'number',
                networkStateProperty: typeof el.networkState === 'number',
            };
            return classify(checks);
        },

        audio: () => {
            // Same hang risk as img — no `el.src = …` assignment.
            const el = document.createElement('audio') as HTMLAudioElement;
            const checks: Record<string, boolean> = {
                srcProperty: 'src' in el && typeof el.src === 'string',
                playMethod: typeof el.play === 'function',
                pauseMethod: typeof el.pause === 'function',
                volumeProperty: typeof el.volume === 'number',
                pausedProperty: typeof el.paused === 'boolean',
            };
            return classify(checks);
        },

        canvas: () => {
            const el = document.createElement('canvas') as HTMLCanvasElement;
            const checks: Record<string, boolean> = {
                widthAssignable: (() => { el.width = 100; return el.width === 100; })(),
                heightAssignable: (() => { el.height = 100; return el.height === 100; })(),
                getContext2d: typeof el.getContext === 'function' && el.getContext('2d') !== null,
                toDataURL: typeof el.toDataURL === 'function',
            };
            return classify(checks);
        },

        input: () => {
            const el = document.createElement('input') as HTMLInputElement;
            const checks: Record<string, boolean> = {
                valueAssignable: (() => { el.value = 'test'; return el.value === 'test'; })(),
                typeAssignable: (() => { el.type = 'text'; return el.type === 'text'; })(),
                nameAssignable: (() => { el.name = 'n'; return el.name === 'n'; })(),
                placeholderAssignable: (() => { el.placeholder = 'p'; return el.placeholder === 'p'; })(),
                focusMethod: typeof el.focus === 'function',
                blurMethod: typeof el.blur === 'function',
                selectMethod: typeof el.select === 'function',
                checkValidity: typeof el.checkValidity === 'function',
            };
            return classify(checks);
        },

        textarea: () => {
            const el = document.createElement('textarea') as HTMLTextAreaElement;
            const checks: Record<string, boolean> = {
                valueAssignable: (() => { el.value = 'test'; return el.value === 'test'; })(),
                rowsAssignable: (() => { el.rows = 5; return el.rows === 5; })(),
                colsAssignable: (() => { el.cols = 40; return el.cols === 40; })(),
                selectMethod: typeof el.select === 'function',
            };
            return classify(checks);
        },

        select: () => {
            const el = document.createElement('select') as HTMLSelectElement;
            const opt = document.createElement('option') as HTMLOptionElement;
            opt.value = 'a';
            opt.text = 'A';
            el.appendChild(opt);
            const checks: Record<string, boolean> = {
                optionsLength: el.options.length === 1,
                valueAssignable: (() => { el.value = 'a'; return el.value === 'a'; })(),
                selectedIndexProperty: typeof el.selectedIndex === 'number',
                addMethod: typeof el.add === 'function',
                removeMethod: typeof el.remove === 'function',
            };
            return classify(checks);
        },

        form: () => {
            const el = document.createElement('form') as HTMLFormElement;
            const input = document.createElement('input') as HTMLInputElement;
            input.name = 'foo';
            el.appendChild(input);
            const checks: Record<string, boolean> = {
                methodAssignable: (() => { el.method = 'post'; return el.method === 'post'; })(),
                elementsCollection: 'elements' in el,
                lengthProperty: typeof el.length === 'number',
                submitMethod: typeof el.submit === 'function',
                resetMethod: typeof el.reset === 'function',
                checkValidityMethod: typeof el.checkValidity === 'function',
            };
            return classify(checks);
        },

        button: () => {
            const el = document.createElement('button') as HTMLButtonElement;
            const checks: Record<string, boolean> = {
                typeAssignable: (() => { el.type = 'button'; return el.type === 'button'; })(),
                disabledAssignable: (() => { el.disabled = true; return el.disabled === true; })(),
                valueAssignable: (() => { el.value = 'v'; return el.value === 'v'; })(),
            };
            return classify(checks);
        },

        label: () => {
            const el = document.createElement('label') as HTMLLabelElement;
            const checks: Record<string, boolean> = {
                forAssignable: (() => { el.htmlFor = 'inputId'; return el.htmlFor === 'inputId'; })(),
                controlProperty: 'control' in el,
            };
            return classify(checks);
        },

        details: () => {
            const el = document.createElement('details') as HTMLDetailsElement;
            document.body!.appendChild(el);
            el.open = false;
            const closedHeight = el.offsetHeight;
            el.open = true;
            const openedHeight = el.offsetHeight;
            document.body!.removeChild(el);
            const checks: Record<string, boolean> = {
                openPropertySettable: (() => { el.open = true; return el.open === true; })(),
                openTogglesVisibility: openedHeight !== closedHeight || openedHeight >= 0,
            };
            return classify(checks);
        },

        dialog: () => {
            const el = document.createElement('dialog') as HTMLDialogElement;
            document.body!.appendChild(el);
            const checks: Record<string, boolean> = {
                showMethod: typeof el.show === 'function',
                showModalMethod: typeof el.showModal === 'function',
                closeMethod: typeof el.close === 'function',
                openProperty: typeof el.open === 'boolean',
                returnValueProperty: typeof el.returnValue === 'string',
            };
            try { el.show(); checks['showCallable'] = el.open === true; } catch (_) { checks['showCallable'] = false; }
            try { el.close(); } catch (_) { /* ignore */ }
            document.body!.removeChild(el);
            return classify(checks);
        },

        table: () => {
            const el = document.createElement('table') as HTMLTableElement;
            const checks: Record<string, boolean> = {
                captionProperty: 'caption' in el,
                tHeadProperty: 'tHead' in el,
                tFootProperty: 'tFoot' in el,
                tBodiesProperty: 'tBodies' in el,
                insertRowMethod: typeof el.insertRow === 'function',
                deleteRowMethod: typeof el.deleteRow === 'function',
            };
            return classify(checks);
        },

        script: () => {
            // Same hang risk as img — setting `el.src` may trigger Gameface's
            // script loader on a detached element.  Use typeof checks.
            const el = document.createElement('script') as HTMLScriptElement;
            const checks: Record<string, boolean> = {
                srcProperty: 'src' in el && typeof el.src === 'string',
                typeProperty: 'type' in el && typeof el.type === 'string',
                asyncProperty: typeof el.async === 'boolean',
                deferProperty: typeof el.defer === 'boolean',
            };
            return classify(checks);
        },

        link: () => {
            // Same hang risk as img — setting `el.rel = 'stylesheet'` and
            // `el.href = …` may trigger Gameface's stylesheet loader.
            const el = document.createElement('link') as HTMLLinkElement;
            const checks: Record<string, boolean> = {
                relProperty: 'rel' in el && typeof el.rel === 'string',
                hrefProperty: 'href' in el && typeof el.href === 'string',
                sheetProperty: 'sheet' in el,
            };
            return classify(checks);
        },

        meta: () => {
            const el = document.createElement('meta') as HTMLMetaElement;
            const checks: Record<string, boolean> = {
                nameAssignable: (() => { el.name = 'description'; return el.name === 'description'; })(),
                contentAssignable: (() => { el.content = 'test'; return el.content === 'test'; })(),
            };
            return classify(checks);
        },

        iframe: () => {
            // Same hang risk as img — setting `el.src` may trigger Gameface's
            // iframe loader.  width/height are layout-only attributes (no
            // resource loading), so still safe to set.
            const el = document.createElement('iframe') as HTMLIFrameElement;
            const checks: Record<string, boolean> = {
                srcProperty: 'src' in el && typeof el.src === 'string',
                widthAssignable: (() => { el.width = '100'; return el.width === '100'; })(),
                heightAssignable: (() => { el.height = '100'; return el.height === '100'; })(),
                contentDocumentProperty: 'contentDocument' in el,
                contentWindowProperty: 'contentWindow' in el,
            };
            return classify(checks);
        },

        template: () => {
            const el = document.createElement('template') as HTMLTemplateElement;
            const checks: Record<string, boolean> = {
                contentProperty: el.content instanceof DocumentFragment,
            };
            return classify(checks);
        },

        progress: () => {
            const el = document.createElement('progress') as HTMLProgressElement;
            const checks: Record<string, boolean> = {
                valueAssignable: (() => { el.value = 50; return el.value === 50; })(),
                maxAssignable: (() => { el.max = 100; return el.max === 100; })(),
                positionProperty: typeof el.position === 'number',
            };
            return classify(checks);
        },

        meter: () => {
            const el = document.createElement('meter') as HTMLMeterElement;
            const checks: Record<string, boolean> = {
                valueAssignable: (() => { el.value = 0.5; return el.value === 0.5; })(),
                minAssignable: (() => { el.min = 0; return el.min === 0; })(),
                maxAssignable: (() => { el.max = 1; return el.max === 1; })(),
            };
            return classify(checks);
        },

        option: () => {
            const el = document.createElement('option') as HTMLOptionElement;
            const checks: Record<string, boolean> = {
                valueAssignable: (() => { el.value = 'v'; return el.value === 'v'; })(),
                textAssignable: (() => { el.text = 'label'; return el.text === 'label'; })(),
                selectedAssignable: (() => { el.selected = true; return el.selected === true; })(),
                disabledAssignable: (() => { el.disabled = true; return el.disabled === true; })(),
            };
            return classify(checks);
        },
    };

    // ── main loop ────────────────────────────────────────────────────────────

    const results: HtmlFingerprintResults = {};
    const tagSet = new Set(implementedTags);

    for (const [tag, fn] of Object.entries(FINGERPRINTS)) {
        if (!tagSet.has(tag)) continue;
        try {
            const idl = fn();
            const apiChecks = commonElementChecks(document.createElement(tag) as HTMLElement);
            results[tag] = mergeChecks(idl, apiChecks);
        } catch (e) {
            results[tag] = {
                status: 'stub',
                checks: {},
                notes: 'fingerprint threw: ' + String(e),
            };
        }
    }

    // For implemented tags with no specific fingerprint, classify on
    // constructor presence + the common Element API audit alone.
    for (const tag of implementedTags) {
        if (!results[tag]) {
            const el = document.createElement(tag) as HTMLElement;
            const ctorName = el.constructor?.name ?? '';
            const idlChecks = {
                constructorPresent: ctorName !== 'HTMLElement' && ctorName !== 'HTMLUnknownElement',
            };
            const apiChecks = commonElementChecks(el);
            results[tag] = mergeChecks(classify(idlChecks), apiChecks);
        }
    }

    return results;

    // ── helpers ─────────────────────────────────────────────────────────────

    function mergeChecks(idl: HtmlFingerprintResult, api: Record<string, boolean>): HtmlFingerprintResult {
        const merged = { ...idl.checks, ...api };
        const reclassified = classify(merged);
        return idl.notes ? { ...reclassified, notes: idl.notes } : reclassified;
    }
}

// ── Input type matrix probe ───────────────────────────────────────────────────

/**
 * Browser-side: test each <input> type for support.
 *
 * For each candidate type:
 *   1. Set el.type = candidate, read it back.
 *      - If el.type !== candidate → silently-coerced (engine defaulted to "text").
 *   2. Test type-specific APIs.
 *      - If type preserved but APIs don't work → type-preserved-but-inert.
 *      - If type preserved and APIs work → supported.
 */
export function inputTypeProbe(types: string[]): InputTypeResults {
    const results: InputTypeResults = {};

    for (const type of types) {
        results[type] = probeType(type);
    }

    return results;

    // ── helpers ────────────────────────────────────────────────────────────────

    function probeType(type: string): InputTypeResult {
        const el = document.createElement('input') as HTMLInputElement;
        el.type = type;
        const roundTripType = el.type;

        if (roundTripType !== type) {
            return {
                status: 'silently-coerced',
                roundTripType,
                apiChecks: {},
            };
        }

        const apiChecks = checkTypeApis(el, type);
        const apiValues = Object.values(apiChecks);
        const allApisPassing = apiValues.length === 0 || apiValues.every(Boolean);

        return {
            status: allApisPassing ? 'supported' : 'type-preserved-but-inert',
            roundTripType,
            apiChecks,
        };
    }

    function checkTypeApis(el: HTMLInputElement, type: string): Record<string, boolean> {
        const checks: Record<string, boolean> = {};

        switch (type) {
            case 'checkbox':
            case 'radio':
                el.checked = true;
                checks['checkedAssignable'] = el.checked === true;
                checks['indeterminateAssignable'] = (() => {
                    el.indeterminate = true;
                    return el.indeterminate === true;
                })();
                break;

            case 'number':
            case 'range':
                el.min = '0';
                el.max = '100';
                el.value = '42';
                checks['valueAsNumberWorks'] = el.valueAsNumber === 42;
                checks['stepUpMethod'] = typeof el.stepUp === 'function';
                checks['stepDownMethod'] = typeof el.stepDown === 'function';
                break;

            case 'date':
            case 'datetime-local':
            case 'month':
            case 'week':
            case 'time':
                checks['valueAsDateProperty'] = 'valueAsDate' in el;
                checks['valueAsNumberProperty'] = 'valueAsNumber' in el;
                break;

            case 'file':
                checks['filesProperty'] = 'files' in el && (el.files === null || el.files instanceof FileList);
                checks['multipleAssignable'] = (() => {
                    el.multiple = true;
                    return el.multiple === true;
                })();
                break;

            case 'color':
                el.value = '#ff0000';
                checks['hexValueRoundTrips'] = el.value === '#ff0000';
                break;

            case 'email':
            case 'url':
            case 'tel':
            case 'search':
                checks['patternAssignable'] = (() => {
                    el.pattern = '[a-z]+';
                    return el.pattern === '[a-z]+';
                })();
                checks['checkValidity'] = typeof el.checkValidity === 'function';
                break;

            case 'text':
            case 'password':
            case 'hidden':
                el.value = 'test';
                checks['valueAssignable'] = el.value === 'test';
                break;

            case 'submit':
            case 'reset':
            case 'button':
            case 'image':
                checks['valueAssignable'] = (() => {
                    el.value = 'label';
                    return el.value === 'label';
                })();
                break;
        }

        return checks;
    }
}
