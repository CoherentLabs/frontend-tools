import { GamefaceCommands } from '../dist/commands/commands';
import { Utils } from '../dist/utils';

type IUtils = Utils;

type GamefaceExclusions =
    | '_ws'
    | '_cohtmlJSPath'
    | 'handleMessage'
    | 'rootNodeId'
    | 'ws'
    | 'cohtmlJSPath'
    | 'player'
    | 'commandTimeout'
    | 'pendingCommands';

type UtilsExclusions =
    | '_retryInner'
    | 'getPressedKey';

type FilteredGamefaceCommands = Omit<GamefaceCommands, GamefaceExclusions>;
type FilteredUtilMethods = Omit<IUtils, UtilsExclusions>;

declare global {
    var gf: FilteredGamefaceCommands & FilteredUtilMethods;
}

export interface GamefaceE2EConfig {
    /** 
     * Specifies the path to your Player.exe. 
     */
    gamefacePath?: string;

    /** 
     * Specifies the path to your test .spec.js or .spec.ts files. 
     * Supports glob patterns (e.g. "tests/*.spec.js").
     */
    tests?: string;

    /** 
     * Sets the timeout for tests in spec files in milliseconds. 
     * The default is 10 seconds (10000). 
     */
    specTimeout?: number;

    /** 
     * Enables bailing on the first failure. 
     * If true, the test run stops immediately after a test fails.
     */
    bail?: boolean;
}

export { };