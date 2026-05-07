interface Animation {
    currentTime: number;
    playbackRate: number;
    cancel(): void;
    commitStyles(): void;
    finish(): void;
    pause(): void;
    persist(): void;
    play(): void;
    playFromTo(playTime: number, pauseTime: number, callback?: Function): void;
    reverse(): void;
    onfinish: ((this: any, event: Event) => any) | null;
}

interface AnimationEvent extends Event {
    readonly animationName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;
}

declare var AnimationEvent: {
    prototype: AnimationEvent;
    new(type: string, eventInitDict?: AnimationEventInit): AnimationEvent;
};

interface AnimationEventInit extends EventInit {
    readonly animationName: string;
}
interface Attr extends Node {
    readonly namespaceURI: string;
    readonly prefix: string;
    readonly localName: string;
    readonly name: string;
    value: string;
}

interface Blob {
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
}

interface BlobPropertyBag {
    type: string;
}

interface CSS {
    deg(value: number): CSSUnitValue;
    em(value: number): CSSUnitValue;
    in(value: number): CSSUnitValue;
    ms(value: number): CSSUnitValue;
    number(value: number): CSSUnitValue;
    percent(value: number): CSSUnitValue;
    pt(value: number): CSSUnitValue;
    px(value: number): CSSUnitValue;
    rem(value: number): CSSUnitValue;
    s(value: number): CSSUnitValue;
    vh(value: number): CSSUnitValue;
    vmax(value: number): CSSUnitValue;
    vmin(value: number): CSSUnitValue;
    vw(value: number): CSSUnitValue;
}

interface CSSAnimation extends Animation {
    readonly animationName: string;
}

interface CSSKeywordValue extends CSSStyleValue {
    value: string;
}

declare var CSSKeywordValue: {
    prototype: CSSKeywordValue;
    new(value: string): CSSKeywordValue;
};

interface CSSMatrixComponent extends CSSTransformComponent {
    matrix: DOMMatrix;
}

interface CSSMatrixComponentOptions {
    is2D: boolean;
}

interface CSSNumericValue extends CSSStyleValue {
}

interface CSSRotate extends CSSTransformComponent {
    x: CSSUnitValue;
    y: CSSUnitValue;
    z: CSSUnitValue;
    angle: CSSUnitValue;
}

interface CSSRuleList {
    readonly length: number;
}

interface CSSScale extends CSSTransformComponent {
    x: CSSUnitValue;
    y: CSSUnitValue;
    z: CSSUnitValue;
}

interface CSSSkewX extends CSSTransformComponent {
    ax: CSSUnitValue;
}

declare var CSSSkewX: {
    prototype: CSSSkewX;
    new(ax: CSSUnitValue): CSSSkewX;
};

interface CSSSkewY extends CSSTransformComponent {
    ay: CSSUnitValue;
}

declare var CSSSkewY: {
    prototype: CSSSkewY;
    new(ay: CSSUnitValue): CSSSkewY;
};

interface CSSStyleDeclaration {
    cssText: string;
    all: string;
    borderBottomWidth: string;
    borderLeftWidth: string;
    borderRightWidth: string;
    borderTopWidth: string;
    borderWidth: string;
    borderBottomColor: string;
    borderLeftColor: string;
    borderRightColor: string;
    borderTopColor: string;
    borderColor: string;
    borderBottomStyle: string;
    borderLeftStyle: string;
    borderRightStyle: string;
    borderTopStyle: string;
    borderStyle: string;
    borderBottom: string;
    borderLeft: string;
    borderRight: string;
    borderTop: string;
    border: string;
    display: string;
    position: string;
    color: string;
    backgroundColor: string;
    cursor: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    marginTop: string;
    margin: string;
    paddingBottom: string;
    paddingLeft: string;
    paddingRight: string;
    paddingTop: string;
    padding: string;
    clipPath: string;
    shapeRendering: string;
    top: string;
    left: string;
    bottom: string;
    right: string;
    topPX: number;
    leftPX: number;
    bottomPX: number;
    rightPX: number;
    topVW: number;
    leftVW: number;
    bottomVW: number;
    rightVW: number;
    topVH: number;
    leftVH: number;
    bottomVH: number;
    rightVH: number;
    topREM: number;
    leftREM: number;
    bottomREM: number;
    rightREM: number;
    topPERCENT: number;
    leftPERCENT: number;
    bottomPERCENT: number;
    rightPERCENT: number;
    width: string;
    height: string;
    minWidth: string;
    minHeight: string;
    maxWidth: string;
    maxHeight: string;
    rowGap: string;
    columnGap: string;
    gap: string;
    widthPX: number;
    heightPX: number;
    minWidthPX: number;
    minHeightPX: number;
    maxWidthPX: number;
    maxHeightPX: number;
    widthVW: number;
    heightVW: number;
    minWidthVW: number;
    minHeightVW: number;
    maxWidthVW: number;
    maxHeightVW: number;
    widthVH: number;
    heightVH: number;
    minWidthVH: number;
    minHeightVH: number;
    maxWidthVH: number;
    maxHeightVH: number;
    widthREM: number;
    heightREM: number;
    minWidthREM: number;
    minHeightREM: number;
    maxWidthREM: number;
    maxHeightREM: number;
    widthPERCENT: number;
    heightPERCENT: number;
    minWidthPERCENT: number;
    minHeightPERCENT: number;
    maxWidthPERCENT: number;
    maxHeightPERCENT: number;
    backgroundSize: string;
    aspectRatio: string;
    backgroundImage: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
    borderBottomLeftRadius: string;
    borderBottomRightRadius: string;
    borderRadius: string;
    borderImageSource: string;
    borderImageSlice: string;
    borderImageWidth: string;
    borderImageOutset: string;
    borderImageRepeat: string;
    borderImage: string;
    boxSizing: string;
    boxShadow: string;
    textShadow: string;
    textStrokeWidth: string;
    textStrokeColor: string;
    textStroke: string;
    textAlign: string;
    verticalAlign: string;
    letterSpacing: string;
    lineHeight: string;
    filter: string;
    backdropFilter: string;
    cohEnableBackdropFilter: string;
    flexDirection: string;
    justifyContent: string;
    alignSelf: string;
    alignItems: string;
    alignContent: string;
    flexWrap: string;
    flex: string;
    flexGrow: string;
    flexShrink: string;
    flexBasis: string;
    backfaceVisibility: string;
    zIndex: string;
    opacity: string;
    cohSimpleOpacity: string;
    visibility: string;
    font: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    cohFontFitMode: string;
    cohFontFitMaxSize: string;
    cohFontFitMinSize: string;
    cohFontFit: string;
    textTransform: string;
    fontVariantEastAsian: string;
    overflowWrap: string;
    whiteSpace: string;
    textOverflow: string;
    cohSdf: string;
    textDecorationLine: string;
    textUnderlineOffset: string;
    textUnderlinePosition: string;
    textDecorationColor: string;
    textDecorationThickness: string;
    textDecorationStyle: string;
    textRendering: string;
    textDecoration: string;
    textUnderlineOffsetPX: number;
    textUnderlineOffsetVH: number;
    textUnderlineOffsetVW: number;
    textUnderlineOffsetPERCENT: number;
    textUnderlineOffsetREM: number;
    textDecorationThicknessPX: number;
    textDecorationThicknessVH: number;
    textDecorationThicknessVW: number;
    textDecorationThicknessPERCENT: number;
    textDecorationThicknessREM: number;
    transform: string;
    transformOrigin: string;
    animation: string;
    animationName: string;
    animationDuration: string;
    animationIterationCount: string;
    animationTimingFunction: string;
    animationPlayState: string;
    animationFillMode: string;
    animationDelay: string;
    animationDirection: string;
    contain: string;
    content: string;
    overflowX: string;
    overflowY: string;
    overflow: string;
    maskPosition: string;
    maskSize: string;
    background: string;
    maskImage: string;
    maskMode: string;
    maskClip: string;
    maskRepeat: string;
    mask: string;
    perspective: string;
    perspectiveOrigin: string;
    isolation: string;
    mixBlendMode: string;
    transitionBehavior: string;
    transitionProperty: string;
    transitionDuration: string;
    transitionDelay: string;
    transitionTimingFunction: string;
    transition: string;
    caretColor: string;
    userSelect: string;
    pointerEvents: string;
    imageRendering: string;
    fill: string;
    fillOpacity: string;
    stroke: string;
    strokeOpacity: string;
    strokeWidth: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    stopOpacity: string;
    stopColor: string;
    fillRule: string;
    clipRule: string;
    maskType: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    cohCustomEffectName: string;
    cohCustomEffectFloatParam1: string;
    cohCustomEffectFloatParam2: string;
    cohCustomEffectFloatParam3: string;
    cohCustomEffectFloatParam4: string;
    cohCustomEffectFloatParam5: string;
    cohCustomEffectFloatParam6: string;
    cohCustomEffectFloatParam7: string;
    cohCustomEffectFloatParam8: string;
    cohCustomEffectFloatParam9: string;
    cohCustomEffectFloatParam10: string;
    cohCustomEffectFloatParam11: string;
    cohCustomEffectFloatParam12: string;
    cohCustomEffectStringParam1: string;
    cohCustomEffectStringParam2: string;
    cohCompositionId: string;
    cohPartitioned: string;
    cohRenderingOption: string;
    getPropertyValue(prop: string): string;
    removeProperty(propName: string): string;
    setProperty(propName: string, value: string, priority?: string): void;
}

interface CSSStyleSheet extends StyleSheet {
    readonly cssRules: CSSRuleList;
    deleteRule(index: number): void;
    insertRule(rule: string, index?: number): number;
}

interface CSSStyleValue {
    parse(property: string, cssText: string): CSSStyleValue;
}

interface CSSTransformComponent {
    is2D: boolean;
    toMatrix(): DOMMatrix;
}

interface CSSTransformValue extends CSSStyleValue {
    readonly length: number;
    readonly is2D: boolean;
    GetTransformAtIndex(index: number): CSSTransformComponent;
    SetTransformAtIndex(index: number, val: CSSTransformComponent): void;
    toMatrix(): DOMMatrix;
}

declare var CSSTransformValue: {
    prototype: CSSTransformValue;
    new(transforms: Array<CSSTransformComponent>): CSSTransformValue;
};

interface CSSTranslate extends CSSTransformComponent {
    x: CSSUnitValue;
    y: CSSUnitValue;
    z: CSSUnitValue;
}

interface CSSUnitValue extends CSSNumericValue {
    value: number;
    readonly unit: string;
}

declare var CSSUnitValue: {
    prototype: CSSUnitValue;
    new(value: number, unit: string): CSSUnitValue;
};

interface CanvasGradient {
    addColorStop(offset: number, color: string): void;
}

interface CanvasPattern {
}

interface CanvasRenderingContext2D {
    readonly canvas: HTMLCanvasElement;
    globalAlpha: number;
    globalCompositeOperation: string;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    lineCap: string;
    lineJoin: string;
    miterLimit: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowColor: string;
    enableFastLineSegmentDrawing: boolean;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    beginPath(): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    clearRect(x: number, y: number, w: number, h: number): void;
    clip(): void;
    closePath(): void;
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    drawFocusIfNeeded(element: Element): void;
    fill(): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    lineTo(x: number, y: number): void;
    measureText(text: string): TextMetrics;
    moveTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    restore(): void;
    rotate(angle: number): void;
    save(): void;
    scale(x: number, y: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    stroke(): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    translate(x: number, y: number): void;
}

interface CaretPosition {
    readonly offsetNode: Node;
    readonly offset: number;
}

interface CharacterData extends Node {
    data: string;
    readonly length: number;
    readonly previousElementSibling: Element;
    readonly nextElementSibling: Element;
    after(...args: NodeOrString[]): void;
    appendData(data: string): void;
    before(...args: NodeOrString[]): void;
    deleteData(offset: number, count: number): void;
    insertData(offset: number, data: string): void;
    remove(): void;
    replaceData(offset: number, count: number, data: string): void;
    substringData(offset: number, count: number): string;
}

interface Chrome {
    readonly identity: ChromeIdentity;
    readonly instanceID: ChromeInstanceId;
    readonly tabs: ChromeTabs;
}

interface ChromeIdentity {
    getProfileUserInfo(callback: Function): void;
}

interface ChromeInstanceId {
    getID(callback: Function): void;
}

interface ChromeTabs {
    create(properties: any, callback: Function): void;
    getCurrent(callback: Function): void;
    query(queryInfo: any, callback: Function): void;
    reload(tabId: any, reloadProperties: any, callback: Function): void;
    update(tabId: any, updateProperties: any, callback: Function): void;
}

interface CoherentDebug {
    triggerPageCapture(filename: string): void;
}

interface Comment extends CharacterData {
}

declare var Comment: {
    prototype: Comment;
    new(data?: string): Comment;
};

interface Console {
    assert(...optionalParams: any[]): void;
    debug(...optionalParams: any[]): void;
    error(...optionalParams: any[]): void;
    info(...optionalParams: any[]): void;
    log(...optionalParams: any[]): void;
    time(...optionalParams: any[]): void;
    timeEnd(...optionalParams: any[]): void;
    warn(...optionalParams: any[]): void;
}

interface CustomElementRegistry {
    define(name: string, constructor: Function, options?: ElementDefinitionOptions): void;
}

interface CustomEvent extends Event {
    readonly detail: any;
    initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: any): void;
}

interface CustomEventInit<T = any> extends EventInit {
    detail?: T;
}

declare var CustomEvent: {
    prototype: CustomEvent;
    new <T>(typeArg: string, eventInitDict?: CustomEventInit): CustomEvent;
};
interface DOMMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;
    readonly is2D: boolean;
}

interface DOMRect extends DOMRectReadOnly {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface DOMRectList {
    readonly length: number;
    item(index: number): DOMRect;
}

interface DOMRectReadOnly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

interface DOMStringMap {
    itemDeleter(name: string): void;
    itemGetter(name: string): string;
    itemSetter(name: string, value: string): void;
}

interface DOMTokenList {
    readonly length: number;
    value: string;
    add(tokens: string): void;
    contains(token: string): boolean;
    item(index: number): string;
    remove(tokens: string): void;
    replace(token: string, newToken: string): void;
    supports(token: string): boolean;
    toggle(token: string, force?: boolean): boolean;
}

interface DOMTokenListPart {
    readonly length: number;
    value: string;
    add(tokens: string): void;
    contains(token: string): boolean;
    item(index: number): string;
    remove(tokens: string): void;
    replace(token: string, newToken: string): void;
    supports(token: string): boolean;
}

interface Document extends Node {
    readonly URL: string;
    readonly documentURI: string;
    readonly origin: string;
    readonly compatMode: string;
    readonly characterSet: string;
    readonly charset: string;
    readonly inputEncoding: string;
    readonly contentType: string;
    readonly doctype: DocumentType;
    readonly body: Element;
    readonly documentElement: Element;
    readonly defaultView: Window;
    readonly head: Element;
    readonly readyState: string;
    readonly activeElement: Element;
    readonly currentScript: HTMLScriptElement;
    readonly styleSheets: StyleSheetList;
    caretPositionFromPoint(x: number, y: number): CaretPosition;
    createAttribute(localName: string): Attr;
    createAttributeNS(namespace: string, qualifiedName: string): Attr;
    createComment(data: string): Comment;
    createDocumentFragment(): DocumentFragment;
    createElement(tagName: string): Node;
    createElementNS(ns: string, tagName: string): Node;
    createEvent(eventType: string): Event;
    createNodeIterator(root: Node, whatToShow?: number, filter?: NodeFilter): NodeIterator;
    createTextNode(data?: string): Node;
    elementFromPoint(x: number, y: number, compositionId?: string): Element;
    elementsFromPoint(x: number, y: number): Array<Element>;
    getElementById(elementId: string): Element;
    getElementsByClassName(classNames: string): NodeList;
    getElementsByName(elementName?: string): NodeList;
    getElementsByTagName(localName: string): NodeList;
    getSelection(): Selection;
    hasFocus(): boolean;
    importNode(node: Node, deep?: boolean): Node;
    querySelector(selectors: string): Element;
    querySelectorAll(selectors: string): NodeList;
    write(markup: string): void;
    onabort: ((this: any, event: Event) => any) | null;
    onblur: ((this: any, event: Event) => any) | null;
    onclick: ((this: any, event: Event) => any) | null;
    onauxclick: ((this: any, event: Event) => any) | null;
    ondblclick: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onfocus: ((this: any, event: Event) => any) | null;
    onkeydown: ((this: any, event: Event) => any) | null;
    onkeypress: ((this: any, event: Event) => any) | null;
    onkeyup: ((this: any, event: Event) => any) | null;
    onload: ((this: any, event: Event) => any) | null;
    onmousedown: ((this: any, event: Event) => any) | null;
    onmouseover: ((this: any, event: Event) => any) | null;
    onmouseout: ((this: any, event: Event) => any) | null;
    onmouseenter: ((this: any, event: Event) => any) | null;
    onmouseleave: ((this: any, event: Event) => any) | null;
    onmousemove: ((this: any, event: Event) => any) | null;
    onmouseup: ((this: any, event: Event) => any) | null;
    oninput: ((this: any, event: Event) => any) | null;
    onscroll: ((this: any, event: Event) => any) | null;
    onwheel: ((this: any, event: Event) => any) | null;
    ontouchstart: ((this: any, event: Event) => any) | null;
    ontouchend: ((this: any, event: Event) => any) | null;
    ontouchmove: ((this: any, event: Event) => any) | null;
}

interface DocumentFragment extends Node {
    readonly children: NodeList;
    readonly firstElementChild: Element;
    readonly lastElementChild: Element;
    readonly nextElementSibling: Element;
    readonly childElementCount: number;
    getElementById(elementId: string): Element;
    querySelector(selectors: string): Element;
    querySelectorAll(selectors: string): NodeList;
}

declare var DocumentFragment: {
    prototype: DocumentFragment;
    new(): DocumentFragment;
};

interface DocumentType extends Node {
    readonly name: string;
    readonly publicId: string;
    readonly systemId: string;
    after(...args: NodeOrString[]): void;
    before(...args: NodeOrString[]): void;
    remove(): void;
}

interface Element extends Node {
    readonly tagName: string;
    readonly prefix: string;
    readonly namespaceURI: string;
    readonly localName: string;
    slot: string;
    id: string;
    readonly clientTop: number;
    readonly clientLeft: number;
    readonly clientWidth: number;
    readonly clientHeight: number;
    readonly attributes: NamedNodeMap;
    readonly children: NodeList;
    readonly firstElementChild: Element;
    readonly lastElementChild: Element;
    readonly previousElementSibling: Element;
    readonly nextElementSibling: Element;
    readonly childElementCount: number;
    scrollLeft: number;
    scrollLeftVW: number;
    scrollLeftVH: number;
    scrollTop: number;
    scrollTopVW: number;
    scrollTopVH: number;
    readonly scrollWidth: number;
    readonly scrollWidthVW: number;
    readonly scrollWidthVH: number;
    readonly scrollHeight: number;
    readonly scrollHeightVW: number;
    readonly scrollHeightVH: number;
    readonly assignedSlot: HTMLSlotElement;
    className: string;
    readonly classList: DOMTokenList;
    readonly part: DOMTokenListPart;
    innerHTML: string;
    outerHTML: string;
    readonly shadowRoot: ShadowRoot;
    after(...args: NodeOrString[]): void;
    attachShadow(init: ShadowRootInit): ShadowRoot;
    before(...args: NodeOrString[]): void;
    blur(): void;
    closest(selectors: string): Element;
    focus(): void;
    getAnimations(options?: GetAnimationsOptions): Array<Animation>;
    getAttribute(qualifiedName: string): string;
    getAttributeNS(ns: string, qualifiedName: string): string;
    getAttributeNames(): Array<string>;
    getAttributeNode(qualifiedName: string): Attr;
    getAttributeNodeNS(namespace: string, localName: string): Attr;
    getBoundingClientRect(): DOMRect;
    getClientRects(): DOMRectList;
    getElementsByClassName(classNames: string): HTMLCollection;
    getElementsByTagName(qualifiedName: string): HTMLCollection;
    getElementsByTagNameNS(namespace: string, localName: string): HTMLCollection;
    hasAttribute(qualifiedName: string): boolean;
    hasAttributeNS(ns: string, qualifiedName: string): boolean;
    hasAttributes(): boolean;
    insertAdjacentElement(where: string, element: Element): Element;
    insertAdjacentHTML(position: string, text: string): void;
    insertAdjacentText(where: string, data: string): void;
    matches(selectors: string): boolean;
    querySelector(selectors: string): Element;
    querySelectorAll(selectors: string): NodeList;
    remove(): void;
    removeAttribute(qualifiedName: string): void;
    removeAttributeNS(ns: string, qualifiedName: string): void;
    removeAttributeNode(attr: Attr): Attr;
    setAttribute(qualifiedName: string, value: string): void;
    setAttributeNS(ns: string, qualifiedName: string, value: string): void;
    setAttributeNode(attr: Attr): Attr;
    setAttributeNodeNS(attr: Attr): Attr;
    onfocusin: ((this: any, event: Event) => any) | null;
    onfocusout: ((this: any, event: Event) => any) | null;
    onabort: ((this: any, event: Event) => any) | null;
    onblur: ((this: any, event: Event) => any) | null;
    onclick: ((this: any, event: Event) => any) | null;
    onauxclick: ((this: any, event: Event) => any) | null;
    ondblclick: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onfocus: ((this: any, event: Event) => any) | null;
    onkeydown: ((this: any, event: Event) => any) | null;
    onkeypress: ((this: any, event: Event) => any) | null;
    onkeyup: ((this: any, event: Event) => any) | null;
    onload: ((this: any, event: Event) => any) | null;
    onmousedown: ((this: any, event: Event) => any) | null;
    onmouseover: ((this: any, event: Event) => any) | null;
    onmouseout: ((this: any, event: Event) => any) | null;
    onmouseenter: ((this: any, event: Event) => any) | null;
    onmouseleave: ((this: any, event: Event) => any) | null;
    onmousemove: ((this: any, event: Event) => any) | null;
    onmouseup: ((this: any, event: Event) => any) | null;
    oninput: ((this: any, event: Event) => any) | null;
    onchange: ((this: any, event: Event) => any) | null;
    onscroll: ((this: any, event: Event) => any) | null;
    onwheel: ((this: any, event: Event) => any) | null;
    ontouchstart: ((this: any, event: Event) => any) | null;
    ontouchend: ((this: any, event: Event) => any) | null;
    ontouchmove: ((this: any, event: Event) => any) | null;
    onanimationstart: ((this: any, event: Event) => any) | null;
    onanimationend: ((this: any, event: Event) => any) | null;
    onanimationcancel: ((this: any, event: Event) => any) | null;
    onanimationiteration: ((this: any, event: Event) => any) | null;
    ontransitionstart: ((this: any, event: Event) => any) | null;
    ontransitionend: ((this: any, event: Event) => any) | null;
    ontransitioncancel: ((this: any, event: Event) => any) | null;
    ontransitionrun: ((this: any, event: Event) => any) | null;
}

interface ElementDefinitionOptions {
    readonly extends: string;
}

interface ErrorEvent extends Event {
    readonly message: string;
    readonly filename: string;
    readonly lineno: number;
    readonly colno: number;
    readonly error: any;
}

declare var ErrorEvent: {
    prototype: ErrorEvent;
    new(type: string, eventInitDict?: ErrorEventInit): ErrorEvent;
};

interface ErrorEventInit extends EventInit {
    message?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: any;
}
interface Event {
    readonly type: string;
    readonly target: EventTarget;
    readonly currentTarget: EventTarget;
    readonly eventPhase: number;
    readonly bubbles: boolean;
    readonly cancelable: boolean;
    readonly defaultPrevented: boolean;
    readonly composed: boolean;
    initEvent(eventTypeArg?: string, canBubbleArg?: boolean, cancelableArg?: boolean): void;
    preventDefault(): void;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
}

declare var Event: {
    prototype: Event;
    new(type: string, initEvent?: EventInit): Event;
    readonly NONE: 0;
    readonly CAPTURING_PHASE: 1;
    readonly AT_TARGET: 2;
    readonly BUBBLING_PHASE: 3;
};

interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}
interface EventListener {
    handleEvent(event: Event): void;
}

interface EventTarget {
    addEventListener(type: string, listener: Function, options?: AddEventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
    removeEventListener(type: string, listener: Function, options?: RemoveEventListenerOptions): void;
}

interface FocusEvent extends UIEvent {
    readonly relatedTarget: EventTarget;
}

declare var FocusEvent: {
    prototype: FocusEvent;
    new(type: string, eventInitDict?: FocusEventInit): FocusEvent;
};

interface FocusEventInit extends UIEventInit {
    relatedTarget?: EventTarget | null;
}
interface Gamepad {
    readonly id: string;
    readonly index: number;
    readonly connected: boolean;
    readonly timestamp: number;
    readonly mapping: string;
    readonly axes: Array<number>;
    readonly buttons: Array<GamepadButton>;
    readonly displayId: number;
    readonly hand: any;
    readonly pose: GamepadPose;
}

interface GamepadButton {
    readonly pressed: boolean;
    readonly touched: boolean;
    readonly value: number;
}

interface GamepadEvent extends UIEvent {
    readonly gamepad: Gamepad;
}

declare var GamepadEvent: {
    prototype: GamepadEvent;
    new(type: string, eventInitDict?: GamepadEventInit): GamepadEvent;
};

interface GamepadEventInit extends EventInit {
    gamepad: Gamepad;
}
interface GamepadPose {
    readonly hasOrientation: boolean;
    readonly hasPosition: boolean;
    readonly position: Array<number>;
    readonly linearVelocity: Array<number>;
    readonly linearAcceleration: Array<number>;
    readonly orientation: Array<number>;
    readonly angularVelocity: Array<number>;
    readonly angularAcceleration: Array<number>;
}

interface GetAnimationsOptions {
}

interface HTMLBodyElement extends HTMLElement {
}

interface HTMLButtonElement extends HTMLElement {
}

interface HTMLCanvasElement extends HTMLElement {
    width: number;
    height: number;
    getContext(type: string): any;
    getContext2D(): CanvasRenderingContext2D;
}

interface HTMLCollection extends NodeList {
}

interface HTMLDivElement extends HTMLElement {
}

interface HTMLDocument extends Document {
}

interface HTMLElement extends Element {
    readonly dataset: DOMStringMap;
    readonly style: CSSStyleDeclaration;
    readonly attributeStyleMap: StylePropertyMap;
    readonly offsetParent: Element;
    readonly offsetTop: number;
    readonly offsetLeft: number;
    readonly offsetWidth: number;
    readonly offsetHeight: number;
}

declare var HTMLElement: {
    prototype: HTMLElement;
    new(): HTMLElement;
};

interface HTMLHeadElement extends HTMLElement {
}

interface HTMLHtmlElement extends HTMLElement {
}

interface HTMLIFrameElement extends HTMLElement {
}

interface HTMLImageElement extends HTMLElement {
    src: string;
    width: number;
    height: number;
}

declare var HTMLImageElement: {
    prototype: HTMLImageElement;
    new(width?: number, height?: number): HTMLImageElement;
};

interface HTMLInputElement extends HTMLElement {
    value: string;
    type: string;
    maxLength: number;
    minLength: number;
    size: number;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: string;
    select(): void;
}

interface HTMLLinkElement extends HTMLElement {
    href: string;
    rel: string;
    type: string;
}

interface HTMLMediaElement extends HTMLElement {
    cohFastSeek: boolean;
    readonly error: MediaError;
    src: string;
    srcObject: MediaSource;
    readonly currentSrc: string;
    crossOrigin: string;
    readonly networkState: number;
    preload: string;
    readonly buffered: TimeRanges;
    readonly readyState: number;
    readonly seeking: boolean;
    currentTime: number;
    readonly duration: number;
    readonly paused: boolean;
    defaultPlaybackRate: number;
    playbackRate: number;
    readonly played: TimeRanges;
    readonly seekable: TimeRanges;
    readonly ended: boolean;
    autoplay: boolean;
    loop: boolean;
    volume: number;
    muted: boolean;
    canPlayType(type: string): object;
    cohGetKeyframeTimestamps(): Array<number>;
    cohPrebufferKeyframe(timestamp: number): number;
    load(): void;
    pause(): void;
    play(): void;
    ondurationchange: ((this: any, event: Event) => any) | null;
    onemptied: ((this: any, event: Event) => any) | null;
    onended: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onloadstart: ((this: any, event: Event) => any) | null;
    onseeked: ((this: any, event: Event) => any) | null;
    onseeking: ((this: any, event: Event) => any) | null;
    ontimeupdate: ((this: any, event: Event) => any) | null;
    onvolumechange: ((this: any, event: Event) => any) | null;
    onresize: ((this: any, event: Event) => any) | null;
}

declare var HTMLMediaElement: {
    readonly NETWORK_EMPTY: 0;
    readonly NETWORK_IDLE: 1;
    readonly NETWORK_LOADING: 2;
    readonly NETWORK_NO_SOURCE: 3;
    readonly HAVE_NOTHING: 0;
    readonly HAVE_METADATA: 1;
    readonly HAVE_CURRENT_DATA: 2;
    readonly HAVE_FUTURE_DATA: 3;
    readonly HAVE_ENOUGH_DATA: 4;
};

interface HTMLParagraphElement extends HTMLElement {
}

interface HTMLPreElement extends HTMLElement {
}

interface HTMLScriptElement extends HTMLElement {
    async: boolean;
    defer: boolean;
    src: string;
    text: string;
    type: string;
}

interface HTMLSlotElement extends HTMLElement {
    name: string;
    assign(...nodes: ElementOrText[]): void;
    assignedElements(options?: AssignedNodesOptions): Array<Element>;
    assignedNodes(options?: AssignedNodesOptions): Array<Node>;
}

interface HTMLSourceElement extends HTMLElement {
    src: string;
    type: string;
    media: string;
}

interface HTMLSpanElement extends HTMLElement {
}

interface HTMLStyleElement extends HTMLElement {
}

interface HTMLTemplateElement extends HTMLElement {
    readonly content: DocumentFragment;
}

interface HTMLTextAreaElement extends HTMLElement {
    value: string;
    maxLength: number;
    minLength: number;
    cols: number;
    rows: number;
    readonly textLength: number;
    wrap: string;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: string;
    select(): void;
}

interface HTMLTitleElement extends HTMLElement {
}

interface HTMLUnknownElement extends HTMLElement {
}

interface HTMLVideoElement extends HTMLMediaElement {
    width: number;
    height: number;
    readonly videoWidth: number;
    readonly videoHeight: number;
    poster: string;
}

interface History {
    readonly index: number;
    readonly length: number;
    readonly state: any;
    back(): void;
    forward(): void;
    go(delta?: number): void;
    pushState(data: any, title: string, url?: string): void;
    replaceState(data: any, title: string, url?: string): void;
}

interface KeyboardEvent extends UIEvent {
    readonly charCode: number;
    readonly keyCode: number;
    readonly which: number;
    readonly key: string;
    readonly code: string;
    readonly location: number;
    readonly repeat: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    getModifierState(keyIdentifier: string): boolean;
    initKeyboardEvent(typeArg?: string, bubblesArg?: boolean, cancelableArg?: boolean, viewArg?: Window, keyIdentifier?: string, locationArg?: number, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean, metaKey?: boolean, altGraphKey?: boolean): void;
}

declare var KeyboardEvent: {
    prototype: KeyboardEvent;
    new(type: string, eventInitDict?: KeyboardEventInit): KeyboardEvent;
    readonly DOM_KEY_LOCATION_STANDARD: 0x00;
    readonly DOM_KEY_LOCATION_LEFT: 0x01;
    readonly DOM_KEY_LOCATION_RIGHT: 0x02;
    readonly DOM_KEY_LOCATION_NUMPAD: 0x03;
};

interface KeyboardEventInit extends EventModifierInit {
    code?: string;
    isComposing?: boolean;
    key?: string;
    location?: number;
    repeat?: boolean;
}
interface Location {
    href: string;
    readonly origin: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    readonly ancestorOrigins: Array<string>;
    assign(url: string): void;
    reload(forceReload?: boolean): void;
    replace(url: string): void;
}

interface MediaError {
    readonly code: number;
    readonly message: string;
}

declare var MediaError: {
    readonly MEDIA_ERR_ABORTED: 1;
    readonly MEDIA_ERR_NETWORK: 2;
    readonly MEDIA_ERR_DECODE: 3;
    readonly MEDIA_ERR_SRC_NOT_SUPPORTED: 4;
};

interface MediaSource extends EventTarget {
    readonly sourceBuffers: SourceBufferList;
    readonly activeSourceBuffers: SourceBufferList;
    readonly readyState: string;
    duration: number;
    addSourceBuffer(type: string): SourceBuffer;
    endOfStream(error?: string): void;
    isTypeSupported(type: string): boolean;
    removeSourceBuffer(buffer: SourceBuffer): void;
}

declare var MediaSource: {
    prototype: MediaSource;
    new(): MediaSource;
};

interface MessageEvent extends Event {
    readonly data: any;
    readonly origin: string;
    readonly lastEventId: string;
}

interface MouseEvent extends UIEvent {
    readonly screenX: number;
    readonly screenY: number;
    readonly movementX: number;
    readonly movementY: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly x: number;
    readonly y: number;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly button: number;
    readonly buttons: number;
    readonly deltaX: number;
    readonly deltaY: number;
    readonly deltaMode: number;
    readonly relatedTarget: EventTarget;
    getModifierState(keyIdentifier: string): boolean;
    initMouseEvent(typeArg?: string, canBubbleArg?: boolean, cancelableArg?: boolean, viewArg?: Window, detailArg?: number, screenXArg?: number, screenYArg?: number, clientXArg?: number, clientYArg?: number, ctrlKeyArg?: boolean, altKeyArg?: boolean, shiftKeyArg?: boolean, metaKeyArg?: boolean, buttonArg?: number, relatedTargetArg?: Node): void;
}

declare var MouseEvent: {
    prototype: MouseEvent;
    new(type: string, eventInitDict?: MouseEventInit): MouseEvent;
};

interface MouseEventInit extends EventModifierInit {
    button?: number;
    buttons?: number;
    clientX?: number;
    clientY?: number;
    relatedTarget?: EventTarget | null;
    screenX?: number;
    screenY?: number;
}
interface MutationObserver {
    disconnect(): void;
    observe(target: Node, options?: MutationObserverInit): void;
    takeRecords(): Array<MutationRecord>;
}

declare var MutationObserver: {
    prototype: MutationObserver;
    new(callback: Function): MutationObserver;
};

interface MutationObserverInit {
    childList: boolean;
    attributes: boolean;
    characterData: boolean;
    subtree: boolean;
    attributeOldValue: boolean;
    characterDataOldValue: boolean;
    attributeFilter: Array<string>;
}

interface MutationRecord {
    readonly type: string;
    readonly target: Node;
    readonly addedNodes: NodeList;
    readonly removedNodes: NodeList;
    readonly previousSibling: Node;
    readonly nextSibling: Node;
    readonly attributeName: string;
    readonly attributeNamespace: string;
    readonly oldValue: string;
}

interface NamedNodeMap {
    readonly length: number;
    getNamedItem(qualifiedName: string): Attr;
    item(index: number): Attr;
}

interface Navigator {
    readonly userAgent: string;
    getGamepads(): Array<Gamepad>;
}

interface Node extends EventTarget {
    readonly nodeName: string;
    nodeValue: string;
    textContent: string;
    readonly nodeType: number;
    readonly parentNode: Node;
    readonly parentElement: Element;
    readonly childNodes: NodeList;
    readonly firstChild: Node;
    readonly lastChild: Node;
    readonly previousSibling: Node;
    readonly nextSibling: Node;
    readonly ownerDocument: Document;
    readonly baseURI: string;
    readonly isConnected: boolean;
    append(...newChildren: NodeOrString[]): void;
    appendChild(newChild: Node): Node;
    cloneNode(deep?: boolean): Node;
    compareDocumentPosition(other: Node): number;
    contains(other: Node): boolean;
    getRootNode(options?: any): Node;
    hasChildNodes(): boolean;
    insertBefore(node: Node, referenceNode: Node): Node;
    isDefaultNamespace(namespace: string): boolean;
    isEqualNode(otherNode: Node): boolean;
    isSameNode(otherNode: Node): boolean;
    lookupNamespaceURI(prefix: string): string;
    lookupPrefix(namespace: string): string;
    normalize(): void;
    removeChild(oldChild: Node): Node;
    replaceChild(newChild: Node, oldChild: Node): Node;
    onslotchange: ((this: any, event: Event) => any) | null;
}

declare var Node: {
    readonly ELEMENT_NODE: 1;
    readonly ATTRIBUTE_NODE: 2;
    readonly TEXT_NODE: 3;
    readonly CDATA_SECTION_NODE: 4;
    readonly ENTITY_REFERENCE_NODE: 5;
    readonly ENTITY_NODE: 6;
    readonly PROCESSING_INSTRUCTION_NODE: 7;
    readonly COMMENT_NODE: 8;
    readonly DOCUMENT_NODE: 9;
    readonly DOCUMENT_TYPE_NODE: 10;
    readonly DOCUMENT_FRAGMENT_NODE: 11;
    readonly NOTATION_NODE: 12;
    readonly DOCUMENT_POSITION_DISCONNECTED: 0x01;
    readonly DOCUMENT_POSITION_PRECEDING: 0x02;
    readonly DOCUMENT_POSITION_FOLLOWING: 0x04;
    readonly DOCUMENT_POSITION_CONTAINS: 0x08;
    readonly DOCUMENT_POSITION_CONTAINED_BY: 0x10;
    readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20;
};

interface NodeFilter {
    acceptNode(node: Node): number;
}

declare var NodeFilter: {
    readonly FILTER_ACCEPT: 1;
    readonly FILTER_REJECT: 2;
    readonly FILTER_SKIP: 3;
    readonly SHOW_ALL: 0xFFFFFFFF;
    readonly SHOW_ELEMENT: 0x1;
    readonly SHOW_ATTRIBUTE: 0x2;
    readonly SHOW_TEXT: 0x4;
    readonly SHOW_CDATA_SECTION: 0x8;
    readonly SHOW_ENTITY_REFERENCE: 0x10;
    readonly SHOW_ENTITY: 0x20;
    readonly SHOW_PROCESSING_INSTRUCTION: 0x40;
    readonly SHOW_COMMENT: 0x80;
    readonly SHOW_DOCUMENT: 0x100;
    readonly SHOW_DOCUMENT_TYPE: 0x200;
    readonly SHOW_DOCUMENT_FRAGMENT: 0x400;
    readonly SHOW_NOTATION: 0x800;
};

interface NodeIterator {
    readonly root: Node;
    readonly referenceNode: Node;
    readonly pointerBeforeReferenceNode: boolean;
    readonly whatToShow: number;
    readonly filter: NodeFilter;
    nextNode(): Node;
    previousNode(): Node;
}

interface NodeList {
    readonly length: number;
    item(index: number): Node;
}

interface Performance extends EventTarget {
    now(): number;
}

interface PopStateEvent extends Event {
    readonly state: any;
}

declare var PopStateEvent: {
    prototype: PopStateEvent;
    new(type: string, eventInitDict?: EventInit): PopStateEvent;
};

interface PopStateEventInit extends EventInit {
    state?: any;
}
interface ProgressEvent extends Event {
    readonly lengthComputable: boolean;
    readonly loaded: number;
    readonly total: number;
}

interface PromiseRejectionEvent extends Event {
    readonly promise: Promise<any>;
    readonly reason: any;
}

declare var PromiseRejectionEvent: {
    prototype: PromiseRejectionEvent;
    new(type: string, eventInitDict: PromiseRejectionEventInit): PromiseRejectionEvent;
};

interface PromiseRejectionEventInit extends EventInit {
    promise: Promise<any>;
    reason?: any;
}
interface ResizeObserver {
    disconnect(): void;
    observe(target: Element, options?: ResizeObserverOptions): void;
    unobserve(target: Element): void;
}

declare var ResizeObserver: {
    prototype: ResizeObserver;
    new(callback: Function): ResizeObserver;
};

interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
    readonly borderBoxSize: Array<ResizeObserverSize>;
    readonly contentBoxSize: Array<ResizeObserverSize>;
    readonly devicePixelContentBoxSize: Array<ResizeObserverSize>;
}

interface ResizeObserverOptions {
}

interface ResizeObserverSize {
    readonly inlineSize: number;
    readonly blockSize: number;
}

interface SVGAnimatedLength {
    readonly baseVal: SVGLength;
}

interface SVGAnimatedRect {
    readonly baseVal: SVGRect;
}

interface SVGAnimatedTransformList {
    readonly baseVal: SVGTransformList;
}

interface SVGElement extends Element {
    readonly style: CSSStyleDeclaration;
}

interface SVGGraphicsElement extends SVGElement {
    readonly transform: SVGAnimatedTransformList;
}

interface SVGLength {
    readonly unitType: number;
    value: number;
}

interface SVGRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

interface SVGSVGElement extends SVGGraphicsElement {
    readonly viewBox: SVGAnimatedRect;
    readonly width: SVGAnimatedLength;
    readonly height: SVGAnimatedLength;
}

interface SVGTextElement extends SVGElement {
    getComputedTextLength(): number;
}

interface SVGTransform {
    readonly type: number;
    readonly angle: number;
    readonly matrix: DOMMatrix;
}

interface SVGTransformList {
    readonly numberOfItems: number;
    readonly length: number;
    consolidate(): SVGTransform;
}

interface Screen {
    readonly availWidth: number;
    readonly availHeight: number;
    readonly width: number;
    readonly height: number;
    readonly colorDepth: number;
    readonly pixelDepth: number;
}

interface Selection {
    readonly anchorNode: Node;
    readonly anchorOffset: number;
    readonly focusNode: Node;
    readonly focusOffset: number;
    empty(): void;
    removeAllRanges(): void;
    setBaseAndExtent(anchorNode: Node, anchorOffset: number, focusNode: Node, focusOffset: number): void;
    toString(): string;
}

interface ShadowRoot extends DocumentFragment {
    readonly mode: ShadowRootMode;
    readonly delegatesFocus: boolean;
    readonly slotAssignment: SlotAssignmentMode;
    readonly clonable: boolean;
    readonly host: Element;
    innerHTML: string;
    readonly activeElement: Element;
    readonly styleSheets: StyleSheetList;
    elementFromPoint(x: number, y: number, compositionId?: string): Element;
    elementsFromPoint(x: number, y: number): Array<Element>;
}

interface SourceBuffer extends EventTarget {
    mode: string;
    readonly updating: boolean;
    readonly buffered: TimeRanges;
    timestampOffset: number;
    appendWindowStart: number;
    appendWindowEnd: number;
    abort(): void;
    remove(start: number, end: number): void;
}

interface SourceBufferList extends EventTarget {
    readonly length: number;
    item(index: number): SourceBuffer;
}

interface Storage {
    readonly length: number;
    clear(): void;
    getItem(key: string): string;
    key(index: number): string;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}

interface StylePropertyMap extends StylePropertyMapReadOnly {
    clear(): void;
    delete(property: string): void;
}

interface StylePropertyMapReadOnly {
    readonly size: number;
    get(property: string): any;
    has(property: string): boolean;
}

interface StyleSheet {
    readonly ownerNode: Element;
}

interface StyleSheetList {
    readonly length: number;
    item(index: number): CSSStyleSheet;
}

interface Tab {
    readonly Id: number;
}

interface Text extends CharacterData {
    readonly wholeText: string;
    readonly assignedSlot: HTMLSlotElement;
    splitText(offset: number): Text;
}

declare var Text: {
    prototype: Text;
    new(data?: string): Text;
};

interface TextMetrics {
    readonly width: number;
    readonly actualBoundingBoxLeft: number;
    readonly actualBoundingBoxRight: number;
    readonly actualBoundingBoxAscent: number;
    readonly actualBoundingBoxDescent: number;
}

interface TimeRanges {
    readonly length: number;
    end(index: number): number;
    start(index: number): number;
}

interface Touch {
    readonly identifier: number;
    readonly target: Node;
    readonly screenX: number;
    readonly screenY: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly pageX: number;
    readonly pageY: number;
}

declare var Touch: {
    prototype: Touch;
    new(touchInitDict: TouchInit): Touch;
};

interface TouchInit {
    screenX?: number;
    screenY?: number;
    clientX?: number;
    clientY?: number;
    pageX?: number;
    pageY?: number;
    target: EventTarget;
    identifier: number;
}
interface TouchEvent extends UIEvent {
    readonly touches: TouchList;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}

declare var TouchEvent: {
    prototype: TouchEvent;
    new(type: string, eventInitDict?: TouchEventInit): TouchEvent;
};

interface TouchEventInit extends EventModifierInit {
    touches?: Array<Touch>;
}
interface TouchList {
    readonly length: number;
    item(index: number): Touch;
}

interface TransitionEvent extends Event {
    readonly propertyName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;
}

declare var TransitionEvent: {
    prototype: TransitionEvent;
    new(type: string, eventInitDict?: TransitionEventInit): TransitionEvent;
};

interface TransitionEventInit extends EventInit {
    readonly propertyName: string;
}
interface UIEvent extends Event {
    readonly detail: number;
    initUIEvent(type?: string, canBubble?: boolean, cancelable?: boolean, view?: Window, detail?: number): void;
}

declare var UIEvent: {
    prototype: UIEvent;
    new(type: string, initEvent?: UIEventInit): UIEvent;
};

interface UIEventInit extends EventInit {
    detail?: number;
    view?: Window | null;
}

interface EventModifierInit extends UIEventInit {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    modifierAltGraph?: boolean;
    modifierCapsLock?: boolean;
    modifierFn?: boolean;
    modifierFnLock?: boolean;
    modifierHyper?: boolean;
    modifierNumLock?: boolean;
    modifierScrollLock?: boolean;
    modifierSuper?: boolean;
    modifierSymbol?: boolean;
    modifierSymbolLock?: boolean;
    shiftKey?: boolean;
}
interface URL {
    href: string;
    readonly origin: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    revokeObjectURL(url: string): void;
    toJSON(): string;
}

declare var URL: {
    prototype: URL;
    new(url: string, base?: string): URL;
};

interface VirtualList {
    startIndex: number;
    pageSize: number;
}

interface WebSocket extends EventTarget {
    readonly readyState: number;
    readonly bufferedAmount: number;
    binaryType: string;
    readonly url: string;
    readonly extensions: string;
    readonly protocol: string;
    close(code?: number, reason?: string): void;
    onopen: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onclose: ((this: any, event: Event) => any) | null;
    onmessage: ((this: any, event: Event) => any) | null;
}

declare var WebSocket: {
    prototype: WebSocket;
    new(url: string, protocols?: string | Array<string>): WebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
};
interface Window extends EventTarget {
    readonly document: Document;
    readonly console: Console;
    readonly cohDebug: CoherentDebug;
    readonly performance: Performance;
    readonly location: Location;
    readonly navigator: Navigator;
    readonly self: Window;
    readonly localStorage: Storage;
    readonly history: History;
    readonly parent: Window;
    readonly screen: Screen;
    readonly customElements: CustomElementRegistry;
    readonly outerHeight: number;
    readonly outerWidth: number;
    readonly innerHeight: number;
    readonly innerWidth: number;
    readonly screenX: number;
    readonly screenY: number;
    readonly screenLeft: number;
    readonly screenTop: number;
    readonly scrollX: number;
    readonly scrollY: number;
    readonly pageXOffset: number;
    readonly pageYOffset: number;
    readonly devicePixelRatio: number;
    readonly chrome: Chrome;
    addEventListener(type: string, listener: Function, options?: AddEventListenerOptions): void;
    cancelAnimationFrame(id: number): void;
    clearInterval(handle: number): void;
    clearTimeout(handle: number): void;
    dispatchEvent(event: Event): boolean;
    getComputedStyle(element: Element): CSSStyleDeclaration;
    getSelection(): Selection;
    queueMicrotask(callback: Function): void;
    removeEventListener(type: string, listener: Function, useCapture?: RemoveEventListenerOptions): void;
    requestAnimationFrame(callback: Function): number;
    scrollBy(x?: number, y?: number): void;
    scrollTo(x?: number, y?: number): void;
    setInterval(handler: Function, interval?: number): number;
    setTimeout(handler: Function, timeout?: number): number;
    ongamepadconnected: ((this: any, event: Event) => any) | null;
    ongamepaddisconnected: ((this: any, event: Event) => any) | null;
    onpopstate: ((this: any, event: Event) => any) | null;
    onresize: ((this: any, event: Event) => any) | null;
    onunhandledrejection: ((this: any, event: Event) => any) | null;
    onabort: ((this: any, event: Event) => any) | null;
    onblur: ((this: any, event: Event) => any) | null;
    onclick: ((this: any, event: Event) => any) | null;
    onauxclick: ((this: any, event: Event) => any) | null;
    ondblclick: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onfocus: ((this: any, event: Event) => any) | null;
    onkeydown: ((this: any, event: Event) => any) | null;
    onkeypress: ((this: any, event: Event) => any) | null;
    onkeyup: ((this: any, event: Event) => any) | null;
    onload: ((this: any, event: Event) => any) | null;
    onmousedown: ((this: any, event: Event) => any) | null;
    onmouseover: ((this: any, event: Event) => any) | null;
    onmouseout: ((this: any, event: Event) => any) | null;
    onmouseenter: ((this: any, event: Event) => any) | null;
    onmouseleave: ((this: any, event: Event) => any) | null;
    onmousemove: ((this: any, event: Event) => any) | null;
    onmouseup: ((this: any, event: Event) => any) | null;
    oninput: ((this: any, event: Event) => any) | null;
    onscroll: ((this: any, event: Event) => any) | null;
    onwheel: ((this: any, event: Event) => any) | null;
    ontouchstart: ((this: any, event: Event) => any) | null;
    ontouchend: ((this: any, event: Event) => any) | null;
    ontouchmove: ((this: any, event: Event) => any) | null;
}

declare var document: Document;
declare var console: Console;
declare var cohDebug: CoherentDebug;
declare var performance: Performance;
declare var location: Location;
declare var navigator: Navigator;
declare var self: Window;
declare var localStorage: Storage;
declare var history: History;
declare var parent: Window;
declare var screen: Screen;
declare var customElements: CustomElementRegistry;
declare var outerHeight: number;
declare var outerWidth: number;
declare var innerHeight: number;
declare var innerWidth: number;
declare var screenX: number;
declare var screenY: number;
declare var screenLeft: number;
declare var screenTop: number;
declare var scrollX: number;
declare var scrollY: number;
declare var pageXOffset: number;
declare var pageYOffset: number;
declare var devicePixelRatio: number;
declare var chrome: Chrome;
declare function addEventListener(type: string, listener: Function, options?: AddEventListenerOptions): void;
declare function cancelAnimationFrame(id: number): void;
declare function clearInterval(handle: number): void;
declare function clearTimeout(handle: number): void;
declare function dispatchEvent(event: Event): boolean;
declare function getComputedStyle(element: Element): CSSStyleDeclaration;
declare function getSelection(): Selection;
declare function queueMicrotask(callback: Function): void;
declare function removeEventListener(type: string, listener: Function, useCapture?: RemoveEventListenerOptions): void;
declare function requestAnimationFrame(callback: Function): number;
declare function scrollBy(x?: number, y?: number): void;
declare function scrollTo(x?: number, y?: number): void;
declare function setInterval(handler: Function, interval?: number): number;
declare function setTimeout(handler: Function, timeout?: number): number;
declare var ongamepadconnected: ((this: Window, event: Event) => any) | null;
declare var ongamepaddisconnected: ((this: Window, event: Event) => any) | null;
declare var onpopstate: ((this: Window, event: Event) => any) | null;
declare var onresize: ((this: Window, event: Event) => any) | null;
declare var onunhandledrejection: ((this: Window, event: Event) => any) | null;
declare var onabort: ((this: Window, event: Event) => any) | null;
declare var onblur: ((this: Window, event: Event) => any) | null;
declare var onclick: ((this: Window, event: Event) => any) | null;
declare var onauxclick: ((this: Window, event: Event) => any) | null;
declare var ondblclick: ((this: Window, event: Event) => any) | null;
declare var onerror: ((this: Window, event: Event) => any) | null;
declare var onfocus: ((this: Window, event: Event) => any) | null;
declare var onkeydown: ((this: Window, event: Event) => any) | null;
declare var onkeypress: ((this: Window, event: Event) => any) | null;
declare var onkeyup: ((this: Window, event: Event) => any) | null;
declare var onload: ((this: Window, event: Event) => any) | null;
declare var onmousedown: ((this: Window, event: Event) => any) | null;
declare var onmouseover: ((this: Window, event: Event) => any) | null;
declare var onmouseout: ((this: Window, event: Event) => any) | null;
declare var onmouseenter: ((this: Window, event: Event) => any) | null;
declare var onmouseleave: ((this: Window, event: Event) => any) | null;
declare var onmousemove: ((this: Window, event: Event) => any) | null;
declare var onmouseup: ((this: Window, event: Event) => any) | null;
declare var oninput: ((this: Window, event: Event) => any) | null;
declare var onscroll: ((this: Window, event: Event) => any) | null;
declare var onwheel: ((this: Window, event: Event) => any) | null;
declare var ontouchstart: ((this: Window, event: Event) => any) | null;
declare var ontouchend: ((this: Window, event: Event) => any) | null;
declare var ontouchmove: ((this: Window, event: Event) => any) | null;

declare var Window: {
    prototype: Window;
    new(): Window;
}

declare var window: Window;

interface XMLHttpRequest extends XMLHttpRequestEventTarget {
    readonly readyState: number;
    timeout: number;
    withCredentials: boolean;
    readonly responseURL: string;
    readonly status: number;
    readonly statusText: string;
    responseType: string;
    readonly responseText: string;
    readonly response: any;
    abort(): void;
    getAllResponseHeaders(): string;
    getResponseHeader(name: string): string;
    open(method: string, url: string, async?: boolean, username?: string, password?: string): void;
    overrideMimeType(mime: string): void;
    responseArrayBuffer(): ArrayBuffer;
    responseBlob(): Blob;
    send(data?: string): void;
    setRequestHeader(name: string, value: string): void;
    onreadystatechange: ((this: any, event: Event) => any) | null;
    onloadstart: ((this: any, event: Event) => any) | null;
    onprogress: ((this: any, event: Event) => any) | null;
    onabort: ((this: any, event: Event) => any) | null;
    onerror: ((this: any, event: Event) => any) | null;
    onload: ((this: any, event: Event) => any) | null;
    ontimeout: ((this: any, event: Event) => any) | null;
    onloadend: ((this: any, event: Event) => any) | null;
}

declare var XMLHttpRequest: {
    prototype: XMLHttpRequest;
    new(): XMLHttpRequest;
    readonly UNSENT: 0;
    readonly OPENED: 1;
    readonly HEADERS_RECEIVED: 2;
    readonly LOADING: 3;
    readonly DONE: 4;
};

interface XMLHttpRequestEventTarget extends EventTarget {
}

