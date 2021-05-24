const gameFunc = require('../src/Game');
const assert = require("assert");
const { expect } = require("chai");

describe("game start", () => {
  describe("initialize team scores", () => {
    it("sets scores depending on the starting team", () => {
      const gameInfo = {
        redScore: 8,
        blueScore: 8,
        blueStarts: true,
      };
      gameFunc.initScores(gameInfo);
      expect([gameInfo.blueScore, gameInfo.redScore]).to.deep.equal([9,8]);
    });
  });
});
