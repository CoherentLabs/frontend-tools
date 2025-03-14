/// <reference path="./global.d.ts" />

const commands = require("./commands");
const { sleep, retryIfFails } = require('../utils');

global.gf = {
    sleep,
    retryIfFails,
    ...commands,
};