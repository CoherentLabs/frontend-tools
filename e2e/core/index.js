const { globSync } = require('glob');
const { spawnPlayer, killPlayer } = require('./player');
const { createClient, closeClient, runTests } = require('./ws-server');
const path = require('node:path');
const { cwd } = require('node:process');
const { Command, Flags, Errors } = require('@oclif/core');
const fs = require('node:fs');
const Mocha = require('mocha');

class GamefaceE2E extends Command {
    static description = 'Gameface e2e cli';

    static flags = {
        bail: Flags.boolean({
            required: false,
            description: 'Enables bailing on the first failure.',
        }),
        tests: Flags.string({
            char: 't',
            required: false,
            description: 'Path to the tests .spec files.',
        }),
        gamefacePath: Flags.string({
            char: 'p',
            required: false,
            description: 'Path to the Player executable.',
        }),
        specTimeout: Flags.integer({
            required: false,
            description: 'The time before test spec will timeout.',
        }),
        config: Flags.string({
            required: false,
            description: 'Path to the tests config file.',
        }),
    };


    setConfig(flags) {
        global.config = {};

        const configPath = path.join(cwd(), flags.config || 'gameface-e2e-config.js');
        this.debug(`Config file path is: ${configPath}`);
        if (fs.existsSync(configPath)) {
            const config = require(configPath);

            this.tests = config.tests;
            this.gamefacePath = config.gamefacePath;
            this.specTimeout = config.specTimeout;
            this.bail = config.bail;
        } else {
            this.warn(`Unable to find config file with path: ${configPath}. Please make sure this file exists!`);
        }


        if (!this.tests && !flags.tests) {
            this.error("No test .spec files specified!", {
                code: "NO_TESTS",
                suggestions: [
                    'Set the path to your .spec test files in your config.js through the "tests" property.',
                    'Use "tests" argument when running the tests through cli to specify the .spec files path.'
                ],
                exit: 1
            });
        }

        global.config.tests = flags.tests || this.tests;

        if (!this.gamefacePath && !flags.gamefacePath) {
            this.error("Path to the gameface player executable is not specified!", {
                code: "NO_GAMEFACE_PATH",
                suggestions: [
                    'Set the path in your config.js through the "gamefacePath" property.',
                    'Use "gamefacePath" argument when running the tests through cli to specify the path.'
                ],
                exit: 1
            });
        }
        global.config.specTimeout = flags.specTimeout || this.specTimeout;

        if (!this.gamefacePath && !flags.gamefacePath) {
            this.error("Path to the gameface player executable is not specified!", {
                code: "NO_GAMEFACE_PATH",
                suggestions: [
                    'Set the path in your config.js through the "gamefacePath" property.',
                    'Use "gamefacePath" argument when running the tests through cli to specify the path.'
                ],
                exit: 1
            });
        }

        global.config.gamefacePath = flags.gamefacePath || this.gamefacePath;

        global.config.bail = flags.bail || this.bail;
    }

    async catch(error) {
        await closeClient();

        // From child process the catch will be triggered but the error handling will be done automatically
        // so here the `error` argument will be undefined
        if (error) {
            if (error instanceof Errors.CLIError) {
                Errors.handle(error);
            } else {
                console.error(error);
            }
        }

        this.exit(1);
    }

    async initMocha() {
        const mocha = new Mocha();
        const specFiles = await globSync(this.tests);
        if (!specFiles.length) {
            this.error("No test files were found!", {
                code: "NO_TEST_FILES",
                suggestions: [
                    'Set the path to your .spec test files in your config.js through the "tests" property.',
                    'Use "tests" argument when running the tests through cli to specify the .spec files path.',
                    'Make sure the pattern you are using for the test files will match such. '
                ],
                exit: 1
            });
        }

        mocha.addFile('./core/commands/setup-mocha.js');

        for (const file of specFiles) {
            mocha.addFile(path.resolve(cwd(), file));
        }

        return mocha;
    }

    async run() {
        global.log = {
            error: this.error.bind(this),
            log: this.log.bind(this),
            debug: this.debug.bind(this),
            warn: this.warn.bind(this)
        }

        const { flags } = await this.parse(GamefaceE2E);
        this.setConfig(flags);

        process.on('close', async () => {
            await closeClient();
            await killPlayer();
        });

        const mocha = await this.initMocha();
        await spawnPlayer();
        await createClient();
        await runTests(mocha);
    }
}

module.exports = GamefaceE2E;