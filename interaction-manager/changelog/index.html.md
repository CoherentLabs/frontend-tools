# Changelog

Source: https://frontend-tools.coherent-labs.com/interaction-manager/changelog/

## 3.0.1 Latest

Fix Fixed a bug in Spatial Navigation where wrap-around navigation failed in tall, scrollable lists. Previously, pressing UP from the first item (or DOWN from the last) in an overflowing container would incorrectly focus on an arbitrary middle or visible item. It now reliably targets the true opposite edge of the list regardless of scroll position.

## 3.0.0

Breaking Change Changed `switchArea` method in Spatial Navigation to no longer focus the first element in the specified area but instead attempt to focus the last focused element in that area. If no element was previously focused in that area, or if that element has been removed from the DOM, it falls back to `focusFirst()`. This change allows for a more intuitive navigation experience when switching between areas.

New Added a new `getLastFocused` method in Spatial Navigation that returns the last focused element from a specific area.

## 2.8.0

New Added exports for both the `GamepadMappings` and `KeyboardMappings` objects to allow developers to easily access and utilize predefined action mappings in their projects.

## 2.7.0

Feature Migrated project build system to Vite for improved performance and modern tooling.

New Added Type Support & IntelliSense documentation page to help developers leverage TypeScript definitions in various project setups.

## 2.6.1

Fix Fixed an issue in Gamepad where the setter for `pollingInterval` didn’t update the interval function.

## 2.6.0

Feature Migrated the entire codebase to TypeScript. The library now includes native type definitions for better developer experience.

Fix Resolved timing mismatches in Gamepad by removing the `gamepadconnected` listener. Polling now begins explicitly when the `enabled` property is set to `true`.

## 2.5.6

Fix Gamepad actions are now triggered correctly even when combined. Callbacks for individual actions (e.g., `'pad-up'`) will fire even if multiple actions are executed simultaneously (e.g., `'pad-up'` + `'pad-down'`).

## 2.5.5

Feature Added pause() and resume() methods to Spatial Navigation for temporarily disabling and re-enabling navigation actions.

## 2.4.5

Fix Fixed Spatial Navigation to only remove the navigation actions from keys instead of removing the keys entirely from the action system, preventing other registered actions or callbacks on the same keys from being broken.

## 2.4.4

Feature Added support for multiple callbacks per key combination and type in Keyboard.

Feature Added optional `callback` parameter to Keyboard.off() method to remove specific callbacks.

Feature Added automatic cleanup of empty keyboard entries when all callbacks are removed.

Feature Added support for multiple callbacks per action combination and type in Gamepad.

Feature Added optional `callback` parameter to Gamepad.off() method to remove specific callbacks.

Feature Added automatic cleanup of empty gamepad entries when all callbacks are removed.

Feature Added support for HTMLElement references in Spatial Navigation. You can now pass direct HTMLElement references in `init()` and `add()` methods.

Fix Fixed navigation area removal in Spatial Navigation to properly delete the area instead of setting it to an empty object.
