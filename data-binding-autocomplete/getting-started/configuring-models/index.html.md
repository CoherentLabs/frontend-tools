# Configuring the Models

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/data-binding-autocomplete/getting-started/configuring-models/

In order to get model suggestions, we’ll need to provide the definitions of your models. The language server works with examples of the models as `json` objects. You don’t have to manually write the definitions. Run this code on your models and save the results into files that have the same name as the model:

```js
const playerModel = {
    name: 'John Doe'
};

const json = JSON.stringify(playerModel, function(key, value) {
  if (typeof value === 'function') return 'function';
  return value;
});

// json will be:
// "{"name":"John Doe"}"
```

The file for the model above should be named `playerModel.json`. Put all of the `json` definitions in a folder named `gameface-models` anywhere in your workspace. You’ll need this folder only during development, you don’t need to include it in the final package of your project.
