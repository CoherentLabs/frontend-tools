/// <reference path="../../types/global.d.ts" />

const commands = require("./commands");
const { sleep, retryIfFails, KEYS } = require('../utils');

global.gf = {
    sleep,
    retryIfFails,
    KEYS,
    ...commands,
};