const { randBool, generateLabels, generateBoard } = require("./Utils");
class GameInfo {
  constructor() {
    this.started = false;
    this.maxNOps = 4;
    this.maxNSpies = 1;
    this.board = [];
    this.labels = [];
    this.clues = [];
    this.redScore;
    this.blueScore;
    this.blueStarts = true;
    this.turnBlue = true;
    this.turnSpy = true;
    this.turnN = 0;
  }
  getStarted() {
    return this.started;
  }
  getMaxNOps() {
    return this.maxNOps;
  }
  getMaxNSpies() {
    return this.maxNSpies;
  }
  getBoard() {
    return this.board;
  }
  getLabels() {
    return this.labels;
  }
  getRedScore() {
    return this.redScore;
  }
  getBlueScore() {
    return this.blueScore;
  }
  getBlueStarts() {
    return this.blueStarts;
  }
  getTurnBlue() {
    return this.turnBlue;
  }
  getTurnSpy() {
    return this.turnSpy;
  }
  getTurnN() {
    return this.turnN;
  }
  setStarted(started) {
    this.started = started;
  }
  setMaxNOps(maxNOps) {
    this.maxNOps = maxNOps;
  }
  setMaxNSpies(maxNSpies) {
    this.maxNSpies = maxNSpies;
  }
  setBoard(board) {
    this.board = board;
  }
  setLabels(labels) {
    this.labels = labels;
  }
  setRedScore(redScore) {
    this.redScore = redScore;
  }
  setBlueScore(blueScore) {
    this.blueScore = blueScore;
  }
  setBlueStarts(blueStarts) {
    this.blueStarts = blueStarts;
  }
  setTurnBlue(turnBlue) {
    this.turnBlue = turnBlue;
  }
  setTurnSpy(turnSpy) {
    this.turnSpy = turnSpy;
  }
  setTurnN(turnN) {
    this.turnN = turnN;
  }

  init(wordList) {
    this.setStarted(true);
    this.setBlueStarts(randBool());
    this.setTurnBlue(this.getBlueStarts());
    this.setTurnSpy(true);
    this.setLabels(generateLabels(this.getBlueStarts()));
    this.setBoard(generateBoard(wordList));
    this.initScores();
  }
  initScores() {
    if (this.getBlueStarts()) {
      this.setBlueScore(9);
      this.setRedScore(8);
    } else {
      this.setRedScore(9);
      this.setBlueScore(8);
    }
  }
  turnIncrement() {
    this.turnN++;
  }
  reset() {
    this.started = false;
    this.maxNOps = 4;
    this.maxNSpies = 1;
    this.board = [];
    this.labels = [];
    this.redScore;
    this.blueScore;
    this.blueStarts = true;
    this.turnBlue = true;
    this.turnSpy = true;
    this.turnN = 0;
  }
}

module.exports = {
  GameInfo: GameInfo,
};
