(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.spatialNavigation = factory());
})(this, (function() {
  "use strict";
  function toDeg(rad) {
    return rad * 180 / Math.PI;
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
  const mappings$1 = {
    ALT: 18,
    ARROW_DOWN: 40,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,
    ARROW_UP: 38,
    BACKSPACE: 8,
    CAPS_LOCK: 20,
    CTRL: 17,
    DELETE: 46,
    END: 35,
    ENTER: 13,
    ESC: 27,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    HOME: 36,
    INSERT: 45,
    NUM_LOCK: 144,
    NUMPAD_ENTER: 13,
    NUMPAD_DASH: 109,
    NUMPAD_STAR: 106,
    NUMPAD_DOT: 110,
    NUMPAD_FORWARD_SLASH: 111,
    NUMPAD_PLUS: 107,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PAUSE: 19,
    PRINT_SCRN: 44,
    SCROLL_LOCK: 145,
    SHIFT: 16,
    SPACEBAR: 32,
    TAB: 9,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    0: 48,
    QUOTE: 222,
    DASH: 189,
    COMMA: 188,
    DOT: 190,
    FORWARD_SLASH: 191,
    SEMI_COLON: 186,
    SQUARE_BRACKET_LEFT: 219,
    SQUARE_BRACKET_RIGHT: 221,
    BACKWARD_SLASH: 220,
    BACKTICK: 192,
    EQUAL: 187,
    SYSTEM: 91
  };
  const mappingsKeys = Object.keys(mappings$1);
  class Keyboard {
    constructor() {
      this.eventListenerAttached = false;
      this.keysPressed = /* @__PURE__ */ new Set();
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      if (!window.KEYS) window.KEYS = mappings$1;
    }
    /**
     * Registers keyboard event listeners
     * @param options - Configuration object
     * @param options.keys - Array of keys (e.g., ['A', 'SHIFT']) or key codes
     * @param options.callback - Function or action name to execute
     * @param options.type - Event type(s): 'press', 'hold', or 'lift' (can be single or array)
     */
    on(options) {
      const keys = this.normalizeKeys(options.keys);
      const incorrectKeys = keys.filter((key) => !mappings$1[key]);
      if (incorrectKeys.length > 0) return console.error(`The following keys [${incorrectKeys.join(", ")}] you have entered are incorrect! `);
      if (!this.eventListenerAttached) {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        this.eventListenerAttached = true;
      }
      const types = !options.type ? ["press"] : Array.isArray(options.type) ? options.type : [options.type];
      types.forEach((type) => {
        const registeredKeys = IM$1.getKeys(keys);
        const existingEntry = registeredKeys.find((key) => key.type === type);
        if (existingEntry) {
          return IM$1.addCallbackToEntry(existingEntry, options.callback, {
            identifier: `Keys: [${keys.join(", ")}]`,
            type
          });
        }
        if (type === "lift" && keys.length > 1) return console.error("You can only have a single key trigger an action on lift");
        _IM.keyboardFunctions.push({
          keys,
          type,
          callbacks: [options.callback]
        });
      });
    }
    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param keys - Key combination you want to remove (e.g., ['A', 'SHIFT'])
     * @param callback - Optional specific callback or action to remove
     */
    off(keys, callback) {
      keys = this.normalizeKeys(keys);
      const keyCombinations = IM$1.getKeys(keys);
      if (keyCombinations.length === 0) return console.error("You are trying to remove a non-existent key combination!");
      if (callback) {
        const combinationsWithCallback = keyCombinations.filter((combination) => combination.callbacks.includes(callback));
        if (combinationsWithCallback.length === 0) {
          return console.error("You are trying to remove a non-existent callback from this key combination!");
        }
        combinationsWithCallback.forEach((combination) => {
          const cbIndex = combination.callbacks.indexOf(callback);
          combination.callbacks.splice(cbIndex, 1);
          if (combination.callbacks.length === 0) {
            IM$1.removeKeyboardFunction(combination);
          }
        });
      } else {
        keyCombinations.forEach((combination) => {
          IM$1.removeKeyboardFunction(combination);
        });
      }
      if (_IM.keyboardFunctions.length === 0) {
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
        this.eventListenerAttached = false;
      }
    }
    /**
     * Handles when key is pressed
     */
    onKeyDown(event) {
      const keyPressed = this.keyCodeToString(event.keyCode);
      if (!keyPressed) return;
      this.keysPressed.add(keyPressed);
      const registeredKeys = IM$1.getKeys([...this.keysPressed]);
      if (registeredKeys.length === 0) return;
      registeredKeys.forEach((key) => {
        if (key.type === "press" && event.repeat) return;
        if (key.type !== "press" && key.type !== "hold") return;
        if (key.type === "hold" && !event.repeat) return;
        this.executeCallbacks(event, key);
      });
    }
    /**
     * Handles when key is released
     */
    onKeyUp(event) {
      const keyPressed = this.keyCodeToString(event.keyCode);
      if (!keyPressed) return;
      this.keysPressed.delete(keyPressed);
      const registeredKeys = IM$1.getKeys([keyPressed]);
      if (registeredKeys.length === 0) return;
      registeredKeys.forEach((key) => {
        if (key.type === "lift" && key.keys.indexOf(keyPressed) !== -1) this.executeCallbacks(event, key);
      });
    }
    /**
     * Convert keyCode to string representing key
     */
    keyCodeToString(code) {
      return mappingsKeys.find((key) => mappings$1[key] === code);
    }
    /**
     * Removes duplicates and converts KeyCodes to valid KeyName strings
     */
    normalizeKeys(keys) {
      const normalizedKeys = keys.map((key) => {
        if (typeof key === "number") {
          const name = this.keyCodeToString(key);
          if (!name) throw new Error(`Invalid KeyCode: ${key}`);
          return name;
        }
        return key.toUpperCase();
      });
      return [...new Set(normalizedKeys)];
    }
    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     */
    executeCallbacks(event, registeredKeys) {
      registeredKeys.callbacks.forEach((callback) => {
        if (typeof callback === "string") return actions.execute(callback, event);
        callback(event);
      });
    }
  }
  const keyboard = new Keyboard();
  const mappings = {
    FACE_BUTTON_DOWN: 0,
    FACE_BUTTON_RIGHT: 1,
    FACE_BUTTON_LEFT: 2,
    FACE_BUTTON_TOP: 3,
    LEFT_SHOULDER: 4,
    RIGHT_SHOULDER: 5,
    LEFT_SHOULDER_BOTTOM: 6,
    RIGHT_SHOULDER_BOTTOM: 7,
    SELECT: 8,
    START: 9,
    LEFT_ANALOGUE_STICK: 10,
    RIGHT_ANALOGUE_STICK: 11,
    PAD_UP: 12,
    PAD_DOWN: 13,
    PAD_LEFT: 14,
    PAD_RIGHT: 15,
    CENTER_BUTTON: 16,
    aliases: {
      "face-button-down": "FACE_BUTTON_DOWN",
      "face-button-left": "FACE_BUTTON_LEFT",
      "face-button-right": "FACE_BUTTON_RIGHT",
      "face-button-top": "FACE_BUTTON_TOP",
      "left-shoulder": "LEFT_SHOULDER",
      "right-shoulder": "RIGHT_SHOULDER",
      "left-shoulder-bottom": "LEFT_SHOULDER_BOTTOM",
      "right-shoulder-bottom": "RIGHT_SHOULDER_BOTTOM",
      select: "SELECT",
      start: "START",
      "left-analogue-stick": "LEFT_ANALOGUE_STICK",
      "right-analogue-stick": "RIGHT_ANALOGUE_STICK",
      "pad-up": "PAD_UP",
      "pad-down": "PAD_DOWN",
      "pad-left": "PAD_LEFT",
      "pad-right": "PAD_RIGHT",
      "center-button": "CENTER_BUTTON",
      "playstation.x": "FACE_BUTTON_DOWN",
      "playstation.square": "FACE_BUTTON_LEFT",
      "playstation.circle": "FACE_BUTTON_RIGHT",
      "playstation.triangle": "FACE_BUTTON_TOP",
      "playstation.l1": "LEFT_SHOULDER",
      "playstation.r1": "RIGHT_SHOULDER",
      "playstation.l2": "LEFT_SHOULDER_BOTTOM",
      "playstation.r2": "RIGHT_SHOULDER_BOTTOM",
      "playstation.share": "SELECT",
      "playstation.options": "START",
      "playstation.l3": "LEFT_ANALOGUE_STICK",
      "playstation.r3": "RIGHT_ANALOGUE_STICK",
      "playstation.d-pad-up": "PAD_UP",
      "playstation.d-pad-down": "PAD_DOWN",
      "playstation.d-pad-left": "PAD_LEFT",
      "playstation.d-pad-right": "PAD_RIGHT",
      "playstation.center": "CENTER_BUTTON",
      "xbox.a": "FACE_BUTTON_DOWN",
      "xbox.x": "FACE_BUTTON_LEFT",
      "xbox.b": "FACE_BUTTON_RIGHT",
      "xbox.y": "FACE_BUTTON_TOP",
      "xbox.lb": "LEFT_SHOULDER",
      "xbox.rb": "RIGHT_SHOULDER",
      "xbox.lt": "LEFT_SHOULDER_BOTTOM",
      "xbox.rt": "RIGHT_SHOULDER_BOTTOM",
      "xbox.view": "SELECT",
      "xbox.menu": "START",
      "xbox.left-thumbstick": "LEFT_ANALOGUE_STICK",
      "xbox.right-thumbstick": "RIGHT_ANALOGUE_STICK",
      "xbox.d-pad-up": "PAD_UP",
      "xbox.d-pad-down": "PAD_DOWN",
      "xbox.d-pad-left": "PAD_LEFT",
      "xbox.d-pad-right": "PAD_RIGHT",
      "xbox.center": "CENTER_BUTTON"
    },
    axisAliases: [
      "right.joystick",
      "left.joystick",
      "left.joystick.down",
      "left.joystick.up",
      "left.joystick.left",
      "left.joystick.right",
      "right.joystick.down",
      "right.joystick.up",
      "right.joystick.left",
      "right.joystick.right"
    ]
  };
  const AXIS_THRESHOLD = 0.9;
  const ACTION_TYPES = ["press", "hold"];
  class Gamepad {
    constructor() {
      this._gamepadEnabled = false;
      this._pollingInterval = 200;
      this._pressedAction = null;
      this._pressedButtons = [];
      this.sanitizeAction = this.sanitizeAction.bind(this);
    }
    /**
     * Allow gamepads to be connected
     */
    set enabled(isEnabled) {
      this._gamepadEnabled = isEnabled;
      this._gamepadEnabled ? this.startPolling() : this.stopPolling();
    }
    set pollingInterval(interval) {
      this._pollingInterval = interval;
      if (this._gamepadEnabled) {
        if (this.pollingIntervalRef) this.stopPolling();
        this.startPolling();
      }
    }
    on(options) {
      const actions2 = options.actions.map(this.sanitizeAction);
      const isAxisAlias = mappings.axisAliases.some((alias) => actions2.includes(alias));
      const type = options.type && ACTION_TYPES.includes(options.type) ? options.type : "hold";
      if (type === "press" && isAxisAlias) {
        return console.error(`You can't use an axis action with a 'press' type!`);
      }
      if (actions2.length > 1 && isAxisAlias) {
        return console.error(`You can't use an axis action in a combination with a button action`);
      }
      const existingEntry = IM$1.getGamepadAction({ actions: actions2, type });
      if (existingEntry) {
        return IM$1.addCallbackToEntry(existingEntry, options.callback, {
          identifier: `Actions: [${actions2.join(", ")}]`,
          type
        });
      }
      _IM.gamepadFunctions.push({ actions: actions2, type, callbacks: [options.callback] });
    }
    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove 
     */
    off(actions2, callback) {
      const matchingActions = IM$1.getGamepadActions(actions2.map(this.sanitizeAction));
      if (matchingActions.length === 0) {
        return console.error("You are trying to remove a non-existent action!");
      }
      if (callback) {
        const actionsWithCallback = matchingActions.filter((action) => action.callbacks.includes(callback));
        if (actionsWithCallback.length === 0) return console.error("You are trying to remove a non-existent callback from this action!");
        actionsWithCallback.forEach((action) => {
          const cbIndex = action.callbacks.indexOf(callback);
          action.callbacks.splice(cbIndex, 1);
          if (action.callbacks.length === 0) {
            IM$1.removeGamepadFunction(action);
          }
        });
      } else {
        matchingActions.forEach((action) => IM$1.removeGamepadFunction(action));
      }
    }
    /**
     * Loop that handles button presses and axis movement
     */
    startPolling() {
      this.pollingIntervalRef = setInterval(() => {
        const gamepads = navigator.getGamepads();
        if (gamepads.length === 0) return;
        gamepads.forEach((gamepad2) => {
          if (!gamepad2) return;
          this.handleButtons(gamepad2.buttons);
          this.handleJoysticks(gamepad2.axes);
        });
      }, this._pollingInterval);
    }
    stopPolling() {
      if (this.pollingIntervalRef) clearInterval(this.pollingIntervalRef);
    }
    handleButtons(buttons) {
      const pressedButtons = buttons.reduce(
        (acc, el, index) => {
          if (el.pressed) {
            acc.buttonIndexes.push(index);
            acc.buttons.push(el);
          }
          return acc;
        },
        { buttonIndexes: [], buttons: [] }
      );
      const gamepadActions = IM$1.getGamepadActions(pressedButtons.buttonIndexes, false);
      if (this._pressedAction) {
        if (!gamepadActions.includes(this._pressedAction)) {
          this.executeCallbacks(this._pressedAction, this._pressedButtons);
        }
        this._pressedAction = null;
        this._pressedButtons = [];
      }
      gamepadActions.forEach((gamepadAction) => {
        if (gamepadAction.type === "press") {
          this._pressedAction = gamepadAction;
          this._pressedButtons = pressedButtons.buttons;
          return;
        }
        this.executeCallbacks(gamepadAction, pressedButtons.buttons);
      });
    }
    /* eslint-disable max-lines-per-function */
    handleJoysticks(axes) {
      const joystickActions = this.getJoystickActions();
      joystickActions.forEach((jAction) => {
        switch (jAction.actions[0]) {
          case "left.joystick":
            return this.executeCallbacks(jAction, [axes[0], axes[1]]);
          case "right.joystick":
            return this.executeCallbacks(jAction, [axes[2], axes[3]]);
          case "left.joystick.down":
            if (axes[1] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
            break;
          case "left.joystick.up":
            if (axes[1] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
            break;
          case "left.joystick.left":
            if (axes[0] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
            break;
          case "left.joystick.right":
            if (axes[0] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[0], axes[1]]);
            break;
          case "right.joystick.down":
            if (axes[3] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
            break;
          case "right.joystick.up":
            if (axes[3] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
            break;
          case "right.joystick.left":
            if (axes[2] < -AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
            break;
          case "right.joystick.right":
            if (axes[2] > AXIS_THRESHOLD) return this.executeCallbacks(jAction, [axes[2], axes[3]]);
            break;
        }
      });
    }
    /**
     * Convert button aliases to indexes or keep joystick aliases
     * @param {string | number} action - Actions to convert
     */
    sanitizeAction(action) {
      if (typeof action === "number") return action;
      const actionName = action.toLowerCase();
      if (mappings.axisAliases.includes(actionName)) return actionName;
      const key = mappings.aliases[actionName];
      if (key) return mappings[key];
      throw new Error(`You have entered a non-supported button alias: ${action}`);
    }
    /**
     * Gets all registered Joystick actions
     */
    getJoystickActions() {
      return _IM.gamepadFunctions.filter((gpFunc) => mappings.axisAliases.includes(gpFunc.actions[0]));
    }
    /**
     * Executes the callbacks from the registered action
     */
    executeCallbacks(action, value) {
      action.callbacks.forEach((callback) => {
        if (typeof callback === "string") return actions.execute(callback, value);
        callback(value);
      });
    }
  }
  const gamepad = new Gamepad();
  const directions = ["down", "up", "left", "right"];
  const defaultKeysState = { up: ["arrow_up"], down: ["arrow_down"], right: ["arrow_right"], left: ["arrow_left"] };
  class SpatialNavigation {
    constructor() {
      this.enabled = false;
      this.areas = { default: this.createDefaultAreaState() };
      this.registeredKeys = /* @__PURE__ */ new Set();
      this.clearCurrentActiveKeys = false;
      this.overlapPercentage = 0.5;
      this.lastFocusedElement = null;
      this.paused = false;
      this.syncLastFocused = (event) => {
        const target = event.target;
        if (!this.enabled || !target) return;
        for (const areaName in this.areas) {
          const area = this.areas[areaName];
          if (area.elements.includes(target)) {
            area.lastFocusedElement = target;
            this.lastFocusedElement = target;
            break;
          }
        }
      };
    }
    /**
     * Initializes the spatial navigation
     * @param {string[]|Object[]|HTMLElement[]} navigableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigableElements[].elements - Array of selector strings or HTMLElement references
     * @param {number} overlap - Overlap percentage (0-1) for determining if elements are on the same axis
     * @example
     * // Using selector strings
     * spatialNavigation.init(['.menu-item', '#header']);
     *
     * // Using HTMLElement references
     * spatialNavigation.init([element1, element2]);
     *
     * // Using object syntax with mixed selectors and HTMLElements
     * spatialNavigation.init([
     *   { area: 'menu', elements: ['.item', element1, '#button'] }
     * ]);
     */
    init(navigableElements = [], overlap) {
      if (this.enabled) return;
      this.enabled = true;
      this.add(navigableElements);
      this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
      this.registerKeyActions();
      window.addEventListener("focusin", this.syncLastFocused);
      if (overlap && 0 <= overlap && overlap <= 1) {
        this.overlapPercentage = overlap;
      }
    }
    /**
     * Deinitialize the spatial navigation
     */
    deinit() {
      if (!this.enabled) return;
      this.enabled = false;
      this.areas = { default: this.createDefaultAreaState() };
      this.removeKeyActions();
      this.overlapPercentage = 0.5;
      this.lastFocusedElement = null;
      window.removeEventListener("focusin", this.syncLastFocused);
    }
    /**
     * Add new elements to area or new area
     * @param {string[]|Object[]|HTMLElement[]} navigableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigableElements[].elements - Array of selector strings or HTMLElement references
     * @example
     * // Add selector strings to default area
     * spatialNavigation.add(['.new-item']);
     *
     * // Add HTMLElement references to default area
     * spatialNavigation.add([element1, element2]);
     *
     * // Add to named area with mixed types
     * spatialNavigation.add([
     *   { area: 'sidebar', elements: ['.link', element1] }
     * ]);
     */
    add(navigableElements) {
      if (!this.enabled) return;
      if (navigableElements.every((el) => el instanceof HTMLElement)) {
        navigableElements.forEach((element) => this.makeFocusable(element));
        this.setNavigationAreaProperties("default", navigableElements);
        return;
      }
      navigableElements.forEach((navArea) => {
        typeof navArea === "string" ? this.handleString(navArea) : this.handleObject(navArea);
      });
    }
    /**
     * Remove an area from the focusable groups
     * @param area area to be removed
     */
    remove(area = "default") {
      if (!this.enabled) return;
      if (!this.areas[area]) return console.error(`The area '${area}' you are trying to remove doesn't exist`);
      this.areas[area].elements.forEach((element) => element.removeAttribute("tabindex"));
      delete this.areas[area];
    }
    /**
     * Gets the last focused element from the specified area
     * @param area
     */
    getLastFocused(area = "default") {
      const el = this.areas[area]?.lastFocusedElement;
      if (el && !document.contains(el)) {
        this.areas[area].lastFocusedElement = void 0;
        return void 0;
      }
      return el;
    }
    /**
     * Returns the structure of the default area
     */
    createDefaultAreaState() {
      return {
        elements: [],
        distance: 0,
        lastFocusedElement: void 0,
        overflow: { x: 0, y: 0 }
      };
    }
    /**
     * Get elements from selector and save them to the default group
     * @param navArea
     */
    handleString(navArea) {
      const domElements = [...document.querySelectorAll(navArea)];
      if (domElements.length === 0) return console.error(`${navArea} is either not a correct selector or the element is not present in the DOM.`);
      domElements.forEach(this.makeFocusable);
      this.setNavigationAreaProperties("default", domElements);
    }
    /**
     * Gets elements from object and saves them to a focusable group
     * @param {Object} navArea - Navigation area configuration
     * @param {string} navArea.area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navArea.elements - Array of selector strings or HTMLElement references
     */
    handleObject(navArea) {
      const domElements = navArea.elements.reduce((acc, el) => {
        if (el instanceof HTMLElement) {
          acc.push(el);
          this.makeFocusable(el);
          return acc;
        }
        const elements = [...document.querySelectorAll(el)];
        elements.forEach(this.makeFocusable);
        acc.push(...elements);
        return acc;
      }, []);
      if (domElements.length === 0) return console.error(`${navArea.elements.join(", ")} are either not a correct selectors or the elements are not present in the DOM.`);
      if (!this.areas[navArea.area]) {
        this.areas[navArea.area] = this.createDefaultAreaState();
      }
      this.setNavigationAreaProperties(navArea.area, domElements);
    }
    /**
     * @param area - The area to set the properties for
     * @param domElements - The elements to be added to the area
     */
    setNavigationAreaProperties(area, domElements) {
      this.areas[area].elements.push(...domElements);
      this.areas[area].distance = this.getElementsDistance(this.areas[area].elements);
      this.areas[area].overflow = this.setOverflowValues(domElements[0].parentElement);
    }
    /**
     * Calculates the distance between the provided elements and return the max distance
     * @param elements
     * @returns The max distance between the elements
     */
    getElementsDistance(elements) {
      return elements.reduce((acc, el) => {
        const { x, y } = el.getBoundingClientRect();
        const distance = Math.hypot(x, y);
        return acc < distance ? distance : acc;
      }, 0);
    }
    /**
     * Recursively checks for overflow in the parent elements and sets the area overflow values
     * @param {HTMLElement} element - The element to check for overflow
     * @returns {{x: number, y: number}|HTMLElement} - Next element to check for overflow or object with the overflow values
     */
    setOverflowValues(element) {
      if (!element) return { x: 0, y: 0 };
      const { scrollWidth, scrollHeight } = element;
      const overflowX = Math.max(0, scrollWidth - window.innerWidth);
      const overflowY = Math.max(0, scrollHeight - window.innerHeight);
      if (overflowX > 0 || overflowY > 0) {
        return { x: overflowX, y: overflowY };
      }
      return this.setOverflowValues(element.parentElement);
    }
    /**
     * Sets the tabindex of the element that needs to be focused
     * @param element
     */
    makeFocusable(element) {
      element.setAttribute("tabindex", "1");
    }
    /**
     * Returns the valid focusable elements in the navigable area
     * @param {HTMLElement} targetElement
     * @param {HTMLElement[]} elements
     * @param {number} distance
     */
    getFocusableGroup(targetElement, elements, distance) {
      return elements.reduce((accumulator, element) => {
        if (element !== targetElement && !element.hasAttribute("disabled")) {
          const { x, y, height, width } = element.getBoundingClientRect();
          accumulator.push({
            element,
            x: x + distance,
            y: y + distance,
            height,
            width
          });
        }
        return accumulator;
      }, []);
    }
    /**
     * Checks if the passed element is within a group and returns the rest of the elements in the group
     * @param {HTMLElement} targetElement
     * @returns {NavigationObject[]}
     */
    getCurrentArea(targetElement) {
      return Object.values(this.areas).find((area) => {
        if (area.elements.includes(targetElement)) return true;
      });
    }
    /**
     * Gets the element closest to the opposite edge of the navigation direction
     * @param {string} direction
     * @param {NavigationObject[]} elements
     * @param {Object} focusedElement
     * @param {number} focusedElement.x
     * @param {number} focusedElement.y
     * @param {number} distance
     * @param {{x: number, y: number}} overflow
     */
    getClosestToEdge(direction, elements, focusedElement, distance, overflow) {
      let newDistance, oldDistance;
      const bottomEdge = window.innerHeight + distance + overflow.y;
      const rightEdge = window.innerWidth + distance + overflow.x;
      return elements.reduce((acc, el) => {
        switch (direction) {
          case "down":
            newDistance = Math.hypot(el.x - focusedElement.x, el.y);
            oldDistance = Math.hypot(acc.x - focusedElement.x, acc.y);
            break;
          case "up":
            newDistance = Math.hypot(el.x - focusedElement.x, bottomEdge - el.y);
            oldDistance = Math.hypot(acc.x - focusedElement.x, bottomEdge - acc.y);
            break;
          case "right":
            newDistance = Math.hypot(el.x, el.y - focusedElement.y);
            oldDistance = Math.hypot(acc.x, acc.y - focusedElement.y);
            break;
          case "left":
            newDistance = Math.hypot(rightEdge - el.x, el.y - focusedElement.y);
            oldDistance = Math.hypot(rightEdge - acc.x, acc.y - focusedElement.y);
            break;
        }
        acc = newDistance < oldDistance ? el : acc;
        return acc;
      });
    }
    /**
     * Moves the focus in the desired direction
     * @param {string} direction
     */
    moveFocus(direction) {
      if (!this.enabled) return;
      const activeElement = this.isActiveElementInGroup() && document.activeElement || this.lastFocusedElement;
      const currentArea = this.getCurrentArea(activeElement);
      if (!currentArea) return console.error("The active element is not in a focusable area!");
      const { elements, distance, overflow } = currentArea;
      const focusableGroup = this.getFocusableGroup(activeElement, elements, distance);
      const { x, y, width, height } = activeElement.getBoundingClientRect();
      const adjustedDimensions = {
        x: x + distance,
        y: y + distance,
        width,
        height
      };
      if (focusableGroup.length === 0) return;
      const currentAxisGroup = this.filterGroupByCurrentAxis(direction, focusableGroup, adjustedDimensions);
      if (!currentAxisGroup.length) return;
      let nextFocusableElement = this.findNextElement(
        direction,
        currentAxisGroup,
        adjustedDimensions.x,
        adjustedDimensions.y
      );
      if (!nextFocusableElement) {
        nextFocusableElement = this.getClosestToEdge(
          direction,
          currentAxisGroup,
          adjustedDimensions,
          distance,
          overflow
        );
      }
      if (nextFocusableElement) {
        nextFocusableElement.element.focus();
        this.lastFocusedElement = nextFocusableElement.element;
        currentArea.lastFocusedElement = this.lastFocusedElement;
      }
    }
    /** Filters the focusable group by the relevant axis by chacking for same axis overlap */
    filterGroupByCurrentAxis(direction, focusableGroup, currentElement) {
      return focusableGroup.filter((element) => {
        if (direction === "left" || direction === "right") return this.isOverlappingX(currentElement, element);
        return this.isOverlappingY(currentElement, element);
      });
    }
    /** Compares the Y coordinates of two elements and checks for overlap by the specified overlap value */
    isOverlappingX(currentElement, nextElement) {
      const lowerBoundary = Math.min(currentElement.y + currentElement.height, nextElement.y + nextElement.height);
      const topBoundary = Math.max(currentElement.y, nextElement.y);
      const verticalOverlap = Math.max(0, lowerBoundary - topBoundary);
      const minHeight = Math.min(currentElement.height, nextElement.height);
      const overlapPercentage = verticalOverlap / minHeight;
      return overlapPercentage >= this.overlapPercentage;
    }
    /** Compares the X coordinates of two elements and checks for overlap by the specified overlap value */
    isOverlappingY(currentElement, nextElement) {
      const rightBoundary = Math.min(currentElement.x + currentElement.width, nextElement.x + nextElement.width);
      const leftBoundary = Math.max(currentElement.x, nextElement.x);
      const horizontalOverlap = Math.max(0, rightBoundary - leftBoundary);
      const minWidth = Math.min(currentElement.width, nextElement.width);
      const overlapPercentage = horizontalOverlap / minWidth;
      return overlapPercentage >= this.overlapPercentage;
    }
    /** Returns the next element to focus within the group */
    findNextElement(direction, focusableGroup, x, y) {
      return focusableGroup.reduce((acc, el) => {
        const deltaX = el.x - x;
        const deltaY = el.y - y;
        const angle = toDeg(Math.atan2(deltaY, deltaX));
        if (this.getDirectionAngle(direction, angle)) {
          if (!acc) acc = el;
          const newDistance = Math.hypot(deltaX, deltaY);
          const oldDistance = Math.hypot(acc.x - x, acc.y - y);
          acc = newDistance < oldDistance ? el : acc;
        }
        return acc;
      }, null);
    }
    /**
     * Get the angle range for the direction
     */
    getDirectionAngle(direction, angle) {
      switch (direction) {
        case "down":
          return angle > 0 && angle < 180;
        case "up":
          return angle > -180 && angle < 0;
        case "left":
          return angle < -90 || angle > 90;
        case "right":
          return angle > -90 && angle < 90;
      }
    }
    /**
     * Registers actions and adds them to the keyboard and gamepad objects
    */
    registerKeyActions() {
      directions.forEach((direction) => {
        const callback = () => {
          if (this.paused) return;
          this.moveFocus(direction);
        };
        actions.register(`move-focus-${direction}`, callback);
        const keys = this.activeKeys[direction];
        for (const key of keys) {
          keyboard.on({
            keys: [key],
            callback: `move-focus-${direction}`,
            type: ["press", "hold"]
          });
          this.registeredKeys.add(key);
        }
        gamepad.on({
          actions: [`playstation.d-pad-${direction}`],
          callback: `move-focus-${direction}`
        });
      });
    }
    /**
     * Resets to the original keys state
     */
    resetKeys() {
      if (!this.enabled) return;
      this.removeKeyActions();
      this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
      this.registerKeyActions();
    }
    /**
     * Adds or override default direction keys with the specified ones
     * @param {Object} customDirections - { up: 'W', left: 'A', right: 'D', down: 'S' }
     * @param options.clearCurrentActiveKeys - If true, overrides all keys. Defaults to false.
     */
    changeKeys(customDirections, options = { clearCurrentActiveKeys: false }) {
      if (!this.enabled) return;
      const customKeysDirections = Object.keys(customDirections);
      if (customKeysDirections.length === 0) return;
      const incorrectDirections = customKeysDirections.filter((direction) => !directions.includes(direction));
      if (incorrectDirections.length > 0) return console.error(`The following directions: [${incorrectDirections.join(", ")}] you have entered are incorrect! `);
      this.clearCurrentActiveKeys = options.clearCurrentActiveKeys;
      this.removeKeyActions();
      for (const direction in this.activeKeys) {
        const newKey = customDirections[direction];
        if (typeof newKey === "string" && !this.activeKeys[direction].includes(newKey)) {
          this.activeKeys[direction].push(newKey.toUpperCase());
        }
      }
      this.registerKeyActions();
    }
    /**
     * Removes the added actions
     */
    removeKeyActions() {
      if (this.registeredKeys.size !== 0) {
        directions.forEach((direction) => {
          const actionName = `move-focus-${direction}`;
          for (const key of this.activeKeys[direction]) {
            keyboard.off([key], actionName);
          }
          actions.remove(actionName);
          gamepad.off([`playstation.d-pad-${direction}`], actionName);
          if (this.clearCurrentActiveKeys) this.activeKeys[direction] = [];
        });
        this.registeredKeys.clear();
        this.clearCurrentActiveKeys = false;
      }
    }
    /**
     * Focuses on the first element in a focusable area
     */
    focusFirst(area = "default") {
      if (!this.enabled) return;
      const navigableElements = this.areas[area].elements;
      if (!navigableElements || navigableElements.length === 0) {
        return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
      }
      this.lastFocusedElement = navigableElements.find((el) => !el.hasAttribute("disabled"));
      if (!this.lastFocusedElement) {
        return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
      }
      this.lastFocusedElement.focus();
      this.areas[area].lastFocusedElement = this.lastFocusedElement;
    }
    /**
     * Focuses on the last element in a focusable area
     */
    focusLast(area = "default") {
      if (!this.enabled) return;
      const navigableElements = this.areas[area].elements;
      if (!navigableElements || navigableElements.length === 0) {
        return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
      }
      let element;
      for (let i = navigableElements.length - 1; i >= 0; i--) {
        if (!navigableElements[i].hasAttribute("disabled")) {
          element = navigableElements[i];
          break;
        }
      }
      this.lastFocusedElement = element;
      if (!this.lastFocusedElement) {
        return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
      }
      this.lastFocusedElement.focus();
      this.areas[area].lastFocusedElement = this.lastFocusedElement;
    }
    /**
     * Changes focus to another area by focusing on the last focused element in that area. If no element has previously been focused, it will focus the first available element.
     */
    switchArea(area) {
      if (!this.enabled) return;
      const lastFocusedInArea = this.getLastFocused(area);
      if (!lastFocusedInArea || lastFocusedInArea.hasAttribute("disabled")) {
        return this.focusFirst(area);
      }
      lastFocusedInArea.focus();
      this.lastFocusedElement = lastFocusedInArea;
    }
    /**
    * Checks if a given element is in a focusable area
    */
    isElementInGroup(element) {
      return Object.values(this.areas).some((group) => group.elements.includes(element));
    }
    /**
     * Checks if the currently active element is in a focusable area
     */
    isActiveElementInGroup() {
      if (!document.activeElement) return false;
      return this.isElementInGroup(document.activeElement);
    }
    /**
     * Removes the focus from a focused element in a group
     */
    clearFocus() {
      if (!this.enabled) return;
      if (this.isActiveElementInGroup()) document.activeElement.blur();
    }
    /**
     * Pauses the spatial navigation functionality
     */
    pause() {
      if (!this.enabled) return;
      this.paused = true;
    }
    /**
     * Resumes the spatial navigation functionality
     */
    resume() {
      if (!this.enabled) return;
      this.paused = false;
    }
  }
  const SpatialNavigation$1 = new SpatialNavigation();
  IM$1.init();
  return SpatialNavigation$1;
}));
