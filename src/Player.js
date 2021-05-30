class Player {
  constructor(socketID, username, score) {
    this.socketID = socketID;
    this.username = username;
    this.score = score;
  }
  getSocketID() {
    return this.socketID;
  }
  getUsername() {
    return this.username;
  }
  getScore() {
    return this.score;
  }

  setSocketID(socketID) {
    this.socketID = socketID;
  }
  setUsername(username) {
    this.username = username;
  }
  setScore(score) {
    this.score = score;
  }
}

class Client {
  constructor(name, team, isSpymaster, yourTurn, canGuess){
    this.name = name;
    this.team = team;
    this.isSpymaster = isSpymaster;
    this.yourTurn = yourTurn;
    this.canGuess = canGuess;
  }
  getName(){
    return this.name;
  }
  getTeam(){
    return this.team;
  }
  getIsSpymaster(){
    return this.isSpymaster;
  }
  getYourTurn(){
    return this.yourTurn;
  }
  getCanGuess(){
    return this.canGuess;
  }

  setName(name){
    this.name = name;
  }
  setTeam(team){
    this.team = team;
  }
  setIsSpymaster(isSpymaster){
    this.isSpymaster = isSpymaster;
  }
  setYourTurn(yourTurn){
    this.yourTurn = yourTurn;
  }
  setCanGuess(canGuess){
    this.canGuess = canGuess;
  }
}

module.exports = {
  Player: Player,
  Client: Client,
};
