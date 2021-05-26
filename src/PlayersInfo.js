const {Credential} = require("./Credential");
class PlayersInfo {
  constructor() {
    this.spectators = [];
    this.blueOps = [];
    this.redOps = [];
    this.redSpy = new Credential(null, null);
    this.blueSpy = new Credential(null, null);
    this.host = new Credential(null, null);
  }
  getSpectators(){
    return this.spectators;
  }
  getBlueOps(){
    return this.blueOps;
  }
  getRedOps(){
    return this.redOps;
  }
  getRedSpy(){
    return this.redSpy;
  }
  getBlueSpy(){
    return this.blueSpy;
  }
  getHost(){
    return this.host;
  }
  setBlueSpy(blueSpy){
    this.blueSpy = blueSpy;
  }
  setRedSpy(redSpy){
    this.redSpy = redSpy;
  }
  setHost(host){
    this.host = host;
  }
}

module.exports = {
  PlayersInfo : PlayersInfo
}