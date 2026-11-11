# Configuring the Custom Data Bindings

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/data-binding-autocomplete/getting-started/configuring-custom-bindings/

If you are using [custom data binding attributes](https://docs.coherent-labs.com/cpp-gameface/integration/ui_scripting/htmldatabinding/#custom-data-binding-attributes) you can add your definitions in a `bindings.json` file inside a `custom-bindings` folder located at the root of the project:

```js
engine.registerBindingAttribute("my-attribute-name", MyAttributeHandler);
engine.registerBindingAttribute("my-other-attribute-name", MyOtherAttributeHandler);
```

And you’ll get autocomplete suggestions for your custom bindings.
