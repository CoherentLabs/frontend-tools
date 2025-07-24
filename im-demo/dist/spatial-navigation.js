var spatialNavigation = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils/utility-functions.js
  function toDeg(rad) {
    return rad * 180 / Math.PI;
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

  // src/utils/keyboard-mappings.js
  var keyboard_mappings_default;
  var init_keyboard_mappings = __esm({
    "src/utils/keyboard-mappings.js"() {
      keyboard_mappings_default = {
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
    }
  });

  // src/lib_components/keyboard.js
  var Keyboard, keyboard_default;
  var init_keyboard = __esm({
    "src/lib_components/keyboard.js"() {
      init_global_object();
      init_keyboard_mappings();
      init_actions();
      Keyboard = class {
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
         * @param {function | string} options.callback - Function or action to be executed on the key combination
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
            if (registeredKeys.length > 0 && registeredKeys.some((key) => key.type === type)) {
              return console.error("You are trying to overwrite an existing key combination! To do that, first remove it with .off([keys]) then add it again");
            }
            if (type === "lift" && options.keys.length > 1) return console.error("You can only have a single key trigger an action on lift");
            _IM.keyboardFunctions.push({ ...options, type });
          });
        }
        /**
         *
         * @param {string[]} keys - Key combination you want to remove from the listener
         * @returns {void}
         */
        off(keys) {
          keys = [
            ...new Set(
              keys.map((key) => {
                key = typeof key === "number" ? this.keyCodeToString(key) : key;
                return key.toUpperCase();
              })
            )
          ];
          let keyCombinationCount = global_object_default.getKeys(keys).length;
          if (keyCombinationCount === 0) return console.error("You are trying to remove a non-existent key combination!");
          while (keyCombinationCount > 0) {
            const keyCombinationIndex = global_object_default.getKeysIndex(keys);
            _IM.keyboardFunctions.splice(keyCombinationIndex, 1);
            keyCombinationCount--;
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
            this.executeCallback(event, key);
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
            if (key.type === "lift" && key.keys.indexOf(keyPressed) !== -1) this.executeCallback(event, key);
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
         * @param {function | string} registeredKeys.callback - Function or action to be executed on the key combination
         * @param {('press'|'hold'|'lift')} registeredKeys.type - Type of key action you want to use.
         * @return {void}
         * @private
         */
        executeCallback(event, registeredKeys) {
          if (typeof registeredKeys.callback === "string") return actions_default.execute(registeredKeys.callback, event);
          registeredKeys.callback(event);
        }
      };
      keyboard_default = new Keyboard();
    }
  });

  // src/utils/gamepad-mappings.js
  var gamepad_mappings_default;
  var init_gamepad_mappings = __esm({
    "src/utils/gamepad-mappings.js"() {
      gamepad_mappings_default = {
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
    }
  });

  // src/lib_components/gamepad.js
  var AXIS_THRESHOLD, ACTION_TYPES, Gamepad, gamepad_default;
  var init_gamepad = __esm({
    "src/lib_components/gamepad.js"() {
      init_gamepad_mappings();
      init_global_object();
      init_actions();
      AXIS_THRESHOLD = 0.9;
      ACTION_TYPES = ["press", "hold"];
      Gamepad = class {
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
         * @param {function} options.callback - Callback to trigger on the set action
         * @param {number} options.gamepadNumber - The number of the gamepad that you want to trigger the callback on. Use -1 for all gamepads
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
          if (global_object_default.getGamepadAction(options)) {
            return console.error(
              "You have already registered a callback for this action. If you want to overwrite it, remove it first with .off([actions])"
            );
          }
          _IM.gamepadFunctions.push(options);
        }
        /**
         * Removes registered actions
         * @param {Array} actions - Array containing the action you want to remove
         * @returns {void}
         */
        off(actions) {
          const actionsIndex = global_object_default.getGamepadActionIndex(actions.map(this.sanitizeAction));
          if (actionsIndex === -1) return console.error("You are trying to remove a non-existent action!");
          _IM.gamepadFunctions.splice(actionsIndex, 1);
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
          const gamepadActions = global_object_default.getGamepadActions(pressedButtons.buttonIndexes);
          if (!gamepadActions.length === 0) return;
          if (this._pressedAction) {
            if (!gamepadActions.includes(this._pressedAction)) {
              this.executeCallback(this._pressedAction, this._pressedAction.actions);
            }
            this._pressedAction = null;
          }
          gamepadActions.forEach((gamepadAction) => {
            if (gamepadAction.type === "press") {
              this._pressedAction = gamepadAction;
              return;
            }
            this.executeCallback(gamepadAction, pressedButtons.buttons);
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
                return this.executeCallback(jAction, [axes[0], axes[1]]);
              case "right.joystick":
                return this.executeCallback(jAction, [axes[2], axes[3]]);
              case "left.joystick.down":
                if (axes[1] > AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[0], axes[1]]);
                break;
              case "left.joystick.up":
                if (axes[1] < -AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[0], axes[1]]);
                break;
              case "left.joystick.left":
                if (axes[0] < -AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[0], axes[1]]);
                break;
              case "left.joystick.right":
                if (axes[0] > AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[0], axes[1]]);
                break;
              case "right.joystick.down":
                if (axes[3] > AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[2], axes[3]]);
                break;
              case "right.joystick.up":
                if (axes[3] < -AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[2], axes[3]]);
                break;
              case "right.joystick.left":
                if (axes[2] < -AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[2], axes[3]]);
                break;
              case "right.joystick.right":
                if (axes[2] > AXIS_THRESHOLD) return this.executeCallback(jAction, [axes[2], axes[3]]);
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
         * Executes the callback from the registered action
         * @param {Object} action
         * @param {any} value
         * @returns {void}
         * @private
         */
        executeCallback(action, value) {
          if (typeof action.callback === "string") return actions_default.execute(action.callback, value);
          action.callback(value);
        }
      };
      gamepad_default = new Gamepad();
    }
  });

  // src/lib_components/spatial-navigation.js
  var directions, defaultKeysState, SpatialNavigation, spatial_navigation_default;
  var init_spatial_navigation = __esm({
    "src/lib_components/spatial-navigation.js"() {
      init_utility_functions();
      init_actions();
      init_keyboard();
      init_gamepad();
      directions = ["down", "up", "left", "right"];
      defaultKeysState = { up: ["arrow_up"], down: ["arrow_down"], right: ["arrow_right"], left: ["arrow_left"] };
      SpatialNavigation = class {
        // eslint-disable-next-line require-jsdoc
        constructor() {
          this.enabled = false;
          this.navigatableElements = { default: { elements: [], distance: 0, overflow: { x: 0, y: 0 } } };
          this.registeredKeys = /* @__PURE__ */ new Set();
          this.clearCurrentActiveKeys = false;
          this.overlapPercentage = 0.5;
          this.lastFocusedElement = null;
        }
        /**
         * Initializes the spatial navigation
         * @param {string[]|Object[]} navigatableElements
         * @param {string} navigatableElements[].area
         * @param {string[]} navigatableElements[].elements
         * @param {number} overlap
         * @returns {void}
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
         * @param {string[]|Object[]} navigatableElements
         * @param {string} navigatableElements[].area
         * @param {string[]} navigatableElements[].elements
         */
        add(navigatableElements) {
          if (!this.enabled) return;
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
          this.navigatableElements[area] = {};
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
         * @param {Object} navArea
         * @param {string} navArea.area
         * @param {string[]} navArea.elements
         * @returns {void}
         */
        handleObject(navArea) {
          const domElements = navArea.elements.reduce((acc, el) => {
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
          const activeElement = this.checkActiveElementInGroup();
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
            this.registeredKeys.forEach((key) => keyboard_default.off([key]));
            this.registeredKeys.clear();
            directions.forEach((direction) => {
              actions_default.remove(`move-focus-${direction}`);
              gamepad_default.off([`playstation.d-pad-${direction}`]);
              if (this.clearCurrentActiveKeys) this.activeKeys[direction] = [];
            });
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
         * Checks if a given element is a focusable area
         * @returns {boolean}
         */
        isActiveElementInGroup() {
          return Object.values(this.navigatableElements).some((group) => group.elements.includes(document.activeElement));
        }
        /**
         * Checks if the active element is within a group and returns the last focused element if it isn't.
         * @returns {HTMLElement}
         */
        checkActiveElementInGroup() {
          return this.isActiveElementInGroup(document.activeElement) ? document.activeElement : this.lastFocusedElement;
        }
        /**
         * Removes the focus from a focused element in a group
         */
        clearFocus() {
          if (this.isActiveElementInGroup()) document.activeElement.blur();
        }
      };
      spatial_navigation_default = new SpatialNavigation();
    }
  });

  // src/spatial-navigation.js
  var require_spatial_navigation = __commonJS({
    "src/spatial-navigation.js"(exports, module) {
      init_spatial_navigation();
      init_global_object();
      global_object_default.init();
      module.exports = spatial_navigation_default;
    }
  });
  return require_spatial_navigation();
})();
