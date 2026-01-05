/// <reference path="../../types/global.d.ts" />

const commands = require("./commands");
const { sleep, retryIfFails, KEYS, GAMEPAD_BUTTONS } = require('../utils');

global.gf = {
    sleep,
    retryIfFails,
    KEYS,
    GAMEPAD_BUTTONS,
    ...commands,
};