const path = require('path');
const { execSync } = require('child_process');
const TOOLS_PATH = path.join(__dirname, '..');

/**
 * Will publish tool changes in npm
 * @param {string} tool
 * @param {string} folder
 */
async function runTests(tool, npmTestCommand = 'test', build = false) {
    try {
        execSync(`npm install`, { cwd: path.join(tool), encoding: 'utf8', stdio: 'inherit' });
        if (build) execSync(`npm run build`, { cwd: path.join(tool), encoding: 'utf8', stdio: 'inherit' });
        execSync(`npm run ${npmTestCommand}`, { cwd: path.join(tool), encoding: 'utf8', stdio: 'inherit' });
    } catch (err) {
        console.error(err);
        process.exitCode = -1;
    }
}

/** */
async function main() {
    try {
        const tools = [
            { path: path.join(TOOLS_PATH, 'interaction-manager'), testCommand: 'test:Chrome', build: true }
        ];
        for (const tool of tools) {
            await runTests(tool.path, tool.testCommand, tool.build)
        }
    } catch (error) {
        console.error(error);
        process.exitCode = -1;
    }
}

main();