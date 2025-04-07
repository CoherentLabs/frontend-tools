# Frontend-tools

## Publish Workflow

To publish the package automatically to npm, ensure the following requirements are met:

1. The package must reside in a separate folder within the repository, such as the `e2e` package.
2. A `package.json` file with a defined version must be present. When the version is updated and the PR is merged into the master branch, the package will be automatically uploaded to npm.
3. The `package.json` file **must include a `publish` script**. This is **mandatory** as the publish workflow executes this script. The script can be as simple as:

```json
"publish": "npm publish"
```

if no build steps are required, or:

```json
"publish": "${clear/build commands} && npm publish"
```

if you need to clean and build the package before publishing.
4. For Vite plugins related to GamefaceUI, include them in the `gameface-ui-vite-plugins` folder and adhere to the same rules outlined in points 1 to 3.
