# Language Server for Gameface

Get data-bind-* autocomplete suggestions as you type in Visual Studio Code.
You can even access the [engine models'](https://docs.coherent-labs.com/cpp-gameface/content_development/htmldatabindingjs_native/) properties if you provide their definitions in a JSON format. They should be located in a `gameface-models` folder located at the root of the workspace. For more details refer to the [documentation.](https://docs.coherent-labs.com/cpp-gameface/content_development/autocomplete/#configuring-the-models)

## Functionality

This Language Server works for HTML, JavaScript, TypeScript, jsx, tsx files. It has the following language features:
- Completions for data-bind-* attributes
  - type **data-bind** and you'll automatically get suggestions
- Completions for data binding models
  - type **Model.prop.** or **model[prop]** and you'll automatically get suggestions
  - for arrays use property accessors with bracket notation - model.players[0]

The trigger symbol that will show the suggestions for the models is a dot = **.**.


## Structure

```
.
├── client // Language Client
│   ├── src
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the Language Server

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in 'plain text' language mode.
  - Type `j` or `t` to see `Javascript` and `TypeScript` completion.
  - Enter text content such as `AAA aaa BBB`. The extension will emit diagnostics for all words in all-uppercase.

## Installing the package

Open a terminal and use the VS Code command line and run:

`code pathToPackage/gameface-language-server.vsix`

This will install the extension under your user .vscode/extensions.

## Usage

Once you've installed the extension, you can open VS Code, create an `HTML` file and
you'll get auto complete suggestions for the `Gameface` data-bind-* attributes as you type.

If you want to enable auto complete for models, you'll need to provide the definitions of these models.
The extension works directly with the JavaScript declaration of the object, but described in a `JSON` format.

Run `JSON.stringify` on all of your models and save the result into a file with the same name as the model that it
will contain. For example the model Player will should be saved in a file called `Player.json`. The names are case-sensitive, so make sure that the model and the file have exactly the same names.
All model definitions need to be in a folder called `gameface-models` located somewhere in the currently
opened workspace.

If your model contains functions, you need to provide a replacer function that alters the behavior of the stringification process
in order to strigify functions:

~~~~{.js}
JSON.stringify(Model, function(key, value) {
    if (typeof value === 'function') {
        return value.toString()
    }
    return value;
});
~~~~