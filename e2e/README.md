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

The `gf` object provides various methods to interact with the Gameface UI. Here are the available methods:

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

#### `element.click(): Promise<void>`

Simulates a click on the element.

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
