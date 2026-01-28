(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.gamepad = factory());
})(this, (function() {
  "use strict";
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
      const actions = options.actions.map(this.sanitizeAction);
      const isAxisAlias = mappings.axisAliases.some((alias) => actions.includes(alias));
      const type = options.type && ACTION_TYPES.includes(options.type) ? options.type : "hold";
      if (type === "press" && isAxisAlias) {
        return console.error(`You can't use an axis action with a 'press' type!`);
      }
      if (actions.length > 1 && isAxisAlias) {
        return console.error(`You can't use an axis action in a combination with a button action`);
      }
      const existingEntry = IM$1.getGamepadAction({ actions, type });
      if (existingEntry) {
        return IM$1.addCallbackToEntry(existingEntry, options.callback, {
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
      const matchingActions = IM$1.getGamepadActions(actions.map(this.sanitizeAction));
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
        gamepads.forEach((gamepad) => {
          if (!gamepad) return;
          this.handleButtons(gamepad.buttons);
          this.handleJoysticks(gamepad.axes);
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
        if (typeof callback === "string") return Actions$1.execute(callback, value);
        callback(value);
      });
    }
  }
  const Gamepad$1 = new Gamepad();
  IM$1.init();
  return Gamepad$1;
}));
