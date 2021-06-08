class Messages{
  constructor (){
    this.global = []
    this.red = []
    this.blue = []
  }
  getGlobal(){
    return this.global;
  }  
  getRed(){
    return this.red;
  }
  getBlue(){
    return this.blue;
  }
  addGlobal(msg){
    this.global.push(msg)
  }
  addRed(msg){
    this.red.push(msg);
  }
  addBlue(msg){
    this.blue.push(msg);
  }
}

module.exports = {
  Messages : Messages
}