const {GameInfo} = require("../src/GameInfo")
const assert = require("assert");
const { expect } = require("chai");

describe("game start", () => {
  describe("initialize team scores", () => {
    it("sets scores depending on the starting team", () => {
      let gameInfo = new GameInfo();
      gameInfo.setBlueStarts(true);
      gameInfo.initScores();
      expect([gameInfo.getBlueScore(), gameInfo.getRedScore()]).to.deep.equal([9,8]);

      gameInfo.setBlueStarts(false);
      gameInfo.initScores();
      expect([gameInfo.getBlueScore(), gameInfo.getRedScore()]).to.deep.equal([8,9]);
    });
  });
});
