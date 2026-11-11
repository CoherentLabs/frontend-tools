# How to use

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/vite-solid-style-to-css-plugin/getting-started/how-to-use/

To use the `Solid Style to CSS` plugin, you need to set up your project with Vite and then configure the plugin in your `vite.config.js` file.

After you have Vite project, vite config file, and the plugin installed, you can enable the plugin by adding it to the `plugins` array in your Vite configuration file. Here’s a basic example of how to do this:

```js
import { defineConfig } from 'vite';
import solidStyleToCssPlugin from 'vite-solid-style-to-css';

export default defineConfig({
    ...
    plugins: [
        solidStyleToCssPlugin()
        ...
    ],
    ...
});
```

Make sure `solidStyleToCssPlugin` method is called as a first plugin in the array. This is important because the plugin needs to be the first one to process the files.
