var draggable = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils/drag-base.js
  var DragBase, drag_base_default;
  var init_drag_base = __esm({
    "src/utils/drag-base.js"() {
      DragBase = class {
        /**
         *
         * @param {Object} options
         */
        constructor(options) {
          this.draggableElements = [];
          this.draggedElement = null;
          this.enabled = false;
          this.onMouseDown = this.onMouseDown.bind(this);
          this.onMouseMove = this.onMouseMove.bind(this);
          this.onMouseUp = this.onMouseUp.bind(this);
          this.options = options;
        }
        /**
         * Get the index of the dragged item in the draggableElements
         */
        get draggedItemIndex() {
          return [...this.draggableElements].indexOf(this.draggedElement);
        }
        /**
         * Gets the body scroll offset to calculate in the dragging
         */
        get bodyScrollOffset() {
          return {
            x: document.body.scrollLeft,
            y: document.body.scrollTop
          };
        }
        /**
         *
         * @param {number} clientX
         * @param {number} clientY
         * @param {HTMLElement} target
         */
        setPointerOffset(clientX, clientY, target) {
          const { x, y } = target.getBoundingClientRect();
          this.offset = {
            x: clientX - x,
            y: clientY - y
          };
        }
      };
      drag_base_default = DragBase;
    }
  });

  // src/utils/utility-functions.js
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
  var init_utility_functions = __esm({
    "src/utils/utility-functions.js"() {
    }
  });

  // src/utils/global-object.js
  var IM, global_object_default;
  var init_global_object = __esm({
    "src/utils/global-object.js"() {
      IM = class _IM2 {
        // eslint-disable-next-line require-jsdoc
        constructor() {
          this.actions = [];
          this.keyboardFunctions = [];
          this.gamepadFunctions = [];
        }
        /**
         * Initialize global object
         */
        init() {
          if (!window._IM) window._IM = new _IM2();
        }
        /**
         *
         * @param {string[]} keys Array of key combinations
         * @returns {string[]} Key combination from the _IM global object
         */
        getKeys(keys) {
          return _IM.keyboardFunctions.filter((keyFunction) => keyFunction.keys.every((key) => keys.includes(key)));
        }
        /**
         *
         * @param {string[]} keys Array of key combinations
         * @returns {number} Index of key combination in _IM
         */
        getKeysIndex(keys) {
          return _IM.keyboardFunctions.findIndex((keyFunction) => keyFunction.keys.every((key) => keys.includes(key)));
        }
        /**
         *
         * @param {Array} actions Array of actions
         * @param {string} type Type of action
         * @returns {Object} Action from the _IM global object
         */
        getGamepadAction({ actions, type }) {
          return _IM.gamepadFunctions.find((gpFunc) => {
            return gpFunc.actions.every((action) => actions.includes(action)) && gpFunc.type === type && gpFunc.actions.length === actions.length;
          });
        }
        /**
         *
         * @param {Array} actions Array of actions
         * @param {string} type Type of action
         * @returns {Object} Action from the _IM global object
         */
        getGamepadActions(actions) {
          return _IM.gamepadFunctions.filter(
            (gpFunc) => gpFunc.actions.every((action) => actions.includes(action)) && gpFunc.actions.length === actions.length
          );
        }
        /**
         *
         * @param {Array} actions Array of actions
         * @returns {number} Index of an action from the _IM global object
         */
        getGamepadActionIndex(actions) {
          return _IM.gamepadFunctions.findIndex((gpFunc) => gpFunc.actions.every((action) => actions.includes(action)));
        }
        /**
         *
         * @param {string} action Action to search for
         * @returns {Object}
         */
        getAction(action) {
          return _IM.actions.find((actionObj) => actionObj.name === action);
        }
        /**
         *
         * @param {string} action Action to search for
         * @returns {number}
         */
        getActionIndex(action) {
          return _IM.actions.findIndex((actionObj) => actionObj.name === action);
        }
      };
      global_object_default = new IM();
    }
  });

  // src/lib_components/actions.js
  var Actions, actions_default;
  var init_actions = __esm({
    "src/lib_components/actions.js"() {
      init_global_object();
      Actions = class {
        /**
         * Register an action
         * @param {string} action - Function alias that allows you to save functions and reuse them
         * @param {function} callback
         * @returns {void}
         */
        register(action, callback) {
          if (global_object_default.getAction(action)) return console.error(`The following action "${action}" is already registered!`);
          _IM.actions.push({ name: action, callback });
        }
        /**
         * Remove a registered action
         * @param {string} action - Name of action you want to remove
         * @returns {void}
         */
        remove(action) {
          const actionIndex = global_object_default.getActionIndex(action);
          if (actionIndex === -1) return console.error(`${action} is not a registered action!`);
          _IM.actions.splice(actionIndex, 1);
        }
        /**
         * Trigger an action
         * @param {string} action - Name of action you want to execute
         * @param {any} value - Value that is passed to the callback
         * @returns {void}
         */
        execute(action, value) {
          const actionObject = global_object_default.getAction(action);
          if (!actionObject) return console.error(`${action} is not a registered action!`);
          actionObject.callback(value);
        }
      };
      actions_default = new Actions();
    }
  });

  // src/utils/gesture-utils.js
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
  var init_gesture_utils = __esm({
    "src/utils/gesture-utils.js"() {
    }
  });

  // src/lib_components/touch-gestures.js
  var MULTIPLE_TOUCHES_MIN_NUMBER, TouchGestures, touch_gestures_default;
  var init_touch_gestures = __esm({
    "src/lib_components/touch-gestures.js"() {
      init_gesture_utils();
      init_utility_functions();
      MULTIPLE_TOUCHES_MIN_NUMBER = 2;
      TouchGestures = class {
        /**
         * @typedef {Object} gestureReturnObject
         * @property {function} gesture.remove - Removes the gesture and detaches the event listeners
         */
        /* eslint-disable-next-line require-jsdoc */
        constructor() {
          this.activeTouches = /* @__PURE__ */ new Map();
        }
        /**
         *
         * @param {Object} options
         * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
         * @param {function} options.callback - Function to be executed on touch
         * @param {number} [options.time=1000] - Time in milliseconds for the press
         * @returns {gestureReturnObject}
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
         *
         * @param {Object} options
         * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
         * @param {function} options.callback - Function to be executed on touch
         * @param {number} [options.tapsNumber=1] - Number of taps necessary for the callback to be executed
         * @param {number} [options.tapTime=200] - Time in milliseconds between putting down the finger and lifting it up
         * @param {number} [options.betweenTapsTime=500] - Time in milliseconds between two sequential taps
         * @returns {gestureReturnObject}
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
         *
         * @param {Object} options
         * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
         * @param {function} options.onDragStart - Function to be executed on drag start
         * @param {function} options.onDrag - Function to be executed on drag
         * @param {function} options.onDragEnd - Function to be executed on drag end
         * @returns {gestureReturnObject}
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
         *
         * @param {Object} options
         * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
         * @param {function} options.callback - Function to be executed on touch- Directions of the swipe
         * @param {number} options.touchNumber - Number of fingers necessary for the swipe
         * @returns {gestureReturnObject}
         */
        swipe(options) {
          if (!options) return console.error("Options not provided for swipe!");
          let swipeTimer, direction, distance;
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
            const { clientX: startX, clientY: startY } = this.activeTouches.get(touches[0].identifier);
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
            return isSwipe && options.callback && direction && distance > SWIPE_MIN_DISTANCE;
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
         *
         * @param {Object} options
         * @param {HTMLElement | string} options.element - Element you want to attach the touch event to
         * @param {function} options.callback - Function to be executed on touch
         * @returns {gestureReturnObject}
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
            document.addEventListener("touchmove", onPinch);
            document.addEventListener("touchend", onPinchEnd);
            distance = distanceBetweenTwoPoints(
              this.activeTouches.get(0).clientX,
              this.activeTouches.get(0).clientY,
              this.activeTouches.get(1).clientX,
              this.activeTouches.get(1).clientY
            );
          };
          const onPinch = ({ touches }) => {
            if (this.activeTouches.size !== MULTIPLE_TOUCHES_MIN_NUMBER) return;
            this.activeTouches.set(touches[0].identifier, touches[0]);
            const newDistance = distanceBetweenTwoPoints(
              this.activeTouches.get(0).clientX,
              this.activeTouches.get(0).clientY,
              this.activeTouches.get(1).clientX,
              this.activeTouches.get(1).clientY
            );
            const pinchDelta = Math.sign(newDistance - distance) * PINCH_DELTA_NUMBER;
            distance = newDistance;
            const midpoint = getMidPoint(
              this.activeTouches.get(0).clientX,
              this.activeTouches.get(0).clientY,
              this.activeTouches.get(1).clientX,
              this.activeTouches.get(1).clientY
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
         * @returns {gestureReturnObject}
         */
        rotate(options) {
          if (!options) return console.error("Options not provided for rotate!");
          let angle = 0;
          let initialAngle;
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
      };
      touch_gestures_default = new TouchGestures();
    }
  });

  // src/lib_components/draggable.js
  var AXIS, Draggable, draggable_default;
  var init_draggable = __esm({
    "src/lib_components/draggable.js"() {
      init_drag_base();
      init_utility_functions();
      init_actions();
      init_touch_gestures();
      AXIS = ["x", "y"];
      Draggable = class extends drag_base_default {
        /**
         * @typedef {Object} DraggableOptions
         * @property {string} element
         * @property {string} restrictTo
         * @property {string} dragClass
         * @property {'x'|'y'} lockAxis
         * @property {function} onDragStart
         * @property {function} onDragMove
         * @property {function} onDragEnd
         */
        /**
         *
         * @param {DraggableOptions} options
         */
        constructor(options) {
          super(options);
          const hash = createHash();
          this.actionName = `drag-around-${hash}`;
          this.restrict = {
            top: 0,
            left: 0,
            right: Infinity,
            bottom: Infinity
          };
          this._touchEnabled = false;
          this.touchEvents = [];
          this.init();
        }
        /**
         * Enables or disabled touch events
         * @param {boolean} enabled
         */
        set touchEnabled(enabled) {
          if (this._touchEnabled === enabled) return;
          this._touchEnabled = enabled;
          this._touchEnabled ? this.addTouchEvents() : this.removeTouchEvents();
        }
        /**
         * @returns {void}
         */
        init() {
          if (this.enabled) return;
          this.draggableElements = document.querySelectorAll(this.options.element);
          if (this.draggableElements.length === 0) {
            return console.error(`${this.options.element} is not a valid element selector.`);
          }
          this.draggableElements.forEach((element) => element.addEventListener("mousedown", this.onMouseDown));
          this.registerDragActions();
          this.enabled = true;
        }
        /**
         * Removes the eventlisteners
         * @returns {void}
         */
        deinit() {
          if (!this.enabled) return;
          this.enabled = false;
          this.draggableElements.forEach((element) => element.removeEventListener("mousedown", this.onMouseDown));
          this.removeDragActions();
        }
        /**
         * mousedown event handler
         * @param {MouseEvent} event
         */
        onMouseDown(event) {
          this.draggedElement = event.currentTarget;
          this.draggedElement.style.position = "absolute";
          this.elementRect = this.draggedElement.getBoundingClientRect();
          this.setRestriction();
          this.setPointerOffset(event.clientX, event.clientY, this.draggedElement);
          actions_default.execute(this.actionName, {
            x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
            y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
            index: this.draggedItemIndex
          });
          this.options.dragClass && this.draggedElement.classList.add(this.options.dragClass);
          this.options.onDragStart && this.options.onDragStart(this.draggedElement);
          document.addEventListener("mousemove", this.onMouseMove);
          document.addEventListener("mouseup", this.onMouseUp);
        }
        /**
         * mousemove event handler
         * @param {MouseEvent} event
         */
        onMouseMove(event) {
          actions_default.execute(this.actionName, {
            x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
            y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
            index: this.draggedItemIndex
          });
        }
        /**
         * mouseup event handler
         */
        onMouseUp() {
          document.removeEventListener("mousemove", this.onMouseMove);
          document.removeEventListener("mouseup", this.onMouseUp);
          this.options.onDragEnd && this.options.onDragEnd(this.draggedElement);
          this.options.dragClass && this.draggedElement.classList.remove(this.options.dragClass);
          this.draggedElement = null;
        }
        /**
         * Register dragging as an action to be able to use it externally
         */
        registerDragActions() {
          actions_default.register(this.actionName, ({ x, y, index }) => {
            if (!this.draggableElements[index]) return console.error(`There is no draggable element at index ${index}`);
            if (this.options.lockAxis && AXIS.includes(this.options.lockAxis)) {
              x = this.options.lockAxis === "y" ? this.elementRect.x : x;
              y = this.options.lockAxis === "x" ? this.elementRect.y : y;
            }
            this.draggableElements[index].style.left = `${clamp(x, this.restrict.left, this.restrict.right)}px`;
            this.draggableElements[index].style.top = `${clamp(y, this.restrict.top, this.restrict.bottom)}px`;
            this.options.onDragMove && this.options.onDragMove({ x, y });
          });
        }
        /**
         * Removes the registered action
         */
        removeDragActions() {
          actions_default.remove(this.actionName);
        }
        /**
         * Add touch gestures to drag the element
         */
        addTouchEvents() {
          this.draggableElements.forEach((element) => {
            this.touchEvents.push(
              touch_gestures_default.drag({
                element,
                onDragStart: (event) => {
                  this.onMouseDown({ currentTarget: event.currentTarget, clientX: event.x, clientY: event.y });
                },
                onDrag: ({ x, y }) => {
                  this.onMouseMove({ clientX: x, clientY: y });
                },
                onDragEnd: () => {
                  this.onMouseUp();
                }
              })
            );
          });
        }
        /**
         * Removes the touch gestures
         */
        removeTouchEvents() {
          this.touchEvents.forEach((event) => event.remove());
          this.touchEvents = [];
        }
        /**
         * Sets the bounds if a dragged element has to be restricted
         * @returns {void}
         */
        setRestriction() {
          if (!this.options.restrictTo) return;
          const restrictTo = document.querySelector(this.options.restrictTo);
          if (!restrictTo) {
            return console.error(
              `The element ${this.options.restrictTo} you trying to restrict dragging to is not a valid element`
            );
          }
          const { x, y, height, width } = restrictTo.getBoundingClientRect();
          this.restrict = {
            top: y,
            left: x,
            right: width + x - this.elementRect.width,
            bottom: height + y - this.elementRect.height
          };
        }
      };
      draggable_default = Draggable;
    }
  });

  // src/draggable.js
  var require_draggable = __commonJS({
    "src/draggable.js"(exports, module) {
      init_draggable();
      init_global_object();
      global_object_default.init();
      module.exports = draggable_default;
    }
  });
  return require_draggable();
})();
