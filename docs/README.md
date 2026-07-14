# 📚 How to Add New Documentation to Frontend Tools

Our documentation is built using [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

To keep the documentation source files close to the actual code of the plugins/packages, we use **Relative Symlinks**. This allows you to edit the `.md`/`.mdx` files directly inside the plugin's repository (e.g., `gameface-ui-vite-plugins/my-plugin/docs`), while the Astro portal automatically reads and builds them.

To add documentation for a new package, follow these **3 steps**:

## Step 1: Create a Relative Symlink

⚠️ **Important:** You must use **relative paths** (not absolute paths like `C:\...`) so the links don't break when pushed to Git or cloned by other developers.

Open your terminal, navigate to the `src/content/docs` directory inside the documentation project, and create the symlink:

### 🪟 Windows (Run Command Prompt as Administrator)

**Open `cmd` as administrator!**

Use the `mklink /d` command. The syntax is `mklink /d <link-name> <relative-target-path>`.

```cmd
cd path\to\frontend-tools\docs\src\content\docs

:: Example:
mklink /d vite-gameface-style-transformer ..\..\..\..\gameface-ui-vite-plugins\vite-gameface-style-transformer\docs\
```

### 🍎 Mac / 🐧 Linux

Use the ln -s command. The syntax is ln -s <relative-target-path> <link-name>.

```Bash
cd path/to/frontend-tools/docs/src/content/docs

# Example:
ln -s ../../../../gameface-ui-vite-plugins/vite-gameface-style-transformer/docs vite-gameface-style-transformer
```

## Step 2: Register the Documentation in astro.config.ts

Now that Astro has access to the files, you need to configure the Starlight Sidebar Topics Dropdown so users can navigate to it.

Open `astro.config.ts` and update the `getConfig()` function:

1. Update the `documentations` array

Add the ID of your new documentation folder to the `documentations` array. This is used to auto-generate redirects and changelog topics.

```TypeScript
const documentations = [
  'e2e', 
  'gameface-vite-plugin', 
  /* ...other docs */, 
  'vite-gameface-style-transformer' // <-- Add your new docs ID here
];
```

1. Add a new configuration object to `sideBarTopics`

Append a new configuration block to the `sideBarTopics` array. This defines the sidebar structure, icons, and automatically fetches the version from the plugin's package.json.

```TypeScript
const sideBarTopics = [
  // ... existing topics ...
  {
    link: '/vite-gameface-style-transformer/getting-started',
    label: 'Vite Style Transformer',
    id: 'vite-gameface-style-transformer',
    icon: 'seti:css', // Choose an appropriate icon
    items: [
      // 1. Fetch Version
      await generateVersionWithPackageJSON(
        '../gameface-ui-vite-plugins/vite-gameface-style-transformer/package.json',
        'https://npmjs.org/vite-plugin-gameface-styles'
      ),
      // 2. Auto-generate sidebar from directories
      {
        label: 'Getting Started',
        autogenerate: { directory: 'vite-gameface-style-transformer/getting-started' },
      },
      {
        label: 'Concepts',
        autogenerate: { directory: 'vite-gameface-style-transformer/concepts' },
      },
      // 3. Auto-generate Changelog
      generateMultipleDocsChangelog('vite-gameface-style-transformer'),
    ],
  },
];
```

3. **(Optional)** Update Vite's File System Allow List

If Vite throws a "The request url is outside of Vite serving allow list" error during development, add your new folder path to the `vite.server.fs.allow` array in the config:

```TypeScript
vite: {
  server: {
    fs: {
      allow: [
        '.', 
        './src/content/docs/interaction-manager',
        './src/content/docs/vite-gameface-style-transformer' // <-- Add this if needed
      ],
    },
  },
//...
```

## Step 3: Test Locally

Start the development server to ensure everything is linked and routing properly:

```Bash
npm run dev
```

1. Open the local URL.
2. Click the topics dropdown in the sidebar.
3. Verify that your new documentation appears, the version is fetched correctly, and the sidebar generates the .md pages as expected.

Once verified, you can commit your changes. Git will naturally track the relative symlink.
