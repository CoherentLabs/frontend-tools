# gameface-e2e-config.js

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gameface-e2e-config/

The `gameface-e2e-config.js` file is a configuration file for the `gameface-e2e` testing framework. It allows you to specify various properties that control the behavior of the framework when running your tests.

## Configuration Properties

Property | Type | Description
**gamefacePath** | **String** | Specifies the path to your `Player.exe`.
**tests** | **String** | Specifies the path to your test `.spec.js` files.
**specTimeout** | **Number** | Sets the timeout for tests in spec files. The default is 10 seconds. Use this property to increase the timeout if needed.
**bail** | **Boolean** | Enables bailing on the first failure.

## Example

Here is an example of a `gameface-e2e-config.js` file:

```js
module.exports = {
    gamefacePath: "C:/Gameface/Player/Player.exe",
    tests: "examples/**/*.spec.js",
    specTimeout: 20000,
    bail: true
}
```

## Config autocompletion

If you are using TypeScript or a code editor that supports JSDoc, you can get autocompletion for the configuration properties by adding the following JSDoc comment at the top of your `gameface-e2e-config.js` file:

```js
/** @type {import('gameface-e2e').GamefaceE2EConfig} */

module.exports = {
    gamefacePath: "C:/Gameface/Player/Player.exe",
    tests: "examples/**/*.spec.js",
    specTimeout: 20000,
    bail: true
}
```

Like this, your editor will provide suggestions and type checking for the configuration properties.
