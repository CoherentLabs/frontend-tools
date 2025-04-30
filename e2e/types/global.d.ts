import { GamefaceCommandsMethods } from 'gamefaceCommands';
import Utils from '../core/utils';

type UtilMethods = {
    [K in keyof typeof Utils as typeof Utils[K] extends Function ? K : never]: typeof Utils[K];
};

type FilteredGamefaceCommands = Omit<GamefaceCommandsMethods, '_ws' | 'handleMessage' | 'rootNodeId' | 'ws' | 'player'>;
type FilteredUtilMethods = Omit<UtilMethods, '_retryInner' | 'getPressedKey'>;

declare global {
    var gf: FilteredGamefaceCommands & FilteredUtilMethods & { KEYS: typeof Utils.KEYS };
}

export { };