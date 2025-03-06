const assert = require('assert');

describe('Test script', function () {
    it('Test script with mocha', async function () {
        await assert(1 == 1);
    });
});