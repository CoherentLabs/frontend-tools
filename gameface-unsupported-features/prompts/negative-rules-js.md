# Negative Rules — JS

Generated from `results/js/{partial,unsupported}.json`. Stubbed APIs (`stub`, `stub-heavy`, `partial`) are collapsed into the `stub` status; `missing-from-window` becomes `missing`. Missing globals are grouped into family rules to keep the file scannable.

Total rules in this file: **129** (critical: 42, high: 73, medium: 6, low: 8).

## CRITICAL (42)

---
### [JS-001] — Animation
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new Animation(/* ... */); // TypeError: Animation is not a constructor
```

**✅ Generate instead:**
```js
// Drive animation through CSS @keyframes + the animation-* longhands (all supported):
el.style.animationName = 'fadeIn';
el.style.animationDuration = '300ms';
```

**Rule for AI agents:** Never `new Animation(...)` (constructor missing) and do not read/write `effect`, `finished`, `id`, `oncancel`, `onremove`, `pending`, `playState`, `ready`, `replaceState`, `startTime`, …+5 more on existing `Animation` instances; all missing in Gameface.

**Why:** scraper missing: ["effect","finished","id","oncancel","onremove","pending","playState","ready","replaceState","startTime","timeline","updatePlaybackRate"] …+4 more.

---
### [JS-002] — AnimationEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new AnimationEvent(/* ... */); // TypeError: AnimationEvent is not a constructor
```

**✅ Generate instead:**
```js
// Drive animation through CSS @keyframes + the animation-* longhands (all supported):
el.style.animationName = 'fadeIn';
el.style.animationDuration = '300ms';
```

**Rule for AI agents:** Never `new AnimationEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["AnimationEvent"].

---
### [JS-003] — CanvasRenderingContext2D
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.createImageData; // CanvasRenderingContext2D.createImageData is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Canvas drawing is not functional. Render via DOM elements or the host engine.
```

**Rule for AI agents:** Never read/write `createImageData`, `direction`, `ellipse`, `filter`, `fontKerning`, `fontStretch`, `fontVariantCaps`, `getContextAttributes`, `getImageData`, `getLineDash`, …+16 more on `CanvasRenderingContext2D` instances; missing in Gameface.

**Why:** scraper missing: ["createImageData","direction","ellipse","filter","fontKerning","fontStretch","fontVariantCaps","getContextAttributes","getImageData","getLineDash","getTransform","imageSmoothingEnabled"] …+14 more.

---
### [JS-004] — Comment
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new Comment(/* ... */); // TypeError: Comment is not a constructor
```

**✅ Generate instead:**
```js
// document.createTextNode(...) / createComment(...) work. Avoid `new Comment()` — constructor missing.
```

**Rule for AI agents:** Never `new Comment(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["Comment"].

---
### [JS-005] — Console
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.clear; // Console.clear is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use console.log/info/warn/error/debug/assert/time/timeEnd — they are present. Avoid dir/group*/table/count*/dirxml/timeLog/timeStamp/trace.
```

**Rule for AI agents:** Never read/write `clear`, `count`, `countReset`, `dir`, `dirxml`, `group`, `groupCollapsed`, `groupEnd`, `table`, `timeLog`, …+2 more on `Console` instances; missing in Gameface.

**Why:** scraper missing: ["clear","count","countReset","dir","dirxml","group","groupCollapsed","groupEnd","table","timeLog","timeStamp","trace"].

---
### [JS-007] — CSS
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.deg; // CSS.deg is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// CSS.escape works in browsers but unit helpers (CSS.px/em/vw/%, etc.) are missing here. Build raw strings: el.style.width = (n + 'px').
```

**Rule for AI agents:** Never read/write `deg`, `em`, `in`, `ms`, `number`, `percent`, `pt`, `px`, `rem`, `s`, …+4 more on `CSS` instances; missing in Gameface.

**Why:** scraper missing: ["deg","em","in","ms","number","percent","pt","px","rem","s","vh","vmax"] …+2 more.

---
### [JS-008] — CSSStyleDeclaration
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.boxSizing; // CSSStyleDeclaration.boxSizing is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use el.style.<longhand> for the supported longhands only (see results/css/{supported,partial}.json). Avoid setProperty for custom CSS vars (var() is supported, but the CSSOM setter has 350 missing members).
```

**Rule for AI agents:** Never read/write `boxSizing`, `fontVariantEastAsian`, `accentColor`, `alignmentBaseline`, `animationComposition`, `appearance`, `backgroundAttachment`, `backgroundBlendMode`, `backgroundClip`, `backgroundOrigin`, …+340 more on `CSSStyleDeclaration` instances; missing in Gameface.

**Why:** scraper missing: ["boxSizing","fontVariantEastAsian","accentColor","alignmentBaseline","animationComposition","appearance","backgroundAttachment","backgroundBlendMode","backgroundClip","backgroundOrigin","baselineShift","baselineSource"] …+338 more.

---
### [JS-009] — CSSStyleSheet
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new CSSStyleSheet(/* ... */); // TypeError: CSSStyleSheet is not a constructor
```

**✅ Generate instead:**
```js
// Don't construct CSSStyleSheet (missing). Toggle classes or set inline style to mutate visuals.
```

**Rule for AI agents:** Never `new CSSStyleSheet(...)` (constructor missing) and do not read/write `ownerRule`, `rules`, `addRule`, `removeRule`, `replace`, `replaceSync` on existing `CSSStyleSheet` instances; all missing in Gameface.

**Why:** scraper missing: ["ownerRule","rules","addRule","removeRule","replace","replaceSync","CSSStyleSheet"].

---
### [JS-010] — CustomElementRegistry
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.get; // CustomElementRegistry.get is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// customElements.define() exists but get/getName/upgrade/whenDefined are missing — no upgrade lifecycle. Prefer plain factory functions that return DOM trees.
```

**Rule for AI agents:** Never read/write `get`, `getName`, `upgrade`, `whenDefined` on `CustomElementRegistry` instances; missing in Gameface.

**Why:** scraper missing: ["get","getName","upgrade","whenDefined"].

---
### [JS-011] — CustomEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new CustomEvent(/* ... */); // TypeError: CustomEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct CustomEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new CustomEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CustomEvent"].

---
### [JS-012] — Document
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new Document(/* ... */); // TypeError: Document is not a constructor
```

**✅ Generate instead:**
```js
// Use the documented Document API only: getElementById, querySelector(All), createElement(NS), createTextNode/Comment, body/head/documentElement, addEventListener/removeEventListener, defaultView, readyState.
```

**Rule for AI agents:** Never `new Document(...)` (constructor missing) and do not read/write `alinkColor`, `all`, `anchors`, `applets`, `bgColor`, `cookie`, `designMode`, `dir`, `domain`, `embeds`, …+90 more on existing `Document` instances; all missing in Gameface.

**Why:** scraper missing: ["alinkColor","all","anchors","applets","bgColor","cookie","designMode","dir","domain","embeds","fgColor","forms"] …+89 more.

---
### [JS-013] — DOMRect
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new DOMRect(/* ... */); // TypeError: DOMRect is not a constructor
```

**✅ Generate instead:**
```js
// Don't construct DOMRect; read existing instances returned by DOM APIs (getBoundingClientRect, etc.).
```

**Rule for AI agents:** Never `new DOMRect(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["DOMRect"].

---
### [JS-014] — Element
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.currentCSSZoom; // Element.currentCSSZoom is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use the documented Element subset: querySelector(All), getBoundingClientRect, getAttribute/setAttribute/removeAttribute, classList (DOMTokenList is fully supported), className, id, addEventListener, dispatchEvent, children, parent/firstChild/lastChild, scrollTop/scrollLeft, getElementsByClassName/TagName.
```

**Rule for AI agents:** Never read/write `currentCSSZoom`, `onfullscreenchange`, `onfullscreenerror`, `checkVisibility`, `computedStyleMap`, `getHTML`, `hasPointerCapture`, `releasePointerCapture`, `requestFullscreen`, `requestPointerLock`, …+71 more on `Element` instances; missing in Gameface.

**Why:** scraper missing: ["currentCSSZoom","onfullscreenchange","onfullscreenerror","checkVisibility","computedStyleMap","getHTML","hasPointerCapture","releasePointerCapture","requestFullscreen","requestPointerLock","scroll","scrollBy"] …+69 more.

---
### [JS-015] — ErrorEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new ErrorEvent(/* ... */); // TypeError: ErrorEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct ErrorEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new ErrorEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["ErrorEvent"].

---
### [JS-016] — EventTarget
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new EventTarget(/* ... */); // TypeError: EventTarget is not a constructor
```

**✅ Generate instead:**
```js
// Never construct EventTarget; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new EventTarget(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["EventTarget"].

---
### [JS-018] — FocusEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new FocusEvent(/* ... */); // TypeError: FocusEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct FocusEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new FocusEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["FocusEvent"].

---
### [JS-019] — GamepadEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new GamepadEvent(/* ... */); // TypeError: GamepadEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct GamepadEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new GamepadEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["GamepadEvent"].

---
### [JS-020] — History
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.scrollRestoration; // History.scrollRestoration is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// history.scrollRestoration is missing. pushState/replaceState/back/forward/length/state are present in the partial surface but do not perform navigation; treat as no-ops.
```

**Rule for AI agents:** Never read/write `scrollRestoration` on `History` instances; missing in Gameface.

**Why:** scraper missing: ["scrollRestoration"].

---
### [JS-021] — HTMLCanvasElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.getContext2D; // HTMLCanvasElement.getContext2D is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use canvas.width, canvas.height, canvas.getContext('2d'). Avoid toDataURL/toBlob/captureStream/transferControlToOffscreen.
```

**Rule for AI agents:** Never read/write `getContext2D`, `captureStream`, `toBlob`, `toDataURL`, `transferControlToOffscreen`, `mozOpaque`, `mozPrintCallback` on `HTMLCanvasElement` instances; missing in Gameface.

**Why:** scraper missing: ["getContext2D","captureStream","toBlob","toDataURL","transferControlToOffscreen","mozOpaque","mozPrintCallback"].

---
### [JS-022] — HTMLIFrameElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.align; // HTMLIFrameElement.align is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// <iframe> is parsed-no-impl. Don't depend on contentDocument/contentWindow/src/srcdoc/allow/sandbox/loading.
```

**Rule for AI agents:** Never read/write `align`, `allow`, `allowFullscreen`, `contentDocument`, `contentWindow`, `frameBorder`, `height`, `loading`, `longDesc`, `marginHeight`, …+17 more on `HTMLIFrameElement` instances; missing in Gameface.

**Why:** scraper missing: ["align","allow","allowFullscreen","contentDocument","contentWindow","frameBorder","height","loading","longDesc","marginHeight","marginWidth","name"] …+15 more.

---
### [JS-023] — HTMLImageElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.align; // HTMLImageElement.align is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use img.src only. Avoid alt/complete/naturalWidth/Height/currentSrc/crossOrigin/decoding/fetchPriority/loading/referrerPolicy/sizes/srcset.
```

**Rule for AI agents:** Never read/write `align`, `alt`, `border`, `complete`, `crossOrigin`, `currentSrc`, `decoding`, `fetchPriority`, `hspace`, `isMap`, …+17 more on `HTMLImageElement` instances; missing in Gameface.

**Why:** scraper missing: ["align","alt","border","complete","crossOrigin","currentSrc","decoding","fetchPriority","hspace","isMap","loading","longDesc"] …+15 more.

---
### [JS-024] — HTMLInputElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.accept; // HTMLInputElement.accept is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use input.value, input.type ("text"/"password"/"button" only), focus(), blur(), select(), setRangeText, setSelectionRange, placeholder (writeable). Avoid checked/files/validity/required/min/max/pattern/list/labels.
```

**Rule for AI agents:** Never read/write `accept`, `align`, `alt`, `autocomplete`, `capture`, `checked`, `defaultChecked`, `defaultValue`, `dirName`, `disabled`, …+41 more on `HTMLInputElement` instances; missing in Gameface.

**Why:** scraper missing: ["accept","align","alt","autocomplete","capture","checked","defaultChecked","defaultValue","dirName","disabled","files","form"] …+39 more.

---
### [JS-025] — HTMLLinkElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.as; // HTMLLinkElement.as is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use link.href, link.rel. Avoid sheet/relList/media/crossOrigin/integrity/fetchPriority/hreflang/imageSizes/imageSrcset/referrerPolicy/sizes/disabled/as.
```

**Rule for AI agents:** Never read/write `as`, `charset`, `crossOrigin`, `disabled`, `fetchPriority`, `hreflang`, `imageSizes`, `imageSrcset`, `integrity`, `media`, …+7 more on `HTMLLinkElement` instances; missing in Gameface.

**Why:** scraper missing: ["as","charset","crossOrigin","disabled","fetchPriority","hreflang","imageSizes","imageSrcset","integrity","media","referrerPolicy","rev"] …+5 more.

---
### [JS-026] — HTMLMediaElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.srcObject; // HTMLMediaElement.srcObject is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// No real media playback. Bridge to the host engine for audio/video.
```

**Rule for AI agents:** Never read/write `srcObject`, `controls`, `defaultMuted`, `disableRemotePlayback`, `mediaKeys`, `onencrypted`, `onwaitingforkey`, `preservesPitch`, `remote`, `sinkId`, …+17 more on `HTMLMediaElement` instances; missing in Gameface.

**Why:** scraper missing: ["srcObject","controls","defaultMuted","disableRemotePlayback","mediaKeys","onencrypted","onwaitingforkey","preservesPitch","remote","sinkId","textTracks","addTextTrack"] …+15 more.

---
### [JS-027] — HTMLTextAreaElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.autocomplete; // HTMLTextAreaElement.autocomplete is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use textarea.value, rows, cols, focus(), blur(), select(), setRangeText, setSelectionRange. Avoid form/labels/validity/required/disabled/readOnly/autocomplete.
```

**Rule for AI agents:** Never read/write `autocomplete`, `defaultValue`, `dirName`, `disabled`, `form`, `labels`, `name`, `placeholder`, `readOnly`, `required`, …+7 more on `HTMLTextAreaElement` instances; missing in Gameface.

**Why:** scraper missing: ["autocomplete","defaultValue","dirName","disabled","form","labels","name","placeholder","readOnly","required","type","validationMessage"] …+5 more.

---
### [JS-028] — HTMLVideoElement
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.disablePictureInPicture; // HTMLVideoElement.disablePictureInPicture is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// No real media playback. Bridge to the host engine for audio/video.
```

**Rule for AI agents:** Never read/write `disablePictureInPicture`, `onenterpictureinpicture`, `onleavepictureinpicture`, `playsInline`, `cancelVideoFrameCallback`, `getVideoPlaybackQuality`, `requestPictureInPicture`, `requestVideoFrameCallback`, `mozDecodedFrames`, `mozFrameDelay`, …+4 more on `HTMLVideoElement` instances; missing in Gameface.

**Why:** scraper missing: ["disablePictureInPicture","onenterpictureinpicture","onleavepictureinpicture","playsInline","cancelVideoFrameCallback","getVideoPlaybackQuality","requestPictureInPicture","requestVideoFrameCallback","mozDecodedFrames","mozFrameDelay","mozHasAudio","mozPaintedFrames"] …+2 more.

---
### [JS-029] — MutationObserver
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new MutationObserver(/* ... */); // TypeError: MutationObserver is not a constructor
```

**✅ Generate instead:**
```js
// No reactive observation — the constructor is missing. Recompute on requestAnimationFrame or apply changes synchronously when you cause them.
```

**Rule for AI agents:** Never `new MutationObserver(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["MutationObserver"].

---
### [JS-030] — Navigator
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.clipboard; // Navigator.clipboard is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Don't use navigator.clipboard/credentials/mediaDevices/geolocation/permissions/serviceWorker/storage/vibrate/share/userAgentData/locks/connection — missing. Engine bridge for host integrations.
```

**Rule for AI agents:** Never read/write `clipboard`, `credentials`, `doNotTrack`, `geolocation`, `login`, `maxTouchPoints`, `mediaCapabilities`, `mediaDevices`, `mediaSession`, `permissions`, …+77 more on `Navigator` instances; missing in Gameface.

**Why:** scraper missing: ["clipboard","credentials","doNotTrack","geolocation","login","maxTouchPoints","mediaCapabilities","mediaDevices","mediaSession","permissions","serviceWorker","userActivation"] …+75 more.

---
### [JS-031] — Performance
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.eventCounts; // Performance.eventCounts is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Only performance.now() is supported. Don't call mark/measure/getEntries*/timing/navigation.
```

**Rule for AI agents:** Never read/write `eventCounts`, `navigation`, `onresourcetimingbufferfull`, `timeOrigin`, `timing`, `clearMarks`, `clearMeasures`, `clearResourceTimings`, `getEntries`, `getEntriesByName`, …+7 more on `Performance` instances; missing in Gameface.

**Why:** scraper missing: ["eventCounts","navigation","onresourcetimingbufferfull","timeOrigin","timing","clearMarks","clearMeasures","clearResourceTimings","getEntries","getEntriesByName","getEntriesByType","mark"] …+5 more.

---
### [JS-032] — ProgressEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new ProgressEvent(/* ... */); // TypeError: ProgressEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct ProgressEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new ProgressEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["ProgressEvent"].

---
### [JS-033] — PromiseRejectionEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new PromiseRejectionEvent(/* ... */); // TypeError: PromiseRejectionEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct PromiseRejectionEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new PromiseRejectionEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["PromiseRejectionEvent"].

---
### [JS-034] — ResizeObserver
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new ResizeObserver(/* ... */); // TypeError: ResizeObserver is not a constructor
```

**✅ Generate instead:**
```js
// No reactive observation — the constructor is missing. Recompute on requestAnimationFrame or apply changes synchronously when you cause them.
```

**Rule for AI agents:** Never `new ResizeObserver(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["ResizeObserver"].

---
### [JS-035] — Selection
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.direction; // Selection.direction is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// No text-selection workflow. Avoid features that depend on Selection/Range.
```

**Rule for AI agents:** Never read/write `direction`, `isCollapsed`, `rangeCount`, `type`, `addRange`, `collapse`, `collapseToEnd`, `collapseToStart`, `containsNode`, `deleteFromDocument`, …+7 more on `Selection` instances; missing in Gameface.

**Why:** scraper missing: ["direction","isCollapsed","rangeCount","type","addRange","collapse","collapseToEnd","collapseToStart","containsNode","deleteFromDocument","extend","getComposedRanges"] …+5 more.

---
### [JS-036] — ShadowRoot
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.serializable; // ShadowRoot.serializable is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// element.attachShadow may exist on Element but adoptedStyleSheets/getAnimations/getSelection/setHTMLUnsafe are missing. Avoid Shadow DOM-dependent designs.
```

**Rule for AI agents:** Never read/write `serializable`, `getHTML`, `setHTMLUnsafe`, `adoptedStyleSheets`, `fullscreenElement`, `getAnimations`, `getSelection`, `pictureInPictureElement`, `pointerLockElement` on `ShadowRoot` instances; missing in Gameface.

**Why:** scraper missing: ["serializable","getHTML","setHTMLUnsafe","adoptedStyleSheets","fullscreenElement","getAnimations","getSelection","pictureInPictureElement","pointerLockElement"].

---
### [JS-038] — TransitionEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new TransitionEvent(/* ... */); // TypeError: TransitionEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct TransitionEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new TransitionEvent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["TransitionEvent"].

---
### [JS-039] — URL
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new URL(/* ... */); // TypeError: URL is not a constructor
```

**✅ Generate instead:**
```js
// new URL() is missing. Concatenate path strings manually:
const path = base + '/' + segment + '?' + new URLSearchParams /* also missing */;
```

**Rule for AI agents:** Never `new URL(...)` (constructor missing) and do not read/write `revokeObjectURL`, `password`, `searchParams`, `username` on existing `URL` instances; all missing in Gameface.

**Why:** scraper missing: ["revokeObjectURL","password","searchParams","username","URL"].

---
### [JS-040] — WebSocket
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new WebSocket(/* ... */); // TypeError: WebSocket is not a constructor
```

**✅ Generate instead:**
```js
// Communicate with the host via the Gameface bridge (engine.call, coh-* APIs). No HTTP/WS from page JS.
```

**Rule for AI agents:** Never `new WebSocket(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["WebSocket"].

---
### [JS-041] — Window
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
instance.console; // Window.console is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Avoid alert/confirm/prompt/open/postMessage/print/matchMedia/requestIdleCallback/structuredClone — missing. setTimeout/clearTimeout/setInterval/clearInterval/queueMicrotask are supported.
```

**Rule for AI agents:** Never read/write `console`, `chrome`, `clientInformation`, `closed`, `cookieStore`, `event`, `external`, `frameElement`, `frames`, `length`, …+74 more on `Window` instances; missing in Gameface.

**Why:** scraper missing: ["console","chrome","clientInformation","closed","cookieStore","event","external","frameElement","frames","length","locationbar","menubar"] …+72 more.

---
### [JS-042] — XMLHttpRequest
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new XMLHttpRequest(/* ... */); // TypeError: XMLHttpRequest is not a constructor
```

**✅ Generate instead:**
```js
// Communicate with the host via the Gameface bridge (engine.call, coh-* APIs). No HTTP/WS from page JS.
```

**Rule for AI agents:** Never `new XMLHttpRequest(...)` (constructor missing) and do not read/write `responseArrayBuffer`, `responseBlob`, `responseXML`, `upload`, `setAttributionReporting`, `setPrivateToken` on existing `XMLHttpRequest` instances; all missing in Gameface.

**Why:** scraper missing: ["responseArrayBuffer","responseBlob","responseXML","upload","XMLHttpRequest","setAttributionReporting","setPrivateToken"].

---
### [JS-017] — Fetch / network APIs
**Status:** missing
**Surface:** js-api
**Severity:** critical

**❌ Never generate:**
```js
BroadcastChannel; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use network/IPC APIs (`fetch`, `Request`, `Response`, `Headers`, `FormData`, `EventSource`, `WebSocket` (constructor), `BroadcastChannel`, `MessageChannel`, `Worker`, `SharedWorker`); communicate with the host engine via the Gameface bridge.

**Why:** scraper status: missing-from-window. Members: BroadcastChannel, EventSource, FormData, Headers, MessageChannel, MessagePort, Request, Response, ServiceWorker, ServiceWorkerContainer, ServiceWorkerContainerEventMap, ServiceWorkerEventMap, ServiceWorkerGlobalScope, ServiceWorkerRegistration, ServiceWorkerRegistrationEventMap, SharedWorker, Worker, fetch.

---
### [JS-037] — Storage and database APIs
**Status:** missing
**Surface:** js-api
**Severity:** critical

**❌ Never generate:**
```js
File; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use browser storage APIs (`localStorage`, `sessionStorage`, `indexedDB`, `IDB*`, `FileReader`, `File`, `FileList`, `FileSystem*`, `caches`, `cookieStore`); none are available. Persist via the engine bridge.

**Why:** scraper status: missing-from-window. Members: File, FileCallback, FileEntrySync, FileList, FilePropertyBag, FileReader, FileReaderEventMap, FileReaderSync, FileSystem, FileSystemCreateWritableOptions, FileSystemDirectoryEntry, FileSystemDirectoryHandle, FileSystemDirectoryReader, FileSystemEntriesCallback, FileSystemEntry, FileSystemEntryCallback, FileSystemFileEntry, FileSystemFileHandle, FileSystemFlags, FileSystemGetDirectoryOptions, FileSystemGetFileOptions, FileSystemHandle, FileSystemObserver, FileSystemRemoveOptions, FileSystemSync, FileSystemSyncAccessHandle, FileSystemWritableFileStream, IDBCursor, IDBCursorWithValue, IDBDatabase, IDBDatabaseEventMap, IDBDatabaseInfo, IDBFactory, IDBIndex, IDBIndexParameters, IDBKeyRange, IDBObjectStore, IDBObjectStoreParameters, IDBOpenDBRequest, IDBOpenDBRequestEventMap, IDBRequest, IDBRequestEventMap, IDBTransaction, IDBTransactionEventMap, IDBTransactionOptions, IDBVersionChangeEvent, IDBVersionChangeEventInit, StorageManager, caches, indexedDB.

---
### [JS-006] — Crypto, encoding, structured-clone
**Status:** missing
**Surface:** js-api
**Severity:** critical

**❌ Never generate:**
```js
SubtleCrypto; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use `crypto`, `SubtleCrypto`, `TextEncoder`/`TextDecoder`/`TextEncoderStream`/`TextDecoderStream`, `atob`/`btoa`, or `structuredClone`; missing. Implement what you need by hand or pull the data through the engine bridge.

**Why:** scraper status: missing-from-window. Members: SubtleCrypto, TextDecoder, TextDecoderStream, TextEncoder, TextEncoderStream, atob, btoa, crypto, structuredClone.

---

## HIGH (73)

---
### [JS-043] — Attr
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.ownerElement; // Attr.ownerElement is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Read/write attributes via element.getAttribute/setAttribute/removeAttribute. Don't poke Attr directly.
```

**Rule for AI agents:** Never read/write `ownerElement`, `specified` on `Attr` instances; missing in Gameface.

**Why:** scraper missing: ["ownerElement","specified"].

---
### [JS-044] — Blob
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new Blob(/* ... */); // TypeError: Blob is not a constructor
```

**✅ Generate instead:**
```js
// Don't construct Blob or call text/arrayBuffer/stream/bytes; bridge binary data through the engine.
```

**Rule for AI agents:** Never `new Blob(...)` (constructor missing) and do not read/write `arrayBuffer`, `bytes`, `stream`, `text` on existing `Blob` instances; all missing in Gameface.

**Why:** scraper missing: ["arrayBuffer","bytes","stream","text","Blob"].

---
### [JS-045] — BlobPropertyBag
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.endings; // BlobPropertyBag.endings is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// BlobPropertyBag is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `endings` on `BlobPropertyBag` instances; missing in Gameface.

**Why:** scraper missing: ["endings"].

---
### [JS-046] — CanvasPattern
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.setTransform; // CanvasPattern.setTransform is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Canvas drawing is not functional. Render via DOM elements or the host engine.
```

**Rule for AI agents:** Never read/write `setTransform` on `CanvasPattern` instances; missing in Gameface.

**Why:** scraper missing: ["setTransform"].

---
### [JS-047] — CaretPosition
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.getClientRect; // CaretPosition.getClientRect is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// CaretPosition is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `getClientRect` on `CaretPosition` instances; missing in Gameface.

**Why:** scraper missing: ["getClientRect"].

---
### [JS-048] — CharacterData
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.replaceWith; // CharacterData.replaceWith is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// CharacterData is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `replaceWith` on `CharacterData` instances; missing in Gameface.

**Why:** scraper missing: ["replaceWith"].

---
### [JS-049] — CSSAnimation
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.addEventListener; // CSSAnimation.addEventListener is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Drive animation through CSS @keyframes + the animation-* longhands (all supported):
el.style.animationName = 'fadeIn';
el.style.animationDuration = '300ms';
```

**Rule for AI agents:** Never read/write `addEventListener`, `removeEventListener` on `CSSAnimation` instances; missing in Gameface.

**Why:** scraper missing: ["addEventListener","removeEventListener"].

---
### [JS-050] — CSSKeywordValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSKeywordValue(/* ... */); // TypeError: CSSKeywordValue is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSKeywordValue(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSKeywordValue"].

---
### [JS-051] — CSSMatrixComponent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSMatrixComponent(/* ... */); // TypeError: CSSMatrixComponent is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSMatrixComponent(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSMatrixComponent"].

---
### [JS-052] — CSSNumericValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.add; // CSSNumericValue.add is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never read/write `add`, `div`, `equals`, `max`, `min`, `mul`, `sub`, `to`, `toSum`, `type` on `CSSNumericValue` instances; missing in Gameface.

**Why:** scraper missing: ["add","div","equals","max","min","mul","sub","to","toSum","type"].

---
### [JS-053] — CSSRotate
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSRotate(/* ... */); // TypeError: CSSRotate is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSRotate(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSRotate"].

---
### [JS-054] — CSSRuleList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.item; // CSSRuleList.item is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// CSSRuleList is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `item` on `CSSRuleList` instances; missing in Gameface.

**Why:** scraper missing: ["item"].

---
### [JS-055] — CSSScale
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSScale(/* ... */); // TypeError: CSSScale is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSScale(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSScale"].

---
### [JS-056] — CSSSkewX
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSSkewX(/* ... */); // TypeError: CSSSkewX is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSSkewX(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSSkewX"].

---
### [JS-057] — CSSSkewY
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSSkewY(/* ... */); // TypeError: CSSSkewY is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSSkewY(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSSkewY"].

---
### [JS-058] — CSSStyleValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.parse; // CSSStyleValue.parse is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never read/write `parse` on `CSSStyleValue` instances; missing in Gameface.

**Why:** scraper missing: ["parse"].

---
### [JS-059] — CSSTransformValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSTransformValue(/* ... */); // TypeError: CSSTransformValue is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSTransformValue(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSTransformValue"].

---
### [JS-060] — CSSTranslate
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSTranslate(/* ... */); // TypeError: CSSTranslate is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSTranslate(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSTranslate"].

---
### [JS-061] — CSSUnitValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new CSSUnitValue(/* ... */); // TypeError: CSSUnitValue is not a constructor
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never `new CSSUnitValue(...)`; the constructor is missing in Gameface, so this API cannot be instantiated.

**Why:** scraper missing: ["CSSUnitValue"].

---
### [JS-062] — DocumentFragment
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new DocumentFragment(/* ... */); // TypeError: DocumentFragment is not a constructor
```

**✅ Generate instead:**
```js
// DocumentFragment is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never `new DocumentFragment(...)` (constructor missing) and do not read/write `moveBefore`, `prepend`, `replaceChildren` on existing `DocumentFragment` instances; all missing in Gameface.

**Why:** scraper missing: ["DocumentFragment","moveBefore","prepend","replaceChildren"].

---
### [JS-063] — DocumentType
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.replaceWith; // DocumentType.replaceWith is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// DocumentType is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `replaceWith` on `DocumentType` instances; missing in Gameface.

**Why:** scraper missing: ["replaceWith"].

---
### [JS-065] — DOMMatrix
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new DOMMatrix(/* ... */); // TypeError: DOMMatrix is not a constructor
```

**✅ Generate instead:**
```js
// Don't construct DOMMatrix; read existing instances returned by DOM APIs (getBoundingClientRect, etc.).
```

**Rule for AI agents:** Never `new DOMMatrix(...)` (constructor missing) and do not read/write `invertSelf`, `multiplySelf`, `preMultiplySelf`, `rotateAxisAngleSelf`, `rotateFromVectorSelf`, `rotateSelf`, `scale3dSelf`, `scaleSelf`, `setMatrixValue`, `skewXSelf`, …+2 more on existing `DOMMatrix` instances; all missing in Gameface.

**Why:** scraper missing: ["invertSelf","multiplySelf","preMultiplySelf","rotateAxisAngleSelf","rotateFromVectorSelf","rotateSelf","scale3dSelf","scaleSelf","setMatrixValue","skewXSelf","skewYSelf","translateSelf"] …+1 more.

---
### [JS-066] — DOMRectReadOnly
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new DOMRectReadOnly(/* ... */); // TypeError: DOMRectReadOnly is not a constructor
```

**✅ Generate instead:**
```js
// Don't construct DOMRectReadOnly; read existing instances returned by DOM APIs (getBoundingClientRect, etc.).
```

**Rule for AI agents:** Never `new DOMRectReadOnly(...)` (constructor missing) and do not read/write `toJSON` on existing `DOMRectReadOnly` instances; all missing in Gameface.

**Why:** scraper missing: ["toJSON","DOMRectReadOnly"].

---
### [JS-067] — DOMStringMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.itemDeleter; // DOMStringMap.itemDeleter is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Don't construct DOMStringMap; read existing instances returned by DOM APIs (getBoundingClientRect, etc.).
```

**Rule for AI agents:** Never read/write `itemDeleter`, `itemGetter`, `itemSetter` on `DOMStringMap` instances; missing in Gameface.

**Why:** scraper missing: ["itemDeleter","itemGetter","itemSetter"].

---
### [JS-068] — Event
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new Event(/* ... */); // TypeError: Event is not a constructor
```

**✅ Generate instead:**
```js
// Never construct Event; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new Event(...)` (constructor missing) and do not read/write `cancelBubble`, `isTrusted`, `returnValue`, `srcElement`, `timeStamp`, `composedPath`, `explicitOriginalTarget`, `originalTarget` on existing `Event` instances; all missing in Gameface.

**Why:** scraper missing: ["cancelBubble","isTrusted","returnValue","srcElement","timeStamp","composedPath","Event","explicitOriginalTarget","originalTarget"].

---
### [JS-069] — Gamepad
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.vibrationActuator; // Gamepad.vibrationActuator is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Gamepad is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `vibrationActuator`, `hapticActuators` on `Gamepad` instances; missing in Gameface.

**Why:** scraper missing: ["vibrationActuator","hapticActuators"].

---
### [JS-070] — GetAnimationsOptions
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.subtree; // GetAnimationsOptions.subtree is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// GetAnimationsOptions is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `subtree` on `GetAnimationsOptions` instances; missing in Gameface.

**Why:** scraper missing: ["subtree"].

---
### [JS-071] — HTMLBodyElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.aLink; // HTMLBodyElement.aLink is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLBodyElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `aLink`, `background`, `bgColor`, `link`, `text`, `vLink` on `HTMLBodyElement` instances; missing in Gameface.

**Why:** scraper missing: ["aLink","background","bgColor","link","text","vLink"].

---
### [JS-072] — HTMLButtonElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.disabled; // HTMLButtonElement.disabled is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLButtonElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `disabled`, `form`, `formAction`, `formEnctype`, `formMethod`, `formNoValidate`, `formTarget`, `labels`, `name`, `type`, …+11 more on `HTMLButtonElement` instances; missing in Gameface.

**Why:** scraper missing: ["disabled","form","formAction","formEnctype","formMethod","formNoValidate","formTarget","labels","name","type","validationMessage","validity"] …+9 more.

---
### [JS-073] — HTMLCollection
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.namedItem; // HTMLCollection.namedItem is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLCollection is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `namedItem` on `HTMLCollection` instances; missing in Gameface.

**Why:** scraper missing: ["namedItem"].

---
### [JS-074] — HTMLDivElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.align; // HTMLDivElement.align is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLDivElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `align` on `HTMLDivElement` instances; missing in Gameface.

**Why:** scraper missing: ["align"].

---
### [JS-075] — HTMLElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.accessKey; // HTMLElement.accessKey is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Avoid hidden/inert/innerText/outerText/title/lang/dir/spellcheck/tabIndex/draggable/accessKey/translate/contentEditable/enterKeyHint/inputMode/popover* — missing. Use plain DOM (className, getAttribute, addEventListener).
```

**Rule for AI agents:** Never read/write `accessKey`, `accessKeyLabel`, `autocapitalize`, `autocorrect`, `dir`, `draggable`, `hidden`, `inert`, `innerText`, `lang`, …+21 more on `HTMLElement` instances; missing in Gameface.

**Why:** scraper missing: ["accessKey","accessKeyLabel","autocapitalize","autocorrect","dir","draggable","hidden","inert","innerText","lang","outerText","popover"] …+19 more.

---
### [JS-076] — HTMLHeadElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.profile; // HTMLHeadElement.profile is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLHeadElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `profile` on `HTMLHeadElement` instances; missing in Gameface.

**Why:** scraper missing: ["profile"].

---
### [JS-077] — HTMLHtmlElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.version; // HTMLHtmlElement.version is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLHtmlElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `version` on `HTMLHtmlElement` instances; missing in Gameface.

**Why:** scraper missing: ["version"].

---
### [JS-078] — HTMLParagraphElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.align; // HTMLParagraphElement.align is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLParagraphElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `align` on `HTMLParagraphElement` instances; missing in Gameface.

**Why:** scraper missing: ["align"].

---
### [JS-079] — HTMLPreElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.width; // HTMLPreElement.width is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLPreElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `width` on `HTMLPreElement` instances; missing in Gameface.

**Why:** scraper missing: ["width"].

---
### [JS-080] — HTMLScriptElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.charset; // HTMLScriptElement.charset is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLScriptElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `charset`, `crossOrigin`, `event`, `fetchPriority`, `htmlFor`, `integrity`, `noModule`, `referrerPolicy`, `attributionSrc`, `blocking` on `HTMLScriptElement` instances; missing in Gameface.

**Why:** scraper missing: ["charset","crossOrigin","event","fetchPriority","htmlFor","integrity","noModule","referrerPolicy","attributionSrc","blocking"].

---
### [JS-081] — HTMLSourceElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.height; // HTMLSourceElement.height is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLSourceElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `height`, `sizes`, `srcset`, `width` on `HTMLSourceElement` instances; missing in Gameface.

**Why:** scraper missing: ["height","sizes","srcset","width"].

---
### [JS-082] — HTMLStyleElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.disabled; // HTMLStyleElement.disabled is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLStyleElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `disabled`, `media`, `type`, `blocking`, `sheet` on `HTMLStyleElement` instances; missing in Gameface.

**Why:** scraper missing: ["disabled","media","type","blocking","sheet"].

---
### [JS-083] — HTMLTemplateElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.shadowRootClonable; // HTMLTemplateElement.shadowRootClonable is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLTemplateElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `shadowRootClonable`, `shadowRootDelegatesFocus`, `shadowRootMode`, `shadowRootSerializable` on `HTMLTemplateElement` instances; missing in Gameface.

**Why:** scraper missing: ["shadowRootClonable","shadowRootDelegatesFocus","shadowRootMode","shadowRootSerializable"].

---
### [JS-084] — HTMLTitleElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.text; // HTMLTitleElement.text is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// HTMLTitleElement is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `text` on `HTMLTitleElement` instances; missing in Gameface.

**Why:** scraper missing: ["text"].

---
### [JS-085] — KeyboardEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new KeyboardEvent(/* ... */); // TypeError: KeyboardEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct KeyboardEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new KeyboardEvent(...)` (constructor missing) and do not read/write `isComposing`, `keyIdentifier` on existing `KeyboardEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["isComposing","KeyboardEvent","keyIdentifier"].

---
### [JS-087] — MessageEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new MessageEvent(/* ... */); // TypeError: MessageEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct MessageEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new MessageEvent(...)` (constructor missing) and do not read/write `ports`, `source`, `initMessageEvent`, `userActivation` on existing `MessageEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["ports","source","initMessageEvent","MessageEvent","userActivation"].

---
### [JS-090] — MouseEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new MouseEvent(/* ... */); // TypeError: MouseEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct MouseEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new MouseEvent(...)` (constructor missing) and do not read/write `layerX`, `layerY`, `offsetX`, `offsetY`, `pageX`, `pageY` on existing `MouseEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["layerX","layerY","offsetX","offsetY","pageX","pageY","MouseEvent"].

---
### [JS-091] — NamedNodeMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.getNamedItemNS; // NamedNodeMap.getNamedItemNS is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Read/write attributes via element.getAttribute/setAttribute/removeAttribute. Don't poke NamedNodeMap directly.
```

**Rule for AI agents:** Never read/write `getNamedItemNS`, `removeNamedItem`, `removeNamedItemNS`, `setNamedItem`, `setNamedItemNS` on `NamedNodeMap` instances; missing in Gameface.

**Why:** scraper missing: ["getNamedItemNS","removeNamedItem","removeNamedItemNS","setNamedItem","setNamedItemNS"].

---
### [JS-092] — NodeIterator
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.detach; // NodeIterator.detach is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// NodeIterator is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `detach` on `NodeIterator` instances; missing in Gameface.

**Why:** scraper missing: ["detach"].

---
### [JS-093] — PopStateEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new PopStateEvent(/* ... */); // TypeError: PopStateEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct PopStateEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new PopStateEvent(...)` (constructor missing) and do not read/write `hasUAVisualTransition` on existing `PopStateEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["hasUAVisualTransition","PopStateEvent"].

---
### [JS-094] — ResizeObserverOptions
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.box; // ResizeObserverOptions.box is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// ResizeObserverOptions is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `box` on `ResizeObserverOptions` instances; missing in Gameface.

**Why:** scraper missing: ["box"].

---
### [JS-095] — Screen
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.orientation; // Screen.orientation is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Screen is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `orientation`, `availLeft`, `availTop`, `isExtended`, `left`, `lockOrientation`, `mozBrightness`, `mozEnabled`, `top`, `unlockOrientation` on `Screen` instances; missing in Gameface.

**Why:** scraper missing: ["orientation","availLeft","availTop","isExtended","left","lockOrientation","mozBrightness","mozEnabled","top","unlockOrientation"].

---
### [JS-096] — StylePropertyMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.append; // StylePropertyMap.append is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never read/write `append` on `StylePropertyMap` instances; missing in Gameface.

**Why:** scraper missing: ["append"].

---
### [JS-097] — StylePropertyMapReadOnly
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.getAll; // StylePropertyMapReadOnly.getAll is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Typed CSSOM is not constructible. Use plain string CSS values (el.style.transform = 'translate(10px, 20px)').
```

**Rule for AI agents:** Never read/write `getAll`, `forEach`, `entries`, `keys`, `values` on `StylePropertyMapReadOnly` instances; missing in Gameface.

**Why:** scraper missing: ["getAll","forEach","entries","keys","values"].

---
### [JS-098] — StyleSheet
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.disabled; // StyleSheet.disabled is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// StyleSheet is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `disabled`, `href`, `parentStyleSheet`, `title`, `type`, `media` on `StyleSheet` instances; missing in Gameface.

**Why:** scraper missing: ["disabled","href","parentStyleSheet","title","type","media"].

---
### [JS-099] — SVGAnimatedLength
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.animVal; // SVGAnimatedLength.animVal is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGAnimatedLength-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `animVal` on `SVGAnimatedLength` instances; missing in Gameface.

**Why:** scraper missing: ["animVal"].

---
### [JS-100] — SVGAnimatedRect
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.animVal; // SVGAnimatedRect.animVal is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGAnimatedRect-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `animVal` on `SVGAnimatedRect` instances; missing in Gameface.

**Why:** scraper missing: ["animVal"].

---
### [JS-101] — SVGAnimatedTransformList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.animVal; // SVGAnimatedTransformList.animVal is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGAnimatedTransformList-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `animVal` on `SVGAnimatedTransformList` instances; missing in Gameface.

**Why:** scraper missing: ["animVal"].

---
### [JS-102] — SVGElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.ownerSVGElement; // SVGElement.ownerSVGElement is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGElement-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `ownerSVGElement`, `viewportElement`, `attributeStyleMap`, `autofocus`, `dataset`, `nonce`, `tabIndex` on `SVGElement` instances; missing in Gameface.

**Why:** scraper missing: ["ownerSVGElement","viewportElement","attributeStyleMap","autofocus","dataset","nonce","tabIndex"].

---
### [JS-103] — SVGGraphicsElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.getBBox; // SVGGraphicsElement.getBBox is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGGraphicsElement-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `getBBox`, `getCTM`, `getScreenCTM`, `requiredExtensions`, `systemLanguage` on `SVGGraphicsElement` instances; missing in Gameface.

**Why:** scraper missing: ["getBBox","getCTM","getScreenCTM","requiredExtensions","systemLanguage"].

---
### [JS-104] — SVGLength
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.valueAsString; // SVGLength.valueAsString is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGLength-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `valueAsString`, `valueInSpecifiedUnits`, `convertToSpecifiedUnits`, `newValueSpecifiedUnits`, `SVG_LENGTHTYPE_UNKNOWN`, `SVG_LENGTHTYPE_NUMBER`, `SVG_LENGTHTYPE_PERCENTAGE`, `SVG_LENGTHTYPE_EMS`, `SVG_LENGTHTYPE_EXS`, `SVG_LENGTHTYPE_PX`, …+5 more on `SVGLength` instances; missing in Gameface.

**Why:** scraper missing: ["valueAsString","valueInSpecifiedUnits","convertToSpecifiedUnits","newValueSpecifiedUnits","SVG_LENGTHTYPE_UNKNOWN","SVG_LENGTHTYPE_NUMBER","SVG_LENGTHTYPE_PERCENTAGE","SVG_LENGTHTYPE_EMS","SVG_LENGTHTYPE_EXS","SVG_LENGTHTYPE_PX","SVG_LENGTHTYPE_CM","SVG_LENGTHTYPE_MM"] …+3 more.

---
### [JS-105] — SVGSVGElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.currentScale; // SVGSVGElement.currentScale is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGSVGElement-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `currentScale`, `currentTranslate`, `x`, `y`, `animationsPaused`, `checkEnclosure`, `checkIntersection`, `createSVGAngle`, `createSVGLength`, `createSVGMatrix`, …+20 more on `SVGSVGElement` instances; missing in Gameface.

**Why:** scraper missing: ["currentScale","currentTranslate","x","y","animationsPaused","checkEnclosure","checkIntersection","createSVGAngle","createSVGLength","createSVGMatrix","createSVGNumber","createSVGPoint"] …+18 more.

---
### [JS-106] — SVGTransform
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.setMatrix; // SVGTransform.setMatrix is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGTransform-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `setMatrix`, `setRotate`, `setScale`, `setSkewX`, `setSkewY`, `setTranslate`, `SVG_TRANSFORM_UNKNOWN`, `SVG_TRANSFORM_MATRIX`, `SVG_TRANSFORM_TRANSLATE`, `SVG_TRANSFORM_SCALE`, …+3 more on `SVGTransform` instances; missing in Gameface.

**Why:** scraper missing: ["setMatrix","setRotate","setScale","setSkewX","setSkewY","setTranslate","SVG_TRANSFORM_UNKNOWN","SVG_TRANSFORM_MATRIX","SVG_TRANSFORM_TRANSLATE","SVG_TRANSFORM_SCALE","SVG_TRANSFORM_ROTATE","SVG_TRANSFORM_SKEWX"] …+1 more.

---
### [JS-107] — SVGTransformList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.appendItem; // SVGTransformList.appendItem is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// Use only the standard SVG attributes in markup; the SVG DOM (getBBox, animVal, createSVG*, SVGTransformList-specific methods) is partial.
```

**Rule for AI agents:** Never read/write `appendItem`, `clear`, `createSVGTransformFromMatrix`, `getItem`, `initialize`, `insertItemBefore`, `removeItem`, `replaceItem` on `SVGTransformList` instances; missing in Gameface.

**Why:** scraper missing: ["appendItem","clear","createSVGTransformFromMatrix","getItem","initialize","insertItemBefore","removeItem","replaceItem"].

---
### [JS-108] — Text
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new Text(/* ... */); // TypeError: Text is not a constructor
```

**✅ Generate instead:**
```js
// document.createTextNode(...) / createComment(...) work. Avoid `new Text()` — constructor missing.
```

**Rule for AI agents:** Never `new Text(...)` (constructor missing) and do not read/write `getBoxQuads` on existing `Text` instances; all missing in Gameface.

**Why:** scraper missing: ["Text","getBoxQuads"].

---
### [JS-109] — TextMetrics
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.alphabeticBaseline; // TextMetrics.alphabeticBaseline is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// TextMetrics is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `alphabeticBaseline`, `emHeightAscent`, `emHeightDescent`, `fontBoundingBoxAscent`, `fontBoundingBoxDescent`, `hangingBaseline`, `ideographicBaseline` on `TextMetrics` instances; missing in Gameface.

**Why:** scraper missing: ["alphabeticBaseline","emHeightAscent","emHeightDescent","fontBoundingBoxAscent","fontBoundingBoxDescent","hangingBaseline","ideographicBaseline"].

---
### [JS-110] — Touch
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new Touch(/* ... */); // TypeError: Touch is not a constructor
```

**✅ Generate instead:**
```js
// Touch is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never `new Touch(...)` (constructor missing) and do not read/write `force`, `radiusX`, `radiusY`, `rotationAngle`, `altitudeAngle`, `azimuthAngle`, `touchType` on existing `Touch` instances; all missing in Gameface.

**Why:** scraper missing: ["force","radiusX","radiusY","rotationAngle","Touch","altitudeAngle","azimuthAngle","touchType"].

---
### [JS-111] — TouchEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new TouchEvent(/* ... */); // TypeError: TouchEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct TouchEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new TouchEvent(...)` (constructor missing) and do not read/write `changedTouches`, `targetTouches` on existing `TouchEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["changedTouches","targetTouches","TouchEvent"].

---
### [JS-112] — UIEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
const x = new UIEvent(/* ... */); // TypeError: UIEvent is not a constructor
```

**✅ Generate instead:**
```js
// Never construct UIEvent; receive instances from listeners only. addEventListener/removeEventListener/dispatchEvent on supported host objects work.
```

**Rule for AI agents:** Never `new UIEvent(...)` (constructor missing) and do not read/write `view`, `which`, `sourceCapabilities` on existing `UIEvent` instances; all missing in Gameface.

**Why:** scraper missing: ["view","which","UIEvent","sourceCapabilities"].

---
### [JS-115] — XMLHttpRequestEventTarget
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
instance.onabort; // XMLHttpRequestEventTarget.onabort is undefined / not implemented in Gameface
```

**✅ Generate instead:**
```js
// XMLHttpRequestEventTarget is partially implemented. Refer to results/js/partial.json for the exact missing members and stick to the supported subset.
```

**Rule for AI agents:** Never read/write `onabort`, `onerror`, `onload`, `onloadend`, `onloadstart`, `onprogress`, `ontimeout` on `XMLHttpRequestEventTarget` instances; missing in Gameface.

**Why:** scraper missing: ["onabort","onerror","onload","onloadend","onloadstart","onprogress","ontimeout"].

---
### [JS-113] — WebGL and WebGPU
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
GPU; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use WebGL / WebGPU directly; rendering happens through the host engine. Don't call `canvas.getContext("webgl"|"webgl2"|"webgpu")`.

**Why:** scraper status: missing-from-window. Members: GPU, GPUAdapter, GPUAdapterInfo, GPUBindGroup, GPUBindGroupLayout, GPUBuffer, GPUCanvasContext, GPUCommandBuffer, GPUCommandEncoder, GPUCompilationInfo, GPUCompilationMessage, GPUComputePassEncoder, GPUComputePipeline, GPUDevice, GPUDeviceLostInfo, GPUError, GPUExternalTexture, GPUInternalError, GPUOutOfMemoryError, GPUPipelineError, GPUPipelineLayout, GPUQuerySet, GPUQueue, GPURenderBundle, GPURenderBundleEncoder, GPURenderPassEncoder, GPURenderPipeline, GPUSampler, GPUShaderModule, GPUSupportedFeatures, GPUSupportedLimits, GPUTexture, GPUTextureView, GPUUncapturedErrorEvent, GPUValidationError, WebGL2RenderingContext, WebGL2RenderingContextBase, WebGL2RenderingContextOverloads, WebGLActiveInfo, WebGLBuffer, WebGLContextAttributes, WebGLContextEvent, WebGLContextEventInit, WebGLFramebuffer, WebGLObject, WebGLProgram, WebGLQuery, WebGLRenderbuffer, WebGLRenderingContext, WebGLRenderingContextBase, WebGLRenderingContextOverloads, WebGLSampler, WebGLShader, WebGLShaderPrecisionFormat, WebGLSync, WebGLTexture, WebGLTimerQueryEXT, WebGLTransformFeedback, WebGLUniformLocation, WebGLVertexArrayObject, WebGLVertexArrayObjectOES.

---
### [JS-086] — Media, WebRTC, Web Audio
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
AnalyserNode; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use Web Audio (`AudioContext`, `*Node`, `AudioParam`), Media Streams (`MediaStream*`), Media Recording (`MediaRecorder`), Media Source Extensions, Media Capabilities, WebRTC (`RTC*`), Picture-in-Picture, or Speech APIs; missing. Use host-engine audio/video.

**Why:** scraper status: missing-from-window. Members: AnalyserNode, AudioBuffer, AudioBufferOptions, AudioBufferSourceNode, AudioBufferSourceOptions, AudioContext, AudioContextOptions, AudioDestinationNode, AudioListener, AudioNode, AudioNodeOptions, AudioParam, AudioParamMap, AudioWorklet, AudioWorkletGlobalScope, AudioWorkletNode, AudioWorkletNodeEventMap, AudioWorkletNodeOptions, AudioWorkletProcessor, BiquadFilterNode, ChannelMergerNode, ChannelSplitterNode, ConstantSourceNode, ConvolverNode, DelayNode, DynamicsCompressorNode, GainNode, IIRFilterNode, MediaDevices, MediaDevicesEventMap, MediaElementAudioSourceNode, MediaRecorder, MediaRecorderErrorEvent, MediaRecorderEventMap, MediaRecorderOptions, MediaSession, MediaSessionActionDetails, MediaSessionActionHandler, MediaSource, MediaSourceHandle, MediaStream, MediaStreamAudioDestinationNode, MediaStreamAudioSourceNode, MediaStreamAudioSourceOptions, MediaStreamConstraints, MediaStreamEvent, MediaStreamEventMap, MediaStreamTrack, MediaStreamTrackAudioSourceNode, MediaStreamTrackEvent, MediaStreamTrackEventInit, MediaStreamTrackEventMap, MediaStreamTrackGenerator, MediaStreamTrackProcessor, OfflineAudioContext, OfflineAudioContextEventMap, OfflineAudioContextOptions, OscillatorNode, PannerNode, PeriodicWave, PeriodicWaveConstraints, PeriodicWaveOptions, RTCAnswerOptions, RTCCertificate, RTCCertificateExpiration, RTCConfiguration, RTCDTMFSender, RTCDTMFSenderEventMap, RTCDTMFToneChangeEvent, RTCDTMFToneChangeEventInit, RTCDataChannel, RTCDataChannelEvent, RTCDataChannelEventInit, RTCDataChannelEventMap, RTCDataChannelInit, RTCDtlsFingerprint, RTCDtlsTransport, RTCDtlsTransportEventMap, RTCEncodedAudioFrame, RTCEncodedAudioFrameMetadata, RTCEncodedFrameMetadata, RTCEncodedVideoFrame, RTCEncodedVideoFrameMetadata, RTCError, RTCErrorEvent, RTCErrorEventInit, RTCErrorInit, RTCIceCandidate, RTCIceCandidateInit, RTCIceCandidatePair, RTCIceCandidatePairStats, RTCIceServer, RTCIceTransport, RTCIceTransportEventMap, RTCIdentityAssertion, RTCInboundRtpStreamStats, RTCLocalIceCandidateInit, RTCLocalSessionDescriptionInit, RTCOfferAnswerOptions, RTCOfferOptions, RTCOutboundRtpStreamStats, RTCPeerConnection, RTCPeerConnectionErrorCallback, RTCPeerConnectionEventMap, RTCPeerConnectionIceErrorEvent, RTCPeerConnectionIceErrorEventInit, RTCPeerConnectionIceEvent, RTCPeerConnectionIceEventInit, RTCReceivedRtpStreamStats, RTCRtcpParameters, RTCRtpCapabilities, RTCRtpCodec, RTCRtpCodecParameters, RTCRtpCodingParameters, RTCRtpContributingSource, RTCRtpEncodingParameters, RTCRtpHeaderExtensionCapability, RTCRtpHeaderExtensionParameters, RTCRtpParameters, RTCRtpReceiveParameters, RTCRtpReceiver, RTCRtpScriptTransform, RTCRtpScriptTransformer, RTCRtpSendParameters, RTCRtpSender, RTCRtpStreamStats, RTCRtpSynchronizationSource, RTCRtpTransceiver, RTCRtpTransceiverInit, RTCSctpTransport, RTCSctpTransportEventMap, RTCSentRtpStreamStats, RTCSessionDescription, RTCSessionDescriptionCallback, RTCSessionDescriptionInit, RTCSetParameterOptions, RTCStats, RTCStatsReport, RTCTrackEvent, RTCTrackEventInit, RTCTransformEvent, RTCTransportStats, ScriptProcessorNode, ScriptProcessorNodeEventMap, SpeechGrammar, SpeechGrammarList, SpeechRecognition, SpeechRecognitionAlternative, SpeechRecognitionErrorEvent, SpeechRecognitionEvent, SpeechRecognitionResult, SpeechRecognitionResultList, SpeechSynthesis, SpeechSynthesisErrorEvent, SpeechSynthesisErrorEventInit, SpeechSynthesisEvent, SpeechSynthesisEventInit, SpeechSynthesisEventMap, SpeechSynthesisUtterance, SpeechSynthesisUtteranceEventMap, SpeechSynthesisVoice, StereoPannerNode, WaveShaperNode.

---
### [JS-089] — Modern observer APIs
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
FontFace; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use `IntersectionObserver`, `PerformanceObserver`, `ReportingObserver`, `VisualViewport`, `FontFace`/`FontFaceSet`; missing. Poll on `requestAnimationFrame` (a Window stub) or compute manually.

**Why:** scraper status: missing-from-window. Members: FontFace, FontFaceDescriptors, FontFaceSet, FontFaceSetEventMap, FontFaceSetLoadEvent, FontFaceSetLoadEventInit, FontFaceSource, IntersectionObserver, IntersectionObserverCallback, IntersectionObserverEntry, IntersectionObserverInit, PerformanceObserver, PerformanceObserverCallback, PerformanceObserverEntryList, PerformanceObserverInit, ReportingObserver, ReportingObserverCallback, ReportingObserverOptions, VisualViewport, VisualViewportEventMap.

---
### [JS-064] — DOM traversal / Range / Selection helpers
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
AbortController; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use `Range`, `StaticRange`, `TreeWalker`, `AbortController`/`AbortSignal`, `DOMParser`, `XPath*`, `Highlight*`; missing.

**Why:** scraper status: missing-from-window. Members: AbortController, AbortSignal, AbortSignalEventMap, DOMParser, Highlight, HighlightRegistry, Range, StaticRange, StaticRangeInit, TreeWalker, XPathEvaluator, XPathEvaluatorBase, XPathExpression, XPathResult.

---
### [JS-088] — Modern navigation
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
NavigateEvent; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use the modern Navigation API (`navigation`, `NavigationHistoryEntry`, `NavigateEvent`); missing.

**Why:** scraper status: missing-from-window. Members: NavigateEvent, Navigation, NavigationActivation, NavigationCurrentEntryChangeEvent, NavigationDestination, NavigationHistoryEntry, NavigationHistoryEntryEventMap, NavigationPreloadManager, NavigationPreloadState, NavigationTransition.

---
### [JS-114] — Workers, scheduler, idle/animation/microtask
**Status:** missing
**Surface:** js-api
**Severity:** high

**❌ Never generate:**
```js
IdleDeadline; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use Workers, Worklets, the Prioritized Task Scheduler, `requestIdleCallback`, or `setImmediate`; missing.

**Why:** scraper status: missing-from-window. Members: IdleDeadline, PaintWorkletGlobalScope, SharedWorkerGlobalScope, TaskController, TaskPriorityChangeEvent, TaskSignal, WorkerEventMap, WorkerGlobalScope, WorkerLocation, WorkerNavigator, WorkerOptions, Worklet, WorkletGlobalScope, WorkletOptions, scheduler.

---

## MEDIUM (6)

---
### [JS-116] — Auth / credentials / payment
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
AuthenticatorAssertionResponse; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use Web Authentication / Credential Management / Payment Request APIs; missing.

**Why:** scraper status: missing-from-window. Members: AuthenticatorAssertionResponse, AuthenticatorAttestationResponse, AuthenticatorResponse, Credential, CredentialCreationOptions, CredentialPropertiesOutput, CredentialRequestOptions, CredentialsContainer, FederatedCredential, PasswordCredential, PaymentMethodChangeEvent, PaymentMethodChangeEventInit, PaymentRequest, PaymentRequestEvent, PaymentRequestEventMap, PaymentRequestUpdateEvent, PaymentRequestUpdateEventInit, PaymentResponse, PaymentResponseEventMap, PublicKeyCredential, PublicKeyCredentialCreationOptions, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialDescriptor, PublicKeyCredentialDescriptorJSON, PublicKeyCredentialEntity, PublicKeyCredentialParameters, PublicKeyCredentialRequestOptions, PublicKeyCredentialRequestOptionsJSON, PublicKeyCredentialRpEntity, PublicKeyCredentialUserEntity, PublicKeyCredentialUserEntityJSON.

---
### [JS-120] — Sensors, device APIs
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
AbsoluteOrientationSensor; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use device sensors, geolocation, Bluetooth, USB, HID, Serial, WakeLock, or WebXR; missing.

**Why:** scraper status: missing-from-window. Members: AbsoluteOrientationSensor, Accelerometer, AmbientLightSensor, Bluetooth, BluetoothCharacteristicProperties, BluetoothDevice, BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTDescriptor, BluetoothRemoteGATTServer, BluetoothRemoteGATTService, BluetoothUUID, DeviceMotionEvent, DeviceMotionEventAcceleration, DeviceMotionEventAccelerationInit, DeviceMotionEventInit, DeviceMotionEventRotationRate, DeviceMotionEventRotationRateInit, DeviceOrientationEvent, DeviceOrientationEventInit, Geolocation, GeolocationCoordinates, GeolocationPosition, GeolocationPositionError, GravitySensor, Gyroscope, HID, HIDConnectionEvent, HIDDevice, HIDInputReportEvent, LinearAccelerationSensor, Magnetometer, OrientationSensor, RelativeOrientationSensor, Sensor, SensorErrorEvent, Serial, SerialPort, USB, USBAlternateInterface, USBConfiguration, USBConnectionEvent, USBDevice, USBEndpoint, USBInTransferResult, USBInterface, USBIsochronousInTransferPacket, USBIsochronousInTransferResult, USBIsochronousOutTransferPacket, USBIsochronousOutTransferResult, USBOutTransferResult, VRDisplay, VRDisplayCapabilities, VRDisplayEvent, VREyeParameters, VRFieldOfView, VRFrameData, VRPose, VRStageParameters, WakeLock, WakeLockSentinel, WakeLockSentinelEventMap, XRAnchor, XRAnchorSet, XRBoundedReferenceSpace, XRCPUDepthInformation, XRCamera, XRCompositionLayer, XRCubeLayer, XRCylinderLayer, XRDepthInformation, XREquirectLayer, XRFrame, XRHand, XRHitTestResult, XRHitTestSource, XRInputSource, XRInputSourceArray, XRInputSourceEvent, XRInputSourcesChangeEvent, XRJointPose, XRJointSpace, XRLayer, XRLayerEvent, XRLightEstimate, XRLightProbe, XRMediaBinding, XRPose, XRProjectionLayer, XRQuadLayer, XRRay, XRReferenceSpace, XRReferenceSpaceEvent, XRRenderState, XRRigidTransform, XRSession, XRSessionEvent, XRSpace, XRSubImage, XRSystem, XRTransientInputHitTestResult, XRTransientInputHitTestSource, XRView, XRViewerPose, XRViewport, XRWebGLBinding, XRWebGLDepthInformation, XRWebGLLayer, XRWebGLSubImage.

---
### [JS-119] — Permissions / quotas / clipboard
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
Clipboard; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use `Permissions`, `Clipboard`, `ClipboardItem`, `StorageAccess` APIs; missing.

**Why:** scraper status: missing-from-window. Members: Clipboard, ClipboardEvent, ClipboardEventInit, ClipboardItem, ClipboardItemOptions, PermissionDescriptor, PermissionStatus, PermissionStatusEventMap, Permissions, StorageAccessHandle.

---
### [JS-121] — Streams API
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
ByteLengthQueuingStrategy; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use the Streams API (`ReadableStream`, `WritableStream`, `TransformStream`, `CompressionStream`, etc.); missing.

**Why:** scraper status: missing-from-window. Members: ByteLengthQueuingStrategy, CompressionStream, CountQueuingStrategy, DecompressionStream, ReadableByteStreamController, ReadableStream, ReadableStreamBYOBReader, ReadableStreamBYOBRequest, ReadableStreamDefaultController, ReadableStreamDefaultReader, ReadableStreamGenericReader, ReadableStreamGetReaderOptions, ReadableStreamIteratorOptions, ReadableStreamReadDoneResult, ReadableStreamReadValueResult, TransformStream, TransformStreamDefaultController, WritableStream, WritableStreamDefaultController, WritableStreamDefaultWriter.

---
### [JS-118] — Modern editing / input APIs
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
CompositionEvent; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use modern editing / form-event APIs (`EditContext`, `InputEvent`, `CompositionEvent`, `FormDataEvent`, `SubmitEvent`, `InvalidEvent`, `HashChangeEvent`, etc.); missing or partial.

**Why:** scraper status: missing-from-window. Members: CompositionEvent, CompositionEventInit, EditContext, FormDataEvent, FormDataEventInit, HashChangeEvent, HashChangeEventInit, InputDeviceCapabilities, InputDeviceInfo, InputEvent, InputEventInit, SubmitEvent, SubmitEventInit, TextEvent, VirtualKeyboard.

---
### [JS-117] — GPU compute / WebCodecs / Web Codec helpers
**Status:** missing
**Surface:** js-api
**Severity:** medium

**❌ Never generate:**
```js
AudioData; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use WebCodecs, OffscreenCanvas, or `createImageBitmap`; missing.

**Why:** scraper status: missing-from-window. Members: AudioData, AudioDataCopyToOptions, AudioDataInit, AudioDataOutputCallback, AudioDecoder, AudioDecoderConfig, AudioDecoderEventMap, AudioDecoderInit, AudioDecoderSupport, AudioEncoder, AudioEncoderConfig, AudioEncoderEventMap, AudioEncoderInit, AudioEncoderSupport, EncodedAudioChunk, EncodedAudioChunkInit, EncodedAudioChunkMetadata, EncodedAudioChunkOutputCallback, EncodedVideoChunk, EncodedVideoChunkInit, EncodedVideoChunkMetadata, EncodedVideoChunkOutputCallback, ImageBitmap, ImageBitmapOptions, ImageBitmapRenderingContext, ImageBitmapRenderingContextSettings, ImageDecoder, ImageDecoderInit, OffscreenCanvas, OffscreenCanvasEventMap, OffscreenCanvasRenderingContext2D, VideoDecoder, VideoDecoderConfig, VideoDecoderEventMap, VideoDecoderInit, VideoDecoderSupport, VideoEncoder, VideoEncoderConfig, VideoEncoderEncodeOptions, VideoEncoderEncodeOptionsForAvc, VideoEncoderEventMap, VideoEncoderInit, VideoEncoderSupport, VideoFrame, VideoFrameBufferInit, VideoFrameCallbackMetadata, VideoFrameCopyToOptions, VideoFrameInit, VideoFrameOutputCallback, VideoFrameRequestCallback, WebCodecsErrorCallback, createImageBitmap.

---

## LOW (8)

---
### [JS-123] — Geometry / Typed CSSOM extras
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
CSSConditionRule; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use these geometry / typed-CSSOM rule wrappers (`DOMPoint*`, `DOMQuad`, `DOMMatrixReadOnly`, `CSS*Rule`, `CSSPositionValue`, `CSSImageValue`); missing.

**Why:** scraper status: missing-from-window. Members: CSSConditionRule, CSSContainerRule, CSSCounterStyleRule, CSSFontFaceRule, CSSFontFeatureValuesRule, CSSGroupingRule, CSSImageValue, CSSImportRule, CSSKeyframeRule, CSSKeyframesRule, CSSLayerBlockRule, CSSLayerStatementRule, CSSMediaRule, CSSNamespaceRule, CSSPageRule, CSSPositionTryRule, CSSPositionValue, CSSPropertyRule, CSSScopeRule, CSSStartingStyleRule, CSSStyleRule, CSSSupportsRule, DOMMatrixReadOnly, DOMPoint, DOMPointInit, DOMPointReadOnly, DOMQuad, DOMQuadInit.

---
### [JS-122] — Concurrency primitives (browser-side)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
TaskAttributionTiming; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use `SharedArrayBuffer`, `Atomics`, `WeakRef`, `FinalizationRegistry`; missing in this Gameface JS host.

**Why:** scraper status: missing-from-window. Members: TaskAttributionTiming.

---
### [JS-124] — Misc and vendor-specific globals
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
Chrome; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Communicate via the Gameface engine bridge or omit the feature.
```

**Rule for AI agents:** Never use vendor-prefixed (`moz*`, `webkit*`, `Chrome*`, `chrome`), Trusted Types (`trustedTypes`, `TrustedHTML`, …), Topics, Fenced Frames, Interest Groups, Sanitizer, or `launchQueue`; missing.

**Why:** scraper status: missing-from-window. Members: Chrome, ChromeIdentity, ChromeInstanceId, ChromeTabs, Fence, FencedFrameConfig, TrustedHTML, TrustedScript, TrustedScriptURL, TrustedTypePolicy, TrustedTypePolicyFactory, reportError, trustedTypes.

---
### [JS-125] — Other missing globals (#1)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
ANGLE_instanced_arrays; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Avoid this symbol; either omit the feature or implement via the engine bridge.
```

**Rule for AI agents:** Never use these missing global symbols; they are not defined on `window` in Gameface.

**Why:** scraper status: missing-from-window. Members: ANGLE_instanced_arrays, ARIAMixin, AbortPaymentEvent, AbstractRange, AbstractWorker, AbstractWorkerEventMap, AddEventListenerOptions, AddressErrors, AesCbcParams, AesCtrParams, AesDerivedKeyParams, AesGcmParams, AesKeyAlgorithm, AesKeyGenParams, Algorithm, AnalyserOptions, Animatable, AnimationEffect, AnimationEventInit, AnimationEventMap, AnimationFrameProvider, AnimationPlaybackEvent, AnimationPlaybackEventInit, AnimationTimeline, AssignedNodesOptions, AudioConfiguration, AudioProcessingEvent, AudioProcessingEventInit, AudioScheduledSourceNode, AudioScheduledSourceNodeEventMap, AudioSession, AudioSinkInfo, AudioTimestamp, AudioTrack, AudioTrackList, AuthenticationExtensionsClientInputs, AuthenticationExtensionsClientInputsJSON, AuthenticationExtensionsClientOutputs, AuthenticationExtensionsLargeBlobInputs, AuthenticationExtensionsLargeBlobInputsJSON, AuthenticationExtensionsLargeBlobOutputs, AuthenticationExtensionsPRFInputs, AuthenticationExtensionsPRFInputsJSON, AuthenticationExtensionsPRFOutputs, AuthenticationExtensionsPRFValues, AuthenticationExtensionsPRFValuesJSON, AuthenticatorSelectionCriteria, AvcEncoderConfig, BackgroundFetchEvent, BackgroundFetchManager, BackgroundFetchRecord, BackgroundFetchRegistration, BackgroundFetchUpdateUIEvent, BarProp, BarcodeDetector, BaseAudioContext, BaseAudioContextEventMap, BatteryManager, BeforeInstallPromptEvent, BeforeUnloadEvent, BiquadFilterOptions, BlobCallback, BlobEvent, BlobEventInit, Body, BroadcastChannelEventMap, BrowserCaptureMediaStreamTrack, BufferedChangeEvent, CDATASection, CSPViolationReportBody, CSSFontFeatureValuesMap, CSSFontPaletteValuesRule, CSSMarginRule, CSSMathClamp, CSSMathInvert, CSSMathMax, CSSMathMin, CSSMathNegate, CSSMathProduct, CSSMathSum, CSSMathValue, CSSNestedDeclarations, CSSNumericArray, CSSNumericType, CSSPageDescriptors, CSSPerspective, CSSPositionTryDescriptors, CSSPrimitiveValue, CSSPseudoElement, CSSRule, CSSSkew, CSSStyleSheetInit, CSSTransition, CSSUnparsedValue, CSSValue, CSSValueList, CSSVariableReferenceValue, CSSViewTransitionRule, Cache, CacheQueryOptions, CacheStorage, CanMakePaymentEvent, CanvasCaptureMediaStreamTrack, CanvasCompositing, CanvasDrawImage, CanvasDrawPath, CanvasFillStrokeStyles, CanvasFilter, CanvasFilters, CanvasImageData, CanvasImageSmoothing, CanvasPath, CanvasPathDrawingStyles, CanvasRect, CanvasRenderingContext2DSettings, CanvasSettings, CanvasShadowStyles, CanvasState, CanvasText, CanvasTextDrawingStyles, CanvasTransform, CanvasUserInterface, CaptureController, CaretPositionFromPointOptions, ChannelMergerOptions, ChannelSplitterOptions, ChapterInformation, CharacterBoundsUpdateEvent, CheckVisibilityOptions, ChildNode, Client, ClientQueryOptions, ClientRect, Clients, CloseEvent, CloseEventInit, CloseWatcher, CommandEvent, CompileError, ComputedEffectTiming, ComputedKeyframe, ConstantSourceOptions, ConstrainBooleanParameters, ConstrainDOMStringParameters, ConstrainDoubleRange, ConstrainULongRange, ContactAddress, ContactsManager, ContentIndex, ContentIndexEvent, ContentVisibilityAutoStateChangeEvent, ContentVisibilityAutoStateChangeEventInit, ConvolverOptions, CookieChangeEvent, CookieChangeEventInit, CookieInit, CookieListItem, CookieStore, CookieStoreDeleteOptions, CookieStoreEventMap, CookieStoreGetOptions, CookieStoreManager, Counter, CropTarget, Crypto, CryptoKey, CryptoKeyPair, CustomElementConstructor, CustomEventInit, CustomStateSet, DOMError, DOMException, DOMImplementation, DOMMatrix2DInit, DOMMatrixInit, DOMRectInit, DOMStringList, DataCue, DataTransfer, DataTransferItem, DataTransferItemList, DecodeErrorCallback, DecodeSuccessCallback, DedicatedWorkerGlobalScope, DelayOptions, DelegatedInkTrailPresenter, DeprecationReportBody, DevicePosture, Directory, DirectoryEntrySync, DirectoryReaderSync, DisplayMediaStreamOptions, DocumentEventMap, DocumentOrShadowRoot, DocumentPictureInPicture, DocumentPictureInPictureEvent, DocumentTimeline, DocumentTimelineOptions, DoubleRange, DragEvent.

---
### [JS-126] — Other missing globals (#2)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
DragEventInit; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Avoid this symbol; either omit the feature or implement via the engine bridge.
```

**Rule for AI agents:** Never use these missing global symbols; they are not defined on `window` in Gameface.

**Why:** scraper status: missing-from-window. Members: DragEventInit, DynamicsCompressorOptions, EXT_blend_minmax, EXT_color_buffer_float, EXT_color_buffer_half_float, EXT_disjoint_timer_query, EXT_disjoint_timer_query_webgl2, EXT_float_blend, EXT_frag_depth, EXT_sRGB, EXT_shader_texture_lod, EXT_texture_compression_bptc, EXT_texture_compression_rgtc, EXT_texture_filter_anisotropic, EXT_texture_norm16, EcKeyAlgorithm, EcKeyGenParams, EcKeyImportParams, EcdhKeyDeriveParams, EcdsaParams, EffectTiming, ElementCSSInlineStyle, ElementContentEditable, ElementCreationOptions, ElementEventMap, ElementInternals, EntrySync, ErrorCallback, ErrorEventInit, EventCounts, EventInit, EventListenerObject, EventListenerOptions, EventModifierInit, EventSourceEventMap, EventSourceInit, ExtendableCookieChangeEvent, ExtendableEvent, ExtendableMessageEvent, External, EyeDropper, FeaturePolicy, FetchEvent, FetchLaterResult, FocusEventInit, FocusOptions, FontData, FragmentDirective, FrameRequestCallback, FullscreenOptions, FunctionStringCallback, GainOptions, GamepadEffectParameters, GamepadEventInit, GamepadHapticActuator, GenericTransformStream, GestureEvent, GetComposedRangesOptions, GetHTMLOptions, GetNotificationOptions, GetRootNodeOptions, Global, GlobalDescriptor, GlobalEventHandlers, GlobalEventHandlersEventMap, HMDVRDevice, HTMLAllCollection, HTMLAnchorElement, HTMLAreaElement, HTMLAudioElement, HTMLBRElement, HTMLBaseElement, HTMLBodyElementEventMap, HTMLCollectionBase, HTMLCollectionOf, HTMLDListElement, HTMLDataElement, HTMLDataListElement, HTMLDetailsElement, HTMLDialogElement, HTMLDirectoryElement, HTMLElementDeprecatedTagNameMap, HTMLElementEventMap, HTMLElementTagNameMap, HTMLEmbedElement, HTMLFencedFrameElement, HTMLFieldSetElement, HTMLFontElement, HTMLFormControlsCollection, HTMLFormElement, HTMLFrameElement, HTMLFrameSetElement, HTMLFrameSetElementEventMap, HTMLHRElement, HTMLHeadingElement, HTMLHyperlinkElementUtils, HTMLLIElement, HTMLLabelElement, HTMLLegendElement, HTMLMapElement, HTMLMarqueeElement, HTMLMediaElementEventMap, HTMLMenuElement, HTMLMetaElement, HTMLMeterElement, HTMLModElement, HTMLOListElement, HTMLObjectElement, HTMLOptGroupElement, HTMLOptionElement, HTMLOptionsCollection, HTMLOrSVGElement, HTMLOutputElement, HTMLParamElement, HTMLPictureElement, HTMLProgressElement, HTMLQuoteElement, HTMLSelectElement, HTMLTableCaptionElement, HTMLTableCellElement, HTMLTableColElement, HTMLTableDataCellElement, HTMLTableElement, HTMLTableHeaderCellElement, HTMLTableRowElement, HTMLTableSectionElement, HTMLTimeElement, HTMLTrackElement, HTMLUListElement, HTMLVideoElementEventMap, HkdfParams, HmacImportParams, HmacKeyAlgorithm, HmacKeyGenParams, IIRFilterOptions, IdentityCredential, IdentityProvider, IdleDetector, IdleRequestCallback, IdleRequestOptions, ImageCapture, ImageData, ImageDataSettings, ImageDecodeOptions, ImageDecodeResult, ImageEncodeOptions, ImageTrack, ImageTrackList, ImportMeta, ImportNodeOptions, Ink, InstallEvent, Instance, InterventionReportBody, JsonWebKey, KHR_parallel_shader_compile, KeyAlgorithm, KeySystemTrackConfiguration, Keyboard, KeyboardEventInit, KeyboardLayoutMap, Keyframe, KeyframeAnimationOptions, KeyframeEffect, KeyframeEffectOptions, LargestContentfulPaint, LaunchParams, LaunchQueue, LayoutShift, LayoutShiftAttribution, LinkError, LinkStyle, Lock, LockGrantedCallback, LockInfo, LockManager, LockManagerSnapshot, LockOptions, MIDIAccess, MIDIAccessEventMap, MIDIConnectionEvent, MIDIConnectionEventInit, MIDIInput, MIDIInputEventMap, MIDIInputMap, MIDIMessageEvent, MIDIMessageEventInit, MIDIOptions, MIDIOutput, MIDIOutputMap, MIDIPort, MIDIPortEventMap, ML, MLContext, MLGraph, MLGraphBuilder, MLOperand, ManagedMediaSource, ManagedSourceBuffer, MathMLElement.

---
### [JS-127] — Other missing globals (#3)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
MathMLElementEventMap; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Avoid this symbol; either omit the feature or implement via the engine bridge.
```

**Rule for AI agents:** Never use these missing global symbols; they are not defined on `window` in Gameface.

**Why:** scraper status: missing-from-window. Members: MathMLElementEventMap, MathMLElementTagNameMap, MediaCapabilities, MediaCapabilitiesDecodingInfo, MediaCapabilitiesEncodingInfo, MediaCapabilitiesInfo, MediaCapabilitiesKeySystemConfiguration, MediaConfiguration, MediaController, MediaDecodingConfiguration, MediaDeviceInfo, MediaElementAudioSourceOptions, MediaEncodingConfiguration, MediaEncryptedEvent, MediaEncryptedEventInit, MediaImage, MediaKeyMessageEvent, MediaKeyMessageEventInit, MediaKeySession, MediaKeySessionEventMap, MediaKeyStatusMap, MediaKeySystemAccess, MediaKeySystemConfiguration, MediaKeySystemMediaCapability, MediaKeys, MediaKeysPolicy, MediaList, MediaMetadata, MediaMetadataInit, MediaPositionState, MediaQueryList, MediaQueryListEvent, MediaQueryListEventInit, MediaQueryListEventMap, MediaSettingsRange, MediaSourceEventMap, MediaTrackCapabilities, MediaTrackConstraintSet, MediaTrackConstraints, MediaTrackSettings, MediaTrackSupportedConstraints, Memory, MemoryDescriptor, MerchantValidationEvent, MessageEventInit, MessageEventTarget, MessageEventTargetEventMap, MessagePortEventMap, Metadata, MimeType, MimeTypeArray, Module, ModuleExportDescriptor, ModuleImportDescriptor, MouseEventInit, MouseScrollEvent, MultiCacheQueryOptions, MutationCallback, MutationEvent, NDEFMessage, NDEFReader, NDEFReadingEvent, NDEFRecord, NavigatorAutomationInformation, NavigatorBadge, NavigatorConcurrentHardware, NavigatorContentUtils, NavigatorCookies, NavigatorID, NavigatorLanguage, NavigatorLocks, NavigatorLogin, NavigatorManagedData, NavigatorOnLine, NavigatorPlugins, NavigatorStorage, NavigatorUAData, NetworkInformation, NodeListOf, NonDocumentTypeChildNode, NonElementParentNode, NotRestoredReasonDetails, NotRestoredReasons, Notification, NotificationEvent, NotificationEventMap, NotificationOptions, NotificationPermissionCallback, OES_draw_buffers_indexed, OES_element_index_uint, OES_fbo_render_mipmap, OES_standard_derivatives, OES_texture_float, OES_texture_float_linear, OES_texture_half_float, OES_texture_half_float_linear, OES_vertex_array_object, OTPCredential, OVR_multiview2, OfflineAudioCompletionEvent, OfflineAudioCompletionEventInit, OnBeforeUnloadEventHandlerNonNull, OnErrorEventHandlerNonNull, OptionalEffectTiming, OpusEncoderConfig, OscillatorOptions, OverconstrainedError, PageRevealEvent, PageRevealEventInit, PageSwapEvent, PageSwapEventInit, PageTransitionEvent, PageTransitionEventInit, PaintRenderingContext2D, PaintSize, PannerOptions, ParentNode, Path2D, PayerErrors, PaymentAddress, PaymentCurrencyAmount, PaymentDetailsBase, PaymentDetailsInit, PaymentDetailsModifier, PaymentDetailsUpdate, PaymentItem, PaymentManager, PaymentMethodData, PaymentOptions, PaymentShippingOption, PaymentValidationErrors, Pbkdf2Params, PerformanceElementTiming, PerformanceEntry, PerformanceEventMap, PerformanceEventTiming, PerformanceLongAnimationFrameTiming, PerformanceLongTaskTiming, PerformanceMark, PerformanceMarkOptions, PerformanceMeasure, PerformanceMeasureOptions, PerformanceNavigation, PerformanceNavigationTiming, PerformancePaintTiming, PerformanceResourceTiming, PerformanceScriptTiming, PerformanceServerTiming, PerformanceTiming, PeriodicSyncEvent, PeriodicSyncManager, PhotoCapabilities, PhotoSettings, PictureInPictureEvent, PictureInPictureEventInit, PictureInPictureWindow, PictureInPictureWindowEventMap, PlaneLayout, Plugin, PluginArray, PointerEvent, PointerEventInit, PointerLockOptions, PopStateEventInit, PopoverInvokerElement, PositionCallback, PositionErrorCallback, PositionOptions, PositionSensorVRDevice, Presentation, PresentationAvailability, PresentationConnection, PresentationConnectionAvailableEvent, PresentationConnectionCloseEvent, PresentationConnectionList, PresentationReceiver, PresentationRequest, PressureObserver, PressureRecord, ProcessingInstruction, Profiler, ProgressEventInit, PromiseRejectionEventInit, PropertyDefinition, PropertyIndexedKeyframes, ProtectedAudience, PushEvent, PushManager, PushMessageData, PushSubscription, PushSubscriptionChangeEvent, PushSubscriptionJSON, PushSubscriptionOptions, PushSubscriptionOptionsInit, QueuingStrategy, QueuingStrategyInit, QueuingStrategySize, RGBColor, RadioNodeList, ReadableWritablePair.

---
### [JS-128] — Other missing globals (#4)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
Rect; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Avoid this symbol; either omit the feature or implement via the engine bridge.
```

**Rule for AI agents:** Never use these missing global symbols; they are not defined on `window` in Gameface.

**Why:** scraper status: missing-from-window. Members: Rect, RegistrationOptions, RemotePlayback, RemotePlaybackAvailabilityCallback, RemotePlaybackEventMap, Report, ReportBody, RequestInit, ResizeObserverCallback, ResponseInit, RestrictionTarget, RsaHashedImportParams, RsaHashedKeyAlgorithm, RsaHashedKeyGenParams, RsaKeyAlgorithm, RsaKeyGenParams, RsaOaepParams, RsaOtherPrimesInfo, RsaPssParams, RuntimeError, SVGAElement, SVGAngle, SVGAnimateColorElement, SVGAnimateElement, SVGAnimateMotionElement, SVGAnimateTransformElement, SVGAnimatedAngle, SVGAnimatedBoolean, SVGAnimatedEnumeration, SVGAnimatedInteger, SVGAnimatedLengthList, SVGAnimatedNumber, SVGAnimatedNumberList, SVGAnimatedPoints, SVGAnimatedPreserveAspectRatio, SVGAnimatedString, SVGAnimationElement, SVGBoundingBoxOptions, SVGCircleElement, SVGClipPathElement, SVGComponentTransferFunctionElement, SVGCursorElement, SVGDefsElement, SVGDescElement, SVGDiscardElement, SVGElementEventMap, SVGElementTagNameMap, SVGEllipseElement, SVGFEBlendElement, SVGFEColorMatrixElement, SVGFEComponentTransferElement, SVGFECompositeElement, SVGFEConvolveMatrixElement, SVGFEDiffuseLightingElement, SVGFEDisplacementMapElement, SVGFEDistantLightElement, SVGFEDropShadowElement, SVGFEFloodElement, SVGFEFuncAElement, SVGFEFuncBElement, SVGFEFuncGElement, SVGFEFuncRElement, SVGFEGaussianBlurElement, SVGFEImageElement, SVGFEMergeElement, SVGFEMergeNodeElement, SVGFEMorphologyElement, SVGFEOffsetElement, SVGFEPointLightElement, SVGFESpecularLightingElement, SVGFESpotLightElement, SVGFETileElement, SVGFETurbulenceElement, SVGFilterElement, SVGFilterPrimitiveStandardAttributes, SVGFitToViewBox, SVGFontElement, SVGFontFaceElement, SVGFontFaceFormatElement, SVGFontFaceNameElement, SVGFontFaceSrcElement, SVGFontFaceUriElement, SVGForeignObjectElement, SVGGElement, SVGGeometryElement, SVGGlyphElement, SVGGlyphRefElement, SVGGradientElement, SVGHKernElement, SVGImageElement, SVGLengthList, SVGLineElement, SVGLinearGradientElement, SVGMPathElement, SVGMarkerElement, SVGMaskElement, SVGMetadataElement, SVGMissingGlyphElement, SVGNumber, SVGNumberList, SVGPathElement, SVGPatternElement, SVGPoint, SVGPointList, SVGPolygonElement, SVGPolylineElement, SVGPreserveAspectRatio, SVGRadialGradientElement, SVGRectElement, SVGRenderingIntent, SVGSVGElementEventMap, SVGScriptElement, SVGSetElement, SVGStopElement, SVGStringList, SVGStyleElement, SVGSwitchElement, SVGSymbolElement, SVGTRefElement, SVGTSpanElement, SVGTests, SVGTextContentElement, SVGTextPathElement, SVGTextPositioningElement, SVGTitleElement, SVGURIReference, SVGUnitTypes, SVGUseElement, SVGVKernElement, SVGViewElement, Scheduler, Scheduling, ScreenDetailed, ScreenDetails, ScreenOrientation, ScreenOrientationEventMap, ScrollIntoViewOptions, ScrollOptions, ScrollTimeline, ScrollToOptions, SecurityPolicyViolationEvent, SecurityPolicyViolationEventInit, ShadowRootEventMap, ShadowRootInit, ShareData, SharedStorage, SharedStorageAppendMethod, SharedStorageClearMethod, SharedStorageDeleteMethod, SharedStorageModifierMethod, SharedStorageSetMethod, SharedStorageWorklet, SharedStorageWorkletGlobalScope, Slottable, SnapEvent, SourceBuffer, SourceBufferEventMap, SourceBufferList, SourceBufferListEventMap, StartViewTransitionOptions, StereoPannerOptions, StorageBucket, StorageBucketManager, StorageEstimate, StorageEvent, StorageEventInit, StreamPipeOptions, StructuredSerializeOptions, StyleMedia, SyncEvent, SyncManager, Tab, Table, TableDescriptor, TextDecodeOptions, TextDecoderCommon, TextDecoderOptions, TextEncoderCommon, TextEncoderEncodeIntoResult, TextFormat, TextFormatUpdateEvent, TextTrack, TextTrackCue, TextTrackCueEventMap, TextTrackCueList, TextTrackEventMap, TextTrackList, TextTrackListEventMap, TextUpdateEvent, TimeEvent, ToggleEvent, ToggleEventInit, TouchEventInit, TouchInit, TrackEvent, TrackEventInit, Transformer, TransformerFlushCallback, TransformerStartCallback, TransformerTransformCallback.

---
### [JS-129] — Other missing globals (#5)
**Status:** missing
**Surface:** js-api
**Severity:** low

**❌ Never generate:**
```js
TransitionEventInit; // ReferenceError or undefined on window
```

**✅ Generate instead:**
```js
// Avoid this symbol; either omit the feature or implement via the engine bridge.
```

**Rule for AI agents:** Never use these missing global symbols; they are not defined on `window` in Gameface.

**Why:** scraper status: missing-from-window. Members: TransitionEventInit, UIEventInit, ULongRange, URLPattern, URLSearchParams, UnderlyingByteSource, UnderlyingDefaultSource, UnderlyingSink, UnderlyingSinkAbortCallback, UnderlyingSinkCloseCallback, UnderlyingSinkStartCallback, UnderlyingSinkWriteCallback, UnderlyingSource, UnderlyingSourceCancelCallback, UnderlyingSourcePullCallback, UnderlyingSourceStartCallback, UserActivation, VTTCue, VTTRegion, ValidityState, ValidityStateFlags, ValueTypeMap, VideoColorSpace, VideoColorSpaceInit, VideoConfiguration, VideoPlaybackQuality, VideoTrack, VideoTrackGenerator, VideoTrackList, ViewTimeline, ViewTransition, ViewTransitionTypeSet, ViewTransitionUpdateCallback, VisibilityStateEntry, VoidFunction, WEBGL_color_buffer_float, WEBGL_compressed_texture_astc, WEBGL_compressed_texture_etc, WEBGL_compressed_texture_etc1, WEBGL_compressed_texture_pvrtc, WEBGL_compressed_texture_s3tc, WEBGL_compressed_texture_s3tc_srgb, WEBGL_debug_renderer_info, WEBGL_debug_shaders, WEBGL_depth_texture, WEBGL_draw_buffers, WEBGL_lose_context, WEBGL_multi_draw, WGSLLanguageFeatures, WaveShaperOptions, WebAssemblyInstantiatedSource, WebKitPoint, WebSocketError, WebSocketEventMap, WebSocketStream, WebTransport, WebTransportBidirectionalStream, WebTransportCloseInfo, WebTransportDatagramDuplexStream, WebTransportError, WebTransportErrorOptions, WebTransportHash, WebTransportOptions, WebTransportReceiveStream, WebTransportSendOptions, WebTransportSendStream, WebTransportSendStreamOptions, WheelEvent, WheelEventInit, WindowClient, WindowControlsOverlay, WindowControlsOverlayGeometryChangeEvent, WindowEventHandlers, WindowEventHandlersEventMap, WindowEventMap, WindowLocalStorage, WindowOrWorkerGlobalScope, WindowPostMessageOptions, WindowSessionStorage, WriteParams, XMLDocument, XMLHttpRequestEventMap, XMLHttpRequestEventTargetEventMap, XMLHttpRequestUpload, XMLSerializer, XSLTProcessor, crossOriginIsolated, isSecureContext, origin.

---
