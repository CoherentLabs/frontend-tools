var interactionManager = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/interaction-manager.js
  var interaction_manager_exports = {};
  __export(interaction_manager_exports, {
    actions: () => actions_default,
    draggable: () => draggable_default,
    dropzone: () => dropzone_default,
    gamepad: () => gamepad_default,
    keyboard: () => keyboard_default,
    resize: () => resize_default,
    rotate: () => rotate_default,
    spatialNavigation: () => spatial_navigation_default,
    touchGestures: () => touch_gestures_default,
    zoom: () => zoom_default
  });

  // src/utils/global-object.js
  var IM = class _IM2 {
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
     * @returns {KeyboardFunction[]} Array of keyboard function objects
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
     * @param {Object} options
     * @param {Array} options.actions - Array of actions
     * @param {string} options.type - Type of action
     * @returns {GamepadFunction} Gamepad function object from the _IM global object
     */
    getGamepadAction({ actions, type }) {
      return _IM.gamepadFunctions.find((gpFunc) => {
        return gpFunc.actions.every((action) => actions.includes(action)) && gpFunc.type === type && gpFunc.actions.length === actions.length;
      });
    }
    /**
     *
     * @param {Array} actions - Array of actions
     * @returns {GamepadFunction[]} Array of gamepad function objects from the _IM global object
     */
    getGamepadActions(actions, exactMatch = true) {
      return _IM.gamepadFunctions.filter(
        (gpFunc) => gpFunc.actions.every((action) => actions.includes(action)) && (exactMatch ? gpFunc.actions.length === actions.length : true)
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
     * @param {string} action - Action to search for
     * @returns {ActionFunction} Action function object
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
    /**
     * Checks if a callback already exists in a registered function entry
     * @param {KeyboardFunction | GamepadFunction} functionEntry - The function entry to check
     * @param {Function | string} callback - The callback to search for
     * @returns {boolean} True if callback exists, false otherwise
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
    * @param {KeyboardFunction} functionEntry - The entry to remove
    * @returns {void}
    */
    removeKeyboardFunction(functionEntry) {
      const index = _IM.keyboardFunctions.indexOf(functionEntry);
      if (index !== -1) _IM.keyboardFunctions.splice(index, 1);
    }
    /**
     * Removes a gamepad function entry from the registry
     * @param {GamepadFunction} functionEntry - The entry to remove
     * @returns {void}
     */
    removeGamepadFunction(functionEntry) {
      const index = _IM.gamepadFunctions.indexOf(functionEntry);
      if (index !== -1) _IM.gamepadFunctions.splice(index, 1);
    }
  };
  var global_object_default = new IM();

  // src/utils/keyboard-mappings.js
  var keyboard_mappings_default = {
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

  // src/lib_components/actions.js
  var Actions = class {
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
  var actions_default = new Actions();

  // src/lib_components/keyboard.js
  var Keyboard = class {
    /* eslint-disable-next-line require-jsdoc */
    constructor() {
      this.mappings = keyboard_mappings_default;
      this.eventListenerAttached = false;
      this.keysPressed = /* @__PURE__ */ new Set();
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      if (!window.KEYS) window.KEYS = keyboard_mappings_default;
    }
    /**
     * @param {Object} options
     * @param {string[]} options.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {string | Function} options.callback - Function(s) or action(s) to be executed on the key combination
     * @param {string[]} options.type - Type of key action you want to use.
     * @returns {void}
     */
    on(options) {
      options.keys = [
        ...new Set(
          options.keys.map((key) => {
            key = typeof key === "number" ? this.keyCodeToString(key) : key;
            return key.toUpperCase();
          })
        )
      ];
      const incorrectKeys = options.keys.filter((key) => !this.mappings[key]);
      if (incorrectKeys.length > 0) return console.error(`The following keys [${incorrectKeys.join(", ")}] you have entered are incorrect! `);
      if (!this.eventListenerAttached) {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        this.eventListenerAttached = true;
      }
      if (!Array.isArray(options.type)) options.type = [options.type];
      options.type.forEach((type) => {
        const registeredKeys = global_object_default.getKeys(options.keys);
        const existingEntry = registeredKeys.find((key) => key.type === type);
        if (existingEntry) {
          return global_object_default.addCallbackToEntry(existingEntry, options.callback, {
            identifier: `Keys: [${options.keys.join(", ")}]`,
            type
          });
        }
        if (type === "lift" && options.keys.length > 1) return console.error("You can only have a single key trigger an action on lift");
        _IM.keyboardFunctions.push({
          keys: options.keys,
          type,
          callbacks: [options.callback]
        });
      });
    }
    /**
     * Removes either a key combination or a callback from the provided key combination
     * @param {string[]} keys - Key combination you want to remove from the listener
     * @param {string | Function} callback - Callback or action you want to remove 
     * @returns {void}
     */
    off(keys, callback) {
      keys = [
        ...new Set(
          keys.map((key) => {
            key = typeof key === "number" ? this.keyCodeToString(key) : key;
            return key.toUpperCase();
          })
        )
      ];
      const keyCombinations = global_object_default.getKeys(keys);
      let keyCombinationCount = keyCombinations.length;
      if (keyCombinationCount === 0) return console.error("You are trying to remove a non-existent key combination!");
      if (callback) {
        const combinationsWithCallback = keyCombinations.filter((combination) => combination.callbacks.includes(callback));
        if (combinationsWithCallback.length === 0) {
          return console.error("You are trying to remove a non-existent callback from this key combination!");
        }
        combinationsWithCallback.forEach((combination) => {
          const cbIndex = combination.callbacks.indexOf(callback);
          combination.callbacks.splice(cbIndex, 1);
          if (combination.callbacks.length === 0) {
            global_object_default.removeKeyboardFunction(combination);
          }
        });
      } else {
        keyCombinations.forEach((combination) => {
          global_object_default.removeKeyboardFunction(combination);
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
     * @param {KeyboardEvent} event
     * @returns {void}
     * @private
     */
    onKeyDown(event) {
      const keyPressed = this.keyCodeToString(event.keyCode);
      this.keysPressed.add(keyPressed);
      const registeredKeys = global_object_default.getKeys([...this.keysPressed]);
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
     * @param {KeyboardEvent} event
     * @returns {void}
     * @private
     */
    onKeyUp(event) {
      const keyPressed = this.keyCodeToString(event.keyCode);
      this.keysPressed.delete(keyPressed);
      const registeredKeys = global_object_default.getKeys(keyPressed);
      if (registeredKeys.length === 0) return;
      registeredKeys.forEach((key) => {
        if (key.type === "lift" && key.keys.indexOf(keyPressed) !== -1) this.executeCallbacks(event, key);
      });
    }
    /**
     * Convert keyCode to string representing key
     * @param {number} code
     * @returns {string}
     * @private
     */
    keyCodeToString(code) {
      return Object.keys(this.mappings).find((key) => this.mappings[key] === code);
    }
    /**
     * Executes the registered callbacks. Has to be invoked from the onKeyDown and onKeyUp functions
     * @param {KeyboardEvent} event
     * @param {Object} registeredKeys
     * @param {string[]} registeredKeys.keys - Array of keys you want to use, allows only combination of modifier and regular keys
     * @param {(function | string)[]} registeredKeys.callbacks - Functions or actions to be executed on the key combination
     * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
     * @return {void}
     * @private
     */
    executeCallbacks(event, registeredKeys) {
      registeredKeys.callbacks.forEach((callback) => {
        if (typeof callback === "string") return actions_default.execute(callback, event);
        callback(event);
      });
    }
  };
  var keyboard_default = new Keyboard();

  // src/utils/gamepad-mappings.js
  var gamepad_mappings_default = {
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
      "left-sholder": "LEFT_SHOULDER",
      "right-sholder": "RIGHT_SHOULDER",
      "left-sholder-bottom": "LEFT_SHOULDER_BOTTOM",
      "right-sholder-bottom": "RIGHT_SHOULDER_BOTTOM",
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

  // src/lib_components/gamepad.js
  var AXIS_THRESHOLD = 0.9;
  var ACTION_TYPES = ["press", "hold"];
  var Gamepad = class {
    // eslint-disable-next-line require-jsdoc
    constructor() {
      this.mappings = gamepad_mappings_default;
      this.pollingStarted = false;
      this.gamepadEnabled = false;
      this.onGamepadConnected = this.onGamepadConnected.bind(this);
      this.sanitizeAction = this.sanitizeAction.bind(this);
      this.pollingInterval = 200;
      this._pressedAction = null;
    }
    /**
     * Allow gamepads to be connected
     * @param {boolean} isEnabled
     */
    set enabled(isEnabled) {
      this.gamepadEnabled = isEnabled;
      this.gamepadEnabled ? this.init() : this.deinit();
    }
    /**
     * Attaches the event listeners for the gamepads
     * @private
     */
    init() {
      window.addEventListener("gamepadconnected", this.onGamepadConnected);
    }
    /**
     * Removes any attached event listeners for gamepads
     * @private
     */
    deinit() {
      window.removeEventListener("gamepadconnected", this.onGamepadConnected);
    }
    /**
     * Starts polling on the first connected
     * @returns {void}
     * @private
     */
    onGamepadConnected() {
      if (this.pollingStarted) return;
      this.pollingStarted = true;
      this.startPolling();
    }
    /**
     *
     * @param {Object} options
     * @param {string[] | number[]} options.actions - Action to trigger the callback. Can be name of button or joystick
     * @param {'press' | 'hold'} options.type - The type of action to trigger the callback. The available options are hold and press.
     * @param {function | string} options.callback - Function(s) or action(s) to be triggered on the set action
     * @returns {void}
     */
    on(options) {
      options.actions = options.actions.map(this.sanitizeAction);
      const isAxisAlias = this.mappings.axisAliases.some((alias) => options.actions.includes(alias));
      if (!options.type || !ACTION_TYPES.includes(options.type)) options.type = "hold";
      if (options.type === "press" && isAxisAlias) {
        return console.error(`You can't use an axis action with a 'press' type!`);
      }
      if (options.actions.length > 1 && isAxisAlias) {
        return console.error(`You can't use an axis action in a combination with a button action`);
      }
      const existingEntry = global_object_default.getGamepadAction(options);
      if (existingEntry) {
        return global_object_default.addCallbackToEntry(existingEntry, options.callback, {
          identifier: `Actions: [${options.actions.join(", ")}]`,
          type: options.type
        });
      }
      _IM.gamepadFunctions.push({ ...options, callbacks: [options.callback] });
    }
    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove 
     * @returns {void}
     */
    off(actions, callback) {
      const matchingActions = global_object_default.getGamepadActions(actions.map(this.sanitizeAction));
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
            global_object_default.removeGamepadFunction(action);
          }
        });
      } else {
        matchingActions.forEach((action) => global_object_default.removeGamepadFunction(action));
      }
    }
    /**
     * Loop that handles button presses and axis movement
     * @returns {void}
     * @private
     */
    startPolling() {
      const gamepads = navigator.getGamepads();
      if (gamepads.length === 0) {
        this.pollingStarted = false;
        return;
      }
      gamepads.forEach((gamepad, index) => {
        if (!gamepad) return;
        this.handleButtons(gamepad.buttons, index);
        this.handleJoysticks(gamepad.axes);
      });
      setTimeout(this.startPolling.bind(this), this.pollingInterval);
    }
    /**
     *
     * @param {Object[]} buttons
     * @private
     */
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
      const gamepadActions = global_object_default.getGamepadActions(pressedButtons.buttonIndexes, false);
      if (!gamepadActions.length === 0) return;
      if (this._pressedAction) {
        if (!gamepadActions.includes(this._pressedAction)) {
          this.executeCallbacks(this._pressedAction, this._pressedAction.actions);
        }
        this._pressedAction = null;
      }
      gamepadActions.forEach((gamepadAction) => {
        if (gamepadAction.type === "press") {
          this._pressedAction = gamepadAction;
          return;
        }
        this.executeCallbacks(gamepadAction, pressedButtons.buttons);
      });
    }
    /* eslint-disable max-lines-per-function */
    /**
     *
     * @param {number[]} axes
     * @private
     */
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
    /* eslint-enable max-lines-per-function */
    /**
     * Convert button aliases to indexes or keep joystick aliases
     * @param {string | number} action - Actions to convert
     * @returns {string | number} - Converted action strings
     * @private
     */
    sanitizeAction(action) {
      if (typeof action === "number") return action;
      if (this.mappings.axisAliases.includes(action.toLowerCase())) return action.toLowerCase();
      if (typeof action === "string") {
        const key = this.mappings.aliases[action.toLowerCase()];
        if (!key) return console.error(`You have entered a non-supported button alias ${action}`);
        return this.mappings[key];
      }
      return action;
    }
    /**
     * Gets all registered Joystick actions
     * @returns {Object[]} - Joystick actions
     * @private
     */
    getJoystickActions() {
      return _IM.gamepadFunctions.filter((gpFunc) => this.mappings.axisAliases.includes(gpFunc.actions[0]));
    }
    /**
     * Executes the callbacks from the registered action
     * @param {Object} action
     * @param {any} value
     * @returns {void}
     * @private
     */
    executeCallbacks(action, value) {
      action.callbacks.forEach((callback) => {
        if (typeof callback === "string") return actions_default.execute(callback, value);
        callback(value);
      });
    }
  };
  var gamepad_default = new Gamepad();

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

  // src/lib_components/spatial-navigation.js
  var directions = ["down", "up", "left", "right"];
  var defaultKeysState = { up: ["arrow_up"], down: ["arrow_down"], right: ["arrow_right"], left: ["arrow_left"] };
  var SpatialNavigation = class {
    // eslint-disable-next-line require-jsdoc
    constructor() {
      this.enabled = false;
      this.navigatableElements = { default: { elements: [], distance: 0, overflow: { x: 0, y: 0 } } };
      this.registeredKeys = /* @__PURE__ */ new Set();
      this.clearCurrentActiveKeys = false;
      this.overlapPercentage = 0.5;
      this.lastFocusedElement = null;
      this.paused = false;
    }
    /**
     * Initializes the spatial navigation
     * @param {string[]|Object[]|HTMLElement[]} navigatableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigatableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigatableElements[].elements - Array of selector strings or HTMLElement references
     * @param {number} overlap - Overlap percentage (0-1) for determining if elements are on the same axis
     * @returns {void}
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
    init(navigatableElements = [], overlap) {
      if (this.enabled) return;
      this.enabled = true;
      this.add(navigatableElements);
      this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
      this.registerKeyActions();
      if (overlap && 0 <= overlap && overlap <= 1) {
        this.overlapPercentage = overlap;
      }
    }
    /**
     * Deinitialize the spatial navigation
     * @returns {void}
     */
    deinit() {
      if (!this.enabled) return;
      this.enabled = false;
      this.navigatableElements = { default: { elements: [], distance: 0, overflow: { x: 0, y: 0 } } };
      this.removeKeyActions();
      this.overlapPercentage = 0.5;
      this.lastFocusedElement = null;
    }
    /**
     * Add new elements to area or new area
     * @param {string[]|Object[]|HTMLElement[]} navigatableElements - Array of selector strings, objects with area/elements, or HTMLElement references
     * @param {string} navigatableElements[].area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navigatableElements[].elements - Array of selector strings or HTMLElement references
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
    add(navigatableElements) {
      if (!this.enabled) return;
      if (navigatableElements.every((el) => el instanceof HTMLElement)) {
        navigatableElements.forEach((element) => this.makeFocusable(element));
        this.setNavigationAreaProperties("default", navigatableElements);
        return;
      }
      navigatableElements.forEach((navArea) => {
        typeof navArea === "string" ? this.handleString(navArea) : this.handleObject(navArea);
      });
    }
    /**
     * Remove an area from the focusable groups
     * @param {string} area area to be removed
     * @returns {void}
     */
    remove(area = "default") {
      if (!this.enabled) return;
      if (!this.navigatableElements[area]) return console.error(`The area '${area}' you are trying to remove doesn't exist`);
      this.navigatableElements[area].elements.forEach((element) => element.removeAttribute("tabindex"));
      delete this.navigatableElements[area];
    }
    /**
     * Get elements from selector and save them to the default group
     * @param {string} navArea
     * @returns {void}
     */
    handleString(navArea) {
      const domElements = document.querySelectorAll(navArea);
      if (domElements.length === 0) return console.error(`${navArea} is either not a correct selector or the element is not present in the DOM.`);
      domElements.forEach(this.makeFocusable);
      this.setNavigationAreaProperties("default", domElements);
    }
    /**
     * Gets elements from object and saves them to a focusable group
     * @param {Object} navArea - Navigation area configuration
     * @param {string} navArea.area - Name of the navigation area
     * @param {(string|HTMLElement)[]} navArea.elements - Array of selector strings or HTMLElement references
     * @returns {void}
     */
    handleObject(navArea) {
      const domElements = navArea.elements.reduce((acc, el) => {
        if (el instanceof HTMLElement) {
          acc.push(el);
          this.makeFocusable(el);
          return acc;
        }
        const elements = document.querySelectorAll(el);
        elements.forEach(this.makeFocusable);
        acc.push(...elements);
        return acc;
      }, []);
      if (domElements.length === 0) return console.error(`${navArea.elements.join(", ")} are either not a correct selectors or the elements are not present in the DOM.`);
      if (!this.navigatableElements[navArea.area]) {
        this.navigatableElements[navArea.area] = { elements: [], distance: 0 };
      }
      this.setNavigationAreaProperties(navArea.area, domElements);
    }
    /**
     * @param {string} area - The area to set the properties for
     * @param {HTMLElement[]} domElements - The elements to be added to the area
     */
    setNavigationAreaProperties(area, domElements) {
      this.navigatableElements[area].elements.push(...domElements);
      this.navigatableElements[area].distance = this.getElementsDistance(this.navigatableElements[area].elements);
      this.navigatableElements[area].overflow = this.setOverflowValues(domElements[0].parentElement);
    }
    /**
     * Calculates the distance between the provided elements and return the max distance
     * @param {HTMLElement[]} elements
     * @returns {number} - The max distance between the elements
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
     * @param {HTMLElement} element
     */
    makeFocusable(element) {
      element.setAttribute("tabindex", 1);
    }
    /**
     * Returns the valid focusable elements in the navigatable area
     * @param {HTMLElement} targetElement
     * @param {HTMLElement[]} elements
     * @param {number} distance
     * @returns {NavigationObject[]}
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
      return Object.values(this.navigatableElements).find((area) => {
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
     * @returns {NavigationObject}
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
     * @returns {void}
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
      }
    }
    /** Filters the focusable group by the relevant axis by chacking for same axis overlap
    * @param {string} direction
    * @param {Array} focusableGroup
    * @param {Object} currentElement
    * @returns {Array}
    */
    filterGroupByCurrentAxis(direction, focusableGroup, currentElement) {
      return focusableGroup.filter((element) => {
        if (direction === "left" || direction === "right") return this.isOverlappingX(currentElement, element);
        return this.isOverlappingY(currentElement, element);
      });
    }
    /** Compares the Y coordinates of two elements and checks for overlap by the specified overlap value
    * @param {Object} currentElement
    * @param {Object} nextElement
    * @returns {boolean}
    */
    isOverlappingX(currentElement, nextElement) {
      const lowerBoundary = Math.min(currentElement.y + currentElement.height, nextElement.y + nextElement.height);
      const topBoundary = Math.max(currentElement.y, nextElement.y);
      const verticalOverlap = Math.max(0, lowerBoundary - topBoundary);
      const minHeight = Math.min(currentElement.height, nextElement.height);
      const overlapPercentage = verticalOverlap / minHeight;
      return overlapPercentage >= this.overlapPercentage;
    }
    /** Compares the X coordinates of two elements and checks for overlap by the specified overlap value
    * @param {Object} currentElement
    * @param {Object} nextElement
    * @returns {boolean}
    */
    isOverlappingY(currentElement, nextElement) {
      const rightBoundary = Math.min(currentElement.x + currentElement.width, nextElement.x + nextElement.width);
      const leftBoundary = Math.max(currentElement.x, nextElement.x);
      const horizontalOverlap = Math.max(0, rightBoundary - leftBoundary);
      const minWidth = Math.min(currentElement.width, nextElement.width);
      const overlapPercentage = horizontalOverlap / minWidth;
      return overlapPercentage >= this.overlapPercentage;
    }
    /** Returns the next element to focus within the group
    * @param {string} direction
    * @param {Array} focusableGroup
    * @param {number} x
    * @param {number} y
    * @returns {Object}
    */
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
     * @param {string} direction
     * @param {number} angle
     * @returns {boolean}
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
        actions_default.register(`move-focus-${direction}`, callback);
        const keys = this.activeKeys[direction];
        for (const key of keys) {
          keyboard_default.on({
            keys: [key],
            callback: `move-focus-${direction}`,
            type: ["press", "hold"]
          });
          this.registeredKeys.add(key);
        }
        gamepad_default.on({
          actions: [`playstation.d-pad-${direction}`],
          callback: `move-focus-${direction}`
        });
      });
    }
    /**
     * Resets to the original keys state
     */
    resetKeys() {
      this.removeKeyActions();
      this.activeKeys = JSON.parse(JSON.stringify(defaultKeysState));
      this.registerKeyActions();
    }
    /**
     * Adds or override default direction keys with the specified ones
     * @param {Object} customDirections - { up: 'W', left: 'A', right: 'D', down: 'S' }
     * @param {Object} options - Optional settings.
     * @param {Boolean} options.clearCurrentActiveKeys - If true, overrides all keys. Defaults to false.
     * @returns {void}
     */
    changeKeys(customDirections, options = { clearCurrentActiveKeys: false }) {
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
            keyboard_default.off([key], actionName);
          }
          actions_default.remove(actionName);
          gamepad_default.off([`playstation.d-pad-${direction}`], actionName);
          if (this.clearCurrentActiveKeys) this.activeKeys[direction] = [];
        });
        this.registeredKeys.clear();
        this.clearCurrentActiveKeys = false;
      }
    }
    /**
     * Focuses on the first element in a focusable area
     * @param {string} area
     * @returns {void}
     */
    focusFirst(area = "default") {
      const navigatableElements = this.navigatableElements[area].elements;
      if (!navigatableElements || navigatableElements.length === 0) {
        return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
      }
      this.lastFocusedElement = navigatableElements.find((el) => !el.hasAttribute("disabled"));
      if (!this.lastFocusedElement) {
        return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
      }
      this.lastFocusedElement.focus();
    }
    /**
     * Focuses on the last element in a focusable area
     * @param {string} area
     * @returns {void}
     */
    focusLast(area = "default") {
      if (!this.enabled) return;
      const navigatableElements = this.navigatableElements[area].elements;
      if (!navigatableElements || navigatableElements.length === 0) {
        return console.error(`The area '${area}' you are trying to focus doesn't exist or the spatial navigation hasn't been initialized`);
      }
      let element;
      for (let i = navigatableElements.length - 1; i >= 0; i--) {
        if (!navigatableElements[i].hasAttribute("disabled")) {
          element = navigatableElements[i];
          break;
        }
      }
      this.lastFocusedElement = element;
      if (!this.lastFocusedElement) {
        return console.error(`The area '${area}' you are trying to focus doesn't have any focusable elements`);
      }
      this.lastFocusedElement.focus();
    }
    /**
     * Changes focus to another area
     * @param {string} area
     */
    switchArea(area) {
      this.focusFirst(area);
    }
    /**
    * Checks if a given element is in a focusable area
    * @param {HTMLElement} element
    * @returns {boolean}
    */
    isElementInGroup(element) {
      return Object.values(this.navigatableElements).some((group) => group.elements.includes(element));
    }
    /**
     * Checks if the currently active element is in a focusable area
     * @returns {boolean}
     */
    isActiveElementInGroup() {
      return this.isElementInGroup(document.activeElement);
    }
    /**
     * Removes the focus from a focused element in a group
     */
    clearFocus() {
      if (this.isActiveElementInGroup()) document.activeElement.blur();
    }
    /**
     * Pauses the spatial navigation functionality
     */
    pause() {
      this.paused = true;
    }
    /**
     * Resumes the spatial navigation functionality
     */
    resume() {
      this.paused = false;
    }
  };
  var spatial_navigation_default = new SpatialNavigation();

  // src/utils/drag-base.js
  var DragBase = class {
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
  var drag_base_default = DragBase;

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

  // src/lib_components/touch-gestures.js
  var MULTIPLE_TOUCHES_MIN_NUMBER = 2;
  var TouchGestures = class {
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
        const fullRotation2 = 360;
        const rotationOffset2 = 90;
        const offsetY = this.activeTouches.get(0).clientY - this.activeTouches.get(1).clientY;
        const offsetX = this.activeTouches.get(0).clientX - this.activeTouches.get(1).clientX;
        return (toDeg(Math.atan2(offsetY, offsetX)) + fullRotation2 + rotationOffset2) % fullRotation2;
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
  var touch_gestures_default = new TouchGestures();

  // src/lib_components/draggable.js
  var AXIS = ["x", "y"];
  var Draggable = class extends drag_base_default {
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
  var draggable_default = Draggable;

  // src/lib_components/dropzone.js
  var Dropzone = class extends drag_base_default {
    /**
     *
     * @typedef {Object} DropzoneOptions
     * @property {string} element
     * @property {string[]} dropzones
     * @property {string} draggedClass
     * @property {string} dropzoneActiveClass
     * @property {'switch'|'add'|'shift'|'none'} dropType If there is already an element in the dropzone
     * @property {function} onDragStart
     * @property {function} onDragMove
     * @property {function} onDragEnd
     * @property {function} onDropZoneEnter
     * @property {function} onDropZoneLeave
     * @property {function} onDrop
     */
    /**
     *
     * @param {DropzoneOptions} options
     */
    constructor(options) {
      super(options);
      const hash = createHash();
      this.dropzones = [];
      this.draggedOver = null;
      this.actionName = `drag-and-drop-${hash}`;
      this.automaticAction = `move-to-${hash}`;
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
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
      this.createDropzones();
      if (this.dropzones.length === 0) return;
      this.dropzones.forEach((dropzone) => {
        dropzone.addEventListener("mouseenter", this.onMouseEnter);
        dropzone.addEventListener("mouseleave", this.onMouseLeave);
      });
      this.registerDragActions();
      this.enabled = true;
    }
    /**
     * Deinitializes the dragging
     * @returns {void}
     */
    deinit() {
      if (!this.enabled) return;
      this.draggableElements.forEach((element) => element.removeEventListener("mousedown", this.onMouseDown));
      this.dropzones.forEach((dropzone) => {
        dropzone.removeEventListener("mouseenter", this.onMouseEnter);
        dropzone.removeEventListener("mouseleave", this.onMouseLeave);
      });
      this.removeActions();
      this.enabled = false;
    }
    /**
     * mousedown event handler
     * @param {MouseEvent} event
     */
    onMouseDown(event) {
      this.draggedElement = event.currentTarget;
      this.draggedElement.style.position = "absolute";
      this.draggedElement.style.pointerEvents = "none";
      this.setPointerOffset(event.clientX, event.clientY, this.draggedElement);
      actions_default.execute(this.actionName, {
        x: event.clientX + this.bodyScrollOffset.x - this.offset.x,
        y: event.clientY + this.bodyScrollOffset.y - this.offset.y,
        index: this.draggedItemIndex
      });
      this.options.dragStyle && this.draggedElement.classList.add(this.options.dragStyle);
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
      this.draggedElement.style.position = "";
      this.draggedElement.style.pointerEvents = "";
      this.draggedElement.style.left = "";
      this.draggedElement.style.top = "";
      this.options.onDragEnd && this.options.onDragEnd(this.draggedElement);
      this.options.dragStyle && this.draggedElement.classList.remove(this.options.dragStyle);
      this.draggedOver && this.handleDrop();
      this.draggedElement = null;
    }
    /**
     * Handler for the mouseenter event
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseEnter(event) {
      if (!this.draggedElement) return;
      this.draggedOver = event.currentTarget;
      this.options.dropzoneActiveClass && this.draggedOver.classList.add(this.options.dropzoneActiveClass);
    }
    /**
     * Handler for the mouseleave event
     * @returns {void}
     */
    onMouseLeave() {
      if (!this.draggedElement) return;
      if (this.options.dropzoneActiveClass && this.draggedOver) {
        this.draggedOver.classList.remove(this.options.dropzoneActiveClass);
      }
      this.draggedOver = null;
    }
    /**
     * Register dragging as an action to be able to use it externally
     */
    registerDragActions() {
      actions_default.register(this.actionName, ({ x, y, index }) => {
        if (!this.draggableElements[index]) return console.error(`There is no draggable element at index ${index}`);
        this.draggableElements[index].style.left = `${x}px`;
        this.draggableElements[index].style.top = `${y}px`;
        this.options.onDragMove && this.options.onDragMove({ x, y });
      });
      actions_default.register(this.automaticAction, this.automaticMove.bind(this));
      this.actionsRegistered = true;
    }
    /**
     * Removes the registered actions
     */
    removeActions() {
      actions_default.remove(this.actionName);
      actions_default.remove(this.automaticAction);
    }
    /* eslint-disable max-lines-per-function*/
    /**
     * Adds touch events to the draggable elements
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
              const elementOver = document.elementFromPoint(x, y);
              let dropzone = this.options.dropzones.reduce((acc, dropzone2) => {
                if (acc) return acc;
                return acc = elementOver.closest(dropzone2);
              }, null);
              if (!dropzone) {
                dropzone = this.dropzones.includes(elementOver) ? elementOver : null;
              }
              if (dropzone) {
                this.onMouseEnter({ currentTarget: dropzone });
                return;
              }
              this.onMouseLeave();
            },
            onDragEnd: () => {
              this.onMouseUp();
            }
          })
        );
      });
    }
    /* eslint-enable max-lines-per-function */
    /**
     * Removes the touch gestures
     */
    removeTouchEvents() {
      this.touchEvents.forEach((event) => event.remove());
      this.touchEvents = [];
    }
    /**
     * Automatically drags an element to a dropzone
     * @param {Object} options
     * @param {number} options.elementIndex The index of the element you want to move
     * @param {number} options.dropzoneIndex The index of the dropzone you want to move the element to
     */
    automaticMove({ elementIndex, dropzoneIndex }) {
      const { x, y } = this.dropzones[dropzoneIndex].getBoundingClientRect();
      const { x: elementX, y: elementY } = this.draggableElements[elementIndex].getBoundingClientRect();
      const direction = {
        x: Math.sign(x - elementX),
        y: Math.sign(y - elementY)
      };
      this.draggableElements[elementIndex].style.position = "absolute";
      const loop = (newX, newY) => {
        if (newX === x && newY === y) {
          this.dropzones[dropzoneIndex].appendChild(this.draggableElements[elementIndex]);
          this.draggableElements[elementIndex].style.position = "";
          return;
        }
        newX = newX !== x ? direction.x + newX : newX;
        newY = newY !== y ? direction.y + newY : newY;
        this.draggableElements[elementIndex].style.left = `${newX}px`;
        this.draggableElements[elementIndex].style.top = `${newY}px`;
        if (newX !== x || newY !== y) requestAnimationFrame(() => loop(newX, newY));
      };
      loop(elementX, elementY);
    }
    /**
     * Saves the dropzones
     */
    createDropzones() {
      this.dropzones = this.options.dropzones.reduce((acc, dropzone) => {
        const dropzoneElements = [...document.querySelectorAll(dropzone)];
        if (dropzoneElements.length === 0) {
          console.error(`${dropzone} is not a valid html element to be used as a dropzone`);
        }
        return acc.concat(dropzoneElements);
      }, []);
    }
    /**
     * Handler when you drop the dragged item
     */
    handleDrop() {
      let dropType = this.options.dropType;
      const eventData = {
        preventDefault: () => {
          dropType = "ignore";
        },
        target: this.draggedElement,
        dropzone: this.draggedOver
      };
      this.options.onDrop && this.options.onDrop(eventData);
      if (dropType === "ignore") return;
      if (this.draggedOver.children.length === 0) dropType = "add";
      switch (dropType) {
        case "add":
          this.draggedOver.appendChild(this.draggedElement);
          break;
        case "shift":
          this.shiftElements();
          break;
        case "switch":
          this.draggedElement.parentNode.appendChild(this.draggedOver.children[0]);
          this.draggedOver.appendChild(this.draggedElement);
          break;
        case "none":
          break;
        default:
          break;
      }
      this.onMouseLeave();
    }
    /**
     * Shifts the element to the nearest empty space
     */
    shiftElements() {
      const dropzoneIndex = this.dropzones.findIndex((dropzone) => dropzone === this.draggedOver);
      const dropzoneChildren = this.dropzones.map((dropzone) => {
        if (dropzone.children[0] === this.draggedElement) return [];
        return [...dropzone.children];
      });
      const closestEmptyIndex = dropzoneChildren.reduce((acc, el, index) => {
        if (el.length === 0) acc = Math.abs(dropzoneIndex - index) < Math.abs(dropzoneIndex - acc) ? index : acc;
        return acc;
      }, 1e5);
      const directionEmpty = Math.sign(dropzoneIndex - closestEmptyIndex) > 0 ? 0 : 1;
      const directionDropzone = Math.sign(dropzoneIndex - closestEmptyIndex) < 0 ? 0 : 1;
      dropzoneChildren.splice(dropzoneIndex + directionDropzone, 0, [this.draggedElement]);
      dropzoneChildren.splice(closestEmptyIndex + directionEmpty, 1);
      dropzoneChildren.forEach((children, index) => {
        children.forEach((child) => this.dropzones[index].appendChild(child));
      });
    }
  };
  var dropzone_default = Dropzone;

  // src/lib_components/rotate.js
  var fullRotation = 360;
  var rotationOffset = 90;
  var Rotate = class {
    /**
     *
     * @param {Object} options
     * @param {string} options.element
     * @param {number} options.snapAngle Snaps the rotating element to increments of that angle
     * @param {function} options.onRotation
     */
    constructor(options) {
      const hash = createHash();
      this.options = options;
      this.rotatingElement = null;
      this.elementPosition = { x: 0, y: 0 };
      this.angle = 0;
      this.enabled = false;
      this.actionName = `rotate-${hash}`;
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this._touchEnabled = false;
      this.touchEvents = null;
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
     * Initializes the rotation
     * @returns {void}
     */
    init() {
      if (this.enabled) return;
      this.rotatingElement = this.rotatingElement || document.querySelector(this.options.element);
      if (!this.rotatingElement) return console.error(`${this.options.element} is not a valid element selector`);
      this.rotatingElement.addEventListener("mousedown", this.onMouseDown);
      this.registerAction();
      this.enabled = true;
    }
    /**
     * Deinitilizes the rotation
     * @returns {void}
     */
    deinit() {
      if (!this.enabled) return;
      this.rotatingElement.removeEventListener("mousedown", this.onMouseDown);
      this.removeActions();
      this.enabled = false;
    }
    /**
     * Handles the mousedown event
     * @param {MouseEvent} event
     */
    onMouseDown(event) {
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
      const { x, y, height, width } = this.rotatingElement.getBoundingClientRect();
      this.elementPosition = { x: x + width / 2, y: y + height / 2 };
      const angle = this.getAngle(event.clientX, event.clientY);
      this.initalAngle = angle - this.angle;
    }
    /**
     * Handles the mousemove event
     * @param {MouseEvent} event
     */
    onMouseMove(event) {
      this.angle = this.getAngle(event.clientX, event.clientY) - this.initalAngle;
      if (this.options.snapAngle) {
        this.angle = Math.floor(this.angle / this.options.snapAngle) * this.options.snapAngle;
      }
      actions_default.execute(this.actionName, this.angle);
    }
    /**
     * Handles the mouseup event
     */
    onMouseUp() {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
    /**
     * Registers the actions
     */
    registerAction() {
      actions_default.register(this.actionName, (angle) => {
        this.rotatingElement.style.transform = `rotate(${angle}deg)`;
        this.options.onRotation && this.options.onRotation(angle < 0 ? fullRotation + angle : angle);
      });
    }
    /**
     * Removes the action
     */
    removeActions() {
      actions_default.remove(this.actionName);
    }
    /**
     * Add rotate touch events
     */
    addTouchEvents() {
      this.touchEvents = touch_gestures_default.drag({
        element: this.rotatingElement,
        onDragStart: ({ x, y }) => {
          this.onMouseDown({ clientX: x, clientY: y });
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
      this.touchEvents.remove();
      this.touchEvents = null;
    }
    /**
     * Finds the angle from the mouse coordinates based on the center of the element that is rotating
     * @param {number} x
     * @param {number} y
     * @returns {number} Angle in degrees
     */
    getAngle(x, y) {
      const offsetX = x - this.elementPosition.x;
      const offsetY = y - this.elementPosition.y;
      return (toDeg(Math.atan2(offsetY, offsetX)) + fullRotation + rotationOffset) % fullRotation;
    }
  };
  var rotate_default = Rotate;

  // src/lib_components/resize.js
  var Resize = class {
    /**
     *
     * @typedef {Object} ResizeOptions
     * @property {string} element
     * @property {number} edgeWidth
     * @property {function} onWidthChange
     * @property {function} onHeightChange
     * @property {number} widthMin
     * @property {number} widthMax
     * @property {number} heightMin
     * @property {number} heightMax
     */
    /**
     *
     * @param {ResizeOptions} options
     */
    constructor(options) {
      this.options = options;
      this.options.edgeWidth = options.edgeWidth || 5;
      this.options.heightMin = this.options.heightMin || 50;
      this.options.heightMax = this.options.heightMax || window.innerHeight;
      this.options.widthMin = this.options.widthMin || 50;
      this.options.widthMax = this.options.widthMax || window.innerWidth;
      this.resizableElement = null;
      this.enabled = false;
      this.activeEdge = null;
      this.edges = {
        bottom: null,
        right: null,
        bottomRight: null
      };
      const hash = createHash();
      this.heightAction = `resize-height-${hash}`;
      this.widthAction = `resize-width-${hash}`;
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this._touchEnabled = false;
      this.touchEvents = null;
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
     * Initializes the resizing
     * @returns {void}
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
     * @returns {void}
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
     * @param {MouseEvent} event
     * @returns {void}
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
     * @param {MouseEvent} event
     */
    onMouseMove(event) {
      const offsetX = event.clientX - this.elementRect.x;
      const offsetY = event.clientY - this.elementRect.y;
      switch (this.activeEdge) {
        case "bottom":
          actions_default.execute(this.heightAction, offsetY);
          this.options.onHeightChange && this.options.onHeightChange(offsetY);
          break;
        case "right":
          actions_default.execute(this.widthAction, offsetX);
          this.options.onWidthChange && this.options.onWidthChange(offsetX);
          break;
        case "bottomRight":
          actions_default.execute(this.heightAction, offsetY);
          actions_default.execute(this.widthAction, offsetX);
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
      this.touchEvents = touch_gestures_default.drag({
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
      this.touchEvents.remove();
      this.touchEvents = null;
    }
    /**
     * Sets the active edge when resizing. If there is no edge it returns null
     * @param {HTMLElement} element
     * @returns {string|null}
     */
    setEdge(element) {
      if (element.dataset.edge) return element.dataset.edge;
      return null;
    }
    /**
     * Checks if the element you are trying to resize has already position relative or absolute set, so it doesn't overwrite them
     * @returns {void}
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
      actions_default.register(this.heightAction, (height) => {
        this.resizableElement.style.height = `${clamp(height, this.options.heightMin, this.options.heightMax)}px`;
        this.edges.right.style.height = `${clamp(height, this.options.heightMin, this.options.heightMax) - this.options.edgeWidth}px`;
      });
      actions_default.register(this.widthAction, (width) => {
        this.resizableElement.style.width = `${clamp(width, this.options.widthMin, this.options.widthMax)}px`;
        this.edges.bottom.style.width = `${clamp(width, this.options.widthMin, this.options.widthMax) - this.options.edgeWidth}px`;
      });
    }
    /**
     * Removes the registered actions
     */
    removeActions() {
      actions_default.remove(this.heightAction);
      actions_default.remove(this.widthAction);
    }
  };
  var resize_default = Resize;

  // src/lib_components/zoom.js
  var Zoom = class {
    /**
     * @typedef {Object} ZoomOptionsObject
     * @property {string} options.element
     * @property {number} options.minZoom
     * @property {number} options.maxZoom
     * @property {number} options.zoomFactor
     * @property {function} options.onZoom
     */
    /**
     *
     * @param {ZoomOptionsObject} options
     */
    constructor(options) {
      const hash = (Math.random() + 1).toString(36).substring(7);
      this.options = options;
      this.options.maxZoom = this.options.maxZoom || Infinity;
      this.options.minZoom = this.options.minZoom || 0.1;
      this.options.zoomFactor = this.options.zoomFactor || 0.1;
      this.enabled = false;
      this.actionName = `pan-and-zoom-${hash}`;
      this.offset = { x: 0, y: 0 };
      this.transform = {
        x: 0,
        y: 0,
        scale: 1
      };
      this.onWheel = this.onWheel.bind(this);
      this._touchEnabled = false;
      this.touchEvents = null;
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
     * Initialize the pan and zoom
     * @returns {void}
     */
    init() {
      if (this.enabled) return;
      this.zoomableElement = document.querySelector(this.options.element);
      if (!this.zoomableElement) return console.error(`${this.options.element} is not a correct element selector`);
      this.zoomableElement.addEventListener("wheel", this.onWheel);
      this.registerActions();
      this.zoomableElement.style.transformOrigin = "top left";
      this.enabled = true;
    }
    /**
     * Deinitilize the pan and zoom
     * @returns {void}
     */
    deinit() {
      if (!this.enabled) return;
      this.zoomableElement.removeEventListener("wheel", this.onWheel);
      this.removeActions();
      this.enabled = false;
    }
    /**
     * Handles the wheel event
     * @param {MouseEvent} event
     */
    onWheel(event) {
      event.preventDefault();
      actions_default.execute(this.actionName, {
        x: event.clientX,
        y: event.clientY,
        zoomDirection: Math.sign(event.deltaY)
      });
    }
    /**
     * Registers the actions for the pan and zoom
     */
    registerActions() {
      actions_default.register(this.actionName, ({ x, y, zoomDirection }) => {
        const offset = this.calculateOffsets(x, y);
        this.options.onZoom && this.options.onZoom();
        const scale = (this.transform.scale - zoomDirection * this.options.zoomFactor).toFixed(5);
        if (scale < this.options.minZoom || scale > this.options.maxZoom) return;
        const zoomPoint = {
          x: offset.x / this.transform.scale,
          y: offset.y / this.transform.scale
        };
        const transform = this.transform;
        transform.x += zoomPoint.x * (this.transform.scale - scale);
        transform.y += zoomPoint.y * (this.transform.scale - scale);
        transform.scale = scale;
        this.zoomableElement.style.transform = `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y})`;
        this.transform = transform;
      });
    }
    /**
     * Removes the registered actions
     */
    removeActions() {
      actions_default.remove(this.actionName);
    }
    /**
     * Add pinch and stretch touch events
     */
    addTouchEvents() {
      this.touchEvents = touch_gestures_default.pinch({
        element: this.zoomableElement,
        callback: ({ pinchDelta, midpoint }) => {
          actions_default.execute(this.actionName, {
            x: midpoint.x,
            y: midpoint.y,
            zoomDirection: Math.sign(pinchDelta) * -1
          });
        }
      });
    }
    /**
     * Removes the touch events
     */
    removeTouchEvents() {
      this.touchEvents.remove();
      this.touchEvents = null;
    }
    /**
     * Calculates the mouse coordinates inside the element
     * @param {number} x
     * @param {number} y
     * @returns {Object}
     */
    calculateOffsets(x, y) {
      const elementRect = this.zoomableElement.getBoundingClientRect();
      return {
        x: x - elementRect.x,
        y: y - elementRect.y
      };
    }
  };
  var zoom_default = Zoom;

  // src/interaction-manager.js
  global_object_default.init();
  return __toCommonJS(interaction_manager_exports);
})();
