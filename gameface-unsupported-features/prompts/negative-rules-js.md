# Negative Rules — JS

Generated from `results/js/{partial,unsupported}.json`. Stubbed APIs (`stub`, `stub-heavy`, `partial`) are collapsed into the `stub` status; `missing-from-window` becomes `missing`. Missing globals are grouped into family rules to keep the file scannable.

Total rules in this file: **149** (critical: 26, high: 109, medium: 6, low: 8).

## CRITICAL (26)

---
### [JS-001] — Animation
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const a = el.animate([{ opacity: 0 }, { opacity: 1 }], 300);
a.play(); a.pause(); a.finish(); // all no-op stubs
```

**✅ Generate instead:**
```js
// Use CSS @keyframes + animation longhands instead. Listen with element.style.animationName / events:
el.style.animation = 'fade 300ms ease-in-out forwards';
```

**Rule for AI agents:** Never call `element.animate()` or `Animation` methods (`play`, `pause`, `finish`, `reverse`, `cancel`); they are no-op stubs. Drive animation through CSS `@keyframes` only.

**Why:** scraper stubs: ["cancel","commitStyles","finish","pause","persist","play","playFromTo","reverse"]; scraper missing: ["effect","finished","id","oncancel","onremove","pending","playState","ready","replaceState","startTime","timeline","updatePlaybackRate"] …+4 more

---
### [JS-002] — CanvasRenderingContext2D
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const ctx = canvas.getContext('2d');
ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); // all no-op
```

**✅ Generate instead:**
```js
// Canvas is a no-op for drawing. Render in the host engine or via DOM elements.
```

**Rule for AI agents:** Never call any `CanvasRenderingContext2D` drawing method (`arc`, `fill`, `stroke`, `drawImage`, `fillText`, etc.); all are no-op stubs. Render via DOM or the host engine.

**Why:** scraper stubs: ["arc","arcTo","beginPath","bezierCurveTo","clearRect","clip","closePath","createConicGradient","createLinearGradient","createRadialGradient","drawFocusIfNeeded","fill"] …; scraper missing: ["createImageData","direction","ellipse","filter","fontKerning","fontStretch","fontVariantCaps","getContextAttributes","getImageData","getLineDash","getTransform","imageSmoothingEnabled"] …+14 more

---
### [JS-004] — CSSStyleDeclaration
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
el.style.borderInline = '1px solid red'; // missing
el.style.setProperty('--x', '1'); // stub
```

**✅ Generate instead:**
```js
// Set only documented physical-axis properties; don't expect setProperty to round-trip through getPropertyValue.
el.style.color = 'red';
```

**Rule for AI agents:** Never read/write the long list of missing CSS DOM properties on `element.style`; `setProperty`/`getPropertyValue`/`removeProperty` are stubs and `-webkit-*`/logical-axis properties are missing entirely.

**Why:** scraper stubs: ["getPropertyValue","removeProperty","setProperty"]; scraper missing: ["accentColor","alignmentBaseline","animationComposition","appearance","backgroundAttachment","backgroundBlendMode","backgroundClip","backgroundOrigin","baselineShift","baselineSource","blockSize","borderBlock"] …+336 more

---
### [JS-005] — CSSStyleSheet
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const s = new CSSStyleSheet(); // constructor missing
doc.styleSheets[0].insertRule('.x{}', 0); // insertRule is a stub
```

**✅ Generate instead:**
```js
// Mutate styles by toggling class names or by writing inline style on the element.
el.classList.add('active');
```

**Rule for AI agents:** Never use `new CSSStyleSheet()` (constructor missing); never call `insertRule`/`deleteRule` (stubs). Mutate styles via class toggling or inline `style`.

**Why:** scraper stubs: ["deleteRule","insertRule"]; scraper missing: ["ownerRule","rules","addRule","removeRule","replace","replaceSync","CSSStyleSheet"]

---
### [JS-006] — CustomElementRegistry
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
customElements.define('my-thing', class extends HTMLElement {}); // stub: registration is recorded but no upgrade lifecycle
```

**✅ Generate instead:**
```js
// Limit to component frameworks that don't depend on connectedCallback / lifecycle. Or build factory functions that return DOM trees.
```

**Rule for AI agents:** Never rely on `customElements.define` for lifecycle (connected/disconnected/attributeChanged); only `define` exists, and it does not run the upgrade machinery. `get`, `whenDefined`, `upgrade` are missing.

**Why:** scraper stubs: ["define"]; scraper missing: ["get","getName","upgrade","whenDefined"]

---
### [JS-007] — CustomEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const e = new CustomEvent('x', { detail: {} }); // constructor missing
```

**✅ Generate instead:**
```js
// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.
```

**Rule for AI agents:** Never construct `new CustomEvent(...)`; the constructor is missing. `preventDefault`/`stopPropagation` exist as no-op stubs on incoming events.

**Why:** scraper stubs: ["initCustomEvent"]; scraper missing: ["CustomEvent"]

---
### [JS-008] — Document
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
document.createElement('div'); // stub: returns an element but lifecycle hooks are no-ops
```

**✅ Generate instead:**
```js
// Use the supported DOM ops only: getElementById, querySelector, querySelectorAll, createElement, addEventListener.
```

**Rule for AI agents:** Never assume a full `Document` API; methods like `createElement`/`querySelector`/`getElementById` exist as stubs that work for basic cases, but `adoptNode`, `createRange`, `createTreeWalker`, `evaluate`, `getAnimations`, `exitFullscreen`, `startViewTransition`, `fonts`, `adoptedStyleSheets`, etc. are missing.

**Why:** scraper stubs: ["caretPositionFromPoint","createAttribute","createAttributeNS","createComment","createDocumentFragment","createElement","createElementNS","createEvent","createNodeIterator","createTextNode","elementFromPoint","elementsFromPoint"] …; scraper missing: ["alinkColor","all","anchors","applets","bgColor","cookie","designMode","dir","domain","embeds","fgColor","forms"] …+89 more

---
### [JS-009] — Element
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
el.attachShadow({ mode: 'open' }); // stub
el.scrollIntoView(); // missing
```

**✅ Generate instead:**
```js
// Restrict to documented APIs (classList add/remove via the supported subset, getBoundingClientRect, querySelector).
el.querySelector('.x').getBoundingClientRect();
```

**Rule for AI agents:** Never call `element.attachShadow`, `scrollIntoView`, `scroll`/`scrollTo`/`scrollBy`, `requestFullscreen`, `requestPointerLock`, `getHTML`/`setHTMLUnsafe`, `computedStyleMap`, `animate`, `toggleAttribute`, or any of the `aria*Element`/role properties; they are missing or stubbed.

**Why:** scraper stubs: ["after","attachShadow","before","blur","closest","focus","getAnimations","getAttribute","getAttributeNS","getAttributeNames","getAttributeNode","getAttributeNodeNS"] …; scraper missing: ["currentCSSZoom","onfullscreenchange","onfullscreenerror","checkVisibility","computedStyleMap","getHTML","hasPointerCapture","releasePointerCapture","requestFullscreen","requestPointerLock","scroll","scrollBy"] …+69 more

---
### [JS-010] — Event
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const e = new Event('x'); // constructor missing
ev.stopPropagation(); // stub
```

**✅ Generate instead:**
```js
// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.
```

**Rule for AI agents:** Never construct `new Event(...)`; the constructor is missing. `preventDefault`/`stopPropagation` exist as no-op stubs on incoming events.

**Why:** scraper stubs: ["initEvent","preventDefault","stopImmediatePropagation","stopPropagation"]; scraper missing: ["cancelBubble","isTrusted","returnValue","srcElement","timeStamp","composedPath","Event","explicitOriginalTarget","originalTarget"]

---
### [JS-011] — EventTarget
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
target.addEventListener('x', cb); target.dispatchEvent(ev); // stubs
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new EventTarget()`; constructor is missing. `addEventListener`/`removeEventListener`/`dispatchEvent` exist as stubs only on supported host objects.

**Why:** scraper stubs: ["addEventListener","dispatchEvent","removeEventListener"]

---
### [JS-013] — History
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
history.pushState({}, "", "/x"); // method exists but is a no-op
```

**✅ Generate instead:**
```js
// No history navigation. Use in-page state and class toggling.
```

**Rule for AI agents:** Never use `history.pushState`/`replaceState`/`back`/`forward`/`go`; all are stubs and there is no real navigation.

**Why:** scraper stubs: ["back","forward","go","pushState","replaceState"]; only present: ["index","length","state"]

---
### [JS-014] — KeyboardEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const e = new KeyboardEvent('keydown'); // constructor missing
ev.isComposing; // missing
```

**✅ Generate instead:**
```js
// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.
```

**Rule for AI agents:** Never construct `new KeyboardEvent(...)`; the constructor is missing. `preventDefault`/`stopPropagation` exist as no-op stubs on incoming events.

**Why:** scraper stubs: ["getModifierState","initKeyboardEvent"]; scraper missing: ["isComposing","KeyboardEvent","keyIdentifier"]

---
### [JS-015] — MouseEvent
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
// getModifierState is a stub on MouseEvent
```

**✅ Generate instead:**
```js
// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.
```

**Rule for AI agents:** Never construct `new MouseEvent(...)`; the constructor is missing. `preventDefault`/`stopPropagation` exist as no-op stubs on incoming events.

**Why:** scraper stubs: ["getModifierState","initMouseEvent"]; scraper missing: ["layerX","layerY","offsetX","offsetY","pageX","pageY","MouseEvent"]

---
### [JS-016] — MutationObserver
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const o = new MutationObserver(cb);
o.observe(el, { childList: true }); // stub: callback never fires
```

**✅ Generate instead:**
```js
// No reactive observation. Poll on requestAnimationFrame or apply changes immediately when you cause them.
```

**Rule for AI agents:** Never use `MutationObserver`; `observe`/`disconnect`/`takeRecords` are no-op stubs and the callback never fires.

**Why:** scraper stubs: ["disconnect","observe","takeRecords"]

---
### [JS-017] — Navigator
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
navigator.clipboard.writeText('hi'); // missing
navigator.getGamepads(); // stub
```

**✅ Generate instead:**
```js
// No clipboard / credentials / mediaDevices / geolocation. getGamepads is a stub. Use the engine bridge.
```

**Rule for AI agents:** Never use `navigator.clipboard`/`credentials`/`mediaDevices`/`geolocation`/`permissions`/`serviceWorker`/`storage`/`vibrate`/`share`/`userAgentData`; missing. `getGamepads` is a stub.

**Why:** scraper stubs: ["getGamepads"]; scraper missing: ["clipboard","credentials","doNotTrack","geolocation","login","maxTouchPoints","mediaCapabilities","mediaDevices","mediaSession","permissions","serviceWorker","userActivation"] …+75 more

---
### [JS-018] — Node
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
node.appendChild(child); node.cloneNode(); // both stubs
```

**✅ Generate instead:**
```js
// Use parent.appendChild(child) only when both nodes were created via the supported document.createElement path.
```

**Rule for AI agents:** Never assume `Node` traversal/mutation methods compose across all node types; `appendChild`, `cloneNode`, `compareDocumentPosition`, `contains`, `insertBefore`, `removeChild`, `replaceChild` are all stubs (basic usage works, edge cases may not).

**Why:** scraper stubs: ["append","appendChild","cloneNode","compareDocumentPosition","contains","getRootNode","hasChildNodes","insertBefore","isDefaultNamespace","isEqualNode","isSameNode","lookupNamespaceURI"] …

---
### [JS-019] — Performance
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
performance.mark('x'); performance.measure('y'); // missing
```

**✅ Generate instead:**
```js
// Only performance.now() is supported. Don't call mark/measure/getEntries.
```

**Rule for AI agents:** Never call `performance.mark`/`measure`/`getEntries`/`getEntriesByName`/`getEntriesByType`/`clearMarks`/`clearMeasures`/`navigation`/`timing`; only `performance.now()` is supported.

**Why:** scraper stubs: ["now","addEventListener","removeEventListener"]; scraper missing: ["eventCounts","navigation","onresourcetimingbufferfull","timeOrigin","timing","clearMarks","clearMeasures","clearResourceTimings","getEntries","getEntriesByName","getEntriesByType","mark"] …+5 more

---
### [JS-020] — ResizeObserver
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const o = new ResizeObserver(cb);
o.observe(el); // stub: cb never fires
```

**✅ Generate instead:**
```js
// No reactive observation. Poll on requestAnimationFrame or apply changes immediately when you cause them.
```

**Rule for AI agents:** Never use `ResizeObserver`; `observe`/`unobserve`/`disconnect` are no-op stubs and the callback never fires.

**Why:** scraper stubs: ["disconnect","observe","unobserve"]

---
### [JS-021] — Selection
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
getSelection().toString(); // method exists but is a no-op
```

**✅ Generate instead:**
```js
// No text selection API. Avoid features that depend on selection.
```

**Rule for AI agents:** Never depend on `getSelection()` for ranges; methods (`removeAllRanges`, `setBaseAndExtent`, `empty`, `toString`) are stubs and most range APIs are missing.

**Why:** scraper stubs: ["empty","removeAllRanges","setBaseAndExtent","toString"]; scraper missing: ["direction","isCollapsed","rangeCount","type","addRange","collapse","collapseToEnd","collapseToStart","containsNode","deleteFromDocument","extend","getComposedRanges"] …+5 more

---
### [JS-022] — Storage
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
localStorage.setItem("k","v"); // method exists but is a no-op
```

**✅ Generate instead:**
```js
// No localStorage / sessionStorage. Persist via the engine bridge.
```

**Rule for AI agents:** Never use `localStorage`/`sessionStorage` for persistence; `setItem`/`getItem`/`removeItem`/`clear`/`key` are stubs.

**Why:** scraper stubs: ["clear","getItem","key","removeItem","setItem"]; only present: ["length"]

---
### [JS-024] — URL
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
new URL('https://x'); // constructor missing
```

**✅ Generate instead:**
```js
// Don't construct URL. Use string operations.
const path = base + '/' + segment;
```

**Rule for AI agents:** Never `new URL(...)`; the constructor is missing. Use string operations.

**Why:** scraper stubs: ["toJSON","toString"]; scraper missing: ["revokeObjectURL","password","searchParams","username","URL"]

---
### [JS-025] — WebSocket
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const s = new WebSocket('ws://x');
s.send('hi'); // send is a no-op stub
```

**✅ Generate instead:**
```js
// Communicate with the host engine via the Gameface bridge (engine.call, coh-* APIs). Don't make HTTP/WS calls from page JS.
```

**Rule for AI agents:** Never call `WebSocket` (`new WebSocket` constructor missing; `close`/`send` are stubs). Communicate via the engine bridge.

**Why:** scraper stubs: ["close","send","addEventListener","removeEventListener"]; scraper missing: ["WebSocket"]

---
### [JS-026] — XMLHttpRequest
**Status:** stub
**Surface:** js-stub
**Severity:** critical

**❌ Never generate:**
```js
const x = new XMLHttpRequest();
x.open('GET','/api'); x.send(); // open/send are stubs
```

**✅ Generate instead:**
```js
// Communicate with the host engine via the Gameface bridge (engine.call, coh-* APIs). Don't make HTTP/WS calls from page JS.
```

**Rule for AI agents:** Never call `XMLHttpRequest` methods (`open`, `send`, `abort`, `setRequestHeader` …); they are stubs. Use the Gameface engine bridge.

**Why:** scraper stubs: ["abort","getAllResponseHeaders","getResponseHeader","open","overrideMimeType","send","setRequestHeader","addEventListener","removeEventListener"]; scraper missing: ["responseArrayBuffer","responseBlob","responseXML","upload","XMLHttpRequest","setAttributionReporting","setPrivateToken"]

---
### [JS-012] — Fetch / network APIs
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
### [JS-023] — Storage and database APIs
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
### [JS-003] — Crypto, encoding, structured-clone
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

## HIGH (109)

---
### [JS-027] — AnimationEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// AnimationEvent is missing on AnimationEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new AnimationEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["AnimationEvent"]

---
### [JS-028] — Attr
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// ownerElement is missing on Attr
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never read `Attr.ownerElement` or `Attr.specified`; missing. Use `element.getAttribute`/`setAttribute` directly.

**Why:** scraper missing: ["ownerElement","specified"]

---
### [JS-029] — Blob
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// slice is a stub on Blob
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `Blob.text()`/`arrayBuffer()`/`stream()`/`bytes()` or `new Blob()`; missing. `slice` is a no-op stub.

**Why:** scraper stubs: ["slice"]; scraper missing: ["arrayBuffer","bytes","stream","text","Blob"]

---
### [JS-030] — BlobPropertyBag
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// endings is missing on BlobPropertyBag
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never set the missing dictionary fields on `BlobPropertyBag` (per scraper evidence); they are silently ignored.

**Why:** scraper missing: ["endings"]

---
### [JS-031] — CanvasGradient
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addColorStop is a stub on CanvasGradient
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use CanvasGradient; `addColorStop`/`setTransform` are stubs and the canvas pipeline is non-functional.

**Why:** scraper stubs: ["addColorStop"]

---
### [JS-032] — CanvasPattern
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// setTransform is missing on CanvasPattern
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use CanvasPattern; `addColorStop`/`setTransform` are stubs and the canvas pipeline is non-functional.

**Why:** scraper missing: ["setTransform"]

---
### [JS-033] — CaretPosition
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// getClientRect is missing on CaretPosition
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `CaretPosition.getClientRect()`; missing.

**Why:** scraper missing: ["getClientRect"]

---
### [JS-034] — CharacterData
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// after is a stub on CharacterData
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `appendData`/`deleteData`/`insertData`/`replaceData`/`substringData`/`after`/`before`/`remove`; all stubs. Mutate Text via `textContent`.

**Why:** scraper stubs: ["after","appendData","before","deleteData","insertData","remove","replaceData","substringData"]; only present: ["data","length","previousElementSibling","nextElementSibling","ownerDocument"]

---
### [JS-035] — CoherentDebug
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// triggerPageCapture is a stub on CoherentDebug
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never rely on `CoherentDebug.triggerPageCapture`; it is a stub.

**Why:** scraper stubs: ["triggerPageCapture"]

---
### [JS-036] — Comment
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// Comment is missing on Comment
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new Comment()`; constructor missing. Create comments/text via `document.createComment`/`document.createTextNode` (stubs).

**Why:** scraper missing: ["Comment"]

---
### [JS-037] — Console
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
console.dir(obj); console.group(); // missing
```

**✅ Generate instead:**
```js
// Only console.log/info/debug/warn/error/assert/time/timeEnd are stubbed. Don't call .group/.dir/.table.
```

**Rule for AI agents:** Never call `console.dir`, `console.group`/`groupEnd`/`groupCollapsed`, `console.table`, `console.count`/`countReset`, `console.dirxml`, `console.timeLog`/`timeStamp`, or `console.trace`; only `log`/`info`/`debug`/`warn`/`error`/`assert`/`time`/`timeEnd` are present.

**Why:** scraper stubs: ["assert","debug","error","info","log","time","timeEnd","warn"]; scraper missing: ["clear","count","countReset","dir","dirxml","group","groupCollapsed","groupEnd","table","timeLog","timeStamp","trace"]

---
### [JS-038] — CSS
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// deg is missing on CSS
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `CSS.px`/`em`/`%`/`rem`/`vw`/`vh`/`vmin`/`vmax`/`s`/`ms`/`deg`/`number`/`pt`/`in`/`percent`; the unit factories are missing.

**Why:** scraper missing: ["deg","em","in","ms","number","percent","pt","px","rem","s","vh","vmax"] …+2 more

---
### [JS-039] — CSSAnimation
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is missing on CSSAnimation
```

**✅ Generate instead:**
```js
// Use CSS @keyframes + animation longhands instead. Listen with element.style.animationName / events:
el.style.animation = 'fade 300ms ease-in-out forwards';
```

**Rule for AI agents:** Never call `element.animate()` or `Animation` methods (`play`, `pause`, `finish`, `reverse`, `cancel`); they are no-op stubs. Drive animation through CSS `@keyframes` only.

**Why:** scraper missing: ["addEventListener","removeEventListener"]

---
### [JS-040] — CSSKeywordValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSKeywordValue is missing on CSSKeywordValue
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSKeywordValue(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSKeywordValue"]

---
### [JS-041] — CSSMatrixComponent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSMatrixComponent is missing on CSSMatrixComponent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSMatrixComponent(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSMatrixComponent"]

---
### [JS-042] — CSSNumericValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// add is missing on CSSNumericValue
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (CSSNumericValue); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper missing: ["add","div","equals","max","min","mul","sub","to","toSum","type"]

---
### [JS-043] — CSSRotate
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSRotate is missing on CSSRotate
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSRotate(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSRotate"]

---
### [JS-044] — CSSRuleList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// item is missing on CSSRuleList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `CSSRuleList.item`; missing. Use index access only.

**Why:** scraper missing: ["item"]

---
### [JS-045] — CSSScale
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSScale is missing on CSSScale
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSScale(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSScale"]

---
### [JS-046] — CSSSkewX
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSSkewX is missing on CSSSkewX
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSSkewX(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSSkewX"]

---
### [JS-047] — CSSSkewY
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSSkewY is missing on CSSSkewY
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSSkewY(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSSkewY"]

---
### [JS-048] — CSSStyleValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// toString is a stub on CSSStyleValue
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (CSSStyleValue); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper stubs: ["toString"]

---
### [JS-049] — CSSTransformComponent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// toMatrix is a stub on CSSTransformComponent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (CSSTransformComponent); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper stubs: ["toMatrix","toString"]; only present: ["is2D"]

---
### [JS-050] — CSSTransformValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// GetTransformAtIndex is a stub on CSSTransformValue
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (CSSTransformValue); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper stubs: ["GetTransformAtIndex","SetTransformAtIndex","toMatrix","forEach","entries","keys","values"]; only present: ["length","is2D"]

---
### [JS-051] — CSSTranslate
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSTranslate is missing on CSSTranslate
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSTranslate(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSTranslate"]

---
### [JS-052] — CSSUnitValue
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// CSSUnitValue is missing on CSSUnitValue
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new CSSUnitValue(...)`; constructor missing in Typed CSSOM.

**Why:** scraper missing: ["CSSUnitValue"]

---
### [JS-053] — DocumentFragment
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// getElementById is a stub on DocumentFragment
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new DocumentFragment()`; constructor missing. `getElementById`/`querySelector`/`querySelectorAll`/`append` are stubs.

**Why:** scraper stubs: ["getElementById","querySelector","querySelectorAll","append"]; scraper missing: ["DocumentFragment","moveBefore","prepend","replaceChildren"]

---
### [JS-054] — DocumentType
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// after is a stub on DocumentType
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `DocumentType.replaceWith`; missing. `after`/`before`/`remove` are stubs.

**Why:** scraper stubs: ["after","before","remove"]; scraper missing: ["replaceWith"]

---
### [JS-056] — DOMMatrix
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// invertSelf is missing on DOMMatrix
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new DOMMatrix(...)`; constructor missing. Mutating self-* methods (`invertSelf`, `multiplySelf`, `rotateSelf`, etc.) are missing.

**Why:** scraper missing: ["invertSelf","multiplySelf","preMultiplySelf","rotateAxisAngleSelf","rotateFromVectorSelf","rotateSelf","scale3dSelf","scaleSelf","setMatrixValue","skewXSelf","skewYSelf","translateSelf"] …+1 more

---
### [JS-057] — DOMRect
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// DOMRect is missing on DOMRect
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new DOMRect(...)`; constructor missing. 

**Why:** scraper missing: ["DOMRect"]

---
### [JS-058] — DOMRectList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// item is a stub on DOMRectList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `DOMRectList.item` or iteration methods; they are stubs. Use `length` + index access only.

**Why:** scraper stubs: ["item"]; only present: ["length"]

---
### [JS-059] — DOMRectReadOnly
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// toJSON is missing on DOMRectReadOnly
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new DOMRectReadOnly(...)`; constructor missing. 

**Why:** scraper missing: ["toJSON","DOMRectReadOnly"]

---
### [JS-060] — DOMStringMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// itemDeleter is missing on DOMStringMap
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new DOMStringMap(...)`; constructor missing. 

**Why:** scraper missing: ["itemDeleter","itemGetter","itemSetter"]

---
### [JS-061] — DOMTokenList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
el.classList.add('x'); el.classList.toggle('y'); // both stubs
```

**✅ Generate instead:**
```js
// Use el.className = '...' assignment for guaranteed effect; classList methods exist but are stubs.
el.className = 'panel panel--active';
```

**Rule for AI agents:** Never call `classList` methods (`add`, `remove`, `toggle`, `replace`, `contains`, `supports`, `item`); they are stubs. Assign `element.className` directly.

**Why:** scraper stubs: ["add","contains","item","remove","replace","supports","toggle","toString","forEach","entries","keys","values"]; only present: ["length","value"]

---
### [JS-062] — DOMTokenListPart
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// add is a stub on DOMTokenListPart
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `DOMTokenListPart`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["add","contains","item","remove","replace","supports"]; only present: ["length","value"]

---
### [JS-063] — ErrorEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// ErrorEvent is missing on ErrorEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new ErrorEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["ErrorEvent"]

---
### [JS-064] — EventListener
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// handleEvent is a stub on EventListener
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `EventListener`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["handleEvent"]

---
### [JS-065] — FocusEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// FocusEvent is missing on FocusEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new FocusEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["FocusEvent"]

---
### [JS-066] — Gamepad
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// vibrationActuator is missing on Gamepad
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `Gamepad`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper missing: ["vibrationActuator","hapticActuators"]

---
### [JS-067] — GamepadEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// GamepadEvent is missing on GamepadEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new GamepadEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["GamepadEvent"]

---
### [JS-068] — GetAnimationsOptions
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// subtree is missing on GetAnimationsOptions
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never set the missing dictionary fields on `GetAnimationsOptions` (per scraper evidence); they are silently ignored.

**Why:** scraper missing: ["subtree"]

---
### [JS-069] — HTMLBodyElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLBodyElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLBodyElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["aLink","background","bgColor","link","text","vLink"]

---
### [JS-070] — HTMLButtonElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLButtonElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `HTMLButtonElement` form/validation properties (`form`, `validity`, `labels`, `formAction`, `checkValidity`, `reportValidity`, `setCustomValidity`, `disabled`, `type`, `value`, `name`, `willValidate`, `command`/`commandFor*`, `popoverTarget*`); all missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["disabled","form","formAction","formEnctype","formMethod","formNoValidate","formTarget","labels","name","type","validationMessage","validity"] …+9 more

---
### [JS-071] — HTMLCanvasElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// getContext is a stub on HTMLCanvasElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `canvas.toDataURL`, `toBlob`, `captureStream`, `transferControlToOffscreen`; missing. `getContext`/`addEventListener` are stubs.

**Why:** scraper stubs: ["getContext","addEventListener","removeEventListener"]; scraper missing: ["getContext2D","captureStream","toBlob","toDataURL","transferControlToOffscreen","mozOpaque","mozPrintCallback"]

---
### [JS-072] — HTMLCollection
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// item is a stub on HTMLCollection
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `HTMLCollection`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["item"]; scraper missing: ["namedItem"]

---
### [JS-073] — HTMLDivElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLDivElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLDivElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-074] — HTMLDocument
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLDocument
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLDocument-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-075] — HTMLElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `hidden`, `inert`, `innerText`/`outerText`, `title`, `lang`, `dir`, `autocapitalize`, `autocorrect`, `spellcheck`, `tabIndex`, `accessKey`, `draggable`, `translate`, `isContentEditable`/`contentEditable`, `enterKeyHint`, `inputMode`, `virtualKeyboardPolicy`, `popover`/`showPopover`/`hidePopover`/`togglePopover`, `click()`, `attachInternals`, `autofocus`; all missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener","blur","focus"]; scraper missing: ["accessKey","accessKeyLabel","autocapitalize","autocorrect","dir","draggable","hidden","inert","innerText","lang","outerText","popover"] …+19 more

---
### [JS-076] — HTMLHeadElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLHeadElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLHeadElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-077] — HTMLHtmlElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLHtmlElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLHtmlElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-078] — HTMLIFrameElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLIFrameElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `iframe.contentDocument`/`contentWindow`, `src`/`srcdoc`, `allow`, `allowFullscreen`, `sandbox`, `loading`, `name`, `height`/`width`; iframe is parsed-no-impl. All missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["align","allow","allowFullscreen","contentDocument","contentWindow","frameBorder","height","loading","longDesc","marginHeight","marginWidth","name"] …+15 more

---
### [JS-079] — HTMLImageElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLImageElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never read `img.alt`, `complete`, `naturalWidth`/`Height`, `currentSrc`, `crossOrigin`, `decoding`, `fetchPriority`, `loading`, `referrerPolicy`, `sizes`, `srcset`, `useMap`, `x`, `y`; all missing. `src` works.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["align","alt","border","complete","crossOrigin","currentSrc","decoding","fetchPriority","hspace","isMap","loading","longDesc"] …+15 more

---
### [JS-080] — HTMLInputElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// select is a stub on HTMLInputElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `input.checked`, `files`, `form`, `labels`, `list`, `max`/`min`/`step`, `multiple`, `pattern`, `placeholder`, `readOnly`, `required`, `validity`, `valueAsDate`/`valueAsNumber`, `stepUp`/`stepDown`, `checkValidity`/`reportValidity`/`setCustomValidity`, `showPicker`, `indeterminate`, `autocomplete`, `accept`, `alt`, `disabled`, `name`; all missing. `value`, `type`, `focus`, `blur`, `select`, `setRangeText`, `setSelectionRange` are stubs/supported.

**Why:** scraper stubs: ["select","setRangeText","setSelectionRange","addEventListener","removeEventListener"]; scraper missing: ["accept","align","alt","autocomplete","capture","checked","defaultChecked","defaultValue","dirName","disabled","files","form"] …+39 more

---
### [JS-081] — HTMLLinkElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLLinkElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `link.sheet`, `relList`, `media`, `crossOrigin`, `integrity`, `fetchPriority`, `hreflang`, `imageSizes`/`imageSrcset`, `referrerPolicy`, `sizes`, `disabled`, `as`; all missing. `href`/`rel` work.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["as","charset","crossOrigin","disabled","fetchPriority","hreflang","imageSizes","imageSrcset","integrity","media","referrerPolicy","rev"] …+5 more

---
### [JS-082] — HTMLMediaElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// canPlayType is a stub on HTMLMediaElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `addTextTrack`, `fastSeek`, `setMediaKeys`, `setSinkId`; missing. `canPlayType`/`load`/`pause`/`play`/`coh*` are stubs.

**Why:** scraper stubs: ["canPlayType","cohGetKeyframeTimestamps","cohPrebufferKeyframe","load","pause","play","addEventListener","removeEventListener"]; scraper missing: ["srcObject","controls","defaultMuted","disableRemotePlayback","mediaKeys","onencrypted","onwaitingforkey","preservesPitch","remote","sinkId","textTracks","addTextTrack"] …+15 more

---
### [JS-083] — HTMLParagraphElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLParagraphElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLParagraphElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-084] — HTMLPreElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLPreElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLPreElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-085] — HTMLScriptElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLScriptElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `script.crossOrigin`, `integrity`, `fetchPriority`, `referrerPolicy`, `noModule`, `htmlFor`, `event`, `charset`; missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["charset","crossOrigin","event","fetchPriority","htmlFor","integrity","noModule","referrerPolicy","attributionSrc","blocking"]

---
### [JS-086] — HTMLSlotElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// assign is a stub on HTMLSlotElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `HTMLSlotElement`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["assign","assignedElements","assignedNodes","addEventListener","removeEventListener"]; only present: ["name"]

---
### [JS-087] — HTMLSourceElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLSourceElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `source.height`, `width`, `sizes`, `srcset`; missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["height","sizes","srcset","width"]

---
### [JS-088] — HTMLSpanElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLSpanElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLSpanElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-089] — HTMLStyleElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLStyleElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `style.sheet`, `disabled`, `media`, `type`; missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["disabled","media","type","blocking","sheet"]

---
### [JS-090] — HTMLTemplateElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLTemplateElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `template.shadowRootMode`/`shadowRootClonable`/`shadowRootDelegatesFocus`/`shadowRootSerializable`; missing. `content` works.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["shadowRootClonable","shadowRootDelegatesFocus","shadowRootMode","shadowRootSerializable"]

---
### [JS-091] — HTMLTextAreaElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// select is a stub on HTMLTextAreaElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `textarea.form`, `labels`, `name`, `disabled`, `readOnly`, `required`, `placeholder`, `autocomplete`, `validity`/`willValidate`/`checkValidity`/`reportValidity`/`setCustomValidity`; missing. `value`, `rows`, `cols`, `select`, `setRangeText`, `setSelectionRange` work.

**Why:** scraper stubs: ["select","setRangeText","setSelectionRange","addEventListener","removeEventListener"]; scraper missing: ["autocomplete","defaultValue","dirName","disabled","form","labels","name","placeholder","readOnly","required","type","validationMessage"] …+5 more

---
### [JS-092] — HTMLTitleElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLTitleElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLTitleElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-093] — HTMLUnknownElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLUnknownElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect HTMLUnknownElement-specific properties beyond Element; `addEventListener`/`removeEventListener` are stubs and there are no element-typed extras.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]

---
### [JS-094] — HTMLVideoElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on HTMLVideoElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `video.requestPictureInPicture`, `getVideoPlaybackQuality`, `requestVideoFrameCallback`/`cancelVideoFrameCallback`, `disablePictureInPicture`, `playsInline`; missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["disablePictureInPicture","onenterpictureinpicture","onleavepictureinpicture","playsInline","cancelVideoFrameCallback","getVideoPlaybackQuality","requestPictureInPicture","requestVideoFrameCallback","mozDecodedFrames","mozFrameDelay","mozHasAudio","mozPaintedFrames"] …+2 more

---
### [JS-095] — Location
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// assign is a stub on Location
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `Location`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["assign","reload","replace","toString"]

---
### [JS-097] — MessageEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// ports is missing on MessageEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new MessageEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["ports","source","initMessageEvent","MessageEvent","userActivation"]

---
### [JS-100] — NamedNodeMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// getNamedItem is a stub on NamedNodeMap
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `NamedNodeMap.setNamedItem`/`removeNamedItem`/`getNamedItemNS`; missing. `item`/`getNamedItem` are stubs. Use `element.getAttribute`/`setAttribute` instead.

**Why:** scraper stubs: ["getNamedItem","item"]; scraper missing: ["getNamedItemNS","removeNamedItem","removeNamedItemNS","setNamedItem","setNamedItemNS"]

---
### [JS-101] — NodeFilter
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// acceptNode is a stub on NodeFilter
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `NodeFilter`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper stubs: ["acceptNode"]

---
### [JS-102] — NodeIterator
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// nextNode is a stub on NodeIterator
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `NodeIterator`; `nextNode`/`previousNode` are stubs and `createNodeIterator` returns a non-functional traverser.

**Why:** scraper stubs: ["nextNode","previousNode"]; scraper missing: ["detach"]

---
### [JS-103] — NodeList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
nodeList.forEach(fn); // stub iterator
```

**✅ Generate instead:**
```js
// Iterate manually with a for-loop:
for (let i = 0; i < list.length; i++) { handle(list[i]); }
```

**Rule for AI agents:** Never call `NodeList.forEach`/`entries`/`keys`/`values` — they are stubs; iterate with a numeric `for` loop using `length`.

**Why:** scraper stubs: ["item","forEach","entries","keys","values"]; only present: ["length"]

---
### [JS-104] — PopStateEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// hasUAVisualTransition is missing on PopStateEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new PopStateEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["hasUAVisualTransition","PopStateEvent"]

---
### [JS-105] — ProgressEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// ProgressEvent is missing on ProgressEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new ProgressEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["ProgressEvent"]

---
### [JS-106] — PromiseRejectionEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// PromiseRejectionEvent is missing on PromiseRejectionEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new PromiseRejectionEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["PromiseRejectionEvent"]

---
### [JS-107] — ResizeObserverOptions
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// box is missing on ResizeObserverOptions
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never set the missing dictionary fields on `ResizeObserverOptions` (per scraper evidence); they are silently ignored.

**Why:** scraper missing: ["box"]

---
### [JS-108] — Screen
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// orientation is missing on Screen
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `screen.orientation`, `availLeft`/`availTop`, `isExtended`, `left`/`top`, `lockOrientation`/`unlockOrientation`, `mozBrightness`/`mozEnabled`; missing.

**Why:** scraper missing: ["orientation","availLeft","availTop","isExtended","left","lockOrientation","mozBrightness","mozEnabled","top","unlockOrientation"]

---
### [JS-109] — ShadowRoot
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// elementFromPoint is a stub on ShadowRoot
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never depend on Shadow DOM (`element.attachShadow` is a stub on Element); `ShadowRoot` exists but `getHTML`/`setHTMLUnsafe`/`adoptedStyleSheets`/`getAnimations`/`getSelection` are missing.

**Why:** scraper stubs: ["elementFromPoint","elementsFromPoint","addEventListener","removeEventListener"]; scraper missing: ["serializable","getHTML","setHTMLUnsafe","adoptedStyleSheets","fullscreenElement","getAnimations","getSelection","pictureInPictureElement","pointerLockElement"]

---
### [JS-110] — StylePropertyMap
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// clear is a stub on StylePropertyMap
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (StylePropertyMap); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper stubs: ["clear","delete","set"]

---
### [JS-111] — StylePropertyMapReadOnly
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// get is a stub on StylePropertyMapReadOnly
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use the Typed-CSSOM (StylePropertyMapReadOnly); `get`/`set`/`has`/`clear`/`delete` are stubs and the constructors are missing.

**Why:** scraper stubs: ["get","has"]; scraper missing: ["getAll","forEach","entries","keys","values"]

---
### [JS-112] — StyleSheet
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// disabled is missing on StyleSheet
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never assume the full standard surface of `StyleSheet`; multiple methods/properties are stubs or missing per the scraper.

**Why:** scraper missing: ["disabled","href","parentStyleSheet","title","type","media"]

---
### [JS-113] — StyleSheetList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// item is a stub on StyleSheetList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `StyleSheetList.item` or iteration methods; they are stubs. Use `length` + index access only.

**Why:** scraper stubs: ["item"]; only present: ["length"]

---
### [JS-114] — SVGAnimatedLength
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// animVal is missing on SVGAnimatedLength
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGAnimatedLength interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper missing: ["animVal"]

---
### [JS-115] — SVGAnimatedRect
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// animVal is missing on SVGAnimatedRect
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGAnimatedRect interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper missing: ["animVal"]

---
### [JS-116] — SVGAnimatedTransformList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// animVal is missing on SVGAnimatedTransformList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGAnimatedTransformList interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper missing: ["animVal"]

---
### [JS-117] — SVGElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on SVGElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGElement interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper stubs: ["addEventListener","removeEventListener","blur","focus"]; scraper missing: ["ownerSVGElement","viewportElement","attributeStyleMap","autofocus","dataset","nonce","tabIndex"]

---
### [JS-118] — SVGGraphicsElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on SVGGraphicsElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGGraphicsElement interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["getBBox","getCTM","getScreenCTM","requiredExtensions","systemLanguage"]

---
### [JS-119] — SVGLength
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// valueAsString is missing on SVGLength
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGLength interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper missing: ["valueAsString","valueInSpecifiedUnits","convertToSpecifiedUnits","newValueSpecifiedUnits","SVG_LENGTHTYPE_UNKNOWN","SVG_LENGTHTYPE_NUMBER","SVG_LENGTHTYPE_PERCENTAGE","SVG_LENGTHTYPE_EMS","SVG_LENGTHTYPE_EXS","SVG_LENGTHTYPE_PX","SVG_LENGTHTYPE_CM","SVG_LENGTHTYPE_MM"] …+3 more

---
### [JS-120] — SVGSVGElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on SVGSVGElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGSVGElement interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["currentScale","currentTranslate","x","y","animationsPaused","checkEnclosure","checkIntersection","createSVGAngle","createSVGLength","createSVGMatrix","createSVGNumber","createSVGPoint"] …+18 more

---
### [JS-121] — SVGTextElement
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// getComputedTextLength is a stub on SVGTextElement
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGTextElement interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper stubs: ["getComputedTextLength","addEventListener","removeEventListener"]

---
### [JS-122] — SVGTransform
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// setMatrix is missing on SVGTransform
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGTransform interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper missing: ["setMatrix","setRotate","setScale","setSkewX","setSkewY","setTranslate","SVG_TRANSFORM_UNKNOWN","SVG_TRANSFORM_MATRIX","SVG_TRANSFORM_TRANSLATE","SVG_TRANSFORM_SCALE","SVG_TRANSFORM_ROTATE","SVG_TRANSFORM_SKEWX"] …+1 more

---
### [JS-123] — SVGTransformList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// consolidate is a stub on SVGTransformList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use full SVGTransformList interface; many properties are missing (animVal, dataset on SVGElement, ownerSVGElement, getBBox/getCTM, currentScale/Translate, createSVG* factories, animation control). Construct SVG declaratively in the markup and rely only on standard CSS properties for styling.

**Why:** scraper stubs: ["consolidate"]; scraper missing: ["appendItem","clear","createSVGTransformFromMatrix","getItem","initialize","insertItemBefore","removeItem","replaceItem"]

---
### [JS-124] — Text
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// splitText is a stub on Text
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new Text()`; constructor missing. Create comments/text via `document.createComment`/`document.createTextNode` (stubs).

**Why:** scraper stubs: ["splitText"]; scraper missing: ["Text","getBoxQuads"]

---
### [JS-125] — TextMetrics
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// alphabeticBaseline is missing on TextMetrics
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never use `alphabeticBaseline`, `emHeightAscent`/`emHeightDescent`, `fontBoundingBoxAscent`/`fontBoundingBoxDescent`, `hangingBaseline`, `ideographicBaseline` from `measureText`; missing.

**Why:** scraper missing: ["alphabeticBaseline","emHeightAscent","emHeightDescent","fontBoundingBoxAscent","fontBoundingBoxDescent","hangingBaseline","ideographicBaseline"]

---
### [JS-126] — TimeRanges
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// end is a stub on TimeRanges
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `TimeRanges.item` or iteration methods; they are stubs. Use `length` + index access only.

**Why:** scraper stubs: ["end","start"]; only present: ["length"]

---
### [JS-127] — Touch
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// force is missing on Touch
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new Touch()`; constructor missing. Touch APIs are partial — see scraper for missing fields.

**Why:** scraper missing: ["force","radiusX","radiusY","rotationAngle","Touch","altitudeAngle","azimuthAngle","touchType"]

---
### [JS-128] — TouchEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// changedTouches is missing on TouchEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new TouchEvent()`; constructor missing. Touch APIs are partial — see scraper for missing fields.

**Why:** scraper missing: ["changedTouches","targetTouches","TouchEvent"]

---
### [JS-129] — TouchList
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// item is a stub on TouchList
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `TouchList.item` or iteration methods; they are stubs. Use `length` + index access only.

**Why:** scraper stubs: ["item"]; only present: ["length"]

---
### [JS-130] — TransitionEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// TransitionEvent is missing on TransitionEvent
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never `new TransitionEvent(...)`; constructor missing. Receive instances from listeners.

**Why:** scraper missing: ["TransitionEvent"]

---
### [JS-131] — UIEvent
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// initUIEvent is a stub on UIEvent
```

**✅ Generate instead:**
```js
// Don't construct Event subclasses with new. Receive them from listeners; preventDefault/stopPropagation are no-ops.
```

**Rule for AI agents:** Never construct `new UIEvent(...)`; the constructor is missing. `preventDefault`/`stopPropagation` exist as no-op stubs on incoming events.

**Why:** scraper stubs: ["initUIEvent"]; scraper missing: ["view","which","UIEvent","sourceCapabilities"]

---
### [JS-133] — Window
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on Window
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never call `alert`/`confirm`/`prompt`, `open`, `postMessage`, `print`, `matchMedia`, `requestIdleCallback`, or `structuredClone`; missing. `addEventListener`/`removeEventListener`/`getComputedStyle`/`getSelection`/`requestAnimationFrame`/`cancelAnimationFrame`/`setTimeout`/`clearTimeout`/`setInterval`/`clearInterval`/`queueMicrotask`/`scrollBy`/`scrollTo` exist as stubs only.

**Why:** scraper stubs: ["addEventListener","cancelAnimationFrame","clearInterval","clearTimeout","dispatchEvent","getComputedStyle","getSelection","queueMicrotask","removeEventListener","requestAnimationFrame","scrollBy","scrollTo"] …; scraper missing: ["console","chrome","clientInformation","closed","cookieStore","event","external","frameElement","frames","length","locationbar","menubar"] …+72 more

---
### [JS-135] — XMLHttpRequestEventTarget
**Status:** stub
**Surface:** js-stub
**Severity:** high

**❌ Never generate:**
```js
// addEventListener is a stub on XMLHttpRequestEventTarget
```

**✅ Generate instead:**
```js
// Avoid this API on Gameface; use the engine bridge or the supported subset only.
```

**Rule for AI agents:** Never expect `XMLHttpRequestEventTarget.onload`/`onerror`/`onabort`/`onloadstart`/`onloadend`/`onprogress`/`ontimeout`; missing.

**Why:** scraper stubs: ["addEventListener","removeEventListener"]; scraper missing: ["onabort","onerror","onload","onloadend","onloadstart","onprogress","ontimeout"]

---
### [JS-132] — WebGL and WebGPU
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
### [JS-096] — Media, WebRTC, Web Audio
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
### [JS-099] — Modern observer APIs
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
### [JS-055] — DOM traversal / Range / Selection helpers
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
### [JS-098] — Modern navigation
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
### [JS-134] — Workers, scheduler, idle/animation/microtask
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
### [JS-136] — Auth / credentials / payment
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
### [JS-140] — Sensors, device APIs
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
### [JS-139] — Permissions / quotas / clipboard
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
### [JS-141] — Streams API
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
### [JS-138] — Modern editing / input APIs
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
### [JS-137] — GPU compute / WebCodecs / Web Codec helpers
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
### [JS-143] — Geometry / Typed CSSOM extras
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
### [JS-142] — Concurrency primitives (browser-side)
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
### [JS-144] — Misc and vendor-specific globals
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
### [JS-145] — Other missing globals (#1)
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
### [JS-146] — Other missing globals (#2)
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
### [JS-147] — Other missing globals (#3)
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
### [JS-148] — Other missing globals (#4)
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
### [JS-149] — Other missing globals (#5)
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
