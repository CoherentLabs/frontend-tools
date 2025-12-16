import { GamefaceCommands } from '../src/commands/commands';
import { Utils } from '../src/utils';

declare global {
    var log: {
        error: (msg: string, meta?: any) => void;
        log: (msg: string) => void;
        debug: (msg: string) => void;
        warn: (msg: string) => void;
    };

    var config: {
        tests?: string;
        gamefacePath?: string;
        specTimeout?: number;
        bail?: boolean;
    };

    interface Window {
        engine: any;
        _gamepads: any[];
        loadCohtmlJS: (path: string) => Promise<void>;
    }
}