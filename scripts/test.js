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
        const args = process.argv.slice(2);
        const toolArg = args.find(arg => arg.startsWith('--tool='));
        if (!toolArg) throw new Error('Tool path is not specified. Use --tool=<path> to specify the toolArg path.');
        const toolPath = path.join(TOOLS_PATH, toolArg.split('=')[1]);
        const shouldBuildTool = args.includes('--build');

        await runTests(toolPath, `test`, shouldBuildTool);
    } catch (error) {
        console.error(error);
        process.exitCode = -1;
    }
}

main();