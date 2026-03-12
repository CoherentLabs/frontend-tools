const path = require('path');
const fsPromises = require('fs/promises');
const fs = require('fs');
const { execSync } = require('child_process');
const VITE_PLUGINS_PATH = path.join(__dirname, '../gameface-ui-vite-plugins');
const TOOLS_PATH = path.join(__dirname, '..');

/**
 * Will get package json from some tool
 * @param {string} tool
 * @returns {Object}
 */
function getPackageJSON(tool) {
    const packageJSONPath = path.join(tool, 'package.json');
    const fsStats = fs.lstatSync(packageJSONPath, { throwIfNoEntry: false });
    if (!fsStats || !fsStats.isFile()) {
        console.error(`Could not find package.json for ${tool}. Make sure the tool exists and has a valid source code.`);
        return null;
    }
    return JSON.parse(fs.readFileSync(packageJSONPath));
}

/**
 * Gets the latest version of some npm package
 * @param {string} npmPackage - The npm package name
 * @returns {string}
 */
function getPublicVersion(npmPackage) {
    return execSync(`npm view ${npmPackage} version`, { encoding: 'utf8' }).replace('\n', '');
}

/**
 * Checks if some tool should be updated in npm if its version is bumped
 * @param {string} tool
 * @returns {boolean}
 */
function shouldUpdate(tool) {
    const packageJSON = getPackageJSON(tool);
    if (!packageJSON) return false;

    const name = packageJSON.name;
    // if a tool doesn't exist in the registry then it must be published
    if (!JSON.parse(execSync(`npm search ${name} --json`, { encoding: 'utf8' })).length) return true;

    const localVersion = packageJSON.version;
    try {
        const publicVersion = getPublicVersion(name);

        if (localVersion !== publicVersion) {
            console.log(`Package ${tool} has new local version - ${localVersion}. The current npm version is ${publicVersion}.`);
            return true;
        }

        return false;
    } catch (error) {
        // if a tool doesn't exist in the registry then it must be published
        if (error.message.includes(`GET https://registry.npmjs.org/${name} - Not found`)) return true;
    }
}


/**
 * Will publish tool changes in npm
 * @param {string} tool
 * @param {string} folder
 */
async function publish(tool) {
    try {
        execSync(`npm run publish:package`, { cwd: path.join(tool), encoding: 'utf8', stdio: 'inherit' });
        console.log(`Successfully published ${tool}.`);
    } catch (err) {
        console.error(err);
        process.exitCode = -1;
    }
}

async function getToolsDirs(root, exclude = []) {
    const excludeDirs = ['.github', 'scripts', 'docs', 'docs-theme', 'node_modules', '.git', ...exclude];
    const dirs = [];

    async function walk(dir) {
        const entries = await fsPromises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (excludeDirs.includes(entry.name)) continue;

                dirs.push(fullPath);
            }
        }
    }

    await walk(root);
    return dirs;
}

const coherentDocsThemePath = path.join(__dirname, '../docs-theme/packages/coherent-docs-theme');

/** */
async function main() {
    try {
        const tools = [
            ...await getToolsDirs(TOOLS_PATH, ['gameface-ui-vite-plugins', 'language-server', 'gf-figma-exporter']),
            ...await getToolsDirs(VITE_PLUGINS_PATH),
            coherentDocsThemePath
        ];
        for (const tool of tools) {
            if (shouldUpdate(tool)) await publish(tool);
        }
    } catch (error) {
        console.error(error);
        process.exitCode = -1;
    }
}

main();