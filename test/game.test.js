const { GameInfo } = require("../src/GameInfo");
const { Credential } = require("../src/Credential");
const { playersHere } = require("../src/Utils");
const assert = require("assert");
const { expect } = require("chai");


describe("game functionality testing", () => {
describe("game start", () => {
  describe("initialize team scores", () => {
    it("sets scores depending on the starting team", () => {
      let gameInfo = new GameInfo();
      gameInfo.setBlueStarts(true);
      gameInfo.initScores();
      expect([gameInfo.getBlueScore(), gameInfo.getRedScore()]).to.deep.equal([
        9, 8,
      ]);

      gameInfo.setBlueStarts(false);
      gameInfo.initScores();
      expect([gameInfo.getBlueScore(), gameInfo.getRedScore()]).to.deep.equal([
        8, 9,
      ]);
    });
  });
});

describe("check if all types of players present", () => {
  it("if no one left", () => {
    assert.equal(playersHere([], [], null, null), false)
  });
  it("if only one group exists", () => {
    assert.equal(playersHere([new Credential("12345", "test1")], [], null, null), false)
  });
  it("if everyone present", () => {
    assert.equal(playersHere([new Credential("12345", "test1")], [new Credential("12345", "test1")], new Credential("12345", "test1"), new Credential("12345", "test1")), true);
  })
});

})