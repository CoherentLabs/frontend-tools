(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.resize = factory());
})(this, (function() {
  "use strict";
  function toDeg(rad) {
    return rad * 180 / Math.PI;
  }
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function createHash() {
    return (Math.random() + 1).toString(36).substring(7);
  }
  function distanceBetweenTwoPoints(x1, y1, x2, y2) {
    const a = x1 - x2;
    const b = y1 - y2;
    return Math.hypot(a, b);
  }
  function getMidPoint(x1, y1, x2, y2) {
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };
  }
  class IM {
    constructor() {
      this.actions = [];
      this.keyboardFunctions = [];
      this.gamepadFunctions = [];
    }
    /**
     * Initialize global object
     */
    init() {
      if (!window._IM) window._IM = new IM();
    }
    /**
     * Get keyboard functions matching the given keys
     */
    getKeys(keys) {
      return _IM.keyboardFunctions.filter((keyFunction) => keyFunction.keys.every((key) => keys.includes(key)));
    }
    /**
     * Get the index of a keyboard function matching the given keys
     */
    getKeysIndex(keys) {
      return _IM.keyboardFunctions.findIndex((keyFunction) => keyFunction.keys.every((key) => keys.includes(key)));
    }
    /**
     * Get a gamepad function matching the given button actions and type
     */
    getGamepadAction({ actions: actions2, type }) {
      return _IM.gamepadFunctions.find((gpFunc) => {
        return gpFunc.actions.every((action) => actions2.includes(action)) && gpFunc.type === type && gpFunc.actions.length === actions2.length;
      });
    }
    /**
     * Get all gamepad functions matching the given button actions
     */
    getGamepadActions(actions2, exactMatch = true) {
      return _IM.gamepadFunctions.filter(
        (gpFunc) => gpFunc.actions.every((action) => actions2.includes(action)) && (exactMatch ? gpFunc.actions.length === actions2.length : true)
      );
    }
    /**
     * Get the index of a gamepad function matching the given button actions
     */
    getGamepadActionIndex(actions2) {
      return _IM.gamepadFunctions.findIndex((gpFunc) => gpFunc.actions.every((action) => actions2.includes(action)));
    }
    /**
     * Get an action by name
     * @param {string} action - Action to search for
     */
    getAction(action) {
      return _IM.actions.find((actionObj) => actionObj.name === action);
    }
    /**
     * Get the index of an action by name
     */
    getActionIndex(action) {
      return _IM.actions.findIndex((actionObj) => actionObj.name === action);
    }
    /**
     * Checks if a callback already exists in a registered function entry
     */
    hasDuplicateCallback(functionEntry, callback) {
      return functionEntry.callbacks.some((cb) => cb === callback);
    }
    /**
     * Adds a callback to an existing function entry if it's not a duplicate
     * @param {KeyboardFunction | GamepadFunction} functionEntry - The function entry to add the callback to
     * @param {Function | string} callback - The callback to add
     * @param {Object} errorContext - Context information for error messages
     * @param {string} errorContext.identifier - String identifying the keys/actions (e.g., "Keys: [A, B]")
     * @param {string} errorContext.type - The type of action (press, hold, lift)
     */
    addCallbackToEntry(functionEntry, callback, errorContext) {
      if (this.hasDuplicateCallback(functionEntry, callback)) {
        const callbackType = typeof callback === "string" ? "action" : "function";
        const callbackName = typeof callback === "string" ? callback : "(anonymous function)";
        return console.error(
          `Duplicate callback detected!
${errorContext.identifier}
Type: '${errorContext.type}'
Callback: ${callbackName}
This ${callbackType} is already registered for this combination and type. To update it, first remove with the .off() method.`
        );
      }
      return functionEntry.callbacks.push(callback);
    }
    /**
     * Removes a keyboard function entry from the registry
     */
    removeKeyboardFunction(functionEntry) {
      const index = _IM.keyboardFunctions.indexOf(functionEntry);
      if (index !== -1) _IM.keyboardFunctions.splice(index, 1);
    }
    /**
     * Removes a gamepad function entry from the registry
     */
    removeGamepadFunction(functionEntry) {
      const index = _IM.gamepadFunctions.indexOf(functionEntry);
      if (index !== -1) _IM.gamepadFunctions.splice(index, 1);
    }
  }
  const IM$1 = new IM();
  class Actions {
    /**
     * Register an action
     */
    register(action, callback) {
      if (IM$1.getAction(action)) return console.error(`The following action "${action}" is already registered!`);
      _IM.actions.push({ name: action, callback });
    }
    /**
     * Remove a registered action
     */
    remove(action) {
      const actionIndex = IM$1.getActionIndex(action);
      if (actionIndex === -1) return console.error(`${action} is not a registered action!`);
      _IM.actions.splice(actionIndex, 1);
    }
    /**
     * Trigger an action
     */
    execute(action, value) {
      const actionObject = IM$1.getAction(action);
      if (!actionObject) return console.error(`${action} is not a registered action!`);
      actionObject.callback(value);
    }
  }
  const actions = new Actions();
  function getDirection(diffX, diffY) {
    const MIN_SWIPE_OFFSET = 200;
    if (diffY < 0 && diffX > -MIN_SWIPE_OFFSET && diffX < MIN_SWIPE_OFFSET) return "top";
    if (diffY > 0 && diffX > -MIN_SWIPE_OFFSET && diffX < MIN_SWIPE_OFFSET) return "bottom";
    if (diffX < 0 && diffY > -MIN_SWIPE_OFFSET && diffY < MIN_SWIPE_OFFSET) return "left";
    if (diffX > 0 && diffY > -MIN_SWIPE_OFFSET && diffY < MIN_SWIPE_OFFSET) return "right";
    if (diffX <= -MIN_SWIPE_OFFSET && diffY <= -MIN_SWIPE_OFFSET) return "top-left";
    if (diffX >= MIN_SWIPE_OFFSET && diffY <= -MIN_SWIPE_OFFSET) return "top-right";
    if (diffX <= -MIN_SWIPE_OFFSET && diffY >= MIN_SWIPE_OFFSET) return "bottom-left";
    if (diffX >= MIN_SWIPE_OFFSET && diffY >= MIN_SWIPE_OFFSET) return "bottom-right";
  }
  function getElement(element) {
    return element instanceof HTMLElement ? element : document.querySelector(element);
  }
  const MULTIPLE_TOUCHES_MIN_NUMBER = 2;
  class TouchGestures {
    constructor() {
      this.activeTouches = /* @__PURE__ */ new Map();
    }
    /**
     * Hold gesture - triggers after holding for specified time
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.time=1000] - Time in milliseconds for the press
     */
    hold(options) {
      if (!options) return console.error("Options not provided for hold!");
      let holdTimer;
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onHold = ({ touches }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        holdTimer = setTimeout(() => {
          if (!options.callback) return;
          options.callback();
        }, options.time || 1e3);
      };
      const onHoldEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        clearTimeout(holdTimer);
      };
      element.addEventListener("touchstart", onHold);
      element.addEventListener("touchend", onHoldEnd);
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onHold);
          element.removeEventListener("touchend", onHoldEnd);
        }
      };
    }
    /**
     * Tap gesture - single or multi-tap detection
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     * @param {number} [options.tapsNumber=1] - Number of taps necessary for the callback to be executed
     * @param {number} [options.tapTime=200] - Time in milliseconds between putting down the finger and lifting it up
     * @param {number} [options.betweenTapsTime=500] - Time in milliseconds between two sequential taps
     */
    tap(options) {
      if (!options) return console.error("Options not provided for tap!");
      let tapTimer, betweenTapsTimer;
      let isTap = true;
      let tapCount = options.tapsNumber || 1;
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onTap = ({ touches }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        clearTimeout(betweenTapsTimer);
        isTap = true;
        tapTimer = setTimeout(() => {
          isTap = false;
        }, options.tapTime || 200);
      };
      const onTapEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        clearTimeout(tapTimer);
        if (!isTap) return;
        tapCount--;
        betweenTapsTimer = setTimeout(() => {
          tapCount = options.tapsNumber || 1;
          clearTimeout(betweenTapsTimer);
        }, options.betweenTapsTime || 500);
        if (tapCount !== 0 || !options.callback) return;
        options.callback();
        isTap = true;
        clearTimeout(tapTimer);
        tapCount = options.tapsNumber || 1;
      };
      element.addEventListener("touchstart", onTap);
      element.addEventListener("touchend", onTapEnd);
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onTap);
          element.removeEventListener("touchend", onTapEnd);
        }
      };
    }
    /**
     * Drag gesture - tracks touch movement
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.onDragStart - Function to be executed on drag start
     * @param {function} options.onDrag - Function to be executed on drag
     * @param {function} options.onDragEnd - Function to be executed on drag end
     */
    drag(options) {
      if (!options) return console.error("Options not provided for drag!");
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onDragStart = ({ touches, target, currentTarget }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        document.addEventListener("touchmove", onDrag);
        document.addEventListener("touchend", onDragEnd);
        if (!options.onDragStart) return;
        options.onDragStart({ x: touches[0].clientX, y: touches[0].clientY, target, currentTarget });
      };
      const onDrag = ({ touches }) => {
        if (!this.activeTouches.has(touches[0].identifier)) return;
        if (!options.onDrag) return;
        options.onDrag({ x: touches[0].clientX, y: touches[0].clientY });
      };
      const onDragEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("touchend", onDragEnd);
        if (!options.onDragEnd) return;
        options.onDragEnd({ x: touches[0].clientX, y: touches[0].clientY });
      };
      element.addEventListener("touchstart", onDragStart);
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onDragStart);
        }
      };
    }
    /**
     * Swipe gesture - detects directional swipes
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch- Directions of the swipe
     * @param {number} options.touchNumber - Number of fingers necessary for the swipe
     */
    swipe(options) {
      if (!options) return console.error("Options not provided for swipe!");
      let swipeTimer;
      let direction;
      let distance;
      let isSwipe = true;
      const SWIPE_MIN_DISTANCE = 100;
      options.touchNumber ||= 1;
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onSwipeStart = ({ touches }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        if (this.activeTouches.size > options.touchNumber) {
          document.removeEventListener("touchmove", onSwipe);
          document.removeEventListener("touchend", onSwipeEnd);
        }
        if (this.activeTouches.size !== options.touchNumber) return;
        swipeTimer = setTimeout(() => {
          isSwipe = false;
          clearTimeout(swipeTimer);
          swipeTimer = null;
        }, 1e3);
        document.addEventListener("touchmove", onSwipe);
        document.addEventListener("touchend", onSwipeEnd);
      };
      const onSwipe = ({ touches }) => {
        if (!this.activeTouches.has(touches[0].identifier)) return;
        const startTouch = this.activeTouches.get(touches[0].identifier);
        if (!startTouch) return;
        const { clientX: startX, clientY: startY } = startTouch;
        const diffX = touches[0].clientX - startX;
        const diffY = touches[0].clientY - startY;
        direction = getDirection(diffX, diffY);
        distance = distanceBetweenTwoPoints(startX, startY, touches[0].clientX, touches[0].clientY);
      };
      const onSwipeEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        if (this.activeTouches.size !== 0) return;
        document.removeEventListener("touchmove", onSwipe);
        document.removeEventListener("touchend", onSwipeEnd);
        if (isSwipeComplete()) {
          options.callback(direction);
        }
        clearTimeout(swipeTimer);
        isSwipe = true;
        swipeTimer = null;
      };
      const isSwipeComplete = () => {
        return isSwipe && direction && distance && distance > SWIPE_MIN_DISTANCE;
      };
      element.addEventListener("touchstart", onSwipeStart);
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onSwipeStart);
        }
      };
    }
    /**
     * Pinch gesture - two-finger pinch zoom
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    pinch(options) {
      if (!options) return console.error("Options not provided for pinch!");
      let distance;
      const PINCH_DELTA_NUMBER = 40;
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onPinchStart = ({ touches }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        if (this.activeTouches.size < MULTIPLE_TOUCHES_MIN_NUMBER) return;
        const touch0 = this.activeTouches.get(0);
        const touch1 = this.activeTouches.get(1);
        if (!touch0 || !touch1) return;
        document.addEventListener("touchmove", onPinch);
        document.addEventListener("touchend", onPinchEnd);
        distance = distanceBetweenTwoPoints(
          touch0.clientX,
          touch0.clientY,
          touch1.clientX,
          touch1.clientY
        );
      };
      const onPinch = ({ touches }) => {
        if (this.activeTouches.size !== MULTIPLE_TOUCHES_MIN_NUMBER) return;
        this.activeTouches.set(touches[0].identifier, touches[0]);
        const touch1 = this.activeTouches.get(0);
        const touch2 = this.activeTouches.get(1);
        if (!touch1 || !touch2) return;
        const newDistance = distanceBetweenTwoPoints(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );
        const pinchDelta = Math.sign(newDistance - distance) * PINCH_DELTA_NUMBER;
        distance = newDistance;
        const midpoint = getMidPoint(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );
        if (options.callback) options.callback({ pinchDelta, midpoint });
      };
      const onPinchEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        if (this.activeTouches.size !== 0) return;
        document.removeEventListener("touchmove", onPinch);
        document.removeEventListener("touchend", onPinchEnd);
      };
      element.addEventListener("touchstart", onPinchStart);
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onPinchStart);
        }
      };
    }
    /**
     *
     * @param {Object} options
     * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
     * @param {function} options.callback - Function to be executed on touch
     */
    rotate(options) {
      if (!options) return console.error("Options not provided for rotate!");
      let angle = 0;
      let initialAngle = 0;
      const element = getElement(options.element);
      if (!element) return console.error("Element not found!");
      const onRotate = ({ touches }) => {
        if (this.activeTouches.size < MULTIPLE_TOUCHES_MIN_NUMBER) return;
        this.activeTouches.set(touches[0].identifier, touches[0]);
        angle = getAngle() - initialAngle;
        if (options.callback) options.callback(angle);
      };
      const onRotateStart = ({ touches }) => {
        this.activeTouches.set(touches[0].identifier, touches[0]);
        if (this.activeTouches.size !== MULTIPLE_TOUCHES_MIN_NUMBER) return;
        initialAngle = getAngle() - angle;
        document.addEventListener("touchmove", onRotate);
        document.addEventListener("touchend", onRotateEnd);
      };
      const onRotateEnd = ({ touches }) => {
        this.activeTouches.delete(touches[0].identifier);
        document.removeEventListener("touchmove", onRotate);
        document.removeEventListener("touchend", onRotateEnd);
      };
      element.addEventListener("touchstart", onRotateStart);
      const getAngle = () => {
        const fullRotation = 360;
        const rotationOffset = 90;
        const offsetY = this.activeTouches.get(0).clientY - this.activeTouches.get(1).clientY;
        const offsetX = this.activeTouches.get(0).clientX - this.activeTouches.get(1).clientX;
        return (toDeg(Math.atan2(offsetY, offsetX)) + fullRotation + rotationOffset) % fullRotation;
      };
      return {
        /**
         * Removes the event listeners
         */
        remove() {
          element.removeEventListener("touchstart", onRotateStart);
        }
      };
    }
  }
  const touchGestures = new TouchGestures();
  class Resize {
    constructor(options) {
      this.enabled = false;
      this.activeEdge = null;
      this.edges = {
        bottom: null,
        right: null,
        bottomRight: null
      };
      this.elementRect = { x: 0, y: 0 };
      this.touchEvents = null;
      this._touchEnabled = false;
      const hash = createHash();
      this.heightAction = `resize-height-${hash}`;
      this.widthAction = `resize-width-${hash}`;
      this.options = options;
      this.options.edgeWidth = options.edgeWidth ?? 5;
      this.options.heightMin = this.options.heightMin ?? 50;
      this.options.heightMax = this.options.heightMax ?? window.innerHeight;
      this.options.widthMin = this.options.widthMin ?? 50;
      this.options.widthMax = this.options.widthMax ?? window.innerWidth;
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.init();
    }
    /**
     * Enables or disabled touch events
     */
    set touchEnabled(enabled) {
      if (this._touchEnabled === enabled) return;
      this._touchEnabled = enabled;
      this._touchEnabled ? this.addTouchEvents() : this.removeTouchEvents();
    }
    /**
     * Initializes the resizing
     */
    init() {
      if (this.enabled) return;
      this.resizableElement = document.querySelector(this.options.element);
      if (!this.resizableElement) return console.error(`${this.options.element} is not a correct selector`);
      this.resizableElement.addEventListener("mousedown", this.onMouseDown);
      this.addEdges();
      this.registerActions();
      this.enabled = true;
    }
    /**
     * Deinitilazes the resizing
     */
    deinit() {
      if (!this.enabled) return;
      this.resizableElement.removeEventListener("mousedown", this.onMouseDown);
      this.removeEdges();
      this.removeActions();
      this.enabled = false;
    }
    /**
     * Handles the mousedown event
     */
    onMouseDown(event) {
      this.activeEdge = this.setEdge(event.target);
      if (!this.activeEdge) return;
      const { x, y } = this.resizableElement.getBoundingClientRect();
      this.elementRect = { x, y };
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    }
    /**
     * Handles the mousemove event
     */
    onMouseMove(event) {
      const offsetX = event.clientX - this.elementRect.x;
      const offsetY = event.clientY - this.elementRect.y;
      switch (this.activeEdge) {
        case "bottom":
          actions.execute(this.heightAction, offsetY);
          this.options.onHeightChange && this.options.onHeightChange(offsetY);
          break;
        case "right":
          actions.execute(this.widthAction, offsetX);
          this.options.onWidthChange && this.options.onWidthChange(offsetX);
          break;
        case "bottomRight":
          actions.execute(this.heightAction, offsetY);
          actions.execute(this.widthAction, offsetX);
          this.options.onWidthChange && this.options.onWidthChange(offsetX);
          this.options.onHeightChange && this.options.onHeightChange(offsetY);
          break;
      }
    }
    /**
     * Handles the mouseup event
     */
    onMouseUp() {
      this.activeEdge = null;
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
    /**
     * Adds the touch events to fire the actions
     */
    addTouchEvents() {
      this.touchEvents = touchGestures.drag({
        element: this.resizableElement,
        onDragStart: (event) => {
          this.onMouseDown(event);
        },
        onDrag: ({ x, y }) => {
          this.onMouseMove({ clientX: x, clientY: y });
        },
        onDragEnd: () => {
          this.onMouseUp();
        }
      });
    }
    /**
     * Removes the touch events
     */
    removeTouchEvents() {
      this.touchEvents?.remove();
      this.touchEvents = null;
    }
    /**
     * Sets the active edge when resizing. If there is no edge it returns null
     */
    setEdge(element) {
      if (element.dataset.edge) return element.dataset.edge;
      return null;
    }
    /**
     * Checks if the element you are trying to resize has already position relative or absolute set, so it doesn't overwrite them
     */
    checkPosition() {
      const { position } = getComputedStyle(this.resizableElement);
      if (position === "absolute" || position === "relative") return;
      this.resizableElement.style.position = "relative";
    }
    /**
     * Creates the edge elements and appends them to the resizable element
     */
    addEdges() {
      this.checkPosition();
      const { width, height } = this.resizableElement.getBoundingClientRect();
      Object.entries(this.edges).forEach(([edge, element]) => {
        element = document.createElement("DIV");
        element.dataset.edge = edge;
        element.style.position = "absolute";
        switch (edge) {
          case "bottom":
            element.style.width = `${width - this.options.edgeWidth}px`;
            element.style.height = `${this.options.edgeWidth}px`;
            element.style.bottom = `-${this.options.edgeWidth}px`;
            break;
          case "bottomRight":
            element.style.width = `${this.options.edgeWidth}px`;
            element.style.height = `${this.options.edgeWidth}px`;
            element.style.bottom = `-${this.options.edgeWidth}px`;
            element.style.right = `-${this.options.edgeWidth}px`;
            break;
          case "right":
            element.style.width = `${this.options.edgeWidth}px`;
            element.style.height = `${height - this.options.edgeWidth}px`;
            element.style.right = `-${this.options.edgeWidth}px`;
            break;
        }
        this.edges[edge] = element;
        this.resizableElement.appendChild(element);
      });
    }
    /**
     * Removes the edge elements
     */
    removeEdges() {
      Object.values(this.edges).forEach((edge) => {
        this.resizableElement.removeChild(edge);
      });
    }
    /**
     * Registers actions
     */
    registerActions() {
      actions.register(this.heightAction, (height) => {
        this.resizableElement.style.height = `${clamp(height, this.options.heightMin, this.options.heightMax)}px`;
        this.edges.right.style.height = `${clamp(height, this.options.heightMin, this.options.heightMax) - this.options.edgeWidth}px`;
      });
      actions.register(this.widthAction, (width) => {
        this.resizableElement.style.width = `${clamp(width, this.options.widthMin, this.options.widthMax)}px`;
        this.edges.bottom.style.width = `${clamp(width, this.options.widthMin, this.options.widthMax) - this.options.edgeWidth}px`;
      });
    }
    /**
     * Removes the registered actions
     */
    removeActions() {
      actions.remove(this.heightAction);
      actions.remove(this.widthAction);
    }
  }
  IM$1.init();
  return Resize;
}));
