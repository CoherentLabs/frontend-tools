const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const TOOLS_PATH = path.join(__dirname, '..');

// Loads GAMEFACE_PATH (and anything else) from the repo-root .env file, same
// as gameface-e2e-config.js does — so a value set there is picked up here too
// (e.g. for the "no --player-path or GAMEFACE_PATH given" check below), and
// flows through to the child gameface-e2e processes via probeEnv.
require('dotenv').config({ path: path.join(TOOLS_PATH, '.env') });

const SCRAPER_DIR = path.join(TOOLS_PATH, 'gameface-unsupported-features');
const ESLINT_ROOT = path.join(TOOLS_PATH, 'eslint-gameface');
const PLUGIN_DIR = path.join(ESLINT_ROOT, 'packages', 'eslint-plugin-gameface');
const RESULTS_DIR = path.join(SCRAPER_DIR, 'results');
const BUILD_DELTA_SCRIPT = path.join(PLUGIN_DIR, 'scripts', 'build-version-delta.mjs');

const IS_WINDOWS = process.platform === 'win32';

/**
 * Runs a command, streaming its output, and throws on a non-zero exit.
 * Deliberately does NOT build a shell command string — env vars go through
 * the `env` option, not `VAR=value` prefix syntax, so this behaves the same
 * regardless of which shell (if any) invoked this script. `shell: true` on
 * Windows is only needed so npm-installed `.cmd` shims (npx, etc.) resolve;
 * it is not being used to interpret any shell syntax.
 * @param {string} command
 * @param {string[]} args
 * @param {import('child_process').SpawnSyncOptions} [options]
 */
function run(command, args, options = {}) {
    console.log(`\n> ${command} ${args.join(' ')}${options.cwd ? `  (in ${path.relative(TOOLS_PATH, options.cwd)})` : ''}`);
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        shell: IS_WINDOWS,
        ...options,
        env: { ...process.env, ...options.env },
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`"${command} ${args.join(' ')}" exited with code ${result.status}`);
    }
}

/**
 * Parses `--flag value` or `--flag=value` out of an argv array.
 * @param {string[]} args
 * @param {string} flag e.g. "--player-path"
 * @returns {string | undefined}
 */
function readFlagValue(args, flag) {
    const eqPrefix = `${flag}=`;
    const eqArg = args.find((a) => a.startsWith(eqPrefix));
    if (eqArg) return eqArg.slice(eqPrefix.length);
    const index = args.indexOf(flag);
    if (index !== -1) return args[index + 1];
    return undefined;
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const skipTests = args.includes('--skip-tests');
    const deltaVersionArg = args.find((a) => a.startsWith('--version'));

    // Path to the Gameface Player executable, in priority order: --player-path
    // flag, then GAMEFACE_PATH if already set in the environment, then
    // whichever hardcoded default the gameface-e2e-config*.js files fall back
    // to. Passing it here means never having to hand-edit those three files
    // just to switch which engine build gets probed.
    const playerPath = readFlagValue(args, '--player-path') ?? process.env.GAMEFACE_PATH;
    console.log(
        playerPath
            ? `Using Gameface Player: ${playerPath}`
            : 'No --player-path or GAMEFACE_PATH given — using the default in gameface-e2e-config.js.',
    );

    console.log('\n== 1/4: Building the scraper ==');
    run('npx', ['tsc'], { cwd: SCRAPER_DIR });

    // Cohtml's log filename isn't stable across launches (observed as both
    // "CohtmlApplication.log" and "TestApp.log" — apparently depending on an
    // app-identifier baked into the specific Player build, not something this
    // project controls). A stale log left over from an unrelated previous
    // session can't be reliably told apart from a fresh one after the fact,
    // and the Player path is NOT a trustworthy source of the version either.
    // Deleting every log up front sidesteps this: whatever log(s) exist after
    // the Player launches below must have been written by THIS run.
    run('npm', ['run', 'clean-logs'], { cwd: SCRAPER_DIR });

    console.log('\n== 2/4: Probing the live Gameface Player ==');
    const probeEnv = { DEBUG: 'oclif:gameface-e2e*', ...(playerPath ? { GAMEFACE_PATH: playerPath } : {}) };
    run('npx', ['gameface-e2e', '--config=gameface-e2e-config-selectors.js'], { cwd: SCRAPER_DIR, env: probeEnv });
    run('npx', ['gameface-e2e'], { cwd: SCRAPER_DIR, env: probeEnv });
    run('npx', ['gameface-e2e', '--config=gameface-e2e-config-functions.js'], { cwd: SCRAPER_DIR, env: probeEnv });

    const metaPath = path.join(RESULTS_DIR, 'meta.json');
    if (!fs.existsSync(metaPath)) {
        throw new Error(`Probe finished but ${metaPath} was not written — cannot determine the scraped version.`);
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    console.log(`\nProbed Gameface ${meta.version} (generated ${meta.generatedAt}).`);

    console.log('\n== 3/4: Updating the eslint-plugin-gameface catalog ==');
    const deltaArgs = [BUILD_DELTA_SCRIPT, RESULTS_DIR];
    if (deltaVersionArg) deltaArgs.push(deltaVersionArg);
    if (dryRun) deltaArgs.push('--dry-run');
    run('node', deltaArgs, { cwd: PLUGIN_DIR });

    if (dryRun) {
        console.log('\n--dry-run: skipping test-matrix regeneration and the test suite.');
        return;
    }

    if (skipTests) {
        console.log('\n--skip-tests: skipping test-matrix regeneration and the test suite.');
        console.log('\nDone. Review the diff in eslint-gameface/packages/eslint-plugin-gameface/gameface-features/ before committing.');
        return;
    }

    console.log('\n== 4/4: Regenerating the catalog test matrix and running tests ==');
    run('npm', ['run', 'test:extract-matrix'], { cwd: ESLINT_ROOT });
    const testResult = spawnSync('npm', ['test'], { cwd: ESLINT_ROOT, stdio: 'inherit', shell: IS_WINDOWS });
    if (testResult.status !== 0) {
        console.warn('\nSome tests failed — review the output above (a couple of known, pre-existing failures are expected; see prior findings).');
    }

    console.log('\nDone. Review the diff in eslint-gameface/packages/eslint-plugin-gameface/gameface-features/ before committing.');
}

try {
    main();
} catch (error) {
    console.error('\n' + error.message);
    process.exitCode = 1;
}
