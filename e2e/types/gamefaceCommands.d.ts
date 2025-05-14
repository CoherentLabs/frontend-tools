import GamefaceCommands from "../core/commands/commands";

type GamefaceCommandsMethods = {
    [K in keyof typeof GamefaceCommands as typeof GamefaceCommands[K] extends Function ? K : never]: typeof GamefaceCommands[K];
};