# Changelog

Source: https://frontend-tools.coherent-labs.com/e2e/changelog/

## 2.3.0 Latest

Feature Introduced new drag methods for enhanced drag-and-drop testing capabilities.

The newly added methods include:

- element.dragBy - Drags an element by a relative offset from its center.
- element.dragTo - Drags an element to a target element or selector with optional offset positioning.

## 2.2.0

New **TypeScript Migration**: Converted project to TypeScript for improved safety and developer experience. API types are now globally available, allowing for automatic IDE support in .`spec.js` files without explicit imports.

## 2.1.1

Fix Calling `keyUp`, `keyDown`, or `keyPress` on `DOMElement` or `gf` objects with `count` greater than 1 now dispatches keyboard events with the `repeat` property set to `true`.

Fix `DOMElement` methods - `waitForSize` and `waitForPositionOnScreen` - now correctly handle cases where only one dimension (`width` or `height` for size, `x` or `y` for position) is specified.

## 2.1.0

Feature Introduced new methods for simulating and testing gamepad interactions.

The newly added methods include:

- gf.connectGamepad
- gf.disconnectGamepad
- gf.getGamepad
- gamepad.press
- gamepad.hold
- gamepad.release
- gamepad.disconnect
- gamepad.sequence
- gamepad.moveLeftStick
- gamepad.moveRightStick
- gamepad.resetSticks

## 2.0.0

Change Renamed `gf.moveMouse` method to `gf.mouseMove` for consistency with other mouse-related methods (breaking).

Feature Added `getParent` methods to both the `gf` object and the `DOMElement` object for retrieving the parent element of a specified element or the current DOM element, respectively.

## 1.1.1

Fix Fixed tests exit code when tests fail. Previously, the exit code was always 0, which could lead to confusion when running tests in CI/CD pipelines.

## 1.1.0

Feature Introduced new assertion methods for the `DOMElement` object, leveraging `gf.retryIfFails` to ensure reliable validation of element states.

The newly added methods include:

- element.waitForAttributes
- element.waitForClasses
- element.waitForPositionOnScreen
- element.waitForSize
- element.waitForStyles
- element.waitForText
- element.waitForValue
- element.waitForVisibility
- element.waitForVisibilityInScrollableArea

Feature Added the gf.scrollTo method to scroll the page to a specific position.

Feature Added the gf.scrollToTop method to scroll the page to the top.

Feature Added the gf.scrollToBottom method to scroll the page to the bottom.

## 1.0.2

Fix Fixed the `element.scrollIntoView` method to correctly identify the nearest scrollable container when none is explicitly provided through the arguments.

## 1.0.1

Fix Resolved a random error where the WebSocket failed to locate an element with a specific ID while the tests are running.

Fix Resolved an issue where the player would unexpectedly stop when `gf` methods were used without providing a required element selector.

Fix Fixed the missing `core\commands\setup-mocha.js` file error when executing the `npx gameface-e2e`.

## 1.0.0

New Official release of the Gameface E2E testing framework.

New Added public documentation for the framework.

## 0.0.4

New Introduced support for testing data bindings in the UI.

New Added additional examples of how to test data bindings in the UI.

Feature Added methods to test data bindings by creating and updating models.

Feature Added methods to test data bindings by triggering and listening to engine events.

## 0.0.3

New Introduced support for UI interactions.

New Added additional examples for keyboard and mouse interactions.

Feature Enabled support for keyboard and mouse interactions.

Feature Added methods for scrolling elements into view within scrollable containers.

Feature Enabled support for spawning multiple test processes.

Feature Added runtime script execution support via the `gf.executeScript` method.

## 0.0.2

New Added more test examples in the `examples` folder of the `gameface-e2e` npm package.

New Introduced the `gf` object and `DOMElement` object for UI interactions. The `gf` object provides global utilities, while the `DOMElement` object represents specific DOM elements for interaction.

Feature Added methods to access UI elements.

Feature Added methods to validate UI elements.

Feature Introduced navigation to specific URLs via `gf.navigate(url)`.

## 0.0.1

Initial release of the e2e testing framework.

New Enabled the framework to spawn the Gameface player and execute tests.

New Added configuration file support, allowing users to specify the path to `Player.exe` and test files.
