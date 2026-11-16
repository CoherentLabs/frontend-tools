(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.keyboard = factory());
})(this, (function() {
  "use strict";
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
    getGamepadAction({ actions, type }) {
      return _IM.gamepadFunctions.find((gpFunc) => {
        return gpFunc.actions.every((action) => actions.includes(action)) && gpFunc.type === type && gpFunc.actions.length === actions.length;
      });
    }
    /**
     * Get all gamepad functions matching the given button actions
     */
    getGamepadActions(actions, exactMatch = true) {
      return _IM.gamepadFunctions.filter(
        (gpFunc) => gpFunc.actions.every((action) => actions.includes(action)) && (exactMatch ? gpFunc.actions.length === actions.length : true)
      );
    }
    /**
     * Get the index of a gamepad function matching the given button actions
     */
    getGamepadActionIndex(actions) {
      return _IM.gamepadFunctions.findIndex((gpFunc) => gpFunc.actions.every((action) => actions.includes(action)));
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
  const mappings = {
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
  const mappingsKeys = Object.keys(mappings);
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
  const Actions$1 = new Actions();
  class Keyboard {
    constructor() {
      this.eventListenerAttached = false;
      this.keysPressed = /* @__PURE__ */ new Set();
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      if (!window.KEYS) window.KEYS = mappings;
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
      const incorrectKeys = keys.filter((key) => !mappings[key]);
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
      return mappingsKeys.find((key) => mappings[key] === code);
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
        if (typeof callback === "string") return Actions$1.execute(callback, event);
        callback(event);
      });
    }
  }
  const Keyboard$1 = new Keyboard();
  IM$1.init();
  return Keyboard$1;
}));
