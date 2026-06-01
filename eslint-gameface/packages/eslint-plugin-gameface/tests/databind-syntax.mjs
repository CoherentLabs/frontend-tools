import assert from "node:assert/strict";
import {
  findBindForViolation,
  isValidBindForValue,
  isValidClassToggleValue,
} from "../src/utils/databind-checks.js";

assert.equal(isValidBindForValue("lor;af gaeg:{{Model.value}}"), false);
assert.equal(isValidClassToggleValue("af;fae;faef:{{Model.value}}"), false);

assert.equal(isValidBindForValue("index, iter : {{Model.arrayProperty}}"), true);
assert.equal(isValidBindForValue("weapon:{{player.weapons}}"), true);
assert.equal(isValidBindForValue("index, _:{{g_Player.pets}}"), true);
assert.equal(isValidBindForValue("index, iter : [ {{myModel}}, {{myModel}} ]"), true);
assert.equal(isValidBindForValue("iter:uiState.vList({{g_Game.heroes}})"), true);

assert.equal(isValidClassToggleValue("my-class:{{Model.name}}"), true);
assert.equal(isValidClassToggleValue("red:{{this.hasLowHealth}}"), true);
assert.equal(
  isValidClassToggleValue("red:{{this.Health}} < 50;blue:{{Model.flag}}"),
  true,
);
assert.equal(isValidClassToggleValue("class-name:!{{Model.prop}}"), true);

assert.equal(findBindForViolation("lor;af gaeg:{{Model.value}}"), "missingIterator");
assert.equal(findBindForViolation("1model: {{Model.property}}"), "startsWithNumber");

console.log("databind-syntax: ok");
