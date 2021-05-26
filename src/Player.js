class Player {
  constructor(socketID, username, score) {
    this.socketID = socketID;
    this.username = username;
    this.score = score;
  }
  getSocketID(){
    return this.socketID;
  }
  getUsername(){
    return this.username;
  }
  getScore(){
    return this.score;
  }
  
  setSocketID(socketID){
    this.socketID = socketID; 
  }
  setUsername(username){
    this.username = username;
  }
  setScore(score){
    this.score = score;
  }
}


module.exports = {
  Player: Player,
};
