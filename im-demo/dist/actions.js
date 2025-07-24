var actions = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

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

  // src/actions.js
  var require_actions = __commonJS({
    "src/actions.js"(exports, module) {
      init_actions();
      init_global_object();
      global_object_default.init();
      module.exports = actions_default;
    }
  });
  return require_actions();
})();
