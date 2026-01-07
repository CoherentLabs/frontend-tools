"use strict";
var gamepad = (() => {
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

  // src/gamepad.ts
  var gamepad_exports = {};
  __export(gamepad_exports, {
    default: () => gamepad_default2
  });

  // src/utils/gamepad-mappings.ts
  var mappings = {
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
  var gamepad_mappings_default = mappings;

  // src/utils/global-object.ts
  var IM = class _IM2 {
    constructor() {
      // eslint-disable-next-line require-jsdoc
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
  };
  var global_object_default = new IM();

  // src/lib_components/actions.ts
  var Actions = class {
    /**
     * Register an action
     */
    register(action, callback) {
      if (global_object_default.getAction(action)) return console.error(`The following action "${action}" is already registered!`);
      _IM.actions.push({ name: action, callback });
    }
    /**
     * Remove a registered action
     */
    remove(action) {
      const actionIndex = global_object_default.getActionIndex(action);
      if (actionIndex === -1) return console.error(`${action} is not a registered action!`);
      _IM.actions.splice(actionIndex, 1);
    }
    /**
     * Trigger an action
     */
    execute(action, value) {
      const actionObject = global_object_default.getAction(action);
      if (!actionObject) return console.error(`${action} is not a registered action!`);
      actionObject.callback(value);
    }
  };
  var actions_default = new Actions();

  // src/lib_components/gamepad.ts
  var AXIS_THRESHOLD = 0.9;
  var ACTION_TYPES = ["press", "hold"];
  var Gamepad = class {
    constructor() {
      this.gamepadEnabled = false;
      this.pollingInterval = 200;
      this._pressedAction = null;
      this._pressedButtons = [];
      this.sanitizeAction = this.sanitizeAction.bind(this);
    }
    /**
     * Allow gamepads to be connected
     */
    set enabled(isEnabled) {
      this.gamepadEnabled = isEnabled;
      this.gamepadEnabled ? this.startPolling() : this.stopPolling();
    }
    on(options) {
      const actions = options.actions.map(this.sanitizeAction);
      const isAxisAlias = gamepad_mappings_default.axisAliases.some((alias) => actions.includes(alias));
      const type = options.type && ACTION_TYPES.includes(options.type) ? options.type : "hold";
      if (type === "press" && isAxisAlias) {
        return console.error(`You can't use an axis action with a 'press' type!`);
      }
      if (actions.length > 1 && isAxisAlias) {
        return console.error(`You can't use an axis action in a combination with a button action`);
      }
      const existingEntry = global_object_default.getGamepadAction({ actions, type });
      if (existingEntry) {
        return global_object_default.addCallbackToEntry(existingEntry, options.callback, {
          identifier: `Actions: [${actions.join(", ")}]`,
          type
        });
      }
      _IM.gamepadFunctions.push({ actions, type, callbacks: [options.callback] });
    }
    /**
     * Removes either an action or a callback from the provided action
     * @param {Array} actions - Array containing the action you want to remove
     * @param {string | Function} callback - Callback or action you want to remove 
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
     */
    startPolling() {
      this.pollingIntervalRef = setInterval(() => {
        const gamepads = navigator.getGamepads();
        if (gamepads.length === 0) return;
        gamepads.forEach((gamepad) => {
          if (!gamepad) return;
          this.handleButtons(gamepad.buttons);
          this.handleJoysticks(gamepad.axes);
        });
      }, this.pollingInterval);
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
      const gamepadActions = global_object_default.getGamepadActions(pressedButtons.buttonIndexes, false);
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
      if (gamepad_mappings_default.axisAliases.includes(actionName)) return actionName;
      const key = gamepad_mappings_default.aliases[actionName];
      if (key) return gamepad_mappings_default[key];
      throw new Error(`You have entered a non-supported button alias: ${action}`);
    }
    /**
     * Gets all registered Joystick actions
     */
    getJoystickActions() {
      return _IM.gamepadFunctions.filter((gpFunc) => gamepad_mappings_default.axisAliases.includes(gpFunc.actions[0]));
    }
    /**
     * Executes the callbacks from the registered action
     */
    executeCallbacks(action, value) {
      action.callbacks.forEach((callback) => {
        if (typeof callback === "string") return actions_default.execute(callback, value);
        callback(value);
      });
    }
  };
  var gamepad_default = new Gamepad();

  // src/gamepad.ts
  global_object_default.init();
  var gamepad_default2 = gamepad_default;
  return __toCommonJS(gamepad_exports);
})();
if (typeof gamepad !== 'undefined' && gamepad.default) { gamepad = gamepad.default; }
