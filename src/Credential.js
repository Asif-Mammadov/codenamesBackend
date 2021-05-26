class Credential {
  constructor(socketID, username) {
    this.socketID = socketID;
    this.username = username;
  }
  getSocketID(){
    return this.socketID;
  }
  getUsername(){
    return this.username;
  }
  setSocketID(socketID){
    this.socketID = socketID; 
  }
  setUsername(username){
    this.username = username;
  }
}

module.exports = {
  Credential : Credential
}