
class GameServer{
  constructor (){
    this.team1 = new Team('red');
    this.team2 = new Team('blue');
  }
}


var server = new GameServer();
server.team1.assignPlayer(new Player("323112", true));