# Gameface E2E Testing Framework

This is an end-to-end (E2E) JavaScript testing framework for Gameface, capable of running tests on UIs created with Gameface. It utilizes the DevTools protocol to execute commands on Gameface and provides various commands to interact with the UI.

## Installation

To install the testing framework in your project, run the following command:

```shell
npm install gameface-e2e --save-dev
```

Alternatively, you can install it globally:

```shell
npm install gameface-e2e -g
```

**We recommend using Node.js version 20 or higher.**

## Usage

To run tests with the `gameface-e2e` framework, you need the following:

1. `Player.exe` located at `${GamefacePackage}/Player/Player.exe`.
2. `.spec` files to be executed. The framework uses [`mocha`](https://mochajs.org/), so your `.spec` files should follow the `describe`-`it` pattern.
3. (Optional) A config file for running the tests.

### Running tests without a config file

To run your tests without a config file, use the following command:

```shell
npx gameface-e2e --gamefacePath=${PATH_TO_PLAYER_EXE} --tests=${PATH_TO_SPEC_FILES}
```

If you have installed the framework globally, you can use:

```shell
gameface-e2e --gamefacePath=${PATH_TO_PLAYER_EXE} --tests=${PATH_TO_SPEC_FILES}
```

* `PATH_TO_PLAYER_EXE`: The path to your `Player.exe`, either relative to the command execution location or as an absolute path.
* `PATH_TO_SPEC_FILES`: The path to your spec files, either relative to the command execution location or as an absolute path. You can use patterns like `tests/**/*.spec.js` to match all `.spec` files in the `tests` folder.

### Running tests with a config file

To avoid specifying the `gamefacePath` and `tests` paths each time you run your tests, you can create a config file that the framework will use to retrieve both flags.

There are two ways to do this:

1. Create a `gameface-e2e-config.js` file in the directory where you plan to run the `gameface-e2e` command, such as your project root.
2. Create a config JavaScript file with any name and place it anywhere.

Inside this file, you can specify various config properties for the testing library. Here is an example where we specify the path to the Player.exe and tests:

```js
module.exports = {
    tests: "examples/**/*.spec.js",
    gamefacePath: "C:/Gameface/Player/Player.exe"
}
```

When you configure both properties inside your config file, there are two ways to execute the `gameface-e2e` command without specifying the required flags:

1. Without specifying the config file path. Create a file named `gameface-e2e-config.js` in the directory where you will execute the command:
    ```shell
    npx gameface-e2e
    ```
2. By specifying the config file path. Pass the path to your config file, which must be relative to the location where the command will be executed:
    ```shell
    npx gameface-e2e --config=./tests/my-config.js
    ```

### Choosing between `gf` object and `DOMElement`

The `gf` object is a global utility that provides methods to interact with the UI elements. It is typically used for quick, single actions, such as retrieving the text of an element without further interaction.

Example of using the `gf` object for a single action:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const text = await gf.text('.my-element');
        assert.equal(text, 'Hello, World!');
    });
});
```

The `DOMElement` object, on the other hand, represents a specific DOM element and is ideal for scenarios where multiple interactions with the same element are required. For instance, you might retrieve an element, check its text, and then perform a click action.

Example of using the `DOMElement` object for multiple actions:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const text = await element.text();
        assert.equal(text, 'Hello, World!');
        await element.click();
    });
});
```

Use the `gf` object for simplicity when only one interaction is needed, and opt for the `DOMElement` object when you need to perform multiple operations on the same element.

### Running multiple test processes in parallel

The framework allows running multiple test processes simultaneously. Each test process spawns a separate Gameface Player instance on a different port if the current one is occupied.

This feature enables you to execute multiple test processes independently and in parallel, which can significantly reduce the overall test execution time.

#### Example

In this example, we will use the `concurrently` npm module to run two test processes in parallel. Alternatively, you can create your own script to manage multiple processes and handle their exit codes.

First, install the `concurrently` module:

```shell
npm install --save-dev concurrently
```

Next, add the following script to the `scripts` section of your project's `package.json`:

```json
"scripts": {
    ...
    "test": "concurrently --kill-others-on-fail \"gameface-e2e --tests=./tests/view1/**/*.spec.js --gamefacePath=../Gameface/Player/Player.exe\" \"gameface-e2e --tests=./tests/view2/**/*.spec.js --gamefacePath=../Gameface/Player/Player.exe\""
    ...
}
```

You can also use separate configuration files to run different test processes:

```json
"scripts": {
    ...
    "test": "concurrently --kill-others-on-fail \"gameface-e2e --config=./tests/view1.config.js\" \"gameface-e2e --config=./tests/view2.config.js\""
    ...
}
```

In each configuration file, specify the `tests` and `gamefacePath` properties.

Now, running `npm run test` will start two `Player` processes, each executing tests for a specific view in parallel.

**Tip:**

If you are using bash terminal and want to keep your `package.json` organized, you can follow these steps:

1. Create a `run-e2e.sh` script:

```bash
#!/bin/bash
concurrently --kill-others-on-fail \
    "gameface-e2e --config=./tests/view1.config.js" \
    "gameface-e2e --config=./tests/view2.config.js"
```

2. Update the `scripts` section in your `package.json`:

```json
"scripts": {
    "test": "bash ./run-e2e.sh"
}
```

## `gameface-e2e` Command Flags

| Flag         | Type   | Description                                                                                                           |
| ------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| help         |        | Displays the help information for the command.                                                                        |
| gamefacePath | String | Specifies the path to your `Player.exe`.                                                                              |
| tests        | String | Specifies the path to your test `.spec.js` files.                                                                     |
| config       | String | Specifies the path to your config file if you are using one to run the tests.                                         |
| specTimeout  | Number | Sets the timeout for tests in spec files. The default is 10 seconds. Use this flag to increase the timeout if needed. |
| bail         |        | Enables bailing on the first failure.                                                                                 |

## `gameface-e2e-config.js` Configuration Properties

| Property     | Type    | Description                                                                                                               |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| gamefacePath | String  | Specifies the path to your `Player.exe`.                                                                                  |
| tests        | String  | Specifies the path to your test `.spec.js` files.                                                                         |
| specTimeout  | Number  | Sets the timeout for tests in spec files. The default is 10 seconds. Use this property to increase the timeout if needed. |
| bail         | Boolean | Enables bailing on the first failure.                                                                                     |

## Debugging

The framework includes debug logs that can be useful if you encounter an error that is not sufficiently descriptive. For instance, you might face a WebSocket server error due to an incorrect `Player.exe` path. Enabling debug logs can provide insights such as "Spawning player executable with path: ...", helping you identify the issue.

To enable debug logs, execute the `gameface-e2e` command as follows:

**Bash terminal:**

```shell
DEBUG=oclif:gameface-e2e* npx gameface-e2e
```

On Windows, you can use the following command:

**PowerShell:**

```shell
$env:DEBUG = "oclif:gameface-e2e*"; npx gameface-e2e
```

**Command Prompt:**

```shell
cmd /C "set DEBUG=oclif:gameface-e2e* && npx gameface-e2e -p D:\gameface-0.0.0.0\Player\Player.exe --config .\examples\gameface-e2e-config.js"
```

## Writing Tests

To write tests for your Gameface UI, you can use the `gf` object provided by the testing framework. The `gf` object provides various methods to interact with the UI, such as clicking elements, getting the element properties, etc.

Here is an example of a test file:

```js
describe("My Gameface UI", () => {
    it("should display the correct text", async () => {
        const element = await gf.get('.my-element');
        const text = await element.text();
        assert.equal(text, 'Hello, World!');
    });

    it("should update the text when clicked", async () => {
        const btn = await gf.get('.my-button');
        await btn.click();
        const element = await gf.get('.my-element');
        const text = await element.text();
        assert.equal(text, 'Hello, Gameface!');
    });
});
```

To see more examples of how to write tests, check the `examples` folder in the repository. The examples include various test cases demonstrating how to use the `gf` object and its methods.

## API Reference

### `gf` Object

The `gf` object provides various methods and properties to interact with the Gameface UI. Here are the available methods and properties:

#### `gf.KEYS`

Represents a set of key codes commonly used in methods like `keyPress`, `keyDown`, and `keyUp`. This collection includes key codes for keys such as Tab, Backspace, Ctrl, Alt, and others.

#### `gf.get(selector: string): Promise<DOMElement>`

Retrieves a DOM element based on the provided selector.

* `selector`: The CSS selector to query the DOM element.
* Returns a promise that resolves to the `DOMElement` instance.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
    });
});
```

#### `gf.getAll(selector: string): Promise<DOMElements>`

Retrieves all elements matching the specified selector.

* `selector`: The CSS selector to match elements against.
* Returns a promise that resolves to an array of `DOMElement` instances.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
    });
});
```

#### `gf.contains(text: string, selector: string): Promise<DOMElement>`

Retrieves a DOM element containing the specified text.

* `text`: The text to search for in the DOM element.
* `selector`: The selector used to find the element that the search will be started from.
* Returns a promise that resolves to DOMElement that contains the text.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.contains('Hello, World!', '.my-element');
    });
});
```

#### `gf.text(selector: string): Promise<string>`

Retrieves the text content of the specified element.

* `selector`: The CSS selector of the element to retrieve.
* Returns a promise that resolves to the text content of the element.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const text = await gf.text('.my-element');
    });
});
```

#### `gf.children(selector: string): Promise<DOMElements>`

Retrieves the children of the specified element.

* `selector`: The CSS selector of the element to get the children from.
* Returns a promise that resolves to an array of `DOMElement` instances.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const children = await gf.children('.my-element');
    });
});
```

#### `gf.navigate(url: string): Promise<void>`

Navigates to the specified URL.

* `url`: The URL to navigate to.
* Returns a promise that resolves when the navigation is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.navigate('https://localhost:3000/');
    });
});
```

The `url` argument can receive either local or remote URLs. If you want to navigate to a local file, you can use the `gf.navigate` method with a file path. The file path could be either absolute or relative to the Player directory specified via `gamefacePath` command argument. For example, if you want to navigate to a local HTML file, you can use the following code:

```js
gf.navigate('D:/my-directory/my-file.html');
```

Or if you want to navigate to a file relative to the Player's directory, you can use the following code:

```js
gf.navigate('./my-file.html');
```

#### `gf.isHidden(selector: string): Promise<boolean>`

Checks if the specified element is hidden.

* `selector`: The CSS selector of the element to check.
* Returns a promise that resolves to `true` if the element is hidden, `false` otherwise.
* An element is considered hidden if:
  * Its `display` property is set to `none`.
  * Its `visibility` property is set to `hidden`.
  * Its `opacity` property is set to `0`.
* **Note: This method does not check if the element is off-screen.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isHidden = await gf.isHidden('.my-element');
    });
});
```

#### `gf.isVisible(selector: string): Promise<boolean>`

Checks if the specified element is visible.

* `selector`: The CSS selector of the element to check.
* Returns a promise that resolves to `true` if the element is visible, `false` otherwise.
* An element is considered visible if:
  * Its `display` property is not set to `none`.
  * Its `visibility` property is not set to `hidden`.
  * Its `opacity` property is not set to `0`.
  * It is not off-screen.
  * It has a positive width and height.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isVisible = await gf.isVisible('.my-element');
    });
});
```

#### `gf.isScrollable(selector: string): Promise<boolean>`

Checks if the specified element is scrollable.

* `selector`: The CSS selector of the element to check.
* Returns a promise that resolves to `true` if the element is scrollable, `false` otherwise.
* An element is considered scrollable if it has an `overflow` property set to `auto`, `scroll`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isScrollable = await gf.isScrollable('.my-element');
    });
});
```

#### `gf.isFocusable(selector: string): Promise<boolean>`

Checks if the specified element is focusable.

* `selector`: The CSS selector of the element to check.
* Returns a promise that resolves to `true` if the element is focusable, `false` otherwise.
* An element is considered focusable if:
  * It has a `tabindex` attribute.
  * Is not disabled - has not `disabled` attribute.
  * It is an input element (e.g., `<input>`, `<textarea>`).
  * It is a button element (e.g., `<button>`).
  * It is a link element (`<a>`).

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const isFocusable = await gf.isFocusable('.my-element');
    });
});
```

#### `gf.hasAttribute(selector: string, name: string): Promise<boolean>`

Checks if the specified element has the specified attribute.

* `selector`: The CSS selector of the element to check.
* `name`: The name of the attribute to check for.
* Returns a promise that resolves to `true` if the element has the attribute, `false` otherwise.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const hasAttribute = await gf.hasAttribute('.my-element', 'data-id');
    });
});
```

#### `gf.getAttribute(selector: string, name: string): Promise<string | undefined>`

Retrieves the value of the specified attribute of the specified element.

* `selector`: The CSS selector of the element to retrieve.
* `name`: The name of the attribute to retrieve.
* Returns a promise that resolves to the value of the attribute or `undefined` if the attribute does not exist.
* **Note: The attribute value is returned as a string.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const attribute = await gf.getAttribute('.my-element', 'data-id');
    });
});
```

#### `gf.getStyles(selector: string): Promise<Object>`

Retrieves the computed styles of the specified element.

* `selector`: The CSS selector of the element to retrieve.
* Returns a promise that resolves to an object containing the computed styles of the element.
* The object has the following structure: `{ property: value }`.
* **Note: The values are returned as strings.**
* **Note: The styles are computed styles, not inline styles.**
* **Note: The styles are not returned in the same format as the CSS file.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const styles = await gf.getStyles('.my-element');
    });
});
```

#### `gf.getClasses(selector: string): Promise<string[]>`

Retrieves the classes of the specified element.

* `selector`: The CSS selector of the element to retrieve.
* Returns a promise that resolves to an array of strings representing the classes of the element.
* **Note: The classes are returned as an array of strings.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const classes = await gf.getClasses('.my-element');
    });
});
```

#### `gf.click(selector: string): Promise<void>`

Simulates a click on the specified element.

* `selector`: The CSS selector of the element to click.
* Returns a promise that resolves when the click is complete.
* **Note: Clicking on text elements is not supported.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.click('.my-button');
    });
});
```

#### `gf.mousePress(x?: number, y?: number, button?: 'left'|'middle'|'right', modifiers?: number): Promise<void>`

Simulates a mouse down event at the specified coordinates on the document.

* `x`: `(Default = 0)` The X coordinate where the mouse will be pressed.
* `y`: `(Default = 0)` The Y coordinate where the mouse will be pressed.
* `buttton`: `(Default = 'left')` Specifies the mouse button that will be used for the event.
* `modifiers`: `(Default = 0)` Bitfield representing modifier keys (e.g., Alt, Ctrl, Meta, Shift).
* Returns a promise that resolves when the mouse press is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mousePress();
        await gf.mousePress(100, 100, 'right');
    });
});
```

#### `gf.mouseRelease(x?: number, y?: number, button?: 'left'|'middle'|'right', modifiers?: number): Promise<void>`

Simulates a mouse release event at the specified coordinates on the document.

* `x`: `(Default = 0)` The X coordinate where the mouse will be released.
* `y`: `(Default = 0)` The Y coordinate where the mouse will be released.
* `buttton`: `(Default = 'left')` Specifies the mouse button that will be used for the event.
* `modifiers`: `(Default = 0)` Bitfield representing modifier keys (e.g., Alt, Ctrl, Meta, Shift).
* Returns a promise that resolves when the mouse release is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseRelease();
        await gf.mouseRelease(100, 100, 'right');
    });
});
```

#### `gf.mouseMove(x: number, y: number): Promise<void>`

Moves the mouse to the specified coordinates.

* `x`: The X coordinate where the mouse will be moved.
* `y`: The Y coordinate where the mouse will be moved.
* Returns a promise that resolves when the mouse move is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseMove(100, 100);
    });
});
```

#### `gf.mouseWheel(x: number, y: number, deltaX: number, deltaY: number): Promise<void>`

Simulates a mouse wheel event at the specified coordinates with the given deltas.

* `x`: The X coordinate where the mouse wheel will be scrolled.
* `y`: The Y coordinate where the mouse wheel will be scrolled.
* `deltaX`: The horizontal scroll amount. Positive values scroll right, negative values scroll left.
* `deltaY`: The vertical scroll amount. Positive values scroll down, negative values scroll up.
* Returns a promise that resolves when the mouse wheel is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.mouseWheel(100, 100, 50, 50);
    });
});
```

#### `gf.keyPress(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key press event on the document.

* `key`: The key to be pressed. Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key press sequence.
* Returns a promise that resolves when the key press is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.keyPress('a'); // Will press key - 'a'
        await gf.keyPress('a', void 0, 2); // Will press key - 'a' two times
        await gf.keyPress('a', { altKey: true }, 2); // Will press key - 'a' with alt pressed key two times
        await gf.keyPress(gf.KEYS.TAB, void 0, 2); // Will press the Tab key two times
    });
});
```

#### `gf.keyDown(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key down event for the specified key on the document.

* `key`: Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key down event.
* Returns a promise that resolves when the key down is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.keyDown('a'); // Will key down - 'a'
        await gf.keyDown('a', void 0, 2); // Will key down - 'a' two times
        await gf.keyDown('a', { altKey: true }, 2); // Will key down - 'a' with alt pressed key two times
        await gf.keyDown(gf.KEYS.TAB, void 0, 2); // Will key down the Tab key two times
    });
});
```

#### `gf.keyUp(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key up event for the specified key on the document.

* `key`: Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key up event.
* Returns a promise that resolves when the key up is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.keyUp('a'); // Will key up - 'a'
        await gf.keyUp('a', void 0, 2); // Will key up - 'a' two times
        await gf.keyUp('a', { altKey: true }, 2); // Will key up - 'a' with alt pressed key two times
        await gf.keyUp(gf.KEYS.TAB, void 0, 2); // Will key up the Tab key two times
    });
});
```

#### `gf.trigger(eventName: string, data: Object)`

Triggers a custom DOM event on the document with the specified name and data.

* `eventName` - The name of the custom event to dispatch.
* `data` - The data to include in the event's `detail` property.
* Returns a promise that resolves when triggering custom event up is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        await gf.trigger('custom-event');
        await gf.trigger('custom-event', { testData: 1 });
    });
});
```

#### `gf.executeScript(fn: Function, args: ...any): Promise<any>`

Runs a JavaScript function within the browser's runtime context.

* `fn`: The function to execute in the runtime environment.
* `args`: Arguments to pass to the function during execution.
* Returns a promise that resolves with the function's return value from the runtime.
* Throws an error if the function encounters an error during execution.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        // Retrieve the height of the Player's window
        const height = await gf.executeScript(() => window.innerHeight);

        // Change the background color of the body
        const color = 'red';
        await gf.executeScript((color) => {
            document.body.style.background = color;
        }, color);
    });
});
```

### `DOMElement` Object

The `DOMElement` object represents a DOM element and provides various methods to interact with it.

#### `element.getInnerHTML(): Promise<string>`

Retrieves the inner HTML of the element.

* Returns a promise that resolves to the inner HTML of the element.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const innerHTML = await element.getInnerHTML();
    });
});
```

#### `element.getOuterHTML(): Promise<string>`

Retrieves the outer HTML of the element.

* Returns a promise that resolves to the outer HTML of the element.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const outerHTML = await element.getOuterHTML();
    });
});
```

#### `element.children(): Promise<DOMElements>`

Retrieves the children of the element.

* Returns a promise that resolves to an array of `DOMElement` instances representing the children of the element.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const children = await element.children();
    });
});
```

#### `element.find(selector: string): Promise<DOMElement>`

Finds a DOM element using the specified selector starting from the current element.

* `selector`: The CSS selector to query the DOM element.
* Returns a promise that resolves to the `DOMElement` instance.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElement = await element.find('.child-element');
    });
});
```

#### `element.findAll(selector: string): Promise<DOMElements>`

Finds all elements matching the specified selector starting from the current element.

* `selector`: The CSS selector to match elements against.
* Returns a promise that resolves to an array of `DOMElement` instances.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElements = await element.findAll('.child-elements');
    });
});
```

#### `element.contains(text: string): Promise<DOMElement>`

Retrieves a DOM element containing the specified text starting from the current element.

* `text`: The text to search for in the DOM element.
* Returns a promise that resolves to `DOMElement` that contains the text.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const childElement = await element.contains('Hello, World!');
    });
});
```

#### `element.text(): Promise<string>`

Retrieves the text content of the element.

* Returns a promise that resolves to the text content of the element.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const text = await element.text();
    });
});
```

#### `element.isVisibleInScrollableArea(scrollableArea: DOMElement):Promise<boolean>`

Determines if the current DOM element is visible within a specified scrollable area.

* `scrollableArea`: The scrollable area to check visibility against. Must be an instance of DOMElement.
* Returns a promise that resolves to `true` if the element is visible within the scrollable area, otherwise `false`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const text = await element.isVisibleInScrollableArea(await gf.get('.element-wrapper'));
    });
});
```

#### `element.styles(): Promise<Object>`

Retrieves the computed styles of the element.

* Returns a promise that resolves to an object containing the computed styles of the element.
* The object has the following structure: `{ property: value }`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const styles = await element.styles();
    });
});
```

#### `element.isHidden(): Promise<boolean>`

Checks if the element is hidden. An element is considered hidden if:

* Its `display` property is set to `none`.
* Its `visibility` property is set to `hidden`.
* Its `opacity` property is set to `0`.

* Returns a promise that resolves to `true` if the element is hidden, `false` otherwise.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isHidden = await element.isHidden();
    });
});
```

#### `element.isVisible(): Promise<boolean>`

Checks if the element is visible. An element is considered visible if:

* Its `display` property is not set to `none`.
* Its `visibility` property is not set to `hidden`.
* Its `opacity` property is not set to `0`.
* It is not off-screen.
* It has a positive width and height.

* Returns a promise that resolves to `true` if the element is visible, `false` otherwise.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isVisible = await element.isVisible();
    });
});
```

#### `element.isScrollable(): Promise<boolean>`

Checks if the element is scrollable.

* Returns a promise that resolves to `true` if the element is scrollable, `false` otherwise.
* An element is considered scrollable if it has an `overflow` property set to `auto`, `scroll`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isScrollable = await element.isScrollable();
    });
});
```

#### `element.isFocusable(): Promise<boolean>`

Checks if the element is focusable.

* Returns a promise that resolves to `true` if the element is focusable, `false` otherwise.
* An element is considered focusable if:
  * It has a `tabindex` attribute.
  * Is not disabled - has not `disabled` attribute.
  * It is an input element (e.g., `<input>`, `<textarea>`).
  * It is a button element (e.g., `<button>`).
  * It is a link element (`<a>`).

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const isFocusable = await element.isFocusable();
    });
});
```

#### `element.isFocused(): Promise<boolean>`

Checks if the element is focused.

* Returns a promise that resolves to `true` if the element is focused, otherwise `false`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        assert.equal(await element.isFocused(), true);
    });
});
```

#### `element.focus(): Promise<boolean>`

Focuses the DOM element.

* Returns a promise that resolves when the element is focused.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.focus();
        assert.equal(await element.isFocused(), true);
    });
});
```

**Note: Focusing text elements is not supported.**

#### `element.classes(): Promise<string[]>`

Retrieves the classes of the element.

* Returns a promise that resolves to an array of strings representing the classes of the element.
* **Note: The classes are returned as an array of strings.**

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const classes = await element.classes();
    });
});
```

#### `element.getPositionOnScreen(): Promise<{ x: number, y: number } | null>`

Retrieves the position of the element on the screen.

* Returns a promise that resolves to an object containing the `x` and `y` coordinates of the element on the screen.
* If the element is not visible, the method returns `null`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const position = await element.getPositionOnScreen();
    });
});
```

**Note: Getting the position of a text element is not supported.**

#### `element.getSize(): Promise<{ width: number, height: number } | null>`

Retrieves the size of the element.

* Returns a promise that resolves to an object containing the `width` and `height` of the element.
* If the element is not visible, the method returns `null`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const size = await element.getSize();
    });
});
```

**Note: Getting the size of a text element is not supported.**

#### `element.getAttributes(): Promise<Object>`

Retrieves the attributes of the element.

* Returns a promise that resolves to an object containing the attributes of the element.
* The object has the following structure: `{ attribute: value }`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const attributes = await element.getAttributes();
    });
});
```

#### `element.getAttribute(name: string): Promise<string | null>`

Retrieves the value of the specified attribute of the element.

* `name`: The name of the attribute to retrieve.
* Returns a promise that resolves to the value of the attribute or `null` if the attribute does not exist.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const attribute = await element.getAttribute('data-id');
    });
});
```

#### `element.hasAttribute(name: string): Promise<boolean>`

Checks if the element has the specified attribute.

* `name`: The name of the attribute to check for.
* Returns a promise that resolves to `true` if the element has the attribute, `false` otherwise.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        const hasAttribute = await element.hasAttribute('data-id');
    });
});
```

#### `element.setAttribute(name: string, value: string): Promise<void>`

Sets the value of the specified attribute of the element.

* `name`: The name of the attribute to set.
* `value`: The value to set for the attribute.
* Returns a promise that resolves when the attribute is set.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.setAttribute('data-id', '123');
    });
});
```

#### `element.mousePress(button: 'left'|'right'|'middle', options?: Object): Promise<void>`

Simulates a `mousedown` event on the element.

* `button`: `(Default = 'left')` Specifies the mouse button that will be used for the event.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the mouse event is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.mousePress();
    });
});
```

**Note: Mouse pressing on text elements is not supported.**

#### `element.mouseRelease(button: 'left'|'right'|'middle', options?: Object): Promise<void>`

Simulates a `mouseup` event on the element.

* `button`: `(Default = 'left')` Specifies the mouse button that will be used for the event.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the mouse event is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.mouseRelease();
    });
});
```

**Note: Mouse releasing on text elements is not supported.**

#### `element.mouseWheel(deltaX: number, deltaY: number): Promise<void>`

Simulates a `mousewheel` event on the element.

* `deltaX`: The horizontal scroll amount. Positive values scroll right, negative values scroll left.
* `deltaY`: The vertical scroll amount. Positive values scroll down, negative values scroll up.
* Returns a promise that resolves when the mouse event is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.mouseWheel();
    });
});
```

**Note: Wheeling on text elements is not supported.**

#### `element.click(options?: Object): Promise<void>`

Simulates a click on the element.

* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the click is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.click();
    });
});
```

**Note: Clicking on text elements is not supported.**

#### `element.rightClick(options?: Object): Promise<void>`

Simulates a right click event on the element.

* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the event is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.rightClick();
    });
});
```

**Note: Right clicking on text elements is not supported.**

#### `element.doubleClick(options?: Object): Promise<void>`

Simulates a double click event on the element with the 'left' mouse button.

* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the event is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.doubleClick();
    });
});
```

**Note: Double clicking on text elements is not supported.**

#### `element.hover(): Promise<void>`

Simulates hovering over the element.

* Returns a promise that resolves when the action is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.hover();
    });
});
```

**Note: Hovering on text elements is not supported.**

#### `element.drag(x: number, y: number): Promise<void>`

Moves the element to the specified coordinates by simulating a drag action.

* `x`: The target x-coordinate to drag the element to.
* `y`: The target y-coordinate to drag the element to.
* Returns a promise that resolves once the drag action is completed.
* **Note:** Dragging is supported only for elements with drag functionality implemented via `mousedown`, `mousemove`, and `mouseup` events.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.drag(100, 100);
    });
});
```

**Note: Dragging text elements is not supported.**

#### `element.scroll(deltaX: number, deltaY: number): Promise<void>`

Scrolls the element by the specified delta values.

* `deltaX`: `(Default = 0)` The horizontal scroll amount. Positive values scroll right, negative values scroll left.
* `deltaY`: `(Default = 0)` The vertical scroll amount. Positive values scroll down, negative values scroll up.
* Returns a promise that resolves when the action is complete.
* Will not perform the action on elements that are not scrollable - element is hidden or overflow is set to `visible` or `hidden`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.scroll-container');
        await element.scroll(0, 100);
    });
});
```

#### `element.scrollTo(x: number, y: number): Promise<void>`

Scrolls the DOM element to the specified coordinates.

* `x`: The X coordinate where the element will be scrolled to.
* `y`: The Y coordinate where the element will be scrolled to.
* Returns a promise that resolves when the action is complete.
* Will not perform the action on elements that are not scrollable - element is hidden or overflow is set to `visible` or `hidden`.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.scroll-container');
        await element.scrollTo(0, 100);
    });
});
```

#### `element.scrollIntoView(scrollableArea?: DOMElement): Promise<void>`

Scrolls the current DOM element into view within a scrollable area. If the scrollable area is not provided, the method attempts to locate the first scrollable parent element in the DOM hierarchy.

* `scrollableArea`: `(Default = null)` The scrollable area in which the element should be scrolled into view.
* Returns a promise that resolves when the action is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-button');
        await element.scrollIntoView();
    });
});
```

#### `element.keyDown(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key down event for the specified key on the element.

* `key`: Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key down event.
* Returns a promise that resolves when the key down is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.keyDown('a'); // Will key down - 'a'
        await element.keyDown('a', void 0, 2); // Will key down - 'a' two times
        await element.keyDown('a', { altKey: true }, 2); // Will key down - 'a' with alt pressed key two times
        await element.keyDown(gf.KEYS.TAB, void 0, 2); // Will key down the Tab key two times
    });
});
```

#### `element.keyUp(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key up event for the specified key on the element.

* `key`: Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key down event.
* Returns a promise that resolves when the key up is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.keyUp('a'); // Will key up - 'a'
        await element.keyUp('a', void 0, 2); // Will key up - 'a' two times
        await element.keyUp('a', { altKey: true }, 2); // Will key up - 'a' with alt pressed key two times
        await element.keyUp(gf.KEYS.TAB, void 0, 2); // Will key up the Tab key two times
    });
});
```

#### `element.keyPress(key: string|number, options?: Object, count?: number): Promise<void>`

Simulates a key press event for the specified key on the element.

* `key`: Either a key code as number or string.
  * You can use the `gf.KEYS` object to specify the `key` argument.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* `count`: `(Default = 0)` The number of times to repeat the key down event.
* Returns a promise that resolves when the key press is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.keyPress('a'); // Will key press - 'a'
        await element.keyPress('a', void 0, 2); // Will key press - 'a' two times
        await element.keyPress('a', { altKey: true }, 2); // Will key press - 'a' with alt pressed key two times
        await element.keyPress(gf.KEYS.TAB, void 0, 2); // Will key press the Tab key two times
    });
});
```

#### `element.type(keys: string|string[], options?: Object): Promise<void>`

Simulates typing on the element by dispatching key events. This method is compatible with input elements or any elements that have key event listeners such as `keydown`, `keyup`, or `keypress`.

* `keys`: The keys to type. Can be a string or an array of characters.
* `options.altKey`: Indicates if the Alt key is pressed.
* `options.ctrlKey`: Indicates if the Ctrl key is pressed.
* `options.metaKey`: Indicates if the Meta key is pressed.
* `options.shiftKey`: Indicates if the Shift key is pressed.
* Returns a promise that resolves when the action is complete.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.type('text');
        const input = await gf.get('input');
        await input.type('text');
    });
});
```

#### `element.getValue(): Promise<void>`

Retrieves the value of the element if it is an input or textarea.

* Returns a promise that resolves when the action is complete with the element value.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const input = await gf.get('input');
        assert.equal(await input.getValue(), 'text');
    });
});
```

#### `element.clear(): Promise<void>`

Clears the value of the element if it is an input or textarea.

* Returns a promise that resolves when the action is complete.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const input = await gf.get('input');
        await input.clear();
    });
});
```

#### `element.trigger(eventName: string, data?: Object): Promise<void>`

Triggers a custom event on the element.

* `eventName`: The name of the custom event.
* `data`: Optional data to include in the event's `detail` property.
* Returns a promise that resolves when the action is complete.

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const element = await gf.get('.my-element');
        await element.trigger('test-event', { value: 1 });
    });
});
```

**Note: Triggering custom event on text elements is not supported.**

### `DOMElements` Object

The `DOMElements` object represents an array of DOM elements and provides various methods to interact with them.

#### `elements.nth(index: number): Promise<DOMElement>`

Retrieves the element at the specified index.

* `index`: The index of the element to retrieve.
* Returns a promise that resolves to the `DOMElement` instance at the specified index.
* If the index is out of bounds, the method throws an error.
* The index is zero-based.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
        const element = await elements.nth(0);
    });
});
```

#### `elements.first(): Promise<DOMElement>`

Retrieves the first element in the array.

* Returns a promise that resolves to the first `DOMElement` instance in the array.
* If the array is empty, the method throws an error.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
        const element = await elements.first();
    });
});
```

#### `elements.last(): Promise<DOMElement>`

Retrieves the last element in the array.

* Returns a promise that resolves to the last `DOMElement` instance in the array.
* If the array is empty, the method throws an error.

Usage:

```js
describe('Test script', function () {
    it('Test 1', async () => {
        const elements = await gf.getAll('.my-elements');
        const element = await elements.last();
    });
});
```
