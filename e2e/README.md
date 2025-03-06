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

## `gameface-e2e-config.js` Configuration Properties

| Property     | Type   | Description                                                                                                               |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| gamefacePath | String | Specifies the path to your `Player.exe`.                                                                                  |
| tests        | String | Specifies the path to your test `.spec.js` files.                                                                         |
| specTimeout  | Number | Sets the timeout for tests in spec files. The default is 10 seconds. Use this property to increase the timeout if needed. |

## Debugging

The framework includes debug logs that can be useful if you encounter an error that is not sufficiently descriptive. For instance, you might face a WebSocket server error due to an incorrect `Player.exe` path. Enabling debug logs can provide insights such as "Spawning player executable with path: ...", helping you identify the issue.

To enable debug logs, execute the `gameface-e2e` command as follows:

```shell
DEBUG=oclif:gameface-e2e* npx gameface-e2e
```

On Windows, use:

```shell
set DEBUG=oclif:gameface-e2e* npx gameface-e2e
```
