import { globSync } from 'glob';
import { spawnPlayer, killPlayer } from './player';
import { createClient, closeClient, runTests } from './ws-server';
import * as path from 'node:path';
import { cwd } from 'node:process';
import { Command, Flags, Errors } from '@oclif/core';
import * as fs from 'node:fs';
import Mocha from 'mocha';
import { setupGlobals } from './commands/setup-mocha';

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

    private tests?: string;
    private gamefacePath?: string;
    private specTimeout?: number;
    private bail?: boolean;

    setConfig(flags: { [key: string]: any }) {
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

    async catch(error: any) {
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

    async initMocha(): Promise<Mocha> {
        const mocha = new Mocha();
        const specFiles = await globSync(this.tests!); // logic ensures this is set
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

        setupGlobals();

        for (const file of specFiles) {
            mocha.addFile(path.resolve(cwd(), file));
        }

        return mocha;
    }

    async run() {
        // Mocking global.log to map to oclif logging methods
        global.log = {
            error: this.error.bind(this) as any,
            log: this.log.bind(this),
            debug: this.debug.bind(this),
            warn: this.warn.bind(this)
        };

        const { flags } = await this.parse(GamefaceE2E);
        this.setConfig(flags);

        process.on('close', async () => {
            await closeClient();
            await killPlayer();
        });

        const mocha = await this.initMocha();
        const { debuggingPort } = await spawnPlayer();
        await createClient(debuggingPort);
        await runTests(mocha);
    }
}

export default GamefaceE2E;