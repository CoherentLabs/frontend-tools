/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require("dotenv").config({ path: path.join(__dirname, '..', '..', '..', '.env') });

let gamefacePath = process.env.GAMEFACE_PATH;

const TESTS_FOLDER = __dirname;
const ROOT_FOLDER = path.join(__dirname, '..', '..');

const IMFolder = path.join(ROOT_FOLDER, 'dist');
const IMTestFolder = path.join(TESTS_FOLDER, 'interaction-manager');
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
process.env.PORT = portArg.split('=')[1];

/**
 * Checks if all the components are having packages and are not missing
 * @returns {boolean}
 */
function areComponentsPackaged() {
    const notBuildComponents = [];

    if (fs.existsSync(IMTestFolder) && !fs.existsSync(IMFolder)) notBuildComponents.push('interaction-manager');

    if (!notBuildComponents.length) return true;
    console.error(`Missing packages for ${notBuildComponents.join(', ')}.
    Did you forget to build the components?
    Try running npm run test -- --rebuild to generate the component packages.`);

    return false;
}

/**
 * Will build components and test them
 * @param {boolean} rebuild
 * @returns {void}
 */
function test(rebuild) {
    if (rebuild) {
        execSync('npm run build:im', { cwd: ROOT_FOLDER, stdio: 'inherit' });
    }
    if (!areComponentsPackaged()) global.process.exit(1);

    execSync('npm i', { cwd: ROOT_FOLDER, stdio: 'inherit' });
    startGamefaceE2E();
}

/**
 * Start a Karma server and listen for process events
 */
function startGamefaceE2E() {
    if (!gamefacePath) {
        console.error("Gameface path is not specified. Please set the GAMEFACE_PATH environment variable.");
        process.exit(1);
    }

    if (!path.isAbsolute(gamefacePath)) {
        gamefacePath = path.resolve(__dirname, '..', '..', gamefacePath);
    }

    try {
        execSync(`npm i`, {
            stdio: "inherit",
            shell: true,
            cwd: path.join(__dirname, '..', '..', '..', 'e2e'),
        });
        execSync(`node ../e2e/bin/run.js --config=./tests/gameface-e2e-config.js --gamefacePath=${gamefacePath}`, {
            stdio: "inherit",
            shell: true,
        });
    } catch (error) {
        process.exitCode = error.status || 1;
    }
}


/** */
function main() {
    if (!gamefacePath) {
        console.error("Gameface path is not specified. Please set the GAMEFACE_PATH environment variable.");
        global.process.exit(1);
    }
    const args = global.process.argv.slice(2);
    const rebuild = args.indexOf('--rebuild') > -1;
    test(rebuild);
}

main();
