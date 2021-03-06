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
  constructor(socketID, name, team, isSpymaster, yourTurn, canGuess, roomId, isHost){
    this.socketID = socketID;
    this.name = name;
    this.team = team;
    this.isSpymaster = isSpymaster;
    this.yourTurn = yourTurn;
    this.canGuess = canGuess;
    this.roomId = roomId;
    this.isHost = isHost;
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
  getRoomId(){
    return this.roomId;
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
  setRoomId(roomId){
    this.roomId = roomId;
  }
}

module.exports = {
  Player: Player,
  Client: Client,
};
