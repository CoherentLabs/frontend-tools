var gamepad = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

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
      gamepad_default = new Gamepad();
    }
  });

  // src/gamepad.js
  var require_gamepad = __commonJS({
    "src/gamepad.js"(exports, module) {
      init_gamepad();
      init_global_object();
      global_object_default.init();
      module.exports = gamepad_default;
    }
  });
  return require_gamepad();
})();
