"use strict";
var actions = (() => {
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

  // src/actions.ts
  var actions_exports = {};
  __export(actions_exports, {
    default: () => actions_default2
  });

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

  // src/actions.ts
  global_object_default.init();
  var actions_default2 = actions_default;
  return __toCommonJS(actions_exports);
})();
if (typeof actions !== 'undefined' && actions.default) { actions = actions.default; }
