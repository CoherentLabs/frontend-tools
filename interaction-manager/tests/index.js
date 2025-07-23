/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coherent Labs AD. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const fs = require('fs');
const path = require('path');
const { execSync, exec, spawn } = require('child_process');
require("dotenv").config({ path: path.join(__dirname, '..', '..', '.env') });

let gamefacePath = process.env.GAMEFACE_PATH;

const TESTS_FOLDER = __dirname;
const ROOT_FOLDER = path.join(__dirname, '../');

const INTERACTION_MANAGER_FOLDER = path.join(__dirname, '../');
const IMFolder = path.join(INTERACTION_MANAGER_FOLDER, 'dist');
const IMTestFolder = path.join(TESTS_FOLDER, 'interaction-manager');

const KARMA_PORT = 9876;

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

let cohtmlPlayer = null;

function startGameface() {
    cohtmlPlayer = spawn(gamefacePath, ['--url=http://localhost:9876/debug.html']);

    cohtmlPlayer.on('error', (err) => {
        console.error(err);
        global.process.exitCode = -1;
    })
    cohtmlPlayer.on('data', data => console.log(data))
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
    execSync(`npx kill-port ${KARMA_PORT}`, { cwd: ROOT_FOLDER, stdio: 'inherit' });

    startKarma();
}

/**
 * Start a Karma server and listen for process events
 */
function startKarma() {
    const karmaProcess = exec(`karma start tests/karma.conf.js`, { cwd: ROOT_FOLDER });

    karmaProcess.stderr.on('data', function (data) {
        console.error(data.toString());
    });
    karmaProcess.stdout.on('data', function (data) {
        if (gamefacePath && data.includes('server started at http://localhost:9876/')) startGameface();
        if (data.includes('[FAILED]')) process.exitCode = -1;
        console.log(data.toString());
    });
    karmaProcess.on('exit', function (code) {
        global.process.exit(code);
    });
    karmaProcess.on('uncaughtException', (err) => {
        console.error(err);
        global.process.exit(1);
    });
    karmaProcess.on('close', () => {
        if (cohtmlPlayer) cohtmlPlayer.kill();
    })
}


/** */
function main() {
    if(!gamefacePath) {
        console.error("Gameface path is not specified. Please set the GAMEFACE_PATH environment variable.");
        global.process.exit(1);
    }
    const args = global.process.argv.slice(2);
    const rebuild = args.indexOf('--rebuild') > -1;
    test(rebuild);
}

main();
