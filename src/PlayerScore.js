class PlayerScore {
  constructor(scoreOp, scoreSpy) {
    this.Op = scoreOp;
    this.Spy = scoreSpy;
  }
  getOp(){
    return this.Op;
  }
  getSpy(){
    return this.Spy;
  }
  setOp(op){
    this.Op = op;
  }
  setSpy(spy){
    this.Spy = spy;
  }
}

module.exports = {
  PlayerScore : PlayerScore,
}