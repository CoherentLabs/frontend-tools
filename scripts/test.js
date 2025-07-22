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
        if (!toolArg) throw new Error('Tool path is not specified. Use --toolArg=<path> to specify the toolArg path.');
        const toolPath = path.join(TOOLS_PATH, toolArg.split('=')[1]);
        const gamefacePathArg = args.find(arg => arg.startsWith('--gamefacePath='));
        const gamefacePath = gamefacePathArg ? path.join(toolPath, gamefacePathArg.split('=')[1]) : null;
        const shouldBuildTool = args.includes('--buildTool');

        if (!gamefacePath) {
            await runTests(toolPath, `test`, shouldBuildTool);
        } else {
            await runTests(toolPath, `test -- --gamefacePath=${gamefacePath}`, shouldBuildTool);
        }
    } catch (error) {
        console.error(error);
        process.exitCode = -1;
    }
}

main();