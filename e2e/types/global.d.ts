import GamefaceCommands from "../core/commands/commands";
import Utils from '../core/utils';

type GamefaceCommandsMethods = {
    [K in keyof typeof GamefaceCommands as typeof GamefaceCommands[K] extends Function ? K : never]: typeof GamefaceCommands[K];
};

type UtilMethods = {
    [K in keyof typeof Utils as typeof Utils[K] extends Function ? K : never]: typeof Utils[K];
};

type FilteredGamefaceCommands = Omit<GamefaceCommandsMethods, '_ws' | 'handleMessage' | 'rootNodeId' | 'ws' | 'player'>;
type FilteredUtilMethods = Omit<UtilMethods, '_retryInner'>;

declare global {
    var gf: FilteredGamefaceCommands & FilteredUtilMethods;
}

export { };