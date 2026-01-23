import * as Lib from './interaction-manager';

declare global {
    const spatialNavigation: typeof Lib.spatialNavigation;
    const draggable: typeof Lib.draggable;
    const zoom: typeof Lib.zoom;
    const actions: typeof Lib.actions;
    const gamepad: typeof Lib.gamepad;
    const keyboard: typeof Lib.keyboard;
    const dropzone: typeof Lib.dropzone;
    const resize: typeof Lib.resize;
    const rotate: typeof Lib.rotate;
    const touchGestures: typeof Lib.touchGestures;
    const interactionManager: typeof Lib

    interface Window {
        spatialNavigation: typeof Lib.spatialNavigation;
        draggable: typeof Lib.draggable;
        zoom: typeof Lib.zoom;
        actions: typeof Lib.actions;
        gamepad: typeof Lib.gamepad;
        keyboard: typeof Lib.keyboard;
        dropzone: typeof Lib.dropzone;
        resize: typeof Lib.resize;
        rotate: typeof Lib.rotate;
        touchGestures: typeof Lib.touchGestures;
        interactionManager: typeof Lib
    }
}

// 3. Essential: This makes the file a module so 'declare global' works
export {};