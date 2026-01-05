import { gamefaceCommands } from '../dist/commands/commands';
import { Utils } from '../dist/utils';

type IGamefaceCommandsMethods = {
    [K in keyof typeof gamefaceCommands as typeof gamefaceCommands[K] extends Function ? K : never]: typeof gamefaceCommands[K];
};

type IGamefaceCommands = IGamefaceCommandsMethods;
type IUtils = Utils;

type GamefaceExclusions =
    | '_ws'
    | '_cohtmlJSPath'
    | 'handleMessage'
    | 'rootNodeId'
    | 'ws'
    | 'cohtmlJSPath'
    | 'player'
    | 'pendingCommands';

type UtilsExclusions =
    | '_retryInner'
    | 'getPressedKey';

type FilteredGamefaceCommands = Omit<IGamefaceCommands, GamefaceExclusions>;
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